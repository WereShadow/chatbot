# 🤖 NexusAI Chatbot

A stateless AI chatbot built with **LangChain** and **Groq** (Llama 3.3 70B), served via **FastAPI** with a premium dark-mode UI.

> **No memory** — each message is fully independent. No conversation history is stored.

![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-0.3-1C3C3C?logo=langchain&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-LPU_Inference-F55036?logo=groq&logoColor=white)

---

## ✨ Features

- ⚡ **Groq LPU inference** — ultra-fast responses (~200 tokens/sec)
- 🔗 **LangChain LCEL pipeline** — `ChatPromptTemplate | ChatGroq`
- 🧠 **No memory** — stateless, each message is independent
- 🚀 **FastAPI** async backend with automatic docs
- 🎨 **Premium dark-mode UI** — glassmorphism, animated orbs, typing indicator
- 📊 **Live token counter** — see token usage after each response
- 📱 **Fully responsive** — works on desktop & mobile
- 🔒 **Secure** — API key stored in `.env`, never committed

---

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/WereShadow/chatbot.git
cd chatbot
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Get your free Groq API key

1. Go to [https://console.groq.com](https://console.groq.com)
2. Sign up / log in
3. Navigate to **API Keys** → Create a new key

### 4. Configure your API key

```bash
cp .env.example .env
```

Edit `.env` and paste your key:

```env
GROQ_API_KEY=gsk_...your key here...
```

### 5. Run the server

```bash
python main.py
```

### 6. Open in browser

```
http://localhost:8000
```

---

## 🏗️ Project Structure

```
chatbot/
├── main.py              # FastAPI backend + LangChain Groq pipeline
├── requirements.txt     # Python dependencies
├── .env.example         # API key template (copy to .env)
├── .gitignore           # Excludes .env, __pycache__, etc.
├── README.md            # This file
└── static/
    ├── index.html       # Chat UI (HTML)
    ├── style.css        # Premium dark-mode styles (CSS)
    └── app.js           # Frontend logic (JavaScript)
```

---

## 🛠️ Tech Stack

| Layer     | Technology                                |
|-----------|-------------------------------------------|
| **LLM**   | Llama 3.3 70B via Groq LPU                |
| **Chain**  | LangChain (`langchain-groq`)              |
| **API**    | FastAPI + Uvicorn                         |
| **UI**     | HTML · Vanilla CSS · JavaScript           |

---

## 🔌 API Endpoints

| Method | Endpoint    | Description                                  |
|--------|-------------|----------------------------------------------|
| `GET`  | `/`         | Serves the chat UI                           |
| `POST` | `/chat`     | Stateless chat — send a message, get a reply |
| `GET`  | `/health`   | Health check with model info                 |
| `GET`  | `/models`   | Lists available Groq model options           |

### Example `POST /chat`

**Request:**
```json
{
  "message": "Explain quantum computing in simple terms"
}
```

**Response:**
```json
{
  "response": "Quantum computing uses quantum bits (qubits) that can exist in multiple states simultaneously...",
  "model": "llama-3.3-70b-versatile",
  "tokens_used": 247
}
```

---

## 🧩 Available Models

You can change the model in `main.py` by editing the `MODEL_NAME` variable:

| Model                        | Speed     | Context  | Best For                |
|------------------------------|-----------|----------|-------------------------|
| `llama-3.3-70b-versatile`    | Fast      | 128k     | Best quality (default)  |
| `llama3-8b-8192`             | Fastest   | 8k       | Quick, simple tasks     |
| `mixtral-8x7b-32768`         | Fast      | 32k      | Long-context tasks      |
| `gemma2-9b-it`               | Fast      | 8k       | General purpose         |

---

## 📄 License

MIT
