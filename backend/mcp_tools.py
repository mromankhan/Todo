"""Agent tool functions for task management operations."""
from datetime import datetime
from typing import Optional, Literal

from agents import function_tool, RunContextWrapper
from chatkit.agents import AgentContext
from sqlmodel import select

from db import get_session
from models import Task


@function_tool()
async def add_task(
    ctx: RunContextWrapper[AgentContext],
    title: str,
    description: Optional[str] = None,
) -> dict:
    """
    Create a new task for the user.

    Args:
        ctx: Agent context wrapper with user context
        title: Task title (1-200 chars)
        description: Optional task description (max 1000 chars)

    Returns:
        Dictionary with task_id, status, and title
    """
    # Extract user_id from context
    user_id = ctx.context.request_context.user_id

    # Validation
    if not title or len(title.strip()) == 0:
        return {"error": "Title cannot be empty"}

    if len(title) > 200:
        return {
            "error": f"Title too long ({len(title)} chars). Maximum 200 characters."
        }

    if description and len(description) > 1000:
        return {
            "error": f"Description too long ({len(description)} chars). Maximum 1000 characters."
        }

    # Create task in database
    async for session in get_session():
        task = Task(
            user_id=user_id,
            title=title.strip(),
            description=description.strip() if description else None,
            completed=False,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        session.add(task)
        await session.commit()
        await session.refresh(task)

        return {
            "task_id": task.id,
            "status": "created",
            "title": task.title,
            "description": task.description,
        }


@function_tool()
async def list_tasks(
    ctx: RunContextWrapper[AgentContext],
    status: Literal["all", "pending", "completed"] = "all",
) -> dict:
    """
    List tasks for the user with optional status filter.

    Args:
        ctx: Agent context wrapper with user context
        status: Filter by status - "all" (default), "pending", or "completed"

    Returns:
        Dictionary with count and list of tasks
    """
    # Extract user_id from context
    user_id = ctx.context.request_context.user_id

    async for session in get_session():
        # Build query
        statement = select(Task).where(Task.user_id == user_id)

        # Apply status filter
        if status == "pending":
            statement = statement.where(Task.completed == False)
        elif status == "completed":
            statement = statement.where(Task.completed == True)

        # Order by created_at descending (newest first)
        statement = statement.order_by(Task.created_at.desc())

        # Execute query
        result = await session.exec(statement)
        tasks = result.all()

        # Format response
        task_list = [
            {
                "id": task.id,
                "title": task.title,
                "description": task.description,
                "completed": task.completed,
                "created_at": task.created_at.isoformat(),
            }
            for task in tasks
        ]

        return {
            "count": len(task_list),
            "status_filter": status,
            "tasks": task_list,
        }


@function_tool()
async def complete_task(
    ctx: RunContextWrapper[AgentContext],
    task_id: int,
) -> dict:
    """
    Mark a task as completed.

    Args:
        ctx: Agent context wrapper with user context
        task_id: The task ID to complete

    Returns:
        Dictionary with task_id, status, and title
    """
    # Extract user_id from context
    user_id = ctx.context.request_context.user_id

    async for session in get_session():
        # Find task
        statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        result = await session.exec(statement)
        task = result.first()

        if not task:
            return {"error": f"Task {task_id} not found"}

        # Update task
        task.completed = True
        task.updated_at = datetime.utcnow()
        session.add(task)
        await session.commit()

        return {
            "task_id": task.id,
            "status": "completed",
            "title": task.title,
        }


@function_tool()
async def update_task(
    ctx: RunContextWrapper[AgentContext],
    task_id: int,
    title: Optional[str] = None,
    description: Optional[str] = None,
) -> dict:
    """
    Update a task's title and/or description.

    Args:
        ctx: Agent context wrapper with user context
        task_id: The task ID to update
        title: New task title (1-200 chars, optional)
        description: New task description (max 1000 chars, optional)

    Returns:
        Dictionary with task_id, status, and updated fields
    """
    # Extract user_id from context
    user_id = ctx.context.request_context.user_id

    # Validation
    if title is not None:
        if len(title.strip()) == 0:
            return {"error": "Title cannot be empty"}
        if len(title) > 200:
            return {
                "error": f"Title too long ({len(title)} chars). Maximum 200 characters."
            }

    if description is not None and len(description) > 1000:
        return {
            "error": f"Description too long ({len(description)} chars). Maximum 1000 characters."
        }

    async for session in get_session():
        # Find task
        statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        result = await session.exec(statement)
        task = result.first()

        if not task:
            return {"error": f"Task {task_id} not found"}

        # Update task
        updated_fields = []
        if title is not None:
            task.title = title.strip()
            updated_fields.append("title")
        if description is not None:
            task.description = description.strip() if description else None
            updated_fields.append("description")

        task.updated_at = datetime.utcnow()
        session.add(task)
        await session.commit()

        return {
            "task_id": task.id,
            "status": "updated",
            "title": task.title,
            "updated_fields": updated_fields,
        }


@function_tool()
async def delete_task(
    ctx: RunContextWrapper[AgentContext],
    task_id: int,
) -> dict:
    """
    Delete a task permanently.

    Args:
        ctx: Agent context wrapper with user context
        task_id: The task ID to delete

    Returns:
        Dictionary with task_id and status
    """
    # Extract user_id from context
    user_id = ctx.context.request_context.user_id

    async for session in get_session():
        # Find task
        statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
        result = await session.exec(statement)
        task = result.first()

        if not task:
            return {"error": f"Task {task_id} not found"}

        # Delete task
        title = task.title
        await session.delete(task)
        await session.commit()

        return {
            "task_id": task_id,
            "status": "deleted",
            "title": title,
        }
