---
name: jwt-middleware
description: Generate FastAPI JWT verification middleware for authenticating requests from the Next.js frontend using Better Auth tokens. Use this skill when securing API endpoints, validating JWT tokens, or extracting user information from tokens. Triggers on "add JWT auth", "secure endpoint", "verify token", or when working on backend authentication.
---

# JWT Middleware Generator

Generate FastAPI middleware to verify JWT tokens issued by Better Auth in the frontend.

## Workflow

1. Install required dependencies (python-jose, passlib)
2. Create JWT verification utilities
3. Build authentication dependency for FastAPI
4. Apply middleware to protected routes
5. Extract user_id for data isolation

## Project Structure

```
backend/
├── auth/
│   ├── __init__.py
│   ├── jwt.py           # JWT verification utilities
│   └── dependencies.py  # FastAPI auth dependencies
├── routers/
│   └── tasks.py         # Protected routes
└── main.py              # FastAPI app with middleware
```

## Installation

```bash
pip install python-jose[cryptography] passlib
# or with uv
uv add python-jose[cryptography] passlib
```

## JWT Verification Utilities

```python
# auth/jwt.py
from datetime import datetime
from typing import Optional
from jose import JWTError, jwt
from pydantic import BaseModel
import os

# Shared secret with Better Auth frontend
JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = "HS256"

class TokenData(BaseModel):
    user_id: str
    email: Optional[str] = None
    exp: Optional[datetime] = None

class TokenPayload(BaseModel):
    sub: str  # user_id
    email: Optional[str] = None
    exp: int
    iat: int

def verify_token(token: str) -> TokenData:
    """
    Verify a JWT token and extract user data.

    Args:
        token: The JWT token string

    Returns:
        TokenData with user information

    Raises:
        JWTError: If token is invalid or expired
    """
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM]
        )

        # Extract user_id from 'sub' claim (Better Auth standard)
        user_id = payload.get("sub")
        if user_id is None:
            # Fallback to custom claim
            user_id = payload.get("user_id")

        if user_id is None:
            raise JWTError("Token missing user identifier")

        return TokenData(
            user_id=user_id,
            email=payload.get("email"),
            exp=datetime.fromtimestamp(payload.get("exp", 0))
        )

    except JWTError as e:
        raise JWTError(f"Token validation failed: {str(e)}")
```

## FastAPI Dependencies

```python
# auth/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError

from .jwt import verify_token, TokenData

# Security scheme for Swagger UI
security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> TokenData:
    """
    FastAPI dependency to verify JWT and get current user.

    Usage:
        @router.get("/tasks")
        async def get_tasks(user: TokenData = Depends(get_current_user)):
            # user.user_id is available here
    """
    token = credentials.credentials

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        token_data = verify_token(token)
        return token_data
    except JWTError:
        raise credentials_exception

async def get_current_user_id(
    user: TokenData = Depends(get_current_user)
) -> str:
    """
    Convenience dependency that returns just the user_id string.

    Usage:
        @router.get("/tasks")
        async def get_tasks(user_id: str = Depends(get_current_user_id)):
            # Filter tasks by user_id
    """
    return user.user_id

# Optional: Allow unauthenticated access
async def get_optional_user(
    credentials: HTTPAuthorizationCredentials = Depends(
        HTTPBearer(auto_error=False)
    )
) -> TokenData | None:
    """
    Dependency that returns user if authenticated, None otherwise.
    """
    if credentials is None:
        return None

    try:
        return verify_token(credentials.credentials)
    except JWTError:
        return None
```

## Using in Routes

```python
# routers/tasks.py
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List

from models.task import Task
from schemas.task import TaskCreate, TaskResponse
from auth.dependencies import get_current_user_id
from database import get_session

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

@router.get("/", response_model=List[TaskResponse])
async def list_tasks(
    session: Session = Depends(get_session),
    user_id: str = Depends(get_current_user_id)  # JWT validated here
):
    """List all tasks for the authenticated user."""
    statement = select(Task).where(Task.user_id == user_id)
    tasks = session.exec(statement).all()
    return tasks

@router.post("/", response_model=TaskResponse, status_code=201)
async def create_task(
    task: TaskCreate,
    session: Session = Depends(get_session),
    user_id: str = Depends(get_current_user_id)
):
    """Create a new task for the authenticated user."""
    db_task = Task(**task.model_dump(), user_id=user_id)
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task
```

## Main App Configuration

```python
# main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routers import tasks

app = FastAPI(
    title="Todo API",
    description="Phase II Todo Application API",
    version="1.0.0"
)

# CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev
        "https://yourdomain.com", # Production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(tasks.router)

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
```

## Environment Variables

```env
# backend/.env
JWT_SECRET=your-shared-secret-with-frontend-min-32-chars
DATABASE_URL=postgresql://...@neon.tech/neondb?sslmode=require
```

## Testing JWT Auth

```python
# tests/test_auth.py
import pytest
from jose import jwt
from datetime import datetime, timedelta

from auth.jwt import verify_token, JWT_SECRET, JWT_ALGORITHM

def create_test_token(user_id: str, expires_delta: timedelta = timedelta(hours=1)):
    """Create a test JWT token."""
    expire = datetime.utcnow() + expires_delta
    payload = {
        "sub": user_id,
        "email": "test@example.com",
        "exp": expire,
        "iat": datetime.utcnow()
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def test_verify_valid_token():
    token = create_test_token("user123")
    data = verify_token(token)
    assert data.user_id == "user123"
    assert data.email == "test@example.com"

def test_verify_expired_token():
    token = create_test_token("user123", expires_delta=timedelta(hours=-1))
    with pytest.raises(Exception):
        verify_token(token)
```

## Key Principles

1. **Shared Secret**: JWT_SECRET must match Better Auth configuration
2. **User Isolation**: Always use user_id from token for data filtering
3. **Automatic Validation**: Dependencies handle token verification
4. **Swagger Integration**: HTTPBearer enables "Authorize" button in docs
5. **Error Messages**: Return 401 with proper WWW-Authenticate header
