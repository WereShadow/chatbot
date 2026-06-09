from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os

from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------
app = FastAPI(title="LangChain Groq Chatbot API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

# ---------------------------------------------------------------------------
# Groq LLM  (no memory — fully stateless)
# Groq supports: llama-3.3-70b-versatile, llama3-8b-8192, mixtral-8x7b-32768
# ---------------------------------------------------------------------------
MODEL_NAME = "llama-3.3-70b-versatile"

llm = ChatGroq(
    model=MODEL_NAME,
    temperature=0.7,
    max_tokens=1024,
    api_key=os.getenv("GROQ_API_KEY"),
)

# ---------------------------------------------------------------------------
# Prompt template  (stateless — no history injected)
# ---------------------------------------------------------------------------
SYSTEM_PROMPT = (
    "You are a helpful, friendly, and knowledgeable AI assistant. "
    "You provide clear, accurate, and concise responses. "
    "You are honest about your limitations and always aim to be helpful. "
    "Note: You have no memory of previous conversations — each message is independent."
)

prompt = ChatPromptTemplate.from_messages([
    ("system", SYSTEM_PROMPT),
    ("human", "{user_message}"),
])

# LangChain LCEL chain
chain = prompt | llm


# ---------------------------------------------------------------------------
# Schemas
# ---------------------------------------------------------------------------
class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str
    model: str
    tokens_used: int


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------
@app.get("/")
async def root():
    """Serve the chat UI."""
    return FileResponse("static/index.html")


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Stateless chat endpoint — LangChain + Groq (no memory).
    Every request is a fresh invocation; no history is stored server-side.
    """
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    api_key = os.getenv("GROQ_API_KEY")
    if not api_key or api_key == "your_groq_api_key_here":
        raise HTTPException(
            status_code=500,
            detail="Groq API key not configured. Set GROQ_API_KEY in your .env file. "
                   "Get a free key at https://console.groq.com",
        )

    try:
        result = await chain.ainvoke({"user_message": request.message})

        # Extract token usage from Groq response metadata
        usage = result.response_metadata.get("token_usage", {})
        tokens_used = usage.get("total_tokens", 0)

        return ChatResponse(
            response=result.content,
            model=result.response_metadata.get("model_name", MODEL_NAME),
            tokens_used=tokens_used,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health():
    """Health check — returns model info."""
    return {
        "status": "ok",
        "provider": "Groq",
        "model": MODEL_NAME,
        "memory": "disabled",
    }


@app.get("/models")
async def list_models():
    """Returns the available Groq model options."""
    return {
        "models": [
            {"id": "llama-3.3-70b-versatile", "label": "Llama 3.3 70B (default — best quality)"},
            {"id": "llama3-8b-8192",           "label": "Llama 3 8B (fastest)"},
            {"id": "mixtral-8x7b-32768",       "label": "Mixtral 8x7B (32k context)"},
            {"id": "gemma2-9b-it",             "label": "Gemma 2 9B"},
        ]
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
