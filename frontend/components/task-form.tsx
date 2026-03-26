"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import type { Task, TaskCreate } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TaskFormProps {
  userId: string;
  onTaskCreated?: (task: Task) => void;
  editTask?: Task;
  onTaskUpdated?: (task: Task) => void;
  onCancel?: () => void;
}

export function TaskForm({ userId, onTaskCreated, editTask, onTaskUpdated, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState(editTask?.title || "");
  const [description, setDescription] = useState(editTask?.description || "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEditing = !!editTask;
  const titleMax = 200;
  const descMax = 1000;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) { setError("Task title is required."); return; }

    setLoading(true);
    try {
      if (isEditing && editTask) {
        const updated = await api.tasks.update(userId, editTask.id, {
          title: title.trim(),
          description: description.trim() || null,
        });
        onTaskUpdated?.(updated);
      } else {
        const data: TaskCreate = { title: title.trim(), description: description.trim() || null };
        const newTask = await api.tasks.create(userId, data);
        setTitle("");
        setDescription("");
        onTaskCreated?.(newTask);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="task-title" className="text-sm font-medium">
            Task title <span className="text-destructive">*</span>
          </Label>
          <span className={cn(
            "text-[11px] tabular-nums transition-colors",
            title.length > titleMax * 0.9 ? "text-amber-500" : "text-muted-foreground/60"
          )}>
            {title.length}/{titleMax}
          </span>
        </div>
        <Input
          id="task-title"
          type="text"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={titleMax}
          required
          autoFocus={!isEditing}
          className="h-10 text-sm"
        />
      </div>

      {/* Description */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="task-desc" className="text-sm font-medium text-muted-foreground">
            Description
            <span className="ml-1 text-[11px] font-normal">(optional)</span>
          </Label>
          {description.length > 0 && (
            <span className={cn(
              "text-[11px] tabular-nums transition-colors",
              description.length > descMax * 0.9 ? "text-amber-500" : "text-muted-foreground/60"
            )}>
              {description.length}/{descMax}
            </span>
          )}
        </div>
        <Input
          id="task-desc"
          type="text"
          placeholder="Add more details…"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={descMax}
          className="h-10 text-sm"
        />
      </div>

      {/* Error */}
      {error && (
        <div role="alert" className="rounded-lg border border-destructive/20 bg-destructive/8 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <Button
          type="submit"
          disabled={loading}
          className={cn("flex-1 h-10 font-medium gap-2", loading && "opacity-80")}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            !isEditing && <Plus className="h-4 w-4" />
          )}
          {loading
            ? (isEditing ? "Saving…" : "Adding…")
            : (isEditing ? "Save changes" : "Add task")}
        </Button>
        {(isEditing || onCancel) && (
          <Button type="button" variant="outline" onClick={onCancel} className="h-10 px-4">
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
