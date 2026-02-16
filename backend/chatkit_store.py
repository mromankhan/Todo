"""ChatKit Store implementation with SQLModel persistence."""
from datetime import datetime
from typing import Optional

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
    InferenceOptions,
)
from sqlmodel import select

from db import get_session_maker
from models import Conversation, Message


class RequestContext:
    """Request context carrying user information through ChatKit operations."""

    def __init__(self, user_id: str, locale: str = "en"):
        self.user_id = user_id
        self.locale = locale


class SQLModelChatKitStore(Store[RequestContext]):
    """ChatKit Store backed by SQLModel for persistent conversation storage."""

    # ==================== Thread Methods ====================

    async def load_thread(
        self, thread_id: str, context: RequestContext
    ) -> ThreadMetadata:
        """Load a conversation thread from the database."""
        async with get_session_maker()() as session:
            statement = select(Conversation).where(
                Conversation.thread_id == thread_id,
                Conversation.user_id == context.user_id,
            )
            result = await session.execute(statement)
            conversation = result.scalar_one_or_none()

        if not conversation:
            raise NotFoundError(f"Thread {thread_id} not found")

        return ThreadMetadata(
            id=conversation.thread_id,
            title=conversation.title,
            created_at=conversation.created_at,
            metadata={},
        )

    async def save_thread(
        self, thread: ThreadMetadata, context: RequestContext
    ) -> None:
        """Create or update a conversation thread in the database."""
        async with get_session_maker()() as session:
            if thread.id:
                # Try to find existing conversation by thread_id
                statement = select(Conversation).where(
                    Conversation.thread_id == thread.id
                )
                result = await session.execute(statement)
                conversation = result.scalar_one_or_none()

                if conversation:
                    conversation.title = thread.title
                    conversation.updated_at = datetime.utcnow()
                    session.add(conversation)
                    await session.commit()
                    return

            # Create new conversation with ChatKit's thread_id
            conversation = Conversation(
                thread_id=thread.id or "",
                user_id=context.user_id,
                title=thread.title or "New Conversation",
                created_at=thread.created_at or datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            session.add(conversation)
            await session.commit()

    async def load_threads(
        self, limit: int, after: str | None, order: str, context: RequestContext
    ) -> Page[ThreadMetadata]:
        """Load list of threads for history view."""
        async with get_session_maker()() as session:
            statement = select(Conversation).where(
                Conversation.user_id == context.user_id
            )

            if order == "desc":
                statement = statement.order_by(Conversation.created_at.desc())
            else:
                statement = statement.order_by(Conversation.created_at.asc())

            result = await session.execute(statement)
            all_conversations = list(result.scalars().all())

        # Apply cursor pagination
        start_index = 0
        if after:
            for idx, conv in enumerate(all_conversations):
                if conv.thread_id == after:
                    start_index = idx + 1
                    break

        page_conversations = all_conversations[start_index : start_index + limit]
        has_more = start_index + limit < len(all_conversations)

        threads = [
            ThreadMetadata(
                id=conv.thread_id,
                title=conv.title,
                created_at=conv.created_at,
                metadata={},
            )
            for conv in page_conversations
        ]

        next_after = page_conversations[-1].thread_id if has_more and threads else None

        return Page(data=threads, has_more=has_more, after=next_after)

    async def delete_thread(self, thread_id: str, context: RequestContext) -> None:
        """Delete a conversation thread and all its messages."""
        async with get_session_maker()() as session:
            statement = select(Conversation).where(
                Conversation.thread_id == thread_id,
                Conversation.user_id == context.user_id,
            )
            result = await session.execute(statement)
            conversation = result.scalar_one_or_none()

            if not conversation:
                raise NotFoundError(f"Thread {thread_id} not found")

            # Delete all messages first
            msg_statement = select(Message).where(
                Message.conversation_id == conversation.id
            )
            msg_result = await session.execute(msg_statement)
            for msg in msg_result.scalars().all():
                await session.delete(msg)

            await session.delete(conversation)
            await session.commit()

    # ==================== Thread Item Methods ====================

    async def _get_conversation_id(self, session, thread_id: str) -> int:
        """Look up the internal DB id for a ChatKit thread_id."""
        statement = select(Conversation.id).where(
            Conversation.thread_id == thread_id
        )
        result = await session.execute(statement)
        conv_id = result.scalar_one_or_none()
        if conv_id is None:
            raise NotFoundError(f"Thread {thread_id} not found")
        return conv_id

    async def load_thread_items(
        self,
        thread_id: str,
        after: str | None,
        limit: int,
        order: str,
        context: RequestContext,
    ) -> Page[ThreadItem]:
        """Load messages for a conversation with pagination."""
        async with get_session_maker()() as session:
            try:
                conv_id = await self._get_conversation_id(session, thread_id)
            except NotFoundError:
                return Page(data=[], has_more=False, after=None)

            statement = select(Message).where(
                Message.conversation_id == conv_id,
                Message.user_id == context.user_id,
            )

            if order == "desc":
                statement = statement.order_by(Message.created_at.desc())
            else:
                statement = statement.order_by(Message.created_at.asc())

            result = await session.execute(statement)
            all_messages = list(result.scalars().all())

        # Apply cursor pagination
        start_index = 0
        if after:
            for idx, msg in enumerate(all_messages):
                if str(msg.id) == after:
                    start_index = idx + 1
                    break

        page_messages = all_messages[start_index : start_index + limit]
        has_more = start_index + limit < len(all_messages)

        items: list[ThreadItem] = []
        for msg in page_messages:
            if msg.role == "user":
                items.append(
                    UserMessageItem(
                        id=str(msg.id),
                        thread_id=thread_id,
                        created_at=msg.created_at,
                        content=[UserMessageTextContent(text=msg.content)],
                        inference_options=InferenceOptions(),
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
        # Extract role and content based on item type
        if isinstance(item, UserMessageItem):
            role = "user"
            content = item.content[0].text if item.content else ""
        elif isinstance(item, AssistantMessageItem):
            role = "assistant"
            content = item.content[0].text if item.content else ""
        else:
            return

        async with get_session_maker()() as session:
            conv_id = await self._get_conversation_id(session, thread_id)

            # Update conversation updated_at
            statement = select(Conversation).where(Conversation.id == conv_id)
            result = await session.execute(statement)
            conversation = result.scalar_one_or_none()
            if conversation:
                conversation.updated_at = datetime.utcnow()
                session.add(conversation)

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
        try:
            item_id = int(item.id) if item.id else None
        except (ValueError, TypeError):
            await self.add_thread_item(thread_id, item, context)
            return

        if not item_id:
            await self.add_thread_item(thread_id, item, context)
            return

        async with get_session_maker()() as session:
            statement = select(Message).where(Message.id == item_id)
            result = await session.execute(statement)
            message = result.scalar_one_or_none()

            if message:
                if isinstance(item, UserMessageItem):
                    message.content = item.content[0].text if item.content else ""
                elif isinstance(item, AssistantMessageItem):
                    message.content = item.content[0].text if item.content else ""

                session.add(message)
                await session.commit()
            else:
                await self.add_thread_item(thread_id, item, context)

    async def load_item(
        self, thread_id: str, item_id: str, context: RequestContext
    ) -> ThreadItem:
        """Load a specific message by ID."""
        try:
            msg_id = int(item_id)
        except ValueError:
            raise NotFoundError(f"Item {item_id} not found")

        async with get_session_maker()() as session:
            statement = select(Message).where(Message.id == msg_id)
            result = await session.execute(statement)
            message = result.scalar_one_or_none()

        if not message:
            raise NotFoundError(f"Item {item_id} not found")

        if message.role == "user":
            return UserMessageItem(
                id=str(message.id),
                thread_id=thread_id,
                created_at=message.created_at,
                content=[UserMessageTextContent(text=message.content)],
                inference_options=InferenceOptions(),
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
        try:
            msg_id = int(item_id)
        except ValueError:
            raise NotFoundError(f"Item {item_id} not found")

        async with get_session_maker()() as session:
            statement = select(Message).where(Message.id == msg_id)
            result = await session.execute(statement)
            message = result.scalar_one_or_none()

            if message:
                await session.delete(message)
                await session.commit()

    # ==================== Attachment Methods ====================

    async def save_attachment(
        self, attachment: Attachment, context: RequestContext
    ) -> None:
        raise NotImplementedError("Attachments not yet implemented")

    async def load_attachment(
        self, attachment_id: str, context: RequestContext
    ) -> Attachment:
        raise NotImplementedError("Attachments not yet implemented")

    async def delete_attachment(
        self, attachment_id: str, context: RequestContext
    ) -> None:
        raise NotImplementedError("Attachments not yet implemented")
