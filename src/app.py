from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
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

# Allow local frontend dev servers to call the API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# TODO Añadir prompt
CURRICULUM_AGENT_SYSTEM_PROMPT = (
    "Eres un experto en descomposicion de aplicaciones web. "
    "Tu tarea es recibir una idea de app (MVP) y generar un mapa completo de los conocimientos necesarios "
    "para que un cliente pueda construir la app por si mismo usando React, Node.js y SQL, "
    "incluyendo HTML y CSS basicos. "
    "Debes identificar todas las funcionalidades o modulos implicitos y traducirlas en tareas de aprendizaje. "
    "Reglas: considera conocimientos basicos, tareas un poco generales, "
    "asigna nivel_dificultad en orden creciente, sin recursos externos ni explicaciones, "
    "salida solo JSON. "
    "Formato de salida: objeto JSON con la clave 'curriculum' conteniendo una lista de objetos {titulo, nivel_dificultad}."
)

EXERCISES_AGENT_SYSTEM_PROMPT = (
    "ROLE: EXPERT TECH CURRICULUM DESIGNER. "
    "Transforma un JSON de entrada con teoria en un set de ejercicios practicos, progresivos y de alta retencion. "
    "Analiza el campo result e identifica sintaxis critica, logica, manejo de errores e integracion con modulos_previos. "
    "Reglas: minimo 11 ejercicios por modulo, progresion basico/intermedio/avanzado, "
    "balance 25% por tipo (fill in the blanks, test, what happens if, fill code row). "
    "Ejercicios autocontenidos, sin redundancias. "
    "Salida exclusivamente JSON. "
    "Esquema: {\"modulo\": \"Nombre\", \"ejercicios\": [{\"titulo\", \"tipo\", \"nivel\", "
    "\"descripcion_teorica\", \"enunciado\", \"respuesta_correcta\"}]}."
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

def _call_exercises_agent(notes: str, previous_modules: List[str]) -> Dict[str, Any]:
    client = OpenAI()
    messages = [
        {"role": "system", "content": EXERCISES_AGENT_SYSTEM_PROMPT},
        {
            "role": "user",
            "content": json.dumps(
                {"result": notes, "modulos_previos": previous_modules},
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
        curriculum = agent_output.get("curriculum", agent_output) if isinstance(agent_output, dict) else agent_output
        if not isinstance(curriculum, list):
            # Fallback if the agent gave us an object with a different key containing the list
            if isinstance(agent_output, dict):
                for val in agent_output.values():
                    if isinstance(val, list):
                        curriculum = val
                        break
        if not isinstance(curriculum, list):
            raise HTTPException(502, detail="Agent response must be a JSON list.")
        normalized = []
        for index, item in enumerate(curriculum, start=1):
            if not isinstance(item, dict):
                raise HTTPException(502, detail="Each curriculum item must be an object.")
            if "titulo" not in item or "nivel_dificultad" not in item:
                raise HTTPException(502, detail="Each item must include titulo and nivel_dificultad.")
            normalized.append({
                "titulo": item.get("titulo"),
                "id": int(index),
                "dificulty_sorting": int(item.get("nivel_dificultad")),
                "ejercicios": [],
            })

        curriculum_record = {"userId": payload.userId, "curriculum": normalized}
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
        previous_modules = [
            item.get("titulo")
            for item in topics
            if isinstance(item, dict) and int(item.get("id", -1)) < payload.idModule
        ]
        agent_out = _call_exercises_agent(notes, previous_modules)
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
