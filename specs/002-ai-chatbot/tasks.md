# Tasks: AI-Powered Todo Chatbot

**Input**: Design documents from `/specs/002-ai-chatbot/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Not explicitly requested in spec. Manual testing via ChatKit UI and curl.

**Organization**: Tasks grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/` at repository root
- **Frontend**: `frontend/` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install new dependencies for Phase III chatbot

- [X] T001 Install backend dependencies: `openai-agents`, `mcp[cli]`, `openai-chatkit` in backend/pyproject.toml
- [X] T002 Install frontend dependency: `@openai/chatkit-react` in frontend/package.json
- [X] T003 Add `OPENAI_API_KEY` to backend/.env and backend/.env.example

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database models and core infrastructure that ALL user stories depend on

**CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Add Conversation SQLModel to backend/models.py per data-model.md (id, user_id, title, created_at, updated_at)
- [X] T005 Add Message SQLModel to backend/models.py per data-model.md (id, conversation_id, user_id, role, content, created_at)
- [X] T006 Implement ChatKit Store (chatkit_store.py) with SQLModel-backed persistence for threads and items per contracts/chatkit-api.md in backend/chatkit_store.py
- [X] T007 Create ChatKit endpoint route with JWT authentication that delegates to ChatKitServer.process() in backend/routes/chat.py
- [X] T008 Register chat route in FastAPI app and add CORS support for ChatKit in backend/main.py
- [X] T009 Create ChatInterface component using @openai/chatkit-react with JWT auth headers in frontend/components/chat-interface.tsx
- [X] T010 Create chat page that renders ChatInterface component with auth guard in frontend/app/chat/page.tsx
- [X] T011 Add navigation link to chat page from dashboard in frontend/app/dashboard/page.tsx

**Checkpoint**: Foundation ready - ChatKit UI connects to backend, threads persist in DB, but no AI agent or tools yet

---

## Phase 3: User Story 1 - Natural Language Task Creation (Priority: P1) MVP

**Goal**: Users can create tasks by typing natural language commands like "Add a task to buy groceries"

**Independent Test**: Send "Add a task to buy groceries" in ChatKit UI, verify task appears in database and confirmation is returned

### Implementation for User Story 1

- [X] T012 [P] [US1] Create add_task function tool using @function_tool decorator that creates a task in DB via SQLModel in backend/mcp_tools.py
- [X] T013 [P] [US1] Create list_tasks function tool using @function_tool decorator that queries tasks by user_id and status filter in backend/mcp_tools.py
- [X] T014 [US1] Create OpenAI Agent with system instructions for todo management, model gpt-4.1-mini, and tools [add_task, list_tasks] in backend/chat_agent.py
- [X] T015 [US1] Integrate Agent into ChatKitServer respond() method - load history, run agent with conversation context, stream response in backend/chatkit_store.py

**Checkpoint**: User can create tasks and view them via natural language. MVP is functional.

---

## Phase 4: User Story 2 - View and Filter Tasks (Priority: P1)

**Goal**: Users can ask "Show me all my tasks" or "What's pending?" and get filtered task lists

**Independent Test**: Pre-populate tasks, ask "What's pending?" in ChatKit UI, verify only pending tasks shown

### Implementation for User Story 2

- [X] T016 [US2] Enhance list_tasks tool to support status filter parameter ("all", "pending", "completed") with formatted output in backend/mcp_tools.py

**Checkpoint**: Task listing with filters works via natural language. Both P1 stories complete.

---

## Phase 5: User Story 3 - Mark Tasks Complete (Priority: P2)

**Goal**: Users can say "Mark task 3 as complete" and the task status updates

**Independent Test**: Create a task, send "Mark task 1 as complete", verify task.completed=True in database

### Implementation for User Story 3

- [X] T017 [P] [US3] Create complete_task function tool that marks a task as completed by task_id in backend/mcp_tools.py
- [X] T018 [US3] Register complete_task tool with Agent in backend/chat_agent.py

**Checkpoint**: Users can create, view, and complete tasks via chat.

---

## Phase 6: User Story 6 - Conversation Continuity (Priority: P2)

**Goal**: Conversation history persists across sessions - users can close and reopen chat

**Independent Test**: Have a multi-turn conversation, close browser, reopen /chat, verify all previous messages displayed

### Implementation for User Story 6

- [X] T019 [US6] Verify ChatKit Store correctly loads thread items in chronological order on reconnect in backend/chatkit_store.py
- [X] T020 [US6] Verify ChatKit frontend displays full message history when thread is reopened in frontend/components/chat-interface.tsx

**Checkpoint**: Conversation persistence works. Server restarts don't lose history.

---

## Phase 7: User Story 4 - Update Tasks (Priority: P3)

**Goal**: Users can say "Change task 2 to 'Buy groceries and fruits'" to modify tasks

**Independent Test**: Create a task, send update command, verify title changed in database

### Implementation for User Story 4

- [X] T021 [P] [US4] Create update_task function tool that modifies task title/description by task_id in backend/mcp_tools.py
- [X] T022 [US4] Register update_task tool with Agent in backend/chat_agent.py

**Checkpoint**: Task updates work via natural language.

---

## Phase 8: User Story 5 - Delete Tasks (Priority: P3)

**Goal**: Users can say "Delete task 4" to remove tasks

**Independent Test**: Create a task, send "Delete task 1", verify task removed from database

### Implementation for User Story 5

- [X] T023 [P] [US5] Create delete_task function tool that removes a task by task_id in backend/mcp_tools.py
- [X] T024 [US5] Register delete_task tool with Agent in backend/chat_agent.py

**Checkpoint**: Full CRUD cycle works via chat (create, read, update, delete, complete).

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Error handling, edge cases, and UX improvements across all stories

- [X] T025 Add error handling for OpenAI API failures with fallback messages in backend/chat_agent.py
- [X] T026 Add error handling for task-not-found scenarios in all MCP tools in backend/mcp_tools.py
- [X] T027 Handle ambiguous commands and non-task queries in agent system instructions in backend/chat_agent.py
- [X] T028 Add loading/typing indicator in ChatKit UI during agent processing in frontend/components/chat-interface.tsx
- [X] T029 Add responsive styling for chat page on mobile and desktop in frontend/app/chat/page.tsx
- [ ] T030 Validate end-to-end flow per quickstart.md: sign in → navigate to /chat → create task → list tasks → complete task → delete task

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **US1 + US2 (Phase 3-4)**: Depend on Foundational - P1 MVP stories
- **US3 + US6 (Phase 5-6)**: Depend on Foundational - P2 stories, can parallel with each other
- **US4 + US5 (Phase 7-8)**: Depend on Foundational - P3 stories, can parallel with each other
- **Polish (Phase 9)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Depends on Phase 2. Creates add_task + list_tasks tools and Agent. **Foundation for all other stories.**
- **US2 (P1)**: Depends on US1 (extends list_tasks). Completes the P1 MVP.
- **US3 (P2)**: Depends on Phase 2 + Agent from US1. Adds complete_task tool.
- **US6 (P2)**: Depends on Phase 2. Validates conversation persistence (already built in Phase 2).
- **US4 (P3)**: Depends on Phase 2 + Agent from US1. Adds update_task tool.
- **US5 (P3)**: Depends on Phase 2 + Agent from US1. Adds delete_task tool.

### Within Each User Story

- Tool function before Agent registration
- Agent configuration before integration testing
- Core implementation before error handling

### Parallel Opportunities

**Phase 1**: T001, T002, T003 can all run in parallel (different package managers/files)
**Phase 2**: T004+T005 (same file but sequential), T006+T007 (different files, parallel), T009+T010 (different files, parallel)
**Phase 3**: T012+T013 can run in parallel (same file but independent functions)
**Phase 5+7+8**: US3, US4, US5 tool creation tasks can run in parallel (different functions in same file)

---

## Parallel Example: Foundational Phase

```bash
# After T004+T005 (models), launch these in parallel:
Task T006: "Implement ChatKit Store in backend/chatkit_store.py"
Task T007: "Create ChatKit endpoint route in backend/routes/chat.py"

# After T008 (backend registered), launch frontend tasks in parallel:
Task T009: "Create ChatInterface component in frontend/components/chat-interface.tsx"
Task T010: "Create chat page in frontend/app/chat/page.tsx"
```

## Parallel Example: Tool Creation (after Agent exists)

```bash
# These tools are independent functions and can be created in parallel:
Task T017: "Create complete_task tool in backend/mcp_tools.py"
Task T021: "Create update_task tool in backend/mcp_tools.py"
Task T023: "Create delete_task tool in backend/mcp_tools.py"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T011)
3. Complete Phase 3: US1 - Task Creation (T012-T015)
4. Complete Phase 4: US2 - Task Viewing (T016)
5. **STOP and VALIDATE**: Test create + view tasks via ChatKit UI
6. Deploy/demo if ready - **this is your MVP**

### Incremental Delivery

1. Setup + Foundational → ChatKit connected, threads persist
2. Add US1 + US2 → Create + View tasks via chat (MVP!)
3. Add US3 → Complete tasks via chat
4. Add US6 → Verify conversation persistence
5. Add US4 + US5 → Update + Delete tasks via chat
6. Polish → Error handling, edge cases, responsive UI
7. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files or independent functions, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently testable after completion
- Commit after each task or logical group using `[T###] description` format
- Stop at any checkpoint to validate story independently
- MCP tools are implemented as @function_tool decorators (not separate MCP HTTP server)
- ChatKit SDK handles the chat protocol, streaming, and thread management
- Agent system instructions define NLU behavior for all tool selection
