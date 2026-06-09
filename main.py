from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os

from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage, SystemMessage
from langchain_core.prompts import ChatPromptTemplate

load_dotenv()

app = FastAPI(title="LangChain Chatbot API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Initialize LangChain LLM (no memory — stateless)
llm = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0.7,
    api_key=os.getenv("OPENAI_API_KEY"),
)

# System prompt
SYSTEM_PROMPT = """You are a helpful, friendly, and knowledgeable AI assistant. 
You provide clear, accurate, and concise responses. 
You are honest about your limitations and always aim to be helpful.
Note: You do not have memory of previous conversations — each message is treated independently."""

# Chat prompt template
prompt = ChatPromptTemplate.from_messages([
    ("system", SYSTEM_PROMPT),
    ("human", "{user_message}"),
])

# Chain: prompt | llm
chain = prompt | llm


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str
    model: str


@app.get("/")
async def root():
    """Serve the chat UI."""
    return FileResponse("static/index.html")


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Stateless chat endpoint using LangChain (no memory).
    Each request is independent — no conversation history is stored.
    """
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key or api_key == "your_openai_api_key_here":
        raise HTTPException(
            status_code=500,
            detail="OpenAI API key not configured. Please set OPENAI_API_KEY in your .env file.",
        )

    try:
        result = await chain.ainvoke({"user_message": request.message})
        return ChatResponse(
            response=result.content,
            model=result.response_metadata.get("model_name", "gpt-4o-mini"),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok", "memory": "disabled"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
