"use client";

import { useState } from "react";
import { Check, Pencil, Trash2, X } from "lucide-react";
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
}

export function TaskItem({
  task,
  userId,
  onTaskUpdated,
  onTaskDeleted,
}: TaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleToggleComplete = async () => {
    setLoading(true);
    setError(null);
    try {
      const updatedTask = await api.tasks.toggleComplete(userId, task.id);
      onTaskUpdated(updatedTask);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editTitle.trim()) {
      setError("Title is required");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const updatedTask = await api.tasks.update(userId, task.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || null,
      });
      onTaskUpdated(updatedTask);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this task?")) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await api.tasks.delete(userId, task.id);
      onTaskDeleted(task.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setIsEditing(false);
    setError(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isEditing) {
    return (
      <div className="p-4 border-b border-border last:border-b-0">
        <div className="space-y-3">
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Task title"
            maxLength={200}
            autoFocus
          />
          <Input
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Description (optional)"
            maxLength={1000}
          />
          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSaveEdit} disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "p-4 border-b border-border last:border-b-0 flex items-start gap-3",
        task.completed && "opacity-70"
      )}
    >
      <button
        onClick={handleToggleComplete}
        disabled={loading}
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors",
          task.completed
            ? "border-green-500 bg-green-500 text-white"
            : "border-input hover:border-input/80"
        )}
      >
        {task.completed && <Check className="h-3 w-3" />}
      </button>

      <div className="flex-1 min-w-0">
        <h3
          className={cn(
            "font-medium text-foreground",
            task.completed && "line-through opacity-70"
          )}
        >
          {task.title}
        </h3>
        {task.description && (
          <p className="mt-1 text-sm text-muted-foreground">
            {task.description}
          </p>
        )}
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <span>Created {formatDate(task.created_at)}</span>
          {task.updated_at !== task.created_at && (
            <>
              <span>•</span>
              <span>Updated {formatDate(task.updated_at)}</span>
            </>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      </div>

      <div className="flex gap-1">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => setIsEditing(true)}
          disabled={loading}
          className="h-8 w-8 hover:bg-accent"
        >
          <Pencil className="h-4 w-4" />
          <span className="sr-only">Edit</span>
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={handleDelete}
          disabled={loading}
          className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
          <span className="sr-only">Delete</span>
        </Button>
      </div>
    </div>
  );
}
