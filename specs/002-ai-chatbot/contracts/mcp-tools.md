# MCP Tools Contract

**Feature**: 002-ai-chatbot
**Date**: 2026-02-08

## Overview

The MCP server exposes 5 tools for todo task management. These tools are used by the OpenAI Agent to perform task operations on behalf of the user. Each tool accepts `user_id` as a required parameter to ensure user-scoped data access.

## Tools

### add_task

**Purpose**: Create a new task for the user.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | string | Yes | The authenticated user's ID |
| title | string | Yes | Task title (1-200 chars) |
| description | string | No | Task description (max 1000 chars) |

**Returns**:
```json
{
  "task_id": 5,
  "status": "created",
  "title": "Buy groceries"
}
```

**Errors**:
- Title too long (>200 chars): Returns error message
- Title empty: Returns error message

---

### list_tasks

**Purpose**: Retrieve tasks for the user, optionally filtered by status.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | string | Yes | The authenticated user's ID |
| status | string | No | Filter: "all" (default), "pending", "completed" |

**Returns**:
```json
[
  {"id": 1, "title": "Buy groceries", "completed": false, "description": "Milk, eggs, bread"},
  {"id": 2, "title": "Call mom", "completed": true, "description": null}
]
```

**Errors**:
- Invalid status value: Returns error message

---

### complete_task

**Purpose**: Mark a task as complete.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | string | Yes | The authenticated user's ID |
| task_id | integer | Yes | The task ID to complete |

**Returns**:
```json
{
  "task_id": 3,
  "status": "completed",
  "title": "Call mom"
}
```

**Errors**:
- Task not found: Returns "Task not found" message
- Task already completed: Returns info message indicating task was already done

---

### delete_task

**Purpose**: Remove a task from the user's list.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | string | Yes | The authenticated user's ID |
| task_id | integer | Yes | The task ID to delete |

**Returns**:
```json
{
  "task_id": 2,
  "status": "deleted",
  "title": "Old task"
}
```

**Errors**:
- Task not found: Returns "Task not found" message

---

### update_task

**Purpose**: Modify task title or description.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| user_id | string | Yes | The authenticated user's ID |
| task_id | integer | Yes | The task ID to update |
| title | string | No | New task title (1-200 chars) |
| description | string | No | New task description (max 1000 chars) |

**Returns**:
```json
{
  "task_id": 1,
  "status": "updated",
  "title": "Buy groceries and fruits"
}
```

**Errors**:
- Task not found: Returns "Task not found" message
- No fields provided: Returns error message
- Title too long: Returns error message

## Agent System Instructions

The agent MUST be configured with the following behavioral instructions:

```
You are a helpful todo management assistant. You help users manage their task list through natural language conversation.

When a user wants to:
- Create a task: Use add_task with the extracted title and optional description
- View tasks: Use list_tasks with appropriate status filter
- Complete a task: Use complete_task with the task ID
- Delete a task: Use delete_task with the task ID. If the user references a task by name, use list_tasks first to find the ID
- Update a task: Use update_task with the task ID and new fields

Always confirm actions with friendly, concise responses. If a request is ambiguous, ask for clarification.
Format task lists in a readable way with task IDs, titles, and status indicators.
```
