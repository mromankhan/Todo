"""ChatKit Store implementation with SQLModel persistence."""
from datetime import datetime
from typing import Optional
from collections import defaultdict

from chatkit.store import Store, NotFoundError
from chatkit.types import (
    ThreadMetadata,
    ThreadItem,
    Page,
    Attachment,
    UserMessageItem,
    AssistantMessageItem,
    UserMessageTextContent,
    AssistantMessageContent,
)
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from db import get_session
from models import Conversation, Message


class RequestContext:
    """Request context carrying user information through ChatKit operations."""

    def __init__(self, user_id: str, locale: str = "en"):
        self.user_id = user_id
        self.locale = locale


class SQLModelChatKitStore(Store[RequestContext]):
    """ChatKit Store backed by SQLModel for persistent conversation storage."""

    def __init__(self):
        """Initialize the ChatKit Store."""
        self._sessions: dict[str, AsyncSession] = {}

    async def _get_session(self) -> AsyncSession:
        """Get a database session."""
        async for session in get_session():
            return session
        raise RuntimeError("Failed to get database session")

    # ==================== Thread Methods ====================

    async def load_thread(
        self, thread_id: str, context: RequestContext
    ) -> ThreadMetadata:
        """Load a conversation thread from the database."""
        session = await self._get_session()

        try:
            conv_id = int(thread_id)
        except ValueError:
            raise NotFoundError(f"Thread {thread_id} not found")

        statement = select(Conversation).where(
            Conversation.id == conv_id, Conversation.user_id == context.user_id
        )
        result = await session.exec(statement)
        conversation = result.first()

        if not conversation:
            raise NotFoundError(f"Thread {thread_id} not found")

        return ThreadMetadata(
            id=str(conversation.id),
            title=conversation.title,
            created_at=conversation.created_at,
            metadata={},
        )

    async def save_thread(
        self, thread: ThreadMetadata, context: RequestContext
    ) -> None:
        """Create or update a conversation thread in the database."""
        session = await self._get_session()

        # If thread.id exists, update; otherwise create
        if thread.id:
            try:
                conv_id = int(thread.id)
                statement = select(Conversation).where(Conversation.id == conv_id)
                result = await session.exec(statement)
                conversation = result.first()

                if conversation:
                    # Update existing
                    conversation.title = thread.title
                    conversation.updated_at = datetime.utcnow()
                    session.add(conversation)
                    await session.commit()
                    return
            except (ValueError, TypeError):
                pass

        # Create new conversation
        conversation = Conversation(
            user_id=context.user_id,
            title=thread.title or "New Conversation",
            created_at=thread.created_at or datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        session.add(conversation)
        await session.commit()
        await session.refresh(conversation)

        # Update thread.id with the new ID
        thread.id = str(conversation.id)

    async def load_threads(
        self, limit: int, after: str | None, order: str, context: RequestContext
    ) -> Page[ThreadMetadata]:
        """Load list of threads for history view."""
        session = await self._get_session()

        statement = select(Conversation).where(Conversation.user_id == context.user_id)

        # Apply ordering
        if order == "desc":
            statement = statement.order_by(Conversation.created_at.desc())
        else:
            statement = statement.order_by(Conversation.created_at.asc())

        result = await session.exec(statement)
        all_conversations = list(result.all())

        # Apply cursor pagination
        start_index = 0
        if after:
            for idx, conv in enumerate(all_conversations):
                if str(conv.id) == after:
                    start_index = idx + 1
                    break

        # Get page of results
        page_conversations = all_conversations[start_index : start_index + limit]
        has_more = start_index + limit < len(all_conversations)

        threads = [
            ThreadMetadata(
                id=str(conv.id),
                title=conv.title,
                created_at=conv.created_at,
                metadata={},
            )
            for conv in page_conversations
        ]

        next_after = str(page_conversations[-1].id) if has_more and threads else None

        return Page(data=threads, has_more=has_more, after=next_after)

    async def delete_thread(self, thread_id: str, context: RequestContext) -> None:
        """Delete a conversation thread and all its messages."""
        session = await self._get_session()

        try:
            conv_id = int(thread_id)
        except ValueError:
            raise NotFoundError(f"Thread {thread_id} not found")

        statement = select(Conversation).where(
            Conversation.id == conv_id, Conversation.user_id == context.user_id
        )
        result = await session.exec(statement)
        conversation = result.first()

        if not conversation:
            raise NotFoundError(f"Thread {thread_id} not found")

        # Delete all messages first
        msg_statement = select(Message).where(Message.conversation_id == conv_id)
        msg_result = await session.exec(msg_statement)
        for msg in msg_result.all():
            await session.delete(msg)

        # Delete conversation
        await session.delete(conversation)
        await session.commit()

    # ==================== Thread Item Methods ====================

    async def load_thread_items(
        self,
        thread_id: str,
        after: str | None,
        limit: int,
        order: str,
        context: RequestContext,
    ) -> Page[ThreadItem]:
        """Load messages for a conversation with pagination."""
        session = await self._get_session()

        try:
            conv_id = int(thread_id)
        except ValueError:
            return Page(data=[], has_more=False, after=None)

        statement = select(Message).where(
            Message.conversation_id == conv_id, Message.user_id == context.user_id
        )

        # Apply ordering
        if order == "desc":
            statement = statement.order_by(Message.created_at.desc())
        else:
            statement = statement.order_by(Message.created_at.asc())

        result = await session.exec(statement)
        all_messages = list(result.all())

        # Apply cursor pagination
        start_index = 0
        if after:
            for idx, msg in enumerate(all_messages):
                if str(msg.id) == after:
                    start_index = idx + 1
                    break

        # Get page of results
        page_messages = all_messages[start_index : start_index + limit]
        has_more = start_index + limit < len(all_messages)

        # Convert to ThreadItems
        items = []
        for msg in page_messages:
            if msg.role == "user":
                items.append(
                    UserMessageItem(
                        id=str(msg.id),
                        thread_id=thread_id,
                        created_at=msg.created_at,
                        content=[UserMessageTextContent(text=msg.content)],
                    )
                )
            elif msg.role == "assistant":
                items.append(
                    AssistantMessageItem(
                        id=str(msg.id),
                        thread_id=thread_id,
                        created_at=msg.created_at,
                        content=[AssistantMessageContent(text=msg.content)],
                    )
                )

        next_after = str(page_messages[-1].id) if has_more and items else None

        return Page(data=items, has_more=has_more, after=next_after)

    async def add_thread_item(
        self, thread_id: str, item: ThreadItem, context: RequestContext
    ) -> None:
        """Save a new message to the database."""
        session = await self._get_session()

        try:
            conv_id = int(thread_id)
        except ValueError:
            raise ValueError(f"Invalid thread_id: {thread_id}")

        # Update conversation updated_at
        statement = select(Conversation).where(Conversation.id == conv_id)
        result = await session.exec(statement)
        conversation = result.first()
        if conversation:
            conversation.updated_at = datetime.utcnow()
            session.add(conversation)

        # Extract role and content based on item type
        if isinstance(item, UserMessageItem):
            role = "user"
            content = item.content[0].text if item.content else ""
        elif isinstance(item, AssistantMessageItem):
            role = "assistant"
            content = item.content[0].text if item.content else ""
        else:
            # Skip non-message items for now
            return

        # Create message
        message = Message(
            conversation_id=conv_id,
            user_id=context.user_id,
            role=role,
            content=content,
            created_at=item.created_at or datetime.utcnow(),
        )
        session.add(message)
        await session.commit()

    async def save_item(
        self, thread_id: str, item: ThreadItem, context: RequestContext
    ) -> None:
        """Update an existing message or create if not exists."""
        session = await self._get_session()

        try:
            conv_id = int(thread_id)
            item_id = int(item.id) if item.id else None
        except (ValueError, TypeError):
            await self.add_thread_item(thread_id, item, context)
            return

        if not item_id:
            await self.add_thread_item(thread_id, item, context)
            return

        # Try to find existing message
        statement = select(Message).where(Message.id == item_id)
        result = await session.exec(statement)
        message = result.first()

        if message:
            # Update existing
            if isinstance(item, UserMessageItem):
                message.content = item.content[0].text if item.content else ""
            elif isinstance(item, AssistantMessageItem):
                message.content = item.content[0].text if item.content else ""

            session.add(message)
            await session.commit()
        else:
            # Create new
            await self.add_thread_item(thread_id, item, context)

    async def load_item(
        self, thread_id: str, item_id: str, context: RequestContext
    ) -> ThreadItem:
        """Load a specific message by ID."""
        session = await self._get_session()

        try:
            msg_id = int(item_id)
        except ValueError:
            raise NotFoundError(f"Item {item_id} not found")

        statement = select(Message).where(Message.id == msg_id)
        result = await session.exec(statement)
        message = result.first()

        if not message:
            raise NotFoundError(f"Item {item_id} not found")

        # Convert to ThreadItem
        if message.role == "user":
            return UserMessageItem(
                id=str(message.id),
                thread_id=thread_id,
                created_at=message.created_at,
                content=[UserMessageTextContent(text=message.content)],
            )
        else:
            return AssistantMessageItem(
                id=str(message.id),
                thread_id=thread_id,
                created_at=message.created_at,
                content=[AssistantMessageContent(text=message.content)],
            )

    async def delete_thread_item(
        self, thread_id: str, item_id: str, context: RequestContext
    ) -> None:
        """Delete a specific message."""
        session = await self._get_session()

        try:
            msg_id = int(item_id)
        except ValueError:
            raise NotFoundError(f"Item {item_id} not found")

        statement = select(Message).where(Message.id == msg_id)
        result = await session.exec(statement)
        message = result.first()

        if message:
            await session.delete(message)
            await session.commit()

    # ==================== Attachment Methods ====================

    async def save_attachment(
        self, attachment: Attachment, context: RequestContext
    ) -> None:
        """Save attachment metadata (not implemented for basic setup)."""
        raise NotImplementedError("Attachments not yet implemented")

    async def load_attachment(
        self, attachment_id: str, context: RequestContext
    ) -> Attachment:
        """Load attachment metadata (not implemented for basic setup)."""
        raise NotImplementedError("Attachments not yet implemented")

    async def delete_attachment(
        self, attachment_id: str, context: RequestContext
    ) -> None:
        """Delete attachment (not implemented for basic setup)."""
        raise NotImplementedError("Attachments not yet implemented")
