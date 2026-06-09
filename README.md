# 🤖 NexusAI Chatbot

A stateless AI chatbot built with **LangChain** and **OpenAI GPT-4o Mini**, served via **FastAPI** with a premium dark-mode UI.

> **No memory** — each message is fully independent. No conversation history is stored.

---

## ✨ Features

- 🔗 LangChain `ChatPromptTemplate | ChatOpenAI` pipeline
- ⚡ FastAPI async backend
- 🎨 Premium dark-mode UI (glassmorphism, animated orbs, typing indicator)
- 📱 Fully responsive (mobile-friendly)
- 🔒 Stateless — no session storage, no memory

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

### 3. Configure your API key

```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:

```env
OPENAI_API_KEY=sk-...your key here...
```

### 4. Run the server

```bash
python main.py
```

### 5. Open in browser

```
http://localhost:8000
```

---

## 🏗️ Project Structure

```
chatbot/
├── main.py              # FastAPI backend + LangChain pipeline
├── requirements.txt     # Python dependencies
├── .env.example         # API key template (copy to .env)
└── static/
    ├── index.html       # Chat UI
    ├── style.css        # Premium dark UI styles
    └── app.js           # Frontend logic
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| LLM   | OpenAI GPT-4o Mini |
| Chain | LangChain (`langchain-openai`) |
| API   | FastAPI + Uvicorn |
| UI    | HTML · Vanilla CSS · JavaScript |

---

## 📄 License

MIT
