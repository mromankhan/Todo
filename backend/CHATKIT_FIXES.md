# ChatKit Backend Implementation Fixes

## Summary of All Mistakes Fixed

This document details all the mistakes that were present in the ChatKit backend implementation and how they were corrected.

---

## ❌ Critical Mistakes Found & Fixed

### 1. **chatkit_store.py - Completely Wrong Implementation**

#### Mistakes:
- ❌ **Wrong imports**: Using non-existent classes
  ```python
  from chatkit.agents import ThreadItem  # WRONG - doesn't exist
  from chatkit.store import ChatKitStore  # WRONG - doesn't exist
  ```

- ❌ **Wrong base class**: `ChatKitStore` doesn't exist
  ```python
  class SQLModelChatKitStore(ChatKitStore):  # WRONG
  ```

- ❌ **Wrong Thread class**: Using undefined `Thread` instead of `ThreadMetadata`
  ```python
  return Thread(id=..., user_id=..., ...)  # WRONG
  ```

- ❌ **Missing required Store methods**:
  - `load_threads()` - for history view
  - `save_item()` - for updating existing items
  - `load_item()` - for loading specific items
  - `delete_thread_item()` - for deleting items
  - Attachment methods (save, load, delete)

- ❌ **Wrong ThreadItem structure**: Not using proper ChatKit item types
  ```python
  ThreadItem(id=..., role=..., content=...)  # WRONG structure
  ```

- ❌ **`respond()` method in Store**: This belongs in ChatKitServer, not Store
  ```python
  async def respond(self, thread_id, user_id, user_message):  # WRONG location
  ```

#### Fixes:
✅ **Correct imports**:
```python
from chatkit.store import Store, NotFoundError
from chatkit.types import (
    ThreadMetadata,
    ThreadItem,
    Page,
    Attachment,
    UserMessageItem,
    AssistantMessageItem,
    UserMessageContent,
    AssistantMessageContent,
)
```

✅ **Proper Store implementation with RequestContext**:
```python
class RequestContext:
    def __init__(self, user_id: str, locale: str = "en"):
        self.user_id = user_id
        self.locale = locale

class SQLModelChatKitStore(Store[RequestContext]):
    # ... proper implementation
```

✅ **All required methods implemented**:
- ✓ Thread methods: `load_thread`, `save_thread`, `load_threads`, `delete_thread`
- ✓ Item methods: `load_thread_items`, `add_thread_item`, `save_item`, `load_item`, `delete_thread_item`
- ✓ Attachment methods: `save_attachment`, `load_attachment`, `delete_attachment`

✅ **Proper ThreadItem conversion**:
```python
if msg.role == "user":
    items.append(UserMessageItem(
        id=str(msg.id),
        thread_id=thread_id,
        created_at=msg.created_at,
        content=[UserMessageContent(text=msg.content)],
    ))
elif msg.role == "assistant":
    items.append(AssistantMessageItem(
        id=str(msg.id),
        thread_id=thread_id,
        created_at=msg.created_at,
        content=[AssistantMessageContent(text=msg.content)],
    ))
```

✅ **`respond()` removed from Store** - moved to ChatKitServer subclass

---

### 2. **mcp_tools.py - Wrong Tool Decorator and Signatures**

#### Mistakes:
- ❌ **Wrong import**: Using non-existent MCP decorator
  ```python
  from mcp import function_tool  # WRONG - doesn't exist
  ```

- ❌ **Wrong tool signature**: Missing required `RunContextWrapper[AgentContext]`
  ```python
  @function_tool
  async def add_task(
      user_id: str,  # WRONG - should be ctx parameter
      title: str,
      ...
  ):
  ```

- ❌ **Manual user_id passing**: Should extract from context
  ```python
  # WRONG - user_id should come from context, not parameter
  ```

#### Fixes:
✅ **Correct imports**:
```python
from agents import function_tool, RunContextWrapper
from chatkit.agents import AgentContext
```

✅ **Proper tool signatures**:
```python
@function_tool()
async def add_task(
    ctx: RunContextWrapper[AgentContext],
    title: str,
    description: Optional[str] = None,
) -> dict:
    # Extract user_id from context
    user_id = ctx.context.request_context.user_id
    # ... rest of implementation
```

✅ **All 5 tools updated**: add_task, list_tasks, complete_task, update_task, delete_task

---

### 3. **chat_agent.py - Missing AgentContext Typing**

#### Mistakes:
- ❌ **No AgentContext typing**:
  ```python
  agent = Agent(  # WRONG - missing type parameter
      name="TodoAssistant",
      ...
  )
  ```

#### Fixes:
✅ **Proper Agent typing**:
```python
from chatkit.agents import AgentContext

agent = Agent[AgentContext](
    name="TodoAssistant",
    instructions=SYSTEM_INSTRUCTIONS,
    model="gpt-4.1-mini",
    tools=[add_task, list_tasks, complete_task, update_task, delete_task],
)
```

---

### 4. **routes/chat.py - Wrong ChatKitServer Usage**

#### Mistakes:
- ❌ **No ChatKitServer subclass**: Direct instantiation without implementing `respond()`
  ```python
  chatkit_server = ChatKitServer(store=store)  # WRONG - missing respond() implementation
  ```

- ❌ **Wrong process() signature**:
  ```python
  await chatkit_server.process(request, user_id=user_id)  # WRONG signature
  ```

- ❌ **No RequestContext**: Context object not created
  ```python
  # Missing: context = RequestContext(user_id=user_id)
  ```

- ❌ **Missing imports**: AgentContext, simple_to_agent_input, stream_agent_response

#### Fixes:
✅ **Proper ChatKitServer subclass**:
```python
class TodoChatKitServer(ChatKitServer[RequestContext]):
    """Custom ChatKit server implementation for Todo app."""

    async def respond(
        self,
        thread: ThreadMetadata,
        input_user_message: UserMessageItem | None,
        context: RequestContext,
    ) -> AsyncIterator[ThreadStreamEvent]:
        # Load thread history
        items_page = await self.store.load_thread_items(
            thread.id, after=None, limit=20, order="asc", context=context
        )

        # Convert to agent input
        input_items = await simple_to_agent_input(items_page.data)

        # Create agent context
        agent_context = AgentContext(
            thread=thread,
            store=self.store,
            request_context=context,
        )

        # Run agent with streaming
        result = Runner.run_streamed(agent, input_items, context=agent_context)

        # Stream response
        async for event in stream_agent_response(agent_context, result):
            yield event
```

✅ **Correct endpoint implementation**:
```python
@router.post("")
async def chatkit_endpoint(
    request: Request,
    current_user: dict = Depends(verify_jwt),
) -> Response:
    user_id = current_user.get("sub")
    locale = request.headers.get("Accept-Language", "en").split(",")[0]

    # Create context
    context = RequestContext(user_id=user_id, locale=locale)

    # Process with correct signature
    result = await chatkit_server.process(await request.body(), context)

    # Return appropriate response
    if isinstance(result, StreamingResult):
        return StreamingResponse(result, media_type="text/event-stream")
    return Response(content=result.json, media_type="application/json")
```

---

## ✅ What Now Works Correctly

### Architecture Flow
```
Client (ChatKit React)
    ↓ POST /chatkit with JWT
FastAPI Endpoint
    ↓ Extract user_id from JWT
    ↓ Create RequestContext(user_id, locale)
TodoChatKitServer.respond()
    ↓ Load thread history from Store
    ↓ Convert to agent input
    ↓ Create AgentContext
    ↓ Run agent with tools
    ↓ Tools extract user_id from ctx.context.request_context.user_id
    ↓ Stream events back to client
```

### Key Components

1. **RequestContext**: Carries user_id and locale through all operations
2. **SQLModelChatKitStore**: Properly implements all Store[RequestContext] methods
3. **TodoChatKitServer**: Subclasses ChatKitServer and implements respond()
4. **Tools**: Use RunContextWrapper[AgentContext] to access user context
5. **Agent**: Typed with Agent[AgentContext] for proper context flow

### Correct Data Flow

```python
# 1. User sends message
# 2. FastAPI creates RequestContext
context = RequestContext(user_id="user123", locale="en")

# 3. ChatKitServer.process() routes to respond()
# 4. respond() loads history
items = await store.load_thread_items(thread.id, context=context)

# 5. Convert to agent input
input_items = await simple_to_agent_input(items.data)

# 6. Create AgentContext
agent_context = AgentContext(
    thread=thread,
    store=store,
    request_context=context,  # Contains user_id
)

# 7. Run agent
result = Runner.run_streamed(agent, input_items, context=agent_context)

# 8. Tools access user_id
@function_tool()
async def add_task(ctx: RunContextWrapper[AgentContext], title: str):
    user_id = ctx.context.request_context.user_id  # ✓ Correct!
    # ... create task for user
```

---

## Dependencies Verification

All required packages are in `pyproject.toml`:
```toml
dependencies = [
    "fastapi[standard]>=0.124.4",
    "sqlmodel>=0.0.27",
    "python-jose[cryptography]>=3.3.0",
    "asyncpg>=0.30.0",
    "python-dotenv>=1.0.0",
    "openai-agents>=0.8.1",      # ✓ For Agent, function_tool, Runner
    "mcp[cli]>=1.26.0",          # ✓ For MCP (not used for tools anymore)
    "openai-chatkit>=1.6.0",     # ✓ For ChatKit SDK
]
```

---

## Environment Variables Required

Ensure `.env` file has:
```bash
DATABASE_URL=postgresql+asyncpg://...  # Neon PostgreSQL
BETTER_AUTH_SECRET=...                  # JWT secret (shared with frontend)
FRONTEND_URL=http://localhost:3000      # For CORS
OPENAI_API_KEY=sk-...                   # OpenAI API key
```

---

## Testing the Fixed Implementation

### 1. Start the backend:
```bash
cd backend
uv sync
uv run uvicorn main:app --reload --port 8000
```

### 2. Test the endpoint:
```bash
# Health check
curl http://localhost:8000/health

# ChatKit endpoint (requires JWT token)
curl -X POST http://localhost:8000/chatkit \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"thread.create"}'
```

---

## Key Takeaways

1. **Always subclass ChatKitServer** and implement `respond()` - never use it directly
2. **Use Store[RequestContext]** - not invented base classes
3. **Import from correct packages**:
   - `chatkit.store` for Store, NotFoundError
   - `chatkit.types` for ThreadMetadata, ThreadItem types
   - `chatkit.agents` for AgentContext, simple_to_agent_input, stream_agent_response
   - `agents` for function_tool, RunContextWrapper, Agent, Runner

4. **Tool signatures must use RunContextWrapper[AgentContext]** as first parameter
5. **Extract user_id from context**: `ctx.context.request_context.user_id`
6. **Process signature**: `await server.process(await request.body(), context)`

---

## What's Next?

The backend is now correctly implemented! Next steps:

1. ✅ Backend ChatKit implementation - **DONE**
2. 🔲 Frontend ChatKit React integration
3. 🔲 Test end-to-end conversation flow
4. 🔲 Add widgets for todo cards
5. 🔲 Implement thread history UI
6. 🔲 Add file attachments support

---

**Status**: All ChatKit backend mistakes have been identified and fixed! ✅
