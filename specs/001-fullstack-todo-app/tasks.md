# Tasks: Full-Stack Todo Web Application

**Input**: Design documents from `/specs/001-fullstack-todo-app/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/api.yaml ✅

**Tests**: Not explicitly requested in specification. Tests are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/` and `frontend/` at repository root
- Backend structure: `main.py`, `models.py`, `db.py`, `routes/`, `middleware/`
- Frontend structure: `app/`, `components/`, `lib/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, dependencies, and basic structure

- [ ] T001 Add backend dependencies to backend/pyproject.toml (python-jose[cryptography], asyncpg)
- [ ] T002 [P] Create backend/.env.example with DATABASE_URL, BETTER_AUTH_SECRET, FRONTEND_URL placeholders
- [ ] T003 [P] Create frontend/.env.example with NEXT_PUBLIC_API_URL, BETTER_AUTH_SECRET, DATABASE_URL placeholders
- [ ] T004 [P] Create backend directory structure: routes/, middleware/ folders
- [ ] T005 Install backend dependencies by running `uv sync` in backend/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T006 Create database connection module in backend/db.py with async engine and session (per research.md pattern)
- [ ] T007 [P] Create Task SQLModel schemas in backend/models.py (TaskBase, TaskCreate, TaskUpdate, Task, TaskRead per data-model.md)
- [ ] T008 [P] Create JWT verification middleware in backend/middleware/auth.py (per research.md pattern)
- [ ] T009 Create FastAPI app entry point in backend/main.py with CORS middleware (per research.md pattern)
- [ ] T010 Add health check endpoint GET /health in backend/main.py
- [ ] T011 Create TypeScript types for Task in frontend/lib/types.ts (Task, TaskCreate, TaskUpdate interfaces)
- [ ] T012 [P] Create API client base with auth header injection in frontend/lib/api.ts (per research.md pattern)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - User Registration and Authentication (Priority: P1) 🎯 MVP

**Goal**: Enable users to create accounts, sign in, and sign out securely

**Independent Test**: Create a new account, sign out, sign back in - user is authenticated and redirected to dashboard

**Acceptance Criteria** (from spec.md):
- Sign up with valid email/password → account created, auto-signed in
- Sign in with correct credentials → authenticated, redirected to dashboard
- Sign out → session ends, redirected to landing page
- Access dashboard without auth → redirected to sign-in page
- Sign up with existing email → error message shown

### Implementation for User Story 1

- [ ] T013 [US1] Configure Better Auth server in frontend/lib/auth.ts with JWT plugin (per research.md)
- [ ] T014 [US1] Create Better Auth API route handler in frontend/app/api/auth/[...all]/route.ts
- [ ] T015 [US1] Create auth client in frontend/lib/auth-client.ts with useSession, signIn, signUp, signOut exports
- [ ] T016 [P] [US1] Create sign-up form component in frontend/components/auth/sign-up-form.tsx
- [ ] T017 [P] [US1] Create sign-in form component in frontend/components/auth/sign-in-form.tsx
- [ ] T018 [US1] Create sign-up page in frontend/app/(auth)/sign-up/page.tsx using sign-up-form
- [ ] T019 [US1] Create sign-in page in frontend/app/(auth)/sign-in/page.tsx using sign-in-form
- [ ] T020 [US1] Create Next.js middleware for route protection in frontend/middleware.ts (per research.md)
- [ ] T021 [US1] Update landing page frontend/app/page.tsx with sign-in/sign-up links
- [ ] T022 [US1] Add auth provider wrapper to frontend/app/layout.tsx

**Checkpoint**: Users can register, sign in, and sign out. Protected routes redirect unauthenticated users.

---

## Phase 4: User Story 2 - Create New Task (Priority: P1)

**Goal**: Enable signed-in users to add new tasks with title and optional description

**Independent Test**: Sign in, create a task with title and description, see it appear in the list

**Acceptance Criteria** (from spec.md):
- Enter title and click "Add Task" → task appears with status "pending"
- Provide title and description → both saved and visible
- Try to create with empty title → validation error shown
- Create task → shows creation timestamp

### Implementation for User Story 2

- [ ] T023 [US2] Create tasks router in backend/routes/tasks.py with router setup and user_id validation helper
- [ ] T024 [US2] Implement POST /api/{user_id}/tasks endpoint in backend/routes/tasks.py
- [ ] T025 [US2] Register tasks router in backend/main.py
- [ ] T026 [US2] Add task creation method to API client in frontend/lib/api.ts (api.tasks.create)
- [ ] T027 [US2] Create task form component in frontend/components/task-form.tsx with title/description inputs
- [ ] T028 [US2] Create dashboard page shell in frontend/app/dashboard/page.tsx with task form

**Checkpoint**: Signed-in users can create tasks that are saved to database.

---

## Phase 5: User Story 3 - View Task List (Priority: P1)

**Goal**: Enable signed-in users to see all their tasks in a list

**Independent Test**: Sign in with existing tasks, see list of all tasks with title, status, and creation date

**Acceptance Criteria** (from spec.md):
- Visit dashboard → see list of all user's tasks
- Each task shows title, completion status indicator, creation date
- No tasks → friendly message with prompt to create one
- Only see own tasks (not other users' tasks)

### Implementation for User Story 3

- [ ] T029 [US3] Implement GET /api/{user_id}/tasks endpoint in backend/routes/tasks.py
- [ ] T030 [US3] Add task list method to API client in frontend/lib/api.ts (api.tasks.list)
- [ ] T031 [US3] Create task item component in frontend/components/task-item.tsx displaying title, status, date
- [ ] T032 [US3] Create task list component in frontend/components/task-list.tsx with empty state message
- [ ] T033 [US3] Integrate task list into dashboard page frontend/app/dashboard/page.tsx with data fetching

**Checkpoint**: Users can see all their tasks in a list. Empty state shows when no tasks exist.

---

## Phase 6: User Story 4 - Mark Task as Complete/Incomplete (Priority: P2)

**Goal**: Enable users to toggle task completion status

**Independent Test**: Click complete on a pending task → visual indicator changes; click again → reverts to pending

**Acceptance Criteria** (from spec.md):
- Click complete on pending task → marked complete with visual indicator
- Click complete on completed task → marked pending (toggle)
- Completion succeeds → completion timestamp recorded

### Implementation for User Story 4

- [ ] T034 [US4] Implement PATCH /api/{user_id}/tasks/{task_id}/complete endpoint in backend/routes/tasks.py
- [ ] T035 [US4] Add toggle complete method to API client in frontend/lib/api.ts (api.tasks.toggleComplete)
- [ ] T036 [US4] Add completion toggle button/checkbox to frontend/components/task-item.tsx
- [ ] T037 [US4] Wire toggle action in task-item.tsx with optimistic update and error handling

**Checkpoint**: Users can mark tasks complete or incomplete with visual feedback.

---

## Phase 7: User Story 5 - Update Task Details (Priority: P2)

**Goal**: Enable users to edit task title and description

**Independent Test**: Click edit on a task, modify title/description, save → changes persist on refresh

**Acceptance Criteria** (from spec.md):
- Edit and modify title → updated title saved and displayed
- Edit and modify description → updated description saved and displayed
- Try to save with empty title → validation error, changes not saved
- Save changes → "updated at" timestamp refreshed

### Implementation for User Story 5

- [ ] T038 [US5] Implement GET /api/{user_id}/tasks/{task_id} endpoint in backend/routes/tasks.py
- [ ] T039 [US5] Implement PUT /api/{user_id}/tasks/{task_id} endpoint in backend/routes/tasks.py
- [ ] T040 [US5] Add task get and update methods to API client in frontend/lib/api.ts (api.tasks.get, api.tasks.update)
- [ ] T041 [US5] Add edit mode to frontend/components/task-form.tsx for updating existing tasks
- [ ] T042 [US5] Add edit button and inline edit UI to frontend/components/task-item.tsx
- [ ] T043 [US5] Wire edit functionality with validation and error handling

**Checkpoint**: Users can edit task title and description with validation.

---

## Phase 8: User Story 6 - Delete Task (Priority: P2)

**Goal**: Enable users to permanently delete tasks with confirmation

**Independent Test**: Click delete on a task, confirm → task removed from list; refresh → still gone

**Acceptance Criteria** (from spec.md):
- Click delete and confirm → task permanently removed
- Click delete then cancel → task remains
- Delete task and refresh → deleted task does not reappear

### Implementation for User Story 6

- [ ] T044 [US6] Implement DELETE /api/{user_id}/tasks/{task_id} endpoint in backend/routes/tasks.py
- [ ] T045 [US6] Add delete method to API client in frontend/lib/api.ts (api.tasks.delete)
- [ ] T046 [US6] Add delete button to frontend/components/task-item.tsx
- [ ] T047 [US6] Add confirmation dialog for delete action (can use simple confirm() or modal)
- [ ] T048 [US6] Wire delete action with confirmation and error handling

**Checkpoint**: Users can delete tasks with confirmation. Deleted tasks are permanently removed.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T049 Add loading states to all API operations in task components
- [ ] T050 Add error toast/notification for failed operations across all features
- [ ] T051 [P] Style task components with Tailwind CSS for consistent UI
- [ ] T052 [P] Add responsive design adjustments for mobile browsers
- [ ] T053 Initialize database tables on backend startup in backend/main.py (call init_db)
- [ ] T054 Add sign out button to dashboard header in frontend/app/dashboard/page.tsx
- [ ] T055 Verify end-to-end flow: register → create task → view → complete → edit → delete → sign out

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup
    ↓
Phase 2: Foundational (BLOCKS all user stories)
    ↓
Phase 3: US1 - Authentication (BLOCKS all task features)
    ↓
Phase 4: US2 - Create Task ──┬── Phase 5: US3 - View Task List
                             │
                             ↓
                   ┌─────────┴─────────┐
                   ↓                   ↓
         Phase 6: US4 - Complete    Phase 7: US5 - Update    Phase 8: US6 - Delete
                   │                   │                        │
                   └───────────────────┴────────────────────────┘
                                       ↓
                             Phase 9: Polish
```

### User Story Dependencies

| Story | Depends On | Can Start After |
|-------|------------|-----------------|
| US1 - Auth | Foundational | Phase 2 complete |
| US2 - Create | US1 | Phase 3 complete |
| US3 - View | US1, US2 | Phase 4 complete |
| US4 - Complete | US3 | Phase 5 complete |
| US5 - Update | US3 | Phase 5 complete |
| US6 - Delete | US3 | Phase 5 complete |

**Note**: US4, US5, US6 can be implemented in parallel after US3 is complete.

### Within Each User Story

1. Backend endpoint(s) first
2. API client methods
3. UI components
4. Integration and wiring

### Parallel Opportunities

**Phase 1 (Setup)**:
- T002, T003, T004 can run in parallel

**Phase 2 (Foundational)**:
- T007, T008 can run in parallel
- T011, T012 can run in parallel (after T006)

**Phase 3 (US1 - Auth)**:
- T016, T017 can run in parallel

**Phase 6-8 (US4, US5, US6)**:
- All three phases can run in parallel after Phase 5 (US3) completes

**Phase 9 (Polish)**:
- T051, T052 can run in parallel

---

## Parallel Example: After Phase 5 Complete

```bash
# These three phases can start simultaneously:
Phase 6 (US4 - Complete): T034 → T035 → T036 → T037
Phase 7 (US5 - Update): T038 → T039 → T040 → T041 → T042 → T043
Phase 8 (US6 - Delete): T044 → T045 → T046 → T047 → T048
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: US1 - Authentication
4. Complete Phase 4: US2 - Create Task
5. Complete Phase 5: US3 - View Task List
6. **STOP and VALIDATE**: Users can register, create tasks, and view them
7. Deploy to Vercel (frontend) + cloud (backend) if ready

**MVP Delivers**: Authentication + Task Creation + Task Viewing = Core usable application

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Auth) → Users can sign up/in → Deploy
3. Add US2 + US3 (Create + View) → Task loop complete → Deploy (MVP!)
4. Add US4 (Complete) → Progress tracking → Deploy
5. Add US5 (Update) → Task editing → Deploy
6. Add US6 (Delete) → Full CRUD → Deploy
7. Polish phase → Production-ready → Final Deploy

### Parallel Team Strategy

With multiple developers after Phase 5:
- Developer A: US4 - Mark Complete
- Developer B: US5 - Update Task
- Developer C: US6 - Delete Task
- All three can work simultaneously

---

## Summary

| Phase | User Story | Tasks | Parallel Tasks |
|-------|------------|-------|----------------|
| 1 | Setup | 5 | 3 |
| 2 | Foundational | 7 | 4 |
| 3 | US1 - Auth | 10 | 2 |
| 4 | US2 - Create | 6 | 0 |
| 5 | US3 - View | 5 | 0 |
| 6 | US4 - Complete | 4 | 0 |
| 7 | US5 - Update | 6 | 0 |
| 8 | US6 - Delete | 5 | 0 |
| 9 | Polish | 7 | 2 |
| **Total** | | **55** | **11** |

---

## Notes

- [P] tasks = different files, no dependencies within phase
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All backend endpoints include user_id validation per research.md pattern
