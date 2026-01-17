---
name: sqlmodel-schema
description: Generate SQLModel database schemas and models. Use this skill when creating database models, defining table schemas, or setting up the data layer. Triggers on "create model for X", "define database schema", "add table for Y", or when working with SQLModel/database operations in the backend.
---

# SQLModel Schema Generator

Generate SQLModel database models for the Todo application with Neon PostgreSQL.

## Workflow

1. Read feature specification for data requirements
2. Define SQLModel table models
3. Set up relationships between models
4. Configure database connection for Neon
5. Create migration scripts if needed

## Project Structure

```
backend/
├── models/
│   ├── __init__.py      # Export all models
│   ├── base.py          # Base model configuration
│   ├── task.py          # Task model
│   └── user.py          # User model (optional)
├── database.py          # Database connection
└── migrations/          # Alembic migrations (optional)
```

## Base Model Template

```python
# models/base.py
from sqlmodel import SQLModel
from datetime import datetime

class TimestampMixin(SQLModel):
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        sa_column_kwargs={"onupdate": datetime.utcnow}
    )
```

## Task Model Template

```python
# models/task.py
from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime

class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)  # From JWT token

    # Core fields
    title: str = Field(max_length=255)
    description: Optional[str] = Field(default=None)
    is_completed: bool = Field(default=False)

    # Extended fields
    priority: int = Field(default=1, ge=1, le=5)
    due_date: Optional[datetime] = Field(default=None)
    tags: Optional[str] = Field(default=None)  # Comma-separated

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

## Database Connection Template

```python
# database.py
from sqlmodel import SQLModel, create_engine, Session
from contextlib import contextmanager
import os

# Neon PostgreSQL connection string
DATABASE_URL = os.getenv("DATABASE_URL")

# Create engine with Neon-specific settings
engine = create_engine(
    DATABASE_URL,
    echo=True,  # Set to False in production
    pool_pre_ping=True,
    pool_size=5,
    max_overflow=10
)

def create_db_and_tables():
    """Create all tables in the database."""
    SQLModel.metadata.create_all(engine)

def get_session():
    """Dependency for FastAPI routes."""
    with Session(engine) as session:
        yield session

@contextmanager
def get_session_context():
    """Context manager for scripts."""
    with Session(engine) as session:
        yield session
```

## Model with Relationships

```python
# models/task.py (with category relationship)
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List

class Category(SQLModel, table=True):
    __tablename__ = "categories"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    name: str = Field(max_length=100)
    color: Optional[str] = Field(default="#3B82F6")

    # Relationship
    tasks: List["Task"] = Relationship(back_populates="category")

class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: str = Field(index=True)
    title: str = Field(max_length=255)
    is_completed: bool = Field(default=False)

    # Foreign key
    category_id: Optional[int] = Field(default=None, foreign_key="categories.id")
    category: Optional[Category] = Relationship(back_populates="tasks")
```

## Neon PostgreSQL Setup

```python
# .env file
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require

# For Neon serverless
from sqlalchemy.pool import NullPool

engine = create_engine(
    DATABASE_URL,
    poolclass=NullPool,  # Recommended for serverless
)
```

## Key Principles

1. **User Isolation**: Always include `user_id` field indexed
2. **Optional IDs**: Primary keys should be `Optional[int]` with `default=None`
3. **Timestamps**: Include `created_at` and `updated_at` on all models
4. **Validation**: Use Field constraints (max_length, ge, le)
5. **Indexes**: Add indexes on frequently queried fields
