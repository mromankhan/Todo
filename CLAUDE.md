# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Todo application built using Spec-Driven Development (SDD), evolving through 5 phases: Console App → Full-Stack Web App → AI Chatbot → Local K8s → Cloud Deployment.

## Tech Stack

- **Frontend**: Next.js 16+ (App Router), React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Python 3.13+, FastAPI, SQLModel
- **Database**: Neon Serverless PostgreSQL
- **Auth**: Better Auth (frontend) with JWT for backend integration
- **Package Managers**: npm (frontend), uv (backend)

## Commands

### Frontend (from `/frontend`)
```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # Run ESLint
npm test         # Run tests (when configured)
```

### Backend (from `/backend`)
```bash
uv run uvicorn main:app --reload --port 8000  # Start dev server
uv sync                                        # Install dependencies
uv run python main.py                         # Run main script
```

### Both Services
```bash
docker-compose up  # Start both services (when configured)
```

## Architecture

```
Todo/
├── frontend/          # Next.js 16 App Router application
│   ├── app/           # Pages and layouts
│   └── lib/           # Shared utilities (api client, utils)
├── backend/           # FastAPI Python server
│   └── main.py        # Entry point
├── specs/             # Feature specifications (SDD artifacts)
│   └── <feature>/     # spec.md, plan.md, tasks.md per feature
├── .specify/          # SpecKit Plus templates and scripts
│   ├── memory/        # constitution.md (project principles)
│   ├── templates/     # spec, plan, tasks, ADR templates
│   └── scripts/       # PHR and feature creation scripts
├── .claude/
│   ├── commands/      # Slash commands (sp.specify, sp.plan, sp.tasks, etc.)
│   └── skills/        # Reusable skills for common patterns
└── history/           # Prompt History Records and ADRs
```

## Development Workflow (SDD)

This project follows **Spec-Driven Development**. Follow the workflow:

1. **Specify**: `/sp.specify` - Create feature specification
2. **Plan**: `/sp.plan` - Generate technical architecture
3. **Tasks**: `/sp.tasks` - Break plan into actionable tasks
4. **Implement**: `/sp.implement` - Execute tasks from tasks.md

**Key principle**: No code is written until specification is approved. All implementations must reference a Task ID from `specs/<feature>/tasks.md`.

## Available Slash Commands

| Command | Purpose |
|---------|---------|
| `/sp.specify` | Create/update feature specification |
| `/sp.plan` | Generate implementation plan |
| `/sp.tasks` | Generate actionable tasks |
| `/sp.implement` | Execute implementation from tasks |
| `/sp.clarify` | Ask clarification questions for underspecified areas |
| `/sp.checklist` | Generate custom checklist for feature |
| `/sp.adr` | Document architectural decisions |
| `/sp.phr` | Create Prompt History Record |
| `/sp.git.commit_pr` | Commit work and create PR |

## Available Skills

Skills provide specialized patterns. Invoke via the Skill tool:

- `fastapi-crud` - Generate FastAPI CRUD endpoints
- `nextjs-component` - Generate Next.js React components
- `sqlmodel-schema` - Generate SQLModel database schemas
- `better-auth-setup` - Configure Better Auth authentication
- `jwt-middleware` - Generate FastAPI JWT verification middleware
- `api-client` - Generate TypeScript API client
- `db-migration` - Generate database migration scripts
- `spec-feature` - Generate feature specifications

## Key Patterns

### API Integration
- Frontend calls backend via `/lib/api.ts` client
- JWT tokens passed in `Authorization: Bearer <token>` header
- Backend verifies JWT using shared `BETTER_AUTH_SECRET`

### Authentication Flow
1. User logs in via Better Auth (frontend)
2. JWT token issued and stored
3. Frontend attaches token to API requests
4. Backend middleware verifies token and extracts user

### Database
- SQLModel for ORM and Pydantic validation
- Neon PostgreSQL connection via `DATABASE_URL` env var
- All routes filter by authenticated user's ID

## Constitution (Core Principles)

See `.specify/memory/constitution.md` for project principles including:
- Library-first architecture
- CLI interface exposure
- Test-first development (TDD)
- Integration testing requirements
- Observability and versioning standards

## PHR (Prompt History Records)

After completing work, create a PHR using `/sp.phr` or manually via:
```
history/prompts/
├── constitution/   # Constitution-related prompts
├── <feature>/      # Feature-specific prompts
└── general/        # General prompts
```

## ADR Suggestions

When making significant architectural decisions, suggest creating an ADR:
> "📋 Architectural decision detected: <brief>. Document? Run `/sp.adr <title>`"

Test for ADR significance: Does it have long-term impact + multiple alternatives + cross-cutting scope?
