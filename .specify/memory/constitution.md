<!--
SYNC IMPACT REPORT
==================
Version change: 0.0.0 → 1.0.0 (MAJOR - initial constitution creation)

Modified principles: N/A (new document)

Added sections:
- Core Principles (8 principles)
- Technology Stack Requirements
- Development Workflow (SDD)
- API & Security Standards
- Governance

Removed sections: N/A

Templates requiring updates:
- .specify/templates/plan-template.md - ✅ compatible (Constitution Check section exists)
- .specify/templates/spec-template.md - ✅ compatible (functional requirements align)
- .specify/templates/tasks-template.md - ✅ compatible (phase structure aligns)

Follow-up TODOs: None
-->

# Todo Full-Stack Web Application Constitution

## Phase II: Full-Stack Web Application

This constitution governs the development of the Todo Full-Stack Web Application - Phase II of the Evolution of Todo hackathon project. All AI agents and developers MUST adhere to these principles.

## Core Principles

### I. Spec-Driven Development (NON-NEGOTIABLE)

All code MUST be generated through the Spec-Driven Development workflow. Manual coding is prohibited.

- **Workflow**: Specify → Plan → Tasks → Implement
- Every implementation MUST reference a Task ID from `specs/<feature>/tasks.md`
- No code is written until specification is approved
- Agents MUST NOT generate code without a referenced Task ID
- If specification is unclear, agents MUST request clarification rather than assume

**Rationale**: Ensures traceability, prevents "vibe coding", and maintains alignment between requirements and implementation.

### II. Monorepo Architecture

The project uses a monorepo structure with clear separation between frontend and backend.

```
Todo/
├── frontend/          # Next.js 16+ App Router
├── backend/           # FastAPI Python server
├── specs/             # Feature specifications
└── .specify/          # SDD templates and memory
```

- Frontend and backend are separate deployable units
- Shared specifications in `/specs` directory
- Each directory has its own CLAUDE.md for context
- Cross-cutting changes MUST update both services when applicable

**Rationale**: Enables Claude Code to navigate and edit both frontend and backend in a single context while maintaining clear boundaries.

### III. Technology Stack Compliance

The following technology stack is MANDATORY and MUST NOT be substituted:

| Layer | Technology | Version |
|-------|------------|---------|
| Frontend | Next.js (App Router) | 16+ |
| Frontend Runtime | React | 19 |
| Frontend Language | TypeScript | 5.x |
| Frontend Styling | Tailwind CSS | 4.x |
| Backend | FastAPI | Latest |
| Backend Language | Python | 3.13+ |
| ORM | SQLModel | Latest |
| Database | Neon Serverless PostgreSQL | N/A |
| Authentication | Better Auth + JWT | Latest |
| Package Manager (Frontend) | npm | Latest |
| Package Manager (Backend) | uv | Latest |

**Rationale**: Ensures consistency with hackathon requirements and enables reproducible builds.

### IV. Authentication & Security

User authentication MUST follow the Better Auth + JWT pattern:

1. Better Auth handles authentication on the frontend (signup/signin)
2. JWT tokens are issued upon successful login
3. Frontend attaches JWT token to all API requests via `Authorization: Bearer <token>` header
4. Backend verifies JWT using shared `BETTER_AUTH_SECRET`
5. All API endpoints MUST require valid JWT token (401 Unauthorized otherwise)
6. All data queries MUST filter by authenticated user's ID

**Security Requirements**:
- MUST NOT store secrets in code or version control
- MUST use environment variables for sensitive configuration
- MUST validate all user inputs on both frontend and backend
- MUST NOT expose internal errors to users

**Rationale**: Ensures user data isolation and prevents unauthorized access.

### V. API Design Standards

All REST API endpoints MUST follow these conventions:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/{user_id}/tasks | List all tasks |
| POST | /api/{user_id}/tasks | Create a new task |
| GET | /api/{user_id}/tasks/{id} | Get task details |
| PUT | /api/{user_id}/tasks/{id} | Update a task |
| DELETE | /api/{user_id}/tasks/{id} | Delete a task |
| PATCH | /api/{user_id}/tasks/{id}/complete | Toggle completion |

**API Rules**:
- All routes under `/api/` prefix
- Return JSON responses with appropriate HTTP status codes
- Use Pydantic/SQLModel for request/response validation
- Handle errors with HTTPException and meaningful messages
- Task ownership MUST be enforced on every operation

**Rationale**: Standardizes API behavior and enables frontend-backend contract alignment.

### VI. Frontend Patterns

Next.js development MUST follow these patterns:

- Use Server Components by default
- Use Client Components only when interactivity is required (forms, state, effects)
- All backend calls go through `/lib/api.ts` client
- Use Tailwind CSS for styling (no inline styles)
- Follow existing component patterns in `/components`
- Pages and layouts in `/app` directory (App Router)

**Component Structure**:
```
frontend/
├── app/               # Pages and layouts
├── components/        # Reusable UI components
└── lib/               # Shared utilities (api client, auth, utils)
```

**Rationale**: Maintains consistency and leverages Next.js 16+ best practices.

### VII. Backend Patterns

FastAPI development MUST follow these patterns:

- Entry point in `main.py`
- SQLModel for all database models and Pydantic validation
- Route handlers organized in `routes/` directory
- Database connection via `DATABASE_URL` environment variable
- Async handlers for database operations

**Project Structure**:
```
backend/
├── main.py            # FastAPI app entry point
├── models.py          # SQLModel database models
├── routes/            # API route handlers
└── db.py              # Database connection
```

**Rationale**: Maintains clean separation and enables testability.

### VIII. Simplicity & YAGNI

Development MUST prioritize simplicity:

- Start with the simplest solution that meets requirements
- Do NOT add features beyond what is specified
- Do NOT over-engineer or add premature abstractions
- Do NOT add error handling for impossible scenarios
- Three similar lines of code is better than a premature abstraction
- Delete unused code completely (no backward-compatibility hacks)

**Rationale**: Reduces complexity, improves maintainability, and accelerates development.

## Technology Stack Requirements

### Frontend Dependencies (package.json)

Required packages:
- `next` (16+)
- `react`, `react-dom` (19)
- `typescript`
- `tailwindcss`
- `better-auth` (with JWT plugin)

### Backend Dependencies (pyproject.toml)

Required packages:
- `fastapi`
- `uvicorn`
- `sqlmodel`
- `python-jose[cryptography]` (JWT verification)
- `psycopg2-binary` or `asyncpg` (PostgreSQL driver)

### Environment Variables

| Variable | Service | Purpose |
|----------|---------|---------|
| DATABASE_URL | Backend | Neon PostgreSQL connection string |
| BETTER_AUTH_SECRET | Both | Shared JWT signing secret |
| BETTER_AUTH_URL | Frontend | Auth service URL |
| NEXT_PUBLIC_API_URL | Frontend | Backend API base URL |

## Development Workflow (SDD)

### Mandatory Workflow

1. **Specify** (`/sp.specify`): Create feature specification in `specs/<feature>/spec.md`
2. **Plan** (`/sp.plan`): Generate technical architecture in `specs/<feature>/plan.md`
3. **Tasks** (`/sp.tasks`): Break plan into actionable tasks in `specs/<feature>/tasks.md`
4. **Implement** (`/sp.implement`): Execute tasks from tasks.md

### Code Generation Rules

- All generated code MUST include a comment referencing the Task ID
- Example: `# Task: T001 - Create Task model`
- Agents MUST NOT write code for tasks not in tasks.md
- If blocked, agents MUST request clarification or propose specification updates

### Commit Guidelines

- Commit after each task or logical group
- Commit message format: `[T###] Brief description`
- Example: `[T001] Create Task SQLModel schema`

## API & Security Standards

### Request/Response Format

All API responses MUST follow this structure:

**Success Response**:
```json
{
  "data": { ... },
  "message": "Operation successful"
}
```

**Error Response**:
```json
{
  "detail": "Error description",
  "code": "ERROR_CODE"
}
```

### HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Successful GET, PUT, PATCH |
| 201 | Successful POST (resource created) |
| 204 | Successful DELETE |
| 400 | Bad request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (resource not owned by user) |
| 404 | Resource not found |
| 500 | Internal server error |

## Governance

### Amendment Process

1. Proposed changes MUST be documented with rationale
2. Changes affecting architecture require ADR (`/sp.adr`)
3. Constitution amendments follow semantic versioning:
   - **MAJOR**: Backward incompatible principle changes
   - **MINOR**: New principles or expanded guidance
   - **PATCH**: Clarifications and typo fixes

### Compliance

- All PRs/reviews MUST verify compliance with this constitution
- Complexity beyond these standards MUST be justified in writing
- Use CLAUDE.md for runtime development guidance

### Hierarchy

In case of conflict: **Constitution > Specification > Plan > Tasks**

**Version**: 1.0.0 | **Ratified**: 2026-01-18 | **Last Amended**: 2026-01-18
