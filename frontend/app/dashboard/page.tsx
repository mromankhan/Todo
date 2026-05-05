"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut, Plus, CheckCircle2,
  Loader2, ListTodo, ChevronDown, Sparkles,
} from "lucide-react";
import FloatingChat from "@/components/chat-interface";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { TaskForm } from "@/components/task-form";
import { TaskList } from "@/components/task-list";
import { api, clearToken } from "@/lib/api";
import { ModeToggle } from "@/components/ui/mode-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Task } from "@/lib/types";

type Filter = "all" | "active" | "completed";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "completed", label: "Done" },
];

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending: sessionLoading } = useSession();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");

  const userId = session?.user?.id;

  useEffect(() => {
    if (sessionLoading) return;
    if (!session?.user) { router.push("/sign-in"); return; }

    api.tasks.list(session.user.id)
      .then(setTasks)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load tasks"))
      .finally(() => setLoading(false));
  }, [session, sessionLoading, router]);

  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const active = total - completed;
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  const filtered = tasks.filter((t) => {
    if (filter === "active") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const handleSignOut = async () => {
    clearToken();
    await signOut();
    router.push("/");
  };

  /* ── Full-screen session loading ── */
  if (sessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary">
            <ListTodo className="h-6 w-6 text-primary-foreground" />
          </div>
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!session?.user) return null;

  const initials = (session.user.name || session.user.email)
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-dvh bg-background">

      {/* ── Sticky Header ─────────────────────────────────────────── */}
      <header className="glass-header sticky top-0 z-40 border-b border-border/60">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-6">

          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-sm">
              <CheckCircle2 className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground tracking-tight hidden sm:block">
              Todo App
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <ModeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-accent transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                    {initials}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-foreground max-w-28 truncate">
                    {session.user.name?.split(" ")[0] || session.user.email.split("@")[0]}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-semibold truncate">{session.user.name || "—"}</p>
                    <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="text-destructive focus:text-destructive focus:bg-destructive/10 gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* ── Main ──────────────────────────────────────────────────── */}
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">

          {/* ── Sidebar ─────────────────────────────────────────── */}
          <aside className="space-y-4 lg:col-span-1">

            {/* Welcome card */}
            <div className="rounded-2xl bg-primary p-5 text-primary-foreground relative overflow-hidden">
              <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-white/10" />
              <div className="absolute -bottom-6 -left-4 h-20 w-20 rounded-full bg-white/10" />
              <div className="relative z-10 space-y-1">
                <p className="text-xs font-medium text-primary-foreground/70">Good work,</p>
                <h2 className="text-base font-bold tracking-tight truncate">
                  {session.user.name?.split(" ")[0] || "there"} 👋
                </h2>
                <p className="text-xs text-primary-foreground/70 mt-2">
                  {active === 0
                    ? "All tasks complete! Great job."
                    : `${active} task${active > 1 ? "s" : ""} remaining today.`}
                </p>
              </div>
            </div>

            {/* Stats */}
            <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Overview</p>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Total", value: total, color: "text-foreground" },
                  { label: "Active", value: active, color: "text-amber-500" },
                  { label: "Done", value: completed, color: "text-emerald-500" },
                ].map((s) => (
                  <div key={s.label} className="flex flex-col items-center rounded-xl bg-muted/50 py-3 gap-0.5">
                    <span className={cn("text-xl font-bold tabular-nums", s.color)}>{s.value}</span>
                    <span className="text-[10px] text-muted-foreground">{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Progress bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">Progress</span>
                  <span className="text-xs font-semibold tabular-nums">{progress}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                    role="progressbar"
                    aria-valuenow={progress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  />
                </div>
              </div>
            </div>

            {/* AI hint */}
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">AI Assistant</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    Ask the chat widget anything about your tasks.
                  </p>
                </div>
              </div>
            </div>
          </aside>

          {/* ── Content area ──────────────────────────────────────── */}
          <div className="space-y-5 lg:col-span-3">

            {/* Add task card */}
            <div className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10">
                    <Plus className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="text-sm font-semibold text-foreground">New task</h2>
                </div>
                <Button
                  variant={showTaskForm ? "secondary" : "default"}
                  size="sm"
                  onClick={() => setShowTaskForm((v) => !v)}
                  className="h-8 px-3 text-xs font-medium gap-1.5"
                >
                  {showTaskForm ? (
                    "Cancel"
                  ) : (
                    <><Plus className="h-3.5 w-3.5" />Add task</>
                  )}
                </Button>
              </div>

              {showTaskForm && (
                <div className="fade-in">
                  {userId && (
                    <TaskForm
                      userId={userId}
                      onTaskCreated={(t) => { setTasks((p) => [t, ...p]); setShowTaskForm(false); }}
                      onCancel={() => setShowTaskForm(false)}
                    />
                  )}
                </div>
              )}
            </div>

            {/* Task list card */}
            <div className="rounded-2xl border border-border bg-card p-5">
              {/* Header with filter pills */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted">
                    <ListTodo className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-foreground leading-none">
                      Your tasks
                    </h2>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {filtered.length} {filter === "all" ? "total" : filter}
                    </p>
                  </div>
                </div>

                {/* Filter pills */}
                <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5">
                  {FILTERS.map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setFilter(f.value)}
                      className={cn(
                        "rounded-md px-3 py-1 text-xs font-medium transition-all duration-150",
                        filter === f.value
                          ? "bg-card text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {f.label}
                      {f.value === "all" && total > 0 && (
                        <span className={cn(
                          "ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums",
                          filter === "all"
                            ? "bg-primary/15 text-primary"
                            : "bg-muted-foreground/20 text-muted-foreground"
                        )}>
                          {total}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Task content */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">Loading tasks…</p>
                </div>
              ) : error ? (
                <div className="rounded-xl border border-destructive/20 bg-destructive/8 p-4 text-sm text-destructive">
                  {error}
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 ml-2 text-sm text-destructive underline"
                    onClick={() => window.location.reload()}
                  >
                    Retry
                  </Button>
                </div>
              ) : (
                <TaskList
                  tasks={filtered}
                  userId={userId || ""}
                  onTaskUpdated={(updated) =>
                    setTasks((p) => p.map((t) => (t.id === updated.id ? updated : t)))
                  }
                  onTaskDeleted={(id) =>
                    setTasks((p) => p.filter((t) => t.id !== id))
                  }
                />
              )}

              {/* Empty filter state */}
              {!loading && !error && filtered.length === 0 && tasks.length > 0 && (
                <div className="mt-4 text-center">
                  <button
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                    onClick={() => setFilter("all")}
                  >
                    Show all tasks
                  </button>
                </div>
              )}

              {/* CTA when truly empty */}
              {!loading && !error && tasks.length === 0 && (
                <div className="mt-6 flex justify-center">
                  <Button
                    onClick={() => setShowTaskForm(true)}
                    className="gap-2 text-sm"
                    size="sm"
                  >
                    <Plus className="h-4 w-4" />
                    Create your first task
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <FloatingChat />
    </div>
  );
}
