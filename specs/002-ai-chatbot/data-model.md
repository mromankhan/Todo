# Data Model: AI-Powered Todo Chatbot

**Feature**: 002-ai-chatbot
**Date**: 2026-02-08
**Spec**: [spec.md](spec.md)

## Entities

### Task (Existing - No Changes)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Integer | PK, auto-increment | Unique task identifier |
| user_id | String | NOT NULL, indexed | Owner user ID |
| title | String | NOT NULL, 1-200 chars | Task title |
| description | String | nullable, max 1000 chars | Task description |
| completed | Boolean | default False | Completion status |
| created_at | DateTime | NOT NULL, UTC | Creation timestamp |
| updated_at | DateTime | NOT NULL, UTC | Last update timestamp |

### Conversation (New)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Integer | PK, auto-increment | Unique conversation identifier |
| user_id | String | NOT NULL, indexed | Owner user ID |
| title | String | nullable | Optional conversation title |
| created_at | DateTime | NOT NULL, UTC default | Creation timestamp |
| updated_at | DateTime | NOT NULL, UTC default | Last update timestamp |

**Relationships**:
- Has many Messages (one-to-many via conversation_id)
- Belongs to User (via user_id)

**Indexes**:
- `idx_conversation_user_id` on user_id (filter conversations by user)

### Message (New)

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | Integer | PK, auto-increment | Unique message identifier |
| conversation_id | Integer | FK -> Conversation.id, NOT NULL | Parent conversation |
| user_id | String | NOT NULL, indexed | Owner user ID |
| role | String | NOT NULL, enum: "user"/"assistant" | Message sender role |
| content | Text | NOT NULL | Message content |
| created_at | DateTime | NOT NULL, UTC default | Creation timestamp |

**Relationships**:
- Belongs to Conversation (via conversation_id)
- Belongs to User (via user_id)

**Indexes**:
- `idx_message_conversation_id` on conversation_id (load conversation history)
- `idx_message_user_id` on user_id (filter messages by user)

## Entity Relationship Diagram

```
User (Better Auth managed)
  │
  ├──< Task (existing)
  │     - id, user_id, title, description, completed, created_at, updated_at
  │
  ├──< Conversation (new)
  │     - id, user_id, title, created_at, updated_at
  │     │
  │     └──< Message (new)
  │           - id, conversation_id, user_id, role, content, created_at
  │
```

Legend: `──<` = one-to-many

## State Transitions

### Conversation Lifecycle

```
[No Conversation]
    ---(user sends first message without conversation_id)-->
[Created]
    ---(messages exchanged)-->
[Active]
    ---(updated_at refreshed on each message)-->
[Active]
```

### Message Flow (per request)

```
1. Receive POST /chatkit with user message
2. ChatKit Store loads/creates thread (Conversation)
3. ChatKit Store loads thread items (Messages)
4. Agent processes with conversation history
5. ChatKit Store saves user message (role="user")
6. Agent invokes MCP tools as needed
7. ChatKit Store saves assistant response (role="assistant")
8. Stream response back to client
```

## Validation Rules

### Conversation
- `user_id`: Required, non-empty string
- `title`: Optional, max 200 chars (auto-generated from first message if not provided)

### Message
- `conversation_id`: Required, must reference existing Conversation
- `user_id`: Required, must match Conversation.user_id
- `role`: Required, must be "user" or "assistant"
- `content`: Required, non-empty string, max 10000 chars

## Migration Notes

- New tables only - no changes to existing Task table
- Conversation and Message tables should be created alongside existing tables
- Foreign key from Message.conversation_id to Conversation.id with CASCADE delete
- All timestamps default to UTC now()
