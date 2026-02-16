---
id: 0002
title: generate-ai-chatbot-plan
stage: plan
date: 2026-02-08T20:45:00Z
surface: claude-code
model: claude-opus-4-6
feature: 002-ai-chatbot
branch: 002-ai-chatbot
user: HP ProBook
command: /sp.plan
labels: [phase-3, chatbot, architecture, mcp, openai-agents, chatkit]
links:
  spec: specs/002-ai-chatbot/spec.md
  ticket: N/A
  adr: N/A
  pr: N/A
files:
  - specs/002-ai-chatbot/plan.md
  - specs/002-ai-chatbot/research.md
  - specs/002-ai-chatbot/data-model.md
  - specs/002-ai-chatbot/quickstart.md
  - specs/002-ai-chatbot/contracts/chatkit-api.md
  - specs/002-ai-chatbot/contracts/mcp-tools.md
tests: []
---

## Prompt

User: "yes proceed" (to generate implementation plan for 002-ai-chatbot feature)

Invoked `/sp.plan 002-ai-chatbot` to create technical architecture and implementation plan based on the approved specification.

## Response snapshot

Generated complete implementation plan with 6 artifacts:

1. **research.md** - Technology research covering:
   - OpenAI Agents SDK v0.8.1 (function_tool, Runner, conversation history patterns)
   - MCP SDK v1.26.0 (FastMCP, tool decorators)
   - OpenAI ChatKit v1.6.0 backend / v1.4.0 frontend (ChatKitServer, Store interface, streaming)
   - Integration architecture: ChatKit -> Agent -> MCP tools -> SQLModel -> Neon DB
   - Decision: Use ChatKit SDK for full chat protocol instead of custom WebSocket

2. **plan.md** - Implementation plan with:
   - Technical context (Python 3.13+, TypeScript 5.x, 4 new backend files, 2 new frontend files)
   - Constitution check (all 8 principles PASS pre- and post-design)
   - Component architecture diagram
   - Request flow documentation
   - Source code structure with MODIFY/NEW file annotations

3. **data-model.md** - Database schema for:
   - Conversation (id, user_id, title, created_at, updated_at)
   - Message (id, conversation_id, user_id, role, content, created_at)
   - Existing Task model unchanged

4. **contracts/chatkit-api.md** - ChatKit API contract:
   - POST /chatkit endpoint (ChatKit protocol)
   - Thread/ThreadItem mapping to Conversation/Message
   - Store interface methods
   - SSE streaming format

5. **contracts/mcp-tools.md** - MCP tools contract:
   - 5 tools: add_task, list_tasks, complete_task, delete_task, update_task
   - Parameters, return values, error handling for each
   - Agent system instructions

6. **quickstart.md** - Setup guide with dependencies, file structure, run commands

## Outcome

- ✅ Impact: Complete technical architecture ready for task breakdown. All constitution gates pass.
- 🧪 Tests: No tests yet - plan defines testing strategy (manual ChatKit UI + curl)
- 📁 Files: 6 new files created in specs/002-ai-chatbot/
- 🔁 Next prompts: `/sp.tasks` to break plan into actionable implementation tasks
- 🧠 Reflection: Research phase revealed ChatKit has a complete backend SDK (openai-chatkit) that simplifies the architecture significantly. Instead of building custom WebSocket handling, ChatKit's Store interface provides thread/item management that maps cleanly to Conversation/Message models. Key architectural insight: ChatKit + Agents SDK + function_tool gives us the full stack without needing a separate MCP HTTP server process.

## Evaluation notes (flywheel)

- Failure modes observed: None during planning. Research subagent provided comprehensive SDK documentation.
- Graders run and results (PASS/FAIL): Constitution check - ALL PASS (16/16 items, pre and post design)
- Prompt variant (if applicable): Standard SDD plan workflow with parallel research agent
- Next experiment (smallest change to try): Proceed to /sp.tasks to validate plan granularity for implementation
