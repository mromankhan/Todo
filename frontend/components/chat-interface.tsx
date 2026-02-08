"use client";

/**
 * Floating ChatKit widget - shows a chat button on the bottom-right
 * of the dashboard. Click to open/close the AI chatbot panel.
 * Authentication is handled via Better Auth cookies.
 */
import { useState, useCallback } from "react";
import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { useSession } from "@/lib/auth-client";
import { MessageSquare, X } from "lucide-react";

function ChatPanel({ onClose }: { onClose: () => void }) {
  const { data: session } = useSession();
  const userEmail = session?.user?.email || "Unknown";

  const chatkit = useChatKit({
    api: {
      url: "http://localhost:8000/chatkit",
      domainKey: "local-dev",
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          credentials: "include",
          headers: {
            ...(init?.headers || {}),
          },
        }),
    },
    history: {
      enabled: true,
      showDelete: true,
      showRename: true,
    },
    composer: {
      placeholder: "Ask me to manage your tasks...",
    },
    startScreen: {
      greeting: "Hi! I'm your AI task assistant",
      prompts: [
        {
          label: "Show my tasks",
          prompt: "Show me all my tasks",
          icon: "search",
        },
        {
          label: "Add a task",
          prompt: "Add a new task",
          icon: "plus",
        },
        {
          label: "What can you do?",
          prompt: "What can you help me with?",
          icon: "lightbulb",
        },
      ],
    },
    threadItemActions: {
      feedback: true,
      retry: true,
    },
    onError: ({ error }) => {
      console.error("[ChatKit] Error:", error);
    },
    onReady: () => {
      console.log("[ChatKit] Ready");
    },
  });

  return (
    <div className="fixed bottom-20 right-4 z-50 w-[400px] h-[600px] max-w-[calc(100vw-2rem)] max-h-[calc(100vh-8rem)] flex flex-col rounded-2xl border bg-background shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-200">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <MessageSquare className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">AI Task Assistant</h3>
            <p className="text-[10px] text-muted-foreground">{userEmail}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-1.5 hover:bg-muted transition-colors"
          aria-label="Close chat"
        >
          <X className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>

      {/* ChatKit Container */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <ChatKit control={chatkit.control} />
      </div>
    </div>
  );
}

export default function FloatingChat() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, isPending } = useSession();

  const toggleChat = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // Don't render anything if not authenticated
  if (isPending || !session?.user) {
    return null;
  }

  return (
    <>
      {/* Chat Panel */}
      {isOpen && <ChatPanel onClose={() => setIsOpen(false)} />}

      {/* Floating Action Button */}
      <button
        onClick={toggleChat}
        className={`fixed bottom-4 right-4 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 ${
          isOpen
            ? "bg-muted text-muted-foreground hover:bg-muted/80"
            : "bg-primary text-primary-foreground hover:bg-primary/90"
        }`}
        aria-label={isOpen ? "Close chat" : "Open AI assistant"}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageSquare className="h-6 w-6" />
        )}
      </button>
    </>
  );
}
