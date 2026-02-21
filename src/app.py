from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from src.llama_index_template import initialize_index, query_index
import uvicorn
from openai import OpenAI
import json
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

from src.firebase_client import firebase_post, firebase_get, firebase_put

app = FastAPI()
app.llama_index = initialize_index()

# TODO Añadir prompt
CURRICULUM_AGENT_SYSTEM_PROMPT = (
    "You are a curriculum generator. Given a problem description, return a JSON object "
    "with a single key 'curriculum' whose value is an array of topic objects. "
    "Each topic object must have: titulo (string), id (number), dificulty_sorting (number), ejercicios (array). "
    "Do not include any other keys or text."
)

EXERCISES_AGENT_SYSTEM_PROMPT = (
    "You are an exercises generator. Given a topic name and supporting study notes, "
    "return a JSON object with a single key 'ejercicios' whose value is an array. "
    "Do not include any other keys or text."
)


class CurriculumRequest(BaseModel):
    description: str = Field(..., min_length=1)
    userId: str = Field(..., min_length=1)


class Topic(BaseModel):
    titulo: str = Field(..., min_length=1)
    id: int
    dificulty_sorting: int
    ejercicios: List[Any]


class CurriculumResponse(BaseModel):
    id: str
    curriculum: List[Topic]


class ClientResponse(BaseModel):
    id: str


class GetQuestionsRequest(BaseModel):
    idCurriculum: str = Field(..., min_length=1)
    idUser: str = Field(..., min_length=1)
    idModule: int

def get_new_curr_id(user_id: str) -> str:
    # Find existing curriculums for the user and return next numeric id.
    existing = firebase_get(f"curriculums/{user_id}")
    if not existing:
        return "0"

    # Stored ids are strings; filter numeric ids only.
    max_id = -1
    for item in existing.values():
        try:
            cid = int(item.get("id"))
            if cid > max_id:
                max_id = cid
        except Exception:
            continue
    return str(max_id + 1)

def store_curriculum(curriculum: Dict[str, Any], user_id: str | None = None) -> str:
    # Store curriculum as a JSON object (future-proof for complex items).
    resolved_user_id = user_id or curriculum.get("userId")
    if not resolved_user_id:
        raise HTTPException(400, detail="userId is required to store curriculum.")

    new_id = get_new_curr_id(resolved_user_id)
    payload = {
        "id": new_id,
        "userId": resolved_user_id,
        "curriculum": curriculum.get("curriculum", []),
        "created_at": {".sv": "timestamp"},
    }
    firebase_put(f"curriculums/{resolved_user_id}/{new_id}", payload)
    return new_id

def _call_curriculum_agent(payload: Dict[str, Any]) -> Dict[str, Any]:
    client = OpenAI()
    messages = [
        {"role": "system", "content": CURRICULUM_AGENT_SYSTEM_PROMPT},
        {"role": "user", "content": json.dumps(payload, ensure_ascii=True)},
    ]
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            response_format={"type": "json_object"},
            temperature=0.2,
        )
        content = response.choices[0].message.content
    except Exception:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.2,
        )
        content = response.choices[0].message.content
    return json.loads(content)

def _call_exercises_agent(topic: str, notes: str) -> Dict[str, Any]:
    client = OpenAI()
    messages = [
        {"role": "system", "content": EXERCISES_AGENT_SYSTEM_PROMPT},
        {
            "role": "user",
            "content": json.dumps(
                {"topic": topic, "notes": notes},
                ensure_ascii=True,
            ),
        },
    ]
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            response_format={"type": "json_object"},
            temperature=0.2,
        )
        content = response.choices[0].message.content
    except Exception:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            temperature=0.2,
        )
        content = response.choices[0].message.content
    return json.loads(content)

def _rag_notes_for_topic(topic: str) -> str:
    prompt = (
        "Provide concise study notes to teach this topic and help create "
        "theoretical and practical exercises. Focus on key concepts, steps, and pitfalls. "
        f"Topic: {topic}"
    )
    retrieval_result = query_index(app.llama_index, prompt)
    return retrieval_result.response



@app.post('/create_client', response_model=ClientResponse)
def create_client():
    try:
        new_id = firebase_post(
            "clients",
            {"created_at": {".sv": "timestamp"}},
        )
        if not new_id:
            raise HTTPException(502, detail="Failed to create client in Firebase.")
        return {"id": new_id}
    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(500, detail=str(e))

@app.post('/create_project', response_model=CurriculumResponse)
def create_project(payload: CurriculumRequest):
    try:
        agent_output = _call_curriculum_agent(payload.model_dump())
        curriculum = agent_output.get("curriculum")
        if not isinstance(curriculum, list):
            raise HTTPException(502, detail="Agent response missing 'curriculum' list of topics.")
        for item in curriculum:
            if not isinstance(item, dict):
                raise HTTPException(502, detail="Each curriculum item must be an object.")
            if "titulo" not in item or "id" not in item or "dificulty_sorting" not in item or "ejercicios" not in item:
                raise HTTPException(502, detail="Topic must include titulo, id, dificulty_sorting, and ejercicios.")

        curriculum_record = {"userId": payload.userId, "curriculum": curriculum}
        curriculum_id = store_curriculum(curriculum_record)
        curriculum_record["id"] = curriculum_id

        return curriculum_record
    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(500, detail=str(e))

@app.post('/get_questions')
def get_questions(payload: GetQuestionsRequest):
    try:
        stored = firebase_get(f"curriculums/{payload.idUser}/{payload.idCurriculum}")
        if not stored:
            raise HTTPException(404, detail="Curriculum not found.")

        topics = stored.get("curriculum")
        if not isinstance(topics, list):
            raise HTTPException(500, detail="Stored curriculum is invalid.")

        module = None
        for item in topics:
            if not isinstance(item, dict):
                continue
            try:
                if int(item.get("id")) == payload.idModule:
                    module = item
                    break
            except Exception:
                continue

        if not module:
            raise HTTPException(404, detail="Module not found in curriculum.")

        existing_ejercicios = module.get("ejercicios")
        if isinstance(existing_ejercicios, list) and existing_ejercicios:
            return {
                "ejercicios": existing_ejercicios,
            }

        module_title = module.get("titulo")
        if not module_title:
            raise HTTPException(500, detail="Module title is missing.")

        notes = _rag_notes_for_topic(module_title)
        agent_out = _call_exercises_agent(module_title, notes)
        ejercicios = agent_out.get("ejercicios")
        if not isinstance(ejercicios, list):
            raise HTTPException(502, detail="Agent response missing 'ejercicios'.")

        module["ejercicios"] = ejercicios

        stored["curriculum"] = topics
        firebase_put(f"curriculums/{payload.idUser}/{payload.idCurriculum}", stored)

        return {
            "ejercicios": ejercicios,
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(500, detail=str(e))

# TODO: Meter endpoint de modulo completado





@app.post('/rebuild_index')
def rebuild_index():
    try:
        app.llama_index = initialize_index(True)
        return {'message': 'The index has been successfully rebuilt'}
    except Exception as e:
        return HTTPException(500, detail=str(e))

@app.get('/query')
def query(user_query: str):
    try:
        retrieval_result = query_index(app.llama_index, user_query)

        return {
            "result": retrieval_result.response
        }

    except Exception as e:
        return HTTPException(500, detail=str(e))

if __name__ == '__main__':
    uvicorn.run(app, host="127.0.0.1", port=8000)
