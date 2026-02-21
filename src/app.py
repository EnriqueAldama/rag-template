from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from src.llama_index_template import initialize_index, query_index
import uvicorn
from openai import OpenAI
import json
from typing import List, Dict, Any
from dotenv import load_dotenv
from src.prompts import CURRICULUM_AGENT_SYSTEM_PROMPT, EXERCISES_AGENT_SYSTEM_PROMPT

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

class CurriculumRequest(BaseModel):
    description: str = Field(..., min_length=1)
    userId: str = Field(..., min_length=1)


class Module(BaseModel):
    titulo: str = Field(..., min_length=1)
    moduleId: int
    nivel_dificultad: int
    tarea_aprendizaje: int
    ejercicios: List[Any]
    was_completed: bool = False


class CurriculumResponse(BaseModel):
    id: str
    nombre: str
    curriculum: List[Module]


class ClientResponse(BaseModel):
    id: str


class GetQuestionsRequest(BaseModel):
    curriculumId: str = Field(..., min_length=1)
    userId: str = Field(..., min_length=1)
    moduleId: int

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
        "nombre": curriculum.get("nombre", ""),
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

def _rag_notes_for_module(module: Module) -> str:
    prompt = (
        "Provide concise study notes to teach this topic and help create "
        "theoretical and practical exercises. Focus on key concepts, steps, and pitfalls. "
        f"Topic: {module["titulo"]}"
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
        agent_output = _call_curriculum_agent(payload.description)
        nombre_proyecto = agent_output.get("nombre")
        curriculum = agent_output.get("curriculum")
        if not isinstance(nombre_proyecto, str):
            raise HTTPException(502, detail="Agent response missing 'nombre' string.")
        if not isinstance(curriculum, list):
            raise HTTPException(502, detail="Agent response missing 'curriculum' list of topics.")
        
        for index, item in enumerate(curriculum):
            if not isinstance(item, dict):
                raise HTTPException(502, detail=f"Curriculum item at index {index} must be an object.")
            
            # Inyectamos el moduleId secuencial
            item["moduleId"] = str(index)
            
            # Validación de las claves requeridas para cada módulo
            if "titulo" not in item or "nivel_dificultad" not in item or "tarea_aprendizaje" not in item:
                raise HTTPException(502, detail=f"Topic at index {index} is missing required fields.")
            
            # Inyectamos el moduleId secuencial. Lo convertimos a string según tu esquema previo.
            item["moduleId"] = str(index)
            item["was_completed"] = False
            
            # Validación ajustada: verificamos las claves que realmente esperamos de la IA
            if "titulo" not in item or "nivel_dificultad" not in item or "tarea_aprendizaje" not in item:
                raise HTTPException(502, detail="Topic must include titulo, nivel_dificultad, and tarea_aprendizaje.")

        curriculum_record = {
            "userId": payload.userId, 
            "nombre": nombre_proyecto,
            "curriculum": curriculum
        }
        
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
        stored = firebase_get(f"curriculums/{payload.userId}/{payload.curriculumId}")
        if not stored:
            raise HTTPException(404, detail="Curriculum not found.")

        modules = stored.get("curriculum")
        if not isinstance(modules, list):
            raise HTTPException(500, detail="Stored curriculum is invalid.")

        module = None
        for item in modules:
            if not isinstance(item, dict):
                continue
            try:
                if int(item.get("moduleId")) == payload.moduleId:
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

        notes = _rag_notes_for_module(module_title)
        agent_out = _call_exercises_agent(module_title, notes)
        ejercicios = agent_out.get("ejercicios")
        if not isinstance(ejercicios, list):
            raise HTTPException(502, detail="Agent response missing 'ejercicios'.")

        module["ejercicios"] = ejercicios

        stored["curriculum"] = modules
        firebase_put(f"curriculums/{payload.userId}/{payload.curriculumId}", stored)

        return {
            "ejercicios": ejercicios,
        }
    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(500, detail=str(e))



class ProjectSummary(BaseModel):
    id: str
    nombre: str
    created_at: Any  # Usamos Any temporalmente por cómo Firebase maneja los timestamps

@app.get('/client_projects/{user_id}', response_model=List[ProjectSummary])
def get_client_projects(user_id: str):
    try:
        # Recuperamos todos los proyectos del usuario desde Firebase
        user_projects_data = firebase_get(f"curriculums/{user_id}")
        
        # Si el usuario no existe o no tiene proyectos, devolvemos una lista vacía
        if not user_projects_data:
            return []

        projects_list = []
        
        # Iteramos sobre los valores del diccionario devuelto por Firebase
        for project_data in user_projects_data.values():
            if not isinstance(project_data, dict):
                continue
                
            # Extraemos únicamente los campos necesarios
            project_summary = {
                "id": project_data.get("id", ""),
                "nombre": project_data.get("nombre", "Proyecto sin nombre"),
                "created_at": project_data.get("created_at")
            }
            projects_list.append(project_summary)
            
        return projects_list

    except Exception as e:
        # Capturamos y relanzamos errores HTTP (como el de FirebaseError si hereda o se lanza internamente)
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(status_code=500, detail=str(e))


@app.get('/project_details/{user_id}/{project_id}', response_model=Dict[str, Any])
def get_project_details(user_id: str, project_id: str):
    try:
        # 1. Construimos la ruta exacta del nodo en Firebase
        path = f"curriculums/{user_id}/{project_id}"
        
        # 2. Hacemos la llamada a la base de datos
        project_data = firebase_get(path)
        
        # 3. Validamos la existencia del recurso
        if not project_data:
            # En APIs REST, si un recurso específico no existe, se devuelve un código 404
            raise HTTPException(status_code=404, detail="Project not found.")
            
        return project_data

    except Exception as e:
        # Propagamos excepciones HTTP conocidas (como el 404) o errores de Firebase
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(status_code=500, detail=str(e))


class CompleteModuleRequest(BaseModel):
    userId: str = Field(..., min_length=1)
    projectId: str = Field(..., min_length=1)
    moduleId: str = Field(..., min_length=1)

@app.post('/complete_module')
def complete_module(payload: CompleteModuleRequest):
    try:
        # 1. Recuperamos el proyecto completo desde Firebase
        path = f"curriculums/{payload.userId}/{payload.projectId}"
        stored_project = firebase_get(path)
        
        if not stored_project:
            raise HTTPException(status_code=404, detail="Project not found.")

        # 2. Extraemos el array del curriculum
        curriculum = stored_project.get("curriculum")
        if not isinstance(curriculum, list):
            raise HTTPException(status_code=500, detail="Stored curriculum is invalid.")

        # 3. Buscamos el módulo por su ID y actualizamos su estado
        module_found = False
        for item in curriculum:
            if not isinstance(item, dict):
                continue
                
            # Comparamos como strings para garantizar la coincidencia
            if str(item.get("moduleId")) == payload.moduleId:
                item["was_completed"] = True
                module_found = True
                break  # Salimos del bucle una vez encontrado para optimizar

        # Si recorremos todo el array y no encontramos el módulo, lanzamos error
        if not module_found:
            raise HTTPException(status_code=404, detail="Module not found in the project.")

        # 4. Sobrescribimos el proyecto en Firebase con el módulo actualizado
        stored_project["curriculum"] = curriculum
        firebase_put(path, stored_project)

        return {
            "message": "Module marked as completed successfully.", 
            "moduleId": payload.moduleId,
            "was_completed": True
        }

    except Exception as e:
        if isinstance(e, HTTPException):
            raise
        raise HTTPException(status_code=500, detail=str(e))


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
