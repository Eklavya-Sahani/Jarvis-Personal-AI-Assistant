import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel
from openai import OpenAI

load_dotenv()

app = FastAPI(
    title="Jarvis Personal AI Assistant",
    description="AI assistant powered by OpenRouter",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenRouter
api_key = os.getenv("OPENROUTER_API_KEY")

client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=api_key
)


class ChatRequest(BaseModel):
    message: str


# API health check
@app.get("/api/health")
def health():
    return {
        "status": "online",
        "message": "Jarvis AI Assistant is running!"
    }


# Chat API
@app.post("/chat")
def chat(request: ChatRequest):
    try:
        if not request.message.strip():
            return {
                "response": "Please enter a message."
            }

        response = client.chat.completions.create(
            model="openrouter/free",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are Jarvis, a helpful personal AI assistant. "
                        "The user's name is Eklavya. "
                        "Address the user as Eklavya when appropriate. "
                        "Answer naturally, clearly and concisely. "
                        "Do not prefix your answers with 'Jarvis:'."
                    )
                },
                {
                    "role": "user",
                    "content": request.message
                }
            ]
        )

        answer = response.choices[0].message.content.strip()

        return {
            "response": answer
        }

    except Exception as e:
        print("OpenRouter Error:", e)

        return {
            "response": "Sorry Eklavya, I could not connect to the AI service."
        }


# Serve frontend
frontend_path = os.path.join(
    os.path.dirname(os.path.dirname(__file__)),
    "frontend"
)

app.mount(
    "/static",
    StaticFiles(directory=frontend_path),
    name="static"
)


@app.get("/")
def serve_frontend():
    return FileResponse(
        os.path.join(frontend_path, "index.html")
    )