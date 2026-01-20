---
name: db-migration
description: Generate database migration scripts and manage schema changes for Neon PostgreSQL with SQLModel/Alembic. Use this skill when creating tables, modifying schemas, or setting up the initial database. Triggers on "create migration", "update schema", "initialize database", or when working with database structure changes.
---

# Database Migration Generator

Generate and manage database migrations for Neon PostgreSQL using SQLModel and Alembic.

## Workflow

1. Define SQLModel models
2. Initialize Alembic (first time only)
3. Generate migration scripts
4. Apply migrations to database
5. Handle rollbacks if needed

## Project Structure

```
backend/
├── models/
│   ├── __init__.py      # Export all models
│   └── task.py          # Task model
├── database.py          # Database connection
├── alembic.ini          # Alembic configuration
└── migrations/
    ├── env.py           # Alembic environment
    ├── script.py.mako   # Migration template
    └── versions/        # Migration scripts
        └── 001_initial.py
```

## Installation

```bash
pip install alembic
# or with uv
uv add alembic
```

## Initialize Alembic

```bash
cd backend
alembic init migrations
```

## Alembic Configuration

```ini
# alembic.ini
[alembic]
script_location = migrations
prepend_sys_path = .
sqlalchemy.url = driver://user:pass@localhost/dbname

[post_write_hooks]
hooks = black
black.type = console_scripts
black.entrypoint = black
black.options = -q
```

## Alembic Environment Setup

```python
# migrations/env.py
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
import os
import sys

# Add parent directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from sqlmodel import SQLModel
from models import *  # Import all models

config = context.config

# Set database URL from environment
config.set_main_option("sqlalchemy.url", os.getenv("DATABASE_URL"))

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = SQLModel.metadata

def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    """Run migrations in 'online' mode."""
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata
        )

        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

## Initial Migration Template

```python
# migrations/versions/001_initial_tables.py
"""Initial tables

Revision ID: 001
Revises:
Create Date: 2024-01-01 00:00:00.000000
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa
import sqlmodel

# revision identifiers
revision: str = '001'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Create tasks table
    op.create_table(
        'tasks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sqlmodel.sql.sqltypes.AutoString(), nullable=False),
        sa.Column('title', sqlmodel.sql.sqltypes.AutoString(length=255), nullable=False),
        sa.Column('description', sqlmodel.sql.sqltypes.AutoString(), nullable=True),
        sa.Column('is_completed', sa.Boolean(), nullable=False, default=False),
        sa.Column('priority', sa.Integer(), nullable=False, default=1),
        sa.Column('due_date', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # Create indexes
    op.create_index('ix_tasks_user_id', 'tasks', ['user_id'])
    op.create_index('ix_tasks_is_completed', 'tasks', ['is_completed'])

def downgrade() -> None:
    op.drop_index('ix_tasks_is_completed', table_name='tasks')
    op.drop_index('ix_tasks_user_id', table_name='tasks')
    op.drop_table('tasks')
```

## Add Column Migration

```python
# migrations/versions/002_add_tags_column.py
"""Add tags column

Revision ID: 002
Revises: 001
Create Date: 2024-01-02 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
import sqlmodel

revision: str = '002'
down_revision: str = '001'

def upgrade() -> None:
    op.add_column(
        'tasks',
        sa.Column('tags', sqlmodel.sql.sqltypes.AutoString(), nullable=True)
    )

def downgrade() -> None:
    op.drop_column('tasks', 'tags')
```

## Migration Commands

```bash
# Generate new migration from model changes
alembic revision --autogenerate -m "Description of changes"

# Apply all pending migrations
alembic upgrade head

# Apply specific migration
alembic upgrade 002

# Rollback one migration
alembic downgrade -1

# Rollback to specific revision
alembic downgrade 001

# View current revision
alembic current

# View migration history
alembic history
```

## Simple SQLModel Auto-Create (No Alembic)

For simple setups without Alembic:

```python
# database.py
from sqlmodel import SQLModel, create_engine
import os

DATABASE_URL = os.getenv("DATABASE_URL")

engine = create_engine(DATABASE_URL, echo=True)

def init_db():
    """Create all tables. Call on app startup."""
    # Import models to register them
    from models import task  # noqa

    SQLModel.metadata.create_all(engine)

# main.py
from contextlib import asynccontextmanager
from fastapi import FastAPI
from database import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create tables
    init_db()
    yield
    # Shutdown: cleanup if needed

app = FastAPI(lifespan=lifespan)
```

## Neon PostgreSQL Specific Notes

```python
# For Neon serverless, use NullPool
from sqlalchemy.pool import NullPool

engine = create_engine(
    DATABASE_URL,
    poolclass=NullPool,  # Required for serverless
    connect_args={
        "sslmode": "require"  # SSL required for Neon
    }
)
```

## Environment Variables

```env
# backend/.env
DATABASE_URL=postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

## Key Principles

1. **Version Control**: Always commit migration files to git
2. **Reversibility**: Every upgrade should have a matching downgrade
3. **Incremental**: Small, focused migrations are easier to manage
4. **Testing**: Test migrations on a copy before production
5. **Neon Compatibility**: Use NullPool and SSL for serverless
