"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/lib/api";
import type { Task, TaskCreate } from "@/lib/types";

interface TaskFormProps {
  userId: string;
  onTaskCreated?: (task: Task) => void;
  editTask?: Task;
  onTaskUpdated?: (task: Task) => void;
  onCancel?: () => void;
}

export function TaskForm({
  userId,
  onTaskCreated,
  editTask,
  onTaskUpdated,
  onCancel,
}: TaskFormProps) {
  const [title, setTitle] = useState(editTask?.title || "");
  const [description, setDescription] = useState(editTask?.description || "");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isEditing = !!editTask;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    setLoading(true);

    try {
      if (isEditing && editTask) {
        const updatedTask = await api.tasks.update(userId, editTask.id, {
          title: title.trim(),
          description: description.trim() || null,
        });
        onTaskUpdated?.(updatedTask);
      } else {
        const taskData: TaskCreate = {
          title: title.trim(),
          description: description.trim() || null,
        };
        const newTask = await api.tasks.create(userId, taskData);
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
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          type="text"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={200}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description (optional)</Label>
        <Input
          id="description"
          type="text"
          placeholder="Add more details..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={1000}
        />
      </div>
      {error && (
        <div className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
          {error}
        </div>
      )}
      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          {loading
            ? isEditing
              ? "Saving..."
              : "Adding..."
            : isEditing
            ? "Save Changes"
            : "Add Task"}
        </Button>
        {isEditing && onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
