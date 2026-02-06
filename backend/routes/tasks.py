"""Task CRUD API route handlers."""
from datetime import datetime
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from db import get_session
from models import Task, TaskCreate, TaskUpdate, TaskRead
from middleware.auth import verify_jwt, validate_user_access


router = APIRouter(prefix="/api", tags=["tasks"])


@router.post("/{user_id}/tasks", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
async def create_task(
    user_id: str,
    task_data: TaskCreate,
    current_user: dict[str, Any] = Depends(verify_jwt),
    session: AsyncSession = Depends(get_session),
) -> Task:
    """Create a new task for the specified user."""
    validate_user_access(user_id, current_user)

    task = Task(
        user_id=user_id,
        title=task_data.title.strip(),
        description=task_data.description.strip() if task_data.description else None,
    )

    session.add(task)
    await session.commit()
    await session.refresh(task)

    return task


@router.get("/{user_id}/tasks", response_model=list[TaskRead])
async def list_tasks(
    user_id: str,
    current_user: dict[str, Any] = Depends(verify_jwt),
    session: AsyncSession = Depends(get_session),
) -> list[Task]:
    """List all tasks for the specified user."""
    validate_user_access(user_id, current_user)

    statement = select(Task).where(Task.user_id == user_id).order_by(Task.created_at.desc())
    result = await session.execute(statement)
    tasks = result.scalars().all()

    return list(tasks)


@router.get("/{user_id}/tasks/{task_id}", response_model=TaskRead)
async def get_task(
    user_id: str,
    task_id: int,
    current_user: dict[str, Any] = Depends(verify_jwt),
    session: AsyncSession = Depends(get_session),
) -> Task:
    """Get a specific task by ID."""
    validate_user_access(user_id, current_user)

    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    result = await session.execute(statement)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    return task


@router.put("/{user_id}/tasks/{task_id}", response_model=TaskRead)
async def update_task(
    user_id: str,
    task_id: int,
    task_data: TaskUpdate,
    current_user: dict[str, Any] = Depends(verify_jwt),
    session: AsyncSession = Depends(get_session),
) -> Task:
    """Update an existing task."""
    validate_user_access(user_id, current_user)

    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    result = await session.execute(statement)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    # Update only provided fields
    if task_data.title is not None:
        task.title = task_data.title.strip()
    if task_data.description is not None:
        task.description = task_data.description.strip() if task_data.description else None

    task.updated_at = datetime.utcnow()

    session.add(task)
    await session.commit()
    await session.refresh(task)

    return task


@router.delete("/{user_id}/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    user_id: str,
    task_id: int,
    current_user: dict[str, Any] = Depends(verify_jwt),
    session: AsyncSession = Depends(get_session),
) -> None:
    """Delete a task."""
    validate_user_access(user_id, current_user)

    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    result = await session.execute(statement)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    await session.delete(task)
    await session.commit()


@router.patch("/{user_id}/tasks/{task_id}/complete", response_model=TaskRead)
async def toggle_task_complete(
    user_id: str,
    task_id: int,
    current_user: dict[str, Any] = Depends(verify_jwt),
    session: AsyncSession = Depends(get_session),
) -> Task:
    """Toggle task completion status."""
    validate_user_access(user_id, current_user)

    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    result = await session.execute(statement)
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    task.completed = not task.completed
    task.updated_at = datetime.utcnow()

    session.add(task)
    await session.commit()
    await session.refresh(task)

    return task
