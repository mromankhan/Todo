# Research: Full-Stack Todo Web Application

**Date**: 2026-01-18
**Feature**: 001-fullstack-todo-app
**Purpose**: Resolve technical unknowns and document best practices for implementation

## Research Items

### 1. Better Auth + JWT Integration with FastAPI

**Question**: How do we configure Better Auth on Next.js frontend to issue JWT tokens that FastAPI can verify?

**Decision**: Use Better Auth's JWT plugin with a shared secret

**Rationale**:
- Better Auth natively supports JWT via the `jwt` plugin
- JWT is stateless - backend doesn't need to call frontend to verify
- Shared secret (`BETTER_AUTH_SECRET`) enables independent verification

**Implementation Pattern**:

Frontend (Better Auth config):
```typescript
// lib/auth.ts
import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";

export const auth = betterAuth({
  database: {
    // Better Auth manages its own user table
    provider: "pg",
    url: process.env.DATABASE_URL!,
  },
  plugins: [
    jwt({
      // JWT settings
      expiresIn: "7d", // Match session expiry from spec
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
  },
});
```

Backend (JWT verification):
```python
# middleware/auth.py
from jose import jwt, JWTError
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def verify_jwt(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    token = credentials.credentials
    try:
        payload = jwt.decode(
            token,
            os.environ["BETTER_AUTH_SECRET"],
            algorithms=["HS256"]
        )
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

**Alternatives Considered**:
- Session cookies: Rejected - requires backend to validate with frontend
- OAuth2 with separate auth server: Rejected - over-engineering for this scope

---

### 2. SQLModel Async Patterns with Neon PostgreSQL

**Question**: How do we configure SQLModel for async operations with Neon's serverless PostgreSQL?

**Decision**: Use SQLModel with asyncpg driver and async session maker

**Rationale**:
- Neon supports standard PostgreSQL connections
- asyncpg provides best async performance for PostgreSQL
- SQLModel wraps SQLAlchemy async patterns cleanly

**Implementation Pattern**:

```python
# db.py
from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.environ["DATABASE_URL"]
# Convert postgres:// to postgresql+asyncpg://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

engine = create_async_engine(DATABASE_URL, echo=False)

async_session = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def get_session() -> AsyncSession:
    async with async_session() as session:
        yield session

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
```

**Alternatives Considered**:
- Synchronous psycopg2: Rejected - blocks event loop, poor for concurrent users
- Raw asyncpg without ORM: Rejected - loses SQLModel's Pydantic integration

---

### 3. Next.js 16 App Router Authentication Patterns

**Question**: How do we protect routes and handle auth state in Next.js 16 App Router?

**Decision**: Use Better Auth's React integration with middleware for route protection

**Rationale**:
- Better Auth provides `useSession` hook for client components
- Next.js middleware can protect routes before rendering
- Server components can verify auth via cookies

**Implementation Pattern**:

Middleware for route protection:
```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const session = request.cookies.get("better-auth.session");

  // Protect dashboard routes
  if (request.nextUrl.pathname.startsWith("/dashboard")) {
    if (!session) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
  }

  // Redirect authenticated users away from auth pages
  if (request.nextUrl.pathname.startsWith("/sign-in") ||
      request.nextUrl.pathname.startsWith("/sign-up")) {
    if (session) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/sign-in", "/sign-up"],
};
```

Client-side auth hook:
```typescript
// lib/auth-client.ts
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
});

export const { useSession, signIn, signUp, signOut } = authClient;
```

**Alternatives Considered**:
- NextAuth.js: Rejected - Better Auth is specified in constitution
- Custom JWT cookies: Rejected - Better Auth handles this internally

---

### 4. API Client Pattern for Frontend-Backend Communication

**Question**: How should the frontend call the backend API with JWT authentication?

**Decision**: Create a typed API client in `/lib/api.ts` that automatically attaches JWT tokens

**Rationale**:
- Centralized API calls enable consistent error handling
- Automatic token attachment reduces boilerplate
- TypeScript types ensure request/response correctness

**Implementation Pattern**:

```typescript
// lib/api.ts
import { authClient } from "./auth-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

async function getAuthHeader(): Promise<HeadersInit> {
  const session = await authClient.getSession();
  if (!session?.data?.session?.token) {
    return {};
  }
  return {
    Authorization: `Bearer ${session.data.session.token}`,
  };
}

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const authHeader = await getAuthHeader();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

export const api = {
  tasks: {
    list: (userId: string) =>
      apiRequest<Task[]>(`/api/${userId}/tasks`),
    get: (userId: string, taskId: number) =>
      apiRequest<Task>(`/api/${userId}/tasks/${taskId}`),
    create: (userId: string, data: CreateTaskInput) =>
      apiRequest<Task>(`/api/${userId}/tasks`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (userId: string, taskId: number, data: UpdateTaskInput) =>
      apiRequest<Task>(`/api/${userId}/tasks/${taskId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (userId: string, taskId: number) =>
      apiRequest<void>(`/api/${userId}/tasks/${taskId}`, {
        method: "DELETE",
      }),
    toggleComplete: (userId: string, taskId: number) =>
      apiRequest<Task>(`/api/${userId}/tasks/${taskId}/complete`, {
        method: "PATCH",
      }),
  },
};
```

**Alternatives Considered**:
- Direct fetch in components: Rejected - duplicates auth logic
- Axios: Rejected - fetch is standard and sufficient

---

### 5. CORS Configuration for Monorepo Development

**Question**: How do we configure CORS to allow frontend-backend communication during development?

**Decision**: Configure FastAPI CORS middleware with explicit origins

**Rationale**:
- Development requires cross-origin requests (localhost:3000 → localhost:8000)
- Production will use the same approach with deployed origins
- Explicit origins are more secure than wildcards

**Implementation Pattern**:

```python
# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

# CORS configuration
origins = [
    "http://localhost:3000",  # Next.js dev server
    os.environ.get("FRONTEND_URL", ""),  # Production frontend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=[o for o in origins if o],  # Filter empty strings
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Alternatives Considered**:
- Proxy through Next.js: Rejected - adds complexity, hides real API behavior
- Allow all origins: Rejected - security risk in production

---

### 6. User ID Source in API Routes

**Question**: Should user_id come from the URL path or be extracted from the JWT token?

**Decision**: Extract user_id from JWT token; validate it matches URL path parameter

**Rationale**:
- JWT contains the authenticated user's identity (source of truth)
- URL parameter enables RESTful routing patterns
- Matching both prevents user A from accessing user B's data by changing URL

**Implementation Pattern**:

```python
# routes/tasks.py
from fastapi import APIRouter, Depends, HTTPException
from middleware.auth import verify_jwt

router = APIRouter()

@router.get("/api/{user_id}/tasks")
async def list_tasks(
    user_id: str,
    current_user: dict = Depends(verify_jwt),
    session: AsyncSession = Depends(get_session)
):
    # Ensure URL user_id matches authenticated user
    if user_id != current_user["sub"]:
        raise HTTPException(status_code=403, detail="Access denied")

    # Query tasks for this user
    statement = select(Task).where(Task.user_id == user_id)
    result = await session.execute(statement)
    return result.scalars().all()
```

**Alternatives Considered**:
- Only use URL parameter: Rejected - anyone could access any user's data
- Only use JWT: Rejected - loses RESTful URL structure

---

## Summary of Decisions

| Topic | Decision | Key Dependency |
|-------|----------|----------------|
| Auth Integration | Better Auth JWT plugin + python-jose | BETTER_AUTH_SECRET env var |
| Database | SQLModel + asyncpg | DATABASE_URL with postgresql+asyncpg:// |
| Route Protection | Next.js middleware + Better Auth session | Middleware matcher config |
| API Client | Typed fetch wrapper with auto-auth | /lib/api.ts |
| CORS | FastAPI middleware with explicit origins | FRONTEND_URL env var |
| User Validation | JWT + URL path match | verify_jwt dependency |

## Dependencies to Add

### Backend (pyproject.toml)
```toml
dependencies = [
    "fastapi[standard]>=0.124.4",
    "sqlmodel>=0.0.27",
    "python-jose[cryptography]>=3.3.0",  # JWT verification
    "asyncpg>=0.30.0",                    # Async PostgreSQL driver
]
```

### Frontend (package.json)
```json
{
  "dependencies": {
    "better-auth": "^1.4.7"  # Already present
  }
}
```

## Environment Variables Required

| Variable | Service | Example Value |
|----------|---------|---------------|
| DATABASE_URL | Backend | postgresql://user:pass@host/db |
| BETTER_AUTH_SECRET | Both | 32+ character random string |
| NEXT_PUBLIC_API_URL | Frontend | http://localhost:8000 |
| FRONTEND_URL | Backend | http://localhost:3000 |
