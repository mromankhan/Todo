"""ChatKit endpoint for AI-powered chat interface."""
import traceback
from collections.abc import AsyncIterator

from fastapi import APIRouter, Depends, Request, Response
from fastapi.responses import StreamingResponse

from chatkit.server import ChatKitServer, StreamingResult
from chatkit.types import (
    ThreadMetadata,
    ThreadStreamEvent,
    UserMessageItem,
)
from chatkit.agents import AgentContext, simple_to_agent_input, stream_agent_response
from agents import Runner

from chatkit_store import SQLModelChatKitStore, RequestContext
from chat_agent import agent
from middleware.auth import verify_jwt_bearer


router = APIRouter(prefix="/chatkit", tags=["chat"])


class TodoChatKitServer(ChatKitServer[RequestContext]):
    """Custom ChatKit server implementation for Todo app."""

    async def respond(
        self,
        thread: ThreadMetadata,
        input_user_message: UserMessageItem | None,
        context: RequestContext,
    ) -> AsyncIterator[ThreadStreamEvent]:
        """
        Generate AI response to user message.

        Args:
            thread: The current conversation thread
            input_user_message: The user's message (if any)
            context: Request context with user_id

        Yields:
            Thread stream events for the client
        """
        print(f"[CHAT] respond called for thread={thread.id}, user={context.user_id}")

        # Load recent thread history for context
        items_page = await self.store.load_thread_items(
            thread.id,
            after=None,
            limit=20,  # Last 20 messages
            order="asc",  # Chronological order
            context=context,
        )

        print(f"[CHAT] Loaded {len(items_page.data)} history items")

        # Convert thread items to agent input
        input_items = await simple_to_agent_input(items_page.data)

        print(f"[CHAT] Converted to {len(input_items)} agent input items")

        # Create agent context with thread and store
        agent_context = AgentContext(
            thread=thread,
            store=self.store,
            request_context=context,
        )

        # Run the agent with streaming
        result = Runner.run_streamed(
            agent,
            input_items,
            context=agent_context,
        )

        print("[CHAT] Agent streaming started")

        # Stream the agent response as ChatKit events
        try:
            async for event in stream_agent_response(agent_context, result):
                yield event
        except Exception as e:
            print(f"[CHAT] ERROR during streaming: {type(e).__name__}: {e}")
            traceback.print_exc()


# Initialize ChatKit Store
store = SQLModelChatKitStore()

# Initialize ChatKit Server
chatkit_server = TodoChatKitServer(store=store)


@router.post("")
async def chatkit_endpoint(
    request: Request,
    current_user: dict = Depends(verify_jwt_bearer),
) -> Response:
    """
    ChatKit protocol endpoint for AI-powered chat.

    Handles POST /chatkit requests from the ChatKit frontend.
    Requires JWT authentication via cookie (Better Auth session token).

    Args:
        request: The FastAPI request object.
        current_user: The authenticated user from JWT token in cookie.

    Returns:
        Response: ChatKit protocol response (SSE stream or JSON).
    """
    # Extract user_id from JWT token
    user_id = current_user.get("sub")
    if not user_id:
        return Response(
            content='{"error": "User ID not found in token"}',
            status_code=401,
            media_type="application/json",
        )

    # Read Accept-Language header for localization
    locale = request.headers.get("Accept-Language", "en").split(",")[0]

    # Create request context
    context = RequestContext(user_id=user_id, locale=locale)

    # Process the ChatKit request
    # The ChatKitServer handles protocol negotiation, thread management, and streaming
    result = await chatkit_server.process(await request.body(), context)

    # Return appropriate response type
    if isinstance(result, StreamingResult):
        return StreamingResponse(result, media_type="text/event-stream")
    return Response(content=result.json, media_type="application/json")
