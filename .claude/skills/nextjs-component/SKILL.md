---
name: nextjs-component
description: Generate Next.js 16+ React components with App Router, TypeScript, and Tailwind CSS. Use this skill when creating frontend UI components, pages, or layouts. Triggers on "create component for X", "add page for Y", "build UI for Z", or when working in the /frontend directory with React/Next.js.
---

# Next.js Component Generator

Generate production-ready Next.js 16+ components with App Router, TypeScript, Tailwind CSS, and shadcn/ui.

## Workflow

1. Identify component requirements from specification
2. Determine component type (page, layout, client component, server component)
3. Generate TypeScript component with proper types
4. Style with Tailwind CSS v4
5. Integrate shadcn/ui components where appropriate

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   └── dashboard/
│       ├── layout.tsx
│       └── page.tsx
├── components/
│   ├── ui/                  # shadcn/ui components
│   ├── tasks/
│   │   ├── task-list.tsx
│   │   ├── task-item.tsx
│   │   ├── task-form.tsx
│   │   └── task-filters.tsx
│   └── shared/
│       ├── header.tsx
│       └── loading.tsx
├── lib/
│   ├── api.ts               # API client
│   └── utils.ts             # Utility functions
└── types/
    └── task.ts              # TypeScript types
```

## Server Component Template

```tsx
// app/dashboard/page.tsx
import { TaskList } from "@/components/tasks/task-list";
import { getTasks } from "@/lib/api";

export default async function DashboardPage() {
  const tasks = await getTasks();

  return (
    <main className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">My Tasks</h1>
      <TaskList initialTasks={tasks} />
    </main>
  );
}
```

## Client Component Template

```tsx
// components/tasks/task-list.tsx
"use client";

import { useState } from "react";
import { Task } from "@/types/task";
import { TaskItem } from "./task-item";
import { TaskForm } from "./task-form";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface TaskListProps {
  initialTasks: Task[];
}

export function TaskList({ initialTasks }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [showForm, setShowForm] = useState(false);

  const handleAddTask = (newTask: Task) => {
    setTasks((prev) => [...prev, newTask]);
    setShowForm(false);
  };

  const handleToggleComplete = (taskId: number) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, is_completed: !task.is_completed }
          : task
      )
    );
  };

  const handleDeleteTask = (taskId: number) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">
          {tasks.filter((t) => !t.is_completed).length} tasks remaining
        </span>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      {showForm && (
        <TaskForm
          onSubmit={handleAddTask}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="space-y-2">
        {tasks.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onToggleComplete={handleToggleComplete}
            onDelete={handleDeleteTask}
          />
        ))}
      </div>
    </div>
  );
}
```

## Task Item Component

```tsx
// components/tasks/task-item.tsx
"use client";

import { Task } from "@/types/task";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: number) => void;
  onDelete: (id: number) => void;
}

export function TaskItem({ task, onToggleComplete, onDelete }: TaskItemProps) {
  return (
    <div className="flex items-center gap-3 p-4 bg-card rounded-lg border">
      <Checkbox
        checked={task.is_completed}
        onCheckedChange={() => onToggleComplete(task.id)}
      />
      <div className="flex-1">
        <h3
          className={cn(
            "font-medium",
            task.is_completed && "line-through text-muted-foreground"
          )}
        >
          {task.title}
        </h3>
        {task.description && (
          <p className="text-sm text-muted-foreground">{task.description}</p>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(task.id)}
        className="text-destructive hover:text-destructive"
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
}
```

## Task Form Component

```tsx
// components/tasks/task-form.tsx
"use client";

import { useState } from "react";
import { Task } from "@/types/task";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createTask } from "@/lib/api";

interface TaskFormProps {
  onSubmit: (task: Task) => void;
  onCancel: () => void;
}

export function TaskForm({ onSubmit, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsLoading(true);
    try {
      const newTask = await createTask({ title, description });
      onSubmit(newTask);
    } catch (error) {
      console.error("Failed to create task:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-card rounded-lg border">
      <Input
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <Textarea
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="flex gap-2 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Adding..." : "Add Task"}
        </Button>
      </div>
    </form>
  );
}
```

## TypeScript Types

```tsx
// types/task.ts
export interface Task {
  id: number;
  user_id: string;
  title: string;
  description?: string;
  is_completed: boolean;
  priority: number;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface TaskCreate {
  title: string;
  description?: string;
  priority?: number;
  due_date?: string;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  priority?: number;
  due_date?: string;
  is_completed?: boolean;
}
```

## Key Principles

1. **Server vs Client**: Use Server Components by default, "use client" only when needed
2. **TypeScript**: Strong typing for all props and state
3. **Tailwind CSS v4**: Use utility classes for styling
4. **shadcn/ui**: Use pre-built components from the UI library
5. **Accessibility**: Include proper ARIA labels and keyboard navigation
