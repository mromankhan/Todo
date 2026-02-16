"""Gemini-powered Agent configuration for todo task management."""
import os

from openai import AsyncOpenAI
from agents import Agent, OpenAIChatCompletionsModel, set_tracing_disabled
from chatkit.agents import AgentContext

from mcp_tools import add_task, list_tasks, complete_task, update_task, delete_task

# Disable tracing (not supported by Gemini endpoint)
set_tracing_disabled(disabled=True)


# System instructions for the agent
SYSTEM_INSTRUCTIONS = """You are a helpful AI assistant for managing todo tasks. Your role is to help users create, view, update, complete, and delete their tasks through natural language conversation.

**Available Operations:**
- Create tasks: Users can say "Add a task to buy groceries" or "Create a new task: finish the report"
- View tasks: Users can ask "Show me my tasks", "What's on my todo list?", or "Show me completed tasks"
- Complete tasks: Users can say "Mark task 3 as complete" or "I finished task 5"
- Update tasks: Users can say "Change task 2 title to 'Buy groceries and fruits'" or "Update task 1 description"
- Delete tasks: Users can say "Delete task 4" or "Remove task 2"

**Guidelines:**
1. Always confirm actions with the user by showing what was done
2. For ambiguous task references (e.g., "the meeting task"), ask for the specific task ID
3. When listing tasks, format them clearly with task IDs for easy reference
4. Be conversational and helpful
5. If a user's request is unclear, ask clarifying questions
6. Focus ONLY on task management - politely decline non-task-related requests
7. When a task operation fails, explain the error clearly and suggest how to fix it

**Response Style:**
- Be concise and friendly
- Use bullet points or numbered lists when showing multiple tasks
- Always include task IDs in task listings so users can reference them
- Confirm successful operations with a clear message

**Example Interactions:**
User: "Add a task to buy groceries"
You: "✓ Created task #1: Buy groceries"

User: "Show me my tasks"
You: "Here are your tasks:
1. Buy groceries (pending)
2. Finish report (pending)
3. Call dentist (completed)"

User: "Complete task 1"
You: "✓ Marked task #1 'Buy groceries' as completed"
"""


def create_agent() -> Agent:
    """
    Create and configure the Gemini-powered Agent for task management.

    Returns:
        Configured Agent instance with AgentContext typing
    """
    gemini_api_key = os.environ.get("GEMINI_API_KEY")
    if not gemini_api_key:
        raise ValueError("GEMINI_API_KEY environment variable is not set")

    # Create Gemini client via OpenAI-compatible endpoint
    gemini_client = AsyncOpenAI(
        api_key=gemini_api_key,
        base_url="https://generativelanguage.googleapis.com/v1beta/openai/",
    )

    # Create agent with Gemini model
    agent = Agent[AgentContext](
        name="TodoAssistant",
        instructions=SYSTEM_INSTRUCTIONS,
        model=OpenAIChatCompletionsModel(
            model="gemini-2.5-flash",
            openai_client=gemini_client,
        ),
        tools=[
            add_task,
            list_tasks,
            complete_task,
            update_task,
            delete_task,
        ],
    )

    return agent


# Create a singleton agent instance
agent = create_agent()
