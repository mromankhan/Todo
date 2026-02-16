# Research: AI-Powered Todo Chatbot

**Feature**: 002-ai-chatbot
**Date**: 2026-02-08
**Status**: Complete

## Research Topics

### R1: OpenAI Agents SDK Integration Pattern

**Decision**: Use `openai-agents` v0.8.1 with `@function_tool` decorators for tool definition and `Runner.run()` for agent execution.

**Rationale**: The OpenAI Agents SDK provides first-class MCP support via `MCPServerStreamableHttp`, native tool definition with `@function_tool`, and conversation history management via `to_input_list()`. This aligns with the spec requirement for stateless architecture where we manually rebuild conversation context from the database.

**Alternatives Considered**:
- LangChain: Over-engineered for this use case, adds unnecessary abstraction layers
- Direct OpenAI API: Lower level, requires manual tool calling loop; Agents SDK handles this automatically
- CrewAI: Multi-agent framework, overkill for single-agent todo management

**Key Integration Pattern**:
```python
from agents import Agent, Runner, function_tool

agent = Agent(
    name="TodoAssistant",
    instructions="...",
    model="gpt-4.1-mini",
    tools=[add_task, list_tasks, complete_task, delete_task, update_task],
)

# Stateless: rebuild history from DB each request
input_messages = db_messages + [{"role": "user", "content": user_message}]
result = await Runner.run(agent, input_messages)
```

### R2: MCP Server Architecture

**Decision**: Use `mcp` v1.26.0 with `FastMCP` for defining tools. However, for simplicity in Phase III, use `@function_tool` decorators directly on the agent instead of running a separate MCP server process.

**Rationale**: The project guide requires "MCP server with Official MCP SDK that exposes task operations as tools." The cleanest approach is to define MCP tools using `FastMCP` and then connect the OpenAI agent to those tools. Two approaches are possible:

1. **Separate MCP server process** (MCPServerStreamableHttp): Run MCP as an HTTP endpoint, agent connects via HTTP
2. **In-process MCP** (MCPServerStdio): Run MCP as a subprocess, agent connects via stdio
3. **Direct function tools**: Skip MCP transport, use `@function_tool` directly

For the hackathon, we'll use approach 1 (separate MCP endpoint) as it best demonstrates the architecture and satisfies the requirement to "build MCP server with Official MCP SDK."

**Key Pattern**:
```python
# mcp_server.py - MCP tools using FastMCP
from mcp.server.fastmcp import FastMCP
mcp = FastMCP("Todo MCP Server")

@mcp.tool()
async def add_task(user_id: str, title: str, description: str = "") -> dict:
    # DB operations
    return {"task_id": 1, "status": "created", "title": title}
```

### R3: ChatKit Frontend Integration

**Decision**: Use `@openai/chatkit-react` v1.4.0 for frontend and `openai-chatkit` v1.6.0 for backend. The ChatKit SDK handles thread management, streaming, and tool visualization.

**Rationale**: ChatKit provides a complete chat UI framework with built-in support for:
- Thread management (maps to our Conversation entity)
- Streaming responses via SSE
- Tool invocation display (satisfies FR-045)
- Message history display
- Responsive design

The backend `ChatKitServer` class integrates with OpenAI Agents SDK through `AgentContext`, `simple_to_agent_input`, and `stream_agent_response` helpers.

**Alternatives Considered**:
- Custom chat UI: More work, no standard patterns for tool visualization
- Vercel AI SDK: Good but doesn't satisfy "OpenAI ChatKit" requirement
- chat-ui-kit-react: Generic, no OpenAI integration

**Key Pattern**:
```tsx
// Frontend: ChatKit component
import { ChatKit, useChatKit } from "@openai/chatkit-react";

function ChatPage() {
  const chatkit = useChatKit({
    api: { url: `${API_URL}/chatkit` },
  });
  return <ChatKit control={chatkit.control} />;
}
```

### R4: Conversation Persistence Strategy

**Decision**: Use database-backed conversation storage with ChatKit's `Store` interface. The `ChatKitServer` manages threads and items, persisted to Neon PostgreSQL via SQLModel.

**Rationale**: The ChatKit SDK provides a `Store` abstract class that handles thread/item CRUD. By implementing this with SQLModel, we get:
- Automatic conversation persistence (FR-021 to FR-026)
- Stateless server architecture (FR-027 to FR-030) - store handles all state
- Thread management that maps directly to our Conversation entity
- Message history that maps to our Message entity

**Key Insight**: ChatKit's `ThreadMetadata` maps to `Conversation`, and `ThreadItem` (UserMessageItem/AssistantMessageItem) maps to `Message`. This means we implement the Store interface using our SQLModel models.

### R5: Authentication Integration with ChatKit

**Decision**: Pass JWT token via ChatKit's API configuration headers. The backend ChatKit endpoint extracts the token and validates it using existing JWT middleware.

**Rationale**: ChatKit supports custom headers in its API configuration. We reuse the existing Better Auth + JWT flow from Phase II.

**Key Pattern**:
```tsx
// Frontend: Pass JWT token to ChatKit
const chatkit = useChatKit({
  api: {
    url: `${API_URL}/chatkit`,
    headers: { Authorization: `Bearer ${token}` },
  },
});
```

### R6: Database Models for Chat

**Decision**: Add `Conversation` and `Message` SQLModel tables alongside existing `Task` table. Use integer auto-increment IDs consistent with existing Task model.

**Rationale**: Simple extension of existing schema. No changes to Task model needed.

**Schema Design**:
- `Conversation`: id (int PK), user_id (str, indexed), created_at, updated_at
- `Message`: id (int PK), conversation_id (int FK), user_id (str, indexed), role (str), content (text), created_at

## Package Summary

### Backend (uv add)
| Package | Version | Purpose |
|---------|---------|---------|
| openai-agents | 0.8.1 | AI agent framework |
| mcp[cli] | 1.26.0 | MCP server/tools |
| openai-chatkit | 1.6.0 | ChatKit backend SDK |

### Frontend (npm install)
| Package | Version | Purpose |
|---------|---------|---------|
| @openai/chatkit-react | 1.4.0 | Chat UI component |

### Environment Variables (new)
| Variable | Service | Purpose |
|----------|---------|---------|
| OPENAI_API_KEY | Backend | OpenAI API access for Agents SDK |
