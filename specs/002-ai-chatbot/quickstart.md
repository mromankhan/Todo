# Quickstart: AI-Powered Todo Chatbot

**Feature**: 002-ai-chatbot
**Date**: 2026-02-08

## Prerequisites

- Phase II Todo app fully functional (backend + frontend + auth)
- OpenAI API key with access to gpt-4.1-mini
- Node.js 18+ and Python 3.13+ installed
- Neon PostgreSQL database running

## Setup Steps

### 1. Install Backend Dependencies

```bash
cd backend
uv add openai-agents      # v0.8.1 - AI agent framework
uv add "mcp[cli]"         # v1.26.0 - MCP server/tools
uv add openai-chatkit     # v1.6.0 - ChatKit backend SDK
```

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install @openai/chatkit-react   # v1.4.0 - Chat UI component
```

### 3. Configure Environment Variables

**Backend `.env`** (add to existing):
```
OPENAI_API_KEY=sk-your-openai-api-key-here
```

### 4. Create New Database Tables

Add Conversation and Message models to `backend/models.py`, then the tables will be auto-created on app startup (existing pattern in `main.py` lifespan).

### 5. Create Backend Files

New files to create:
```
backend/
├── mcp_server.py          # MCP tools for task operations
├── chat_agent.py          # OpenAI Agent configuration
├── chatkit_server.py      # ChatKit server + Store implementation
└── routes/
    └── chat.py            # ChatKit endpoint route
```

### 6. Create Frontend Files

New files to create:
```
frontend/
├── app/
│   └── chat/
│       └── page.tsx       # Chat page with ChatKit component
├── components/
│   └── chat-interface.tsx # ChatKit wrapper component
```

### 7. Run the Application

Terminal 1 - Backend:
```bash
cd backend
uv run uvicorn main:app --reload --port 8000
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

### 8. Test the Chatbot

1. Sign in at `http://localhost:3000`
2. Navigate to `/chat`
3. Type "Add a task to buy groceries"
4. Verify task is created by typing "Show my tasks"
5. Complete a task: "Mark task 1 as complete"
6. Delete a task: "Delete task 1"

## Architecture Overview

```
Browser (localhost:3000)
  └── /chat page
      └── <ChatKit /> component
          └── POST /chatkit --> FastAPI (localhost:8000)
                                  └── ChatKitServer.respond()
                                      └── OpenAI Agent (gpt-4.1-mini)
                                          └── MCP Tools (add_task, list_tasks, etc.)
                                              └── SQLModel --> Neon PostgreSQL
```

## Key Design Decisions

1. **ChatKit SDK** handles the chat protocol (threading, streaming, tool display)
2. **OpenAI Agents SDK** handles NLU and tool selection
3. **MCP tools** defined with `@function_tool` provide task CRUD operations
4. **SQLModel Store** implements ChatKit's Store interface for conversation persistence
5. **Stateless**: Each request rebuilds context from database - no in-memory state
