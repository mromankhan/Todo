import { redirect } from "next/navigation";

/**
 * Chat page now redirects to dashboard where the floating
 * chat widget is available on the bottom-right corner.
 */
export default function ChatPage() {
  redirect("/dashboard");
}
