"use client";

import { TaskItem } from "./task-item";
import type { Task } from "@/lib/types";
import { StickyNote } from "lucide-react";

interface TaskListProps {
  tasks: Task[];
  userId: string;
  onTaskUpdated: (task: Task) => void;
  onTaskDeleted: (taskId: number) => void;
}

export function TaskList({ tasks, userId, onTaskUpdated, onTaskDeleted }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border py-16 text-center fade-in">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <StickyNote className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-foreground">No tasks here</h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-[18rem]">
          Add a task above to get started. Your progress will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {tasks.map((task, i) => (
        <TaskItem
          key={task.id}
          task={task}
          userId={userId}
          onTaskUpdated={onTaskUpdated}
          onTaskDeleted={onTaskDeleted}
          style={{ animationDelay: `${i * 35}ms` }}
        />
      ))}
    </div>
  );
}
