"""Database connection module for async PostgreSQL operations."""
import os
import re
import ssl
from typing import AsyncGenerator, Optional

from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, AsyncEngine
from sqlalchemy.orm import sessionmaker


def get_database_url() -> tuple[str, bool]:
    """Get database URL with proper async driver prefix and SSL flag."""
    database_url = os.environ.get("DATABASE_URL", "")

    if not database_url:
        raise ValueError(
            "DATABASE_URL environment variable is not set. "
            "Please set it in your .env file or environment. "
            "Example: DATABASE_URL=postgresql+asyncpg://user:pass@host/dbname"
        )

    # Check if SSL is required
    use_ssl = "sslmode=require" in database_url or "sslmode=verify" in database_url

    # Remove parameters that asyncpg doesn't support as URL params
    # asyncpg handles SSL via connect_args, not URL params
    database_url = re.sub(r'[&?]sslmode=[^&]*', '', database_url)
    database_url = re.sub(r'[&?]channel_binding=[^&]*', '', database_url)
    # Clean up double && or trailing ? or &
    database_url = re.sub(r'\?&', '?', database_url)
    database_url = database_url.replace('&&', '&').rstrip('&').rstrip('?')

    # Convert postgres:// or postgresql:// to postgresql+asyncpg://
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql+asyncpg://", 1)
    elif database_url.startswith("postgresql://") and "+asyncpg" not in database_url:
        database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)

    return database_url, use_ssl


# Lazy initialization for engine and session
_engine: Optional[AsyncEngine] = None
_async_session: Optional[sessionmaker] = None


def get_engine() -> AsyncEngine:
    """Get or create the async engine."""
    global _engine
    if _engine is None:
        database_url, use_ssl = get_database_url()

        connect_args = {}
        if use_ssl:
            # Create SSL context for secure connection
            ssl_context = ssl.create_default_context()
            ssl_context.check_hostname = False
            ssl_context.verify_mode = ssl.CERT_NONE
            connect_args["ssl"] = ssl_context

        _engine = create_async_engine(
            database_url,
            echo=False,
            connect_args=connect_args,
        )
    return _engine


def get_session_maker() -> sessionmaker:
    """Get or create the session maker."""
    global _async_session
    if _async_session is None:
        _async_session = sessionmaker(
            get_engine(),
            class_=AsyncSession,
            expire_on_commit=False,
        )
    return _async_session


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for getting async database sessions."""
    session_maker = get_session_maker()
    async with session_maker() as session:
        yield session


async def init_db() -> None:
    """Initialize database tables and run migrations."""
    from sqlalchemy import text, inspect
    from models import Conversation, Message

    engine = get_engine()

    # Check if conversation table needs migration (missing thread_id column)
    async with engine.connect() as conn:
        def check_column(sync_conn):
            insp = inspect(sync_conn)
            if insp.has_table("conversation"):
                columns = [c["name"] for c in insp.get_columns("conversation")]
                return "thread_id" not in columns
            return False

        needs_migration = await conn.run_sync(check_column)

    if needs_migration:
        # Drop old conversation/message tables and recreate with new schema
        async with engine.begin() as conn:
            await conn.execute(text("DROP TABLE IF EXISTS message"))
            await conn.execute(text("DROP TABLE IF EXISTS conversation"))

    # Create all tables (including recreated ones)
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
