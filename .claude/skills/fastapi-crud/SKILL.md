---
name: fastapi-crud
description: Generate FastAPI CRUD endpoints from specifications. Use this skill when creating REST API endpoints in the backend, implementing CRUD operations, or when user requests API routes for features. Triggers on "create API for X", "add endpoint for Y", "implement backend routes", or when working in the /backend directory.
---

# FastAPI CRUD Generator

Generate production-ready FastAPI CRUD endpoints for the Todo application backend.

## Workflow

1. Read the feature specification from `/specs/`
2. Identify required endpoints and data models
3. Generate Pydantic schemas for request/response
4. Create FastAPI router with CRUD operations
5. Add proper error handling and validation

## Project Structure

```
backend/
├── main.py              # FastAPI app entry point
├── routers/
│   └── tasks.py         # Task CRUD router
├── schemas/
│   └── task.py          # Pydantic schemas
├── models/
│   └── task.py          # SQLModel models
└── dependencies.py      # Shared dependencies (auth, db)
```

## Router Template

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List

from models.task import Task
from schemas.task import TaskCreate, TaskUpdate, TaskResponse
from dependencies import get_session, get_current_user

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

@router.get("/", response_model=List[TaskResponse])
async def list_tasks(
    session: Session = Depends(get_session),
    user_id: str = Depends(get_current_user)
):
    """List all tasks for the current user."""
    statement = select(Task).where(Task.user_id == user_id)
    tasks = session.exec(statement).all()
    return tasks

@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task: TaskCreate,
    session: Session = Depends(get_session),
    user_id: str = Depends(get_current_user)
):
    """Create a new task."""
    db_task = Task(**task.model_dump(), user_id=user_id)
    session.add(db_task)
    session.commit()
    session.refresh(db_task)
    return db_task

@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: int,
    session: Session = Depends(get_session),
    user_id: str = Depends(get_current_user)
):
    """Get a specific task by ID."""
    task = session.get(Task, task_id)
    if not task or task.user_id != user_id:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: int,
    task_update: TaskUpdate,
    session: Session = Depends(get_session),
    user_id: str = Depends(get_current_user)
):
    """Update a task."""
    task = session.get(Task, task_id)
    if not task or task.user_id != user_id:
        raise HTTPException(status_code=404, detail="Task not found")

    task_data = task_update.model_dump(exclude_unset=True)
    for key, value in task_data.items():
        setattr(task, key, value)

    session.add(task)
    session.commit()
    session.refresh(task)
    return task

@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: int,
    session: Session = Depends(get_session),
    user_id: str = Depends(get_current_user)
):
    """Delete a task."""
    task = session.get(Task, task_id)
    if not task or task.user_id != user_id:
        raise HTTPException(status_code=404, detail="Task not found")

    session.delete(task)
    session.commit()

@router.patch("/{task_id}/complete", response_model=TaskResponse)
async def toggle_complete(
    task_id: int,
    session: Session = Depends(get_session),
    user_id: str = Depends(get_current_user)
):
    """Toggle task completion status."""
    task = session.get(Task, task_id)
    if not task or task.user_id != user_id:
        raise HTTPException(status_code=404, detail="Task not found")

    task.is_completed = not task.is_completed
    session.add(task)
    session.commit()
    session.refresh(task)
    return task
```

## Schema Template

```python
from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: int = 1
    due_date: Optional[datetime] = None

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    priority: Optional[int] = None
    due_date: Optional[datetime] = None
    is_completed: Optional[bool] = None

class TaskResponse(TaskBase):
    id: int
    user_id: str
    is_completed: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
```

## Key Principles

1. **User Isolation**: Always filter by `user_id` from JWT token
2. **Validation**: Use Pydantic for input validation
3. **Error Handling**: Return proper HTTP status codes
4. **Type Safety**: Use type hints throughout
5. **Documentation**: FastAPI auto-generates OpenAPI docs
