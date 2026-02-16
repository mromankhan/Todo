# ChatKit API Contract

**Feature**: 002-ai-chatbot
**Date**: 2026-02-08

## Overview

The ChatKit endpoint is the primary interface between the frontend chat UI and the backend AI agent. The `openai-chatkit` Python SDK handles the ChatKit protocol, exposing a single POST endpoint that the `@openai/chatkit-react` frontend connects to.

## Endpoint

### POST /chatkit

The ChatKit SDK handles all routing internally. This single endpoint receives all ChatKit protocol messages (thread creation, message sending, thread listing, etc.).

**Authentication**: JWT Bearer token in `Authorization` header (same as existing task API).

**Request**: ChatKit protocol messages (handled by SDK)

**Response**: ChatKit protocol responses (SSE streaming for chat, JSON for thread operations)

## ChatKit Thread = Conversation

The ChatKit SDK manages "threads" which map to our `Conversation` database model:

| ChatKit Concept | Our Model | Description |
|-----------------|-----------|-------------|
| Thread | Conversation | A chat session |
| ThreadItem (UserMessage) | Message (role="user") | User chat message |
| ThreadItem (AssistantMessage) | Message (role="assistant") | AI response |
| Thread ID | Conversation.id | Unique identifier |

## Store Interface Implementation

The ChatKit `Store` abstract class requires these methods, which we implement using SQLModel:

| Method | SQL Operation | Description |
|--------|--------------|-------------|
| `load_thread(id)` | SELECT Conversation WHERE id=? | Load single conversation |
| `save_thread(thread)` | INSERT/UPDATE Conversation | Create or update conversation |
| `load_threads(limit, after, order)` | SELECT Conversations WHERE user_id=? | List user's conversations |
| `load_thread_items(thread_id, ...)` | SELECT Messages WHERE conversation_id=? | Load conversation messages |
| `add_thread_item(thread_id, item)` | INSERT Message | Add new message |
| `save_item(thread_id, item)` | UPDATE Message | Update existing message |
| `delete_thread(id)` | DELETE Conversation (CASCADE) | Delete conversation and messages |

## Response Streaming

The ChatKit server streams responses using Server-Sent Events (SSE):

```
Content-Type: text/event-stream

data: {"type": "thread.item.created", "item": {"role": "assistant", "content": [...]}}
data: {"type": "thread.item.delta", "delta": {"content": [{"text": "Task "}]}}
data: {"type": "thread.item.delta", "delta": {"content": [{"text": "created!"}]}}
data: {"type": "thread.item.done", "item": {...}}
```

## Tool Invocations

When the agent invokes MCP tools, the ChatKit protocol includes tool call events visible in the frontend:

```
data: {"type": "thread.item.created", "item": {"type": "function_call", "name": "add_task", ...}}
data: {"type": "thread.item.done", "item": {"type": "function_call_output", "output": "..."}}
```

## Error Responses

| Scenario | HTTP Status | Response |
|----------|------------|----------|
| Missing/invalid JWT | 401 | `{"detail": "Invalid or expired token"}` |
| User ID mismatch | 403 | `{"detail": "Access denied"}` |
| Thread not found | 404 | `{"detail": "Conversation not found"}` |
| OpenAI API error | 500 | Graceful fallback message in chat |
