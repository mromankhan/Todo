"""SQLModel database models for the Todo application."""
from datetime import datetime
from typing import Optional

from sqlmodel import SQLModel, Field


class TaskBase(SQLModel):
    """Base fields shared between create, update, and read operations."""

    title: str = Field(min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)


class TaskCreate(TaskBase):
    """Schema for creating a new task."""

    pass


class TaskUpdate(SQLModel):
    """Schema for updating an existing task. All fields optional."""

    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=1000)


class Task(TaskBase, table=True):
    """Database model for tasks."""

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True, nullable=False)
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class TaskRead(TaskBase):
    """Schema for reading task data (API response)."""

    id: int
    user_id: str
    completed: bool
    created_at: datetime
    updated_at: datetime
