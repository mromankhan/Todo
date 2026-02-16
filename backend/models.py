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


class Conversation(SQLModel, table=True):
    """Database model for chat conversations (threads)."""

    id: Optional[int] = Field(default=None, primary_key=True)
    thread_id: str = Field(index=True, unique=True, nullable=False)
    user_id: str = Field(index=True, nullable=False)
    title: Optional[str] = Field(default=None, max_length=200)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class Message(SQLModel, table=True):
    """Database model for chat messages within conversations."""

    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: int = Field(foreign_key="conversation.id", index=True, nullable=False)
    user_id: str = Field(index=True, nullable=False)
    role: str = Field(nullable=False)  # "user" or "assistant"
    content: str = Field(nullable=False)
    created_at: datetime = Field(default_factory=datetime.utcnow)
