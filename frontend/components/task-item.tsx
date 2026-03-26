"use client";

import { useState } from "react";
import { Pencil, Trash2, Loader2, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/lib/api";
import type { Task } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: Task;
  userId: string;
  onTaskUpdated: (task: Task) => void;
  onTaskDeleted: (taskId: number) => void;
  style?: React.CSSProperties;
}

export function TaskItem({ task, userId, onTaskUpdated, onTaskDeleted, style }: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggleComplete = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const updated = await api.tasks.toggleComplete(userId, task.id);
      onTaskUpdated(updated);
    } catch {
      setError("Failed to update");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) { setError("Title is required"); return; }
    setLoading(true);
    setError(null);
    try {
      const updated = await api.tasks.update(userId, task.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || null,
      });
      onTaskUpdated(updated);
      setIsEditing(false);
    } catch {
      setError("Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this task?")) return;
    setLoading(true);
    try {
      await api.tasks.delete(userId, task.id);
      onTaskDeleted(task.id);
    } catch {
      setError("Failed to delete");
      setLoading(false);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

  /* ── Edit mode ── */
  if (isEditing) {
    return (
      <div
        style={style}
        className="group rounded-xl border border-primary/30 bg-card p-4 shadow-sm ring-1 ring-primary/10 task-enter"
      >
        <div className="space-y-2.5">
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Task title"
            maxLength={200}
            autoFocus
            className="h-9 text-sm font-medium"
          />
          <Input
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Description (optional)"
            maxLength={1000}
            className="h-9 text-sm"
          />
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex gap-2 pt-0.5">
            <Button size="sm" onClick={handleSaveEdit} disabled={loading} className="h-8 px-4 text-xs">
              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Save"}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => {
              setEditTitle(task.title);
              setEditDescription(task.description || "");
              setError(null);
              setIsEditing(false);
            }} className="h-8 px-3 text-xs">
              <X className="h-3 w-3 mr-1" />Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ── View mode ── */
  return (
    <div
      style={style}
      className={cn(
        "group relative flex items-start gap-3.5 rounded-xl border border-border bg-card p-4",
        "transition-all duration-200 hover:border-border/80 hover:shadow-sm task-enter",
        task.completed && "opacity-60"
      )}
    >
      {/* Checkbox */}
      <button
        onClick={handleToggleComplete}
        disabled={loading}
        aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
        className={cn(
          "check-bounce mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-150",
          task.completed
            ? "border-emerald-500 bg-emerald-500 text-white"
            : "border-border hover:border-primary/60"
        )}
      >
        {loading
          ? <Loader2 className="h-2.5 w-2.5 animate-spin" />
          : task.completed && <Check className="h-2.5 w-2.5 stroke-[3]" />
        }
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-16">
        <p className={cn(
          "text-sm font-medium text-foreground leading-snug",
          task.completed && "line-through text-muted-foreground"
        )}>
          {task.title}
        </p>

        {task.description && (
          <p className="mt-1 text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="mt-2 flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground/70">
            {formatDate(task.created_at)}
          </span>
          {task.completed && (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
              <Check className="h-2.5 w-2.5 stroke-[3]" />
              Done
            </span>
          )}
        </div>

        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      </div>

      {/* Actions — revealed on hover */}
      <div className="absolute right-3 top-3 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setIsEditing(true)}
          disabled={loading}
          className="h-7 w-7 rounded-lg hover:bg-accent"
          aria-label="Edit task"
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleDelete}
          disabled={loading}
          className="h-7 w-7 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          aria-label="Delete task"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
