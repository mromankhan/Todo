# Quickstart Guide: Full-Stack Todo Web Application

**Date**: 2026-01-18
**Feature**: 001-fullstack-todo-app
**Purpose**: Development setup and running instructions

## Prerequisites

- **Node.js**: v20+ (for Next.js frontend)
- **Python**: 3.13+ (for FastAPI backend)
- **uv**: Python package manager (`pip install uv`)
- **Neon Account**: Free tier at https://neon.tech

## Environment Setup

### 1. Clone and Navigate

```bash
cd Todo
```

### 2. Create Environment Files

**Backend** (`backend/.env`):
```bash
# Neon PostgreSQL connection string (get from Neon dashboard)
DATABASE_URL=postgresql+asyncpg://user:password@host.neon.tech/dbname?sslmode=require

# Shared secret for JWT verification (must match frontend)
# Generate with: openssl rand -base64 32
BETTER_AUTH_SECRET=your-32-char-minimum-secret-here

# Frontend URL for CORS (development)
FRONTEND_URL=http://localhost:3000
```

**Frontend** (`frontend/.env.local`):
```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Better Auth configuration
BETTER_AUTH_SECRET=your-32-char-minimum-secret-here
BETTER_AUTH_URL=http://localhost:3000/api/auth

# Database URL for Better Auth (same Neon database)
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
```

> **Important**: Use the same `BETTER_AUTH_SECRET` in both files!

### 3. Install Dependencies

**Backend**:
```bash
cd backend
uv sync
```

**Frontend**:
```bash
cd frontend
npm install
```

## Running the Application

### Development Mode

**Terminal 1 - Backend**:
```bash
cd backend
uv run uvicorn main:app --reload --port 8000
```

**Terminal 2 - Frontend**:
```bash
cd frontend
npm run dev
```

**Access**:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Database Initialization

The database tables are created automatically on first backend startup via SQLModel's `create_all()`. Better Auth manages its own user tables.

## Testing

### Backend Tests
```bash
cd backend
uv run pytest
```

### Frontend Tests
```bash
cd frontend
npm test
```

### E2E Tests (Playwright)
```bash
cd frontend
npx playwright test
```

## Project Structure

```
Todo/
├── backend/
│   ├── main.py           # FastAPI entry point
│   ├── models.py         # SQLModel schemas
│   ├── db.py             # Database connection
│   ├── routes/
│   │   └── tasks.py      # Task API handlers
│   ├── middleware/
│   │   └── auth.py       # JWT verification
│   └── .env              # Backend environment variables
│
├── frontend/
│   ├── app/
│   │   ├── layout.tsx    # Root layout
│   │   ├── page.tsx      # Landing page
│   │   ├── (auth)/       # Auth pages
│   │   └── dashboard/    # Protected dashboard
│   ├── components/       # React components
│   ├── lib/
│   │   ├── api.ts        # API client
│   │   └── auth.ts       # Better Auth setup
│   └── .env.local        # Frontend environment variables
│
└── specs/
    └── 001-fullstack-todo-app/
        ├── spec.md       # Feature specification
        ├── plan.md       # Implementation plan
        └── contracts/    # API contracts
```

## API Quick Reference

All endpoints require JWT token in `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/{user_id}/tasks` | List all tasks |
| POST | `/api/{user_id}/tasks` | Create task |
| GET | `/api/{user_id}/tasks/{id}` | Get task |
| PUT | `/api/{user_id}/tasks/{id}` | Update task |
| DELETE | `/api/{user_id}/tasks/{id}` | Delete task |
| PATCH | `/api/{user_id}/tasks/{id}/complete` | Toggle complete |
| GET | `/health` | Health check (no auth) |

## Neon Database Setup

1. Create account at https://neon.tech
2. Create a new project
3. Copy connection string from dashboard
4. Replace `postgres://` with `postgresql+asyncpg://` for backend
5. Keep `postgresql://` prefix for frontend (Better Auth)

## Troubleshooting

### CORS Errors
- Ensure `FRONTEND_URL` is set correctly in backend `.env`
- Check browser console for specific origin errors

### JWT Invalid Token
- Verify `BETTER_AUTH_SECRET` matches in both services
- Check token expiration (7-day default)

### Database Connection Failed
- Verify Neon project is active (auto-pauses after inactivity)
- Check connection string format matches service (asyncpg vs regular)

### Better Auth Issues
- Run `npx better-auth migrate` in frontend to initialize auth tables
- Check browser cookies for session data

## Deployment Notes

### Vercel (Frontend)
1. Connect GitHub repository
2. Set root directory to `frontend`
3. Add environment variables in Vercel dashboard

### Backend Deployment
1. Create Dockerfile (see Phase IV)
2. Deploy to cloud provider
3. Update `NEXT_PUBLIC_API_URL` in frontend env

### Production Checklist
- [ ] Set secure `BETTER_AUTH_SECRET` (32+ chars)
- [ ] Update CORS origins for production domain
- [ ] Enable SSL/TLS for all connections
- [ ] Set appropriate session expiry
