# Implementation Plan: AI-Powered Todo Chatbot

**Branch**: `002-ai-chatbot` | **Date**: 2026-02-08 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-ai-chatbot/spec.md`

## Summary

Build an AI-powered chatbot interface that enables users to manage their todo list through natural language conversation. The implementation uses OpenAI ChatKit (frontend + backend SDK) for the chat protocol, OpenAI Agents SDK for natural language understanding and tool orchestration, and MCP tools (via `@function_tool`) for task CRUD operations. Conversations are persisted to Neon PostgreSQL via a ChatKit Store implementation using SQLModel, ensuring stateless server architecture.

## Technical Context

**Language/Version**: Python 3.13+ (backend), TypeScript 5.x (frontend)
**Primary Dependencies**: FastAPI, OpenAI Agents SDK (0.8.1), MCP SDK (1.26.0), OpenAI ChatKit (1.6.0 backend / 1.4.0 frontend), SQLModel
**Storage**: Neon Serverless PostgreSQL (existing) - new Conversation and Message tables
**Testing**: Manual testing via ChatKit UI + API testing via curl
**Target Platform**: Web (Next.js 16 frontend + FastAPI backend)
**Project Type**: Web application (monorepo: frontend/ + backend/)
**Performance Goals**: <5s response time including AI processing, 50 concurrent users
**Constraints**: Stateless backend (no in-memory conversation state), JWT auth required
**Scale/Scope**: 2 new DB tables, 4 new backend files, 2 new frontend files

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Research Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-Driven Development | PASS | Spec written and validated before plan |
| II. Monorepo Architecture | PASS | New files fit within existing backend/ and frontend/ structure |
| III. Technology Stack Compliance | PASS | FastAPI, Next.js 16, SQLModel, Neon PostgreSQL, Better Auth - all compliant. New additions (OpenAI SDKs, MCP) are required by Phase III spec |
| IV. Authentication & Security | PASS | Reuses existing JWT middleware; ChatKit endpoint will require auth |
| V. API Design Standards | PASS | ChatKit protocol replaces REST for chat; existing task REST API unchanged |
| VI. Frontend Patterns | PASS | ChatKit component as client component; follows App Router conventions |
| VII. Backend Patterns | PASS | New files follow existing patterns (routes/, models.py, etc.) |
| VIII. Simplicity & YAGNI | PASS | Minimal new files; leverages ChatKit SDK instead of building custom chat protocol |

### Post-Design Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Spec-Driven Development | PASS | Plan maps all 50 FRs to implementation components |
| II. Monorepo Architecture | PASS | 4 new backend files + 2 new frontend files in existing structure |
| III. Technology Stack Compliance | PASS | All required tech stack components used |
| IV. Authentication & Security | PASS | JWT validation on ChatKit endpoint via existing middleware |
| V. API Design Standards | PASS | ChatKit SDK handles protocol; MCP tools follow spec contract |
| VI. Frontend Patterns | PASS | Client component for chat; uses existing auth-client.ts for tokens |
| VII. Backend Patterns | PASS | SQLModel models in models.py; route in routes/; agent logic in dedicated file |
| VIII. Simplicity & YAGNI | PASS | Used ChatKit SDK Store interface (not custom WebSocket); function_tool decorators (not separate MCP HTTP server) |

## Project Structure

### Documentation (this feature)

```text
specs/002-ai-chatbot/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 research output
├── data-model.md        # Phase 1 data model
├── quickstart.md        # Phase 1 quickstart guide
├── contracts/
│   ├── chatkit-api.md   # ChatKit API contract
│   └── mcp-tools.md     # MCP tools contract
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (created by /sp.tasks)
```

### Source Code (repository root)

```text
backend/
├── main.py                # FastAPI app (MODIFY: add ChatKit route, new models)
├── models.py              # SQLModel models (MODIFY: add Conversation, Message)
├── db.py                  # Database connection (EXISTING - no changes)
├── middleware/
│   └── auth.py            # JWT middleware (EXISTING - no changes)
├── routes/
│   ├── tasks.py           # Task CRUD routes (EXISTING - no changes)
│   └── chat.py            # NEW: ChatKit endpoint route
├── mcp_tools.py           # NEW: MCP tool functions for task operations
├── chat_agent.py          # NEW: OpenAI Agent configuration
└── chatkit_store.py       # NEW: ChatKit Store implementation with SQLModel

frontend/
├── app/
│   ├── layout.tsx         # Root layout (EXISTING - no changes)
│   ├── dashboard/
│   │   └── page.tsx       # Task dashboard (EXISTING - no changes)
│   └── chat/
│       └── page.tsx       # NEW: Chat page
├── components/
│   ├── chat-interface.tsx # NEW: ChatKit wrapper component
│   └── ...                # EXISTING components unchanged
└── lib/
    ├── api.ts             # API client (EXISTING - no changes needed)
    ├── auth-client.ts     # Auth client (EXISTING - reuse for JWT)
    └── types.ts           # Types (MODIFY: add chat types)
```

**Structure Decision**: Web application monorepo (Option 2). Extends existing `backend/` and `frontend/` structure with minimal new files. No new directories created except `frontend/app/chat/`. All new backend files are at the module root level following the existing flat structure pattern.

## Component Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (Next.js 16)                        │
│                                                                     │
│  ┌─────────────────┐     ┌──────────────────────────────────────┐  │
│  │  /chat page      │────▶│  ChatInterface component              │  │
│  │  (app/chat/)     │     │  (@openai/chatkit-react)              │  │
│  └─────────────────┘     │  - useChatKit({ api: { url, headers }})│  │
│                          │  - <ChatKit control={...} />           │  │
│                          └──────────────┬───────────────────────┘  │
│                                         │ POST /chatkit             │
│                                         │ Authorization: Bearer JWT │
└─────────────────────────────────────────┼───────────────────────────┘
                                          │
┌─────────────────────────────────────────┼───────────────────────────┐
│                        BACKEND (FastAPI)│                            │
│                                         ▼                            │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │  routes/chat.py                                               │   │
│  │  POST /chatkit → JWT verify → ChatKitServer.process()         │   │
│  └───────────────────────────┬──────────────────────────────────┘   │
│                              │                                       │
│  ┌───────────────────────────▼──────────────────────────────────┐   │
│  │  chatkit_store.py (ChatKit Store implementation)              │   │
│  │  - SQLModel-backed thread/item persistence                    │   │
│  │  - Conversation ↔ Thread, Message ↔ ThreadItem mapping        │   │
│  └───────────────────────────┬──────────────────────────────────┘   │
│                              │                                       │
│  ┌───────────────────────────▼──────────────────────────────────┐   │
│  │  chat_agent.py (OpenAI Agents SDK)                            │   │
│  │  - Agent with system instructions                              │   │
│  │  - model: gpt-4.1-mini                                         │   │
│  │  - tools: [add_task, list_tasks, complete_task,                │   │
│  │            delete_task, update_task]                            │   │
│  └───────────────────────────┬──────────────────────────────────┘   │
│                              │                                       │
│  ┌───────────────────────────▼──────────────────────────────────┐   │
│  │  mcp_tools.py (MCP tool functions)                            │   │
│  │  - @function_tool add_task(user_id, title, description?)      │   │
│  │  - @function_tool list_tasks(user_id, status?)                │   │
│  │  - @function_tool complete_task(user_id, task_id)             │   │
│  │  - @function_tool delete_task(user_id, task_id)               │   │
│  │  - @function_tool update_task(user_id, task_id, ...)          │   │
│  └───────────────────────────┬──────────────────────────────────┘   │
│                              │                                       │
│  ┌───────────────────────────▼──────────────────────────────────┐   │
│  │  models.py + db.py (SQLModel + Neon PostgreSQL)               │   │
│  │  - Task (existing)                                             │   │
│  │  - Conversation (new)                                          │   │
│  │  - Message (new)                                               │   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## Request Flow

```
1. User types message in ChatKit UI
2. ChatKit frontend sends POST /chatkit with JWT token
3. Backend route validates JWT, extracts user_id
4. ChatKitServer receives request:
   a. Store loads/creates thread (Conversation from DB)
   b. Store loads thread items (Messages from DB)
   c. Agent runs with conversation history + new message
   d. Agent invokes MCP tool(s) as needed
   e. Store saves user message to DB
   f. Store saves assistant response to DB
5. Response streamed back via SSE
6. ChatKit UI displays response + tool invocations
```

## Complexity Tracking

No constitution violations to justify. All decisions align with existing patterns:

| Decision | Justification |
|----------|--------------|
| ChatKit SDK (new dependency) | Required by Phase III spec for frontend chat UI |
| OpenAI Agents SDK (new dependency) | Required by Phase III spec for AI logic |
| MCP tools as @function_tool | Simpler than running separate MCP HTTP server; still uses MCP SDK concepts |
| ChatKit Store over custom WebSocket | ChatKit SDK provides battle-tested chat protocol; reduces custom code |
