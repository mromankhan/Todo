"use client";

import { TaskItem } from "./task-item";
import type { Task } from "@/lib/types";
import { CheckCircle2 } from "lucide-react";

interface TaskListProps {
  tasks: Task[];
  userId: string;
  onTaskUpdated: (task: Task) => void;
  onTaskDeleted: (taskId: number) => void;
}

export function TaskList({
  tasks,
  userId,
  onTaskUpdated,
  onTaskDeleted,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="rounded-xl border-2 border-dashed border-border bg-muted/30 p-12 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
          <CheckCircle2 className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-medium text-foreground">No tasks</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Get started by creating a new task.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-background overflow-hidden">
      {tasks.map((task, index) => (
        <div key={task.id} className={index !== tasks.length - 1 ? "border-b border-border" : ""}>
          <TaskItem
            task={task}
            userId={userId}
            onTaskUpdated={onTaskUpdated}
            onTaskDeleted={onTaskDeleted}
          />
        </div>
      ))}
    </div>
  );
}
