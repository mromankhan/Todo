---
name: api-client
description: Generate TypeScript API client for frontend-backend communication. Use this skill when creating fetch wrappers, API utilities, or integrating frontend with FastAPI backend. Triggers on "create API client", "add fetch function for X", "integrate frontend with backend", or when working in frontend/lib/ directory.
---

# API Client Generator

Generate type-safe TypeScript API client for communicating with the FastAPI backend.

## Workflow

1. Read API specification or backend routes
2. Generate TypeScript types matching backend schemas
3. Create fetch wrapper with authentication
4. Implement CRUD operations with proper error handling
5. Add request/response interceptors

## Project Structure

```
frontend/
├── lib/
│   ├── api/
│   │   ├── client.ts        # Base fetch client
│   │   ├── tasks.ts         # Task API functions
│   │   └── auth.ts          # Auth API functions
│   └── utils.ts
└── types/
    └── api.ts               # API response types
```

## Base Client Template

```typescript
// lib/api/client.ts
import { getSession } from "better-auth/react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function getAuthToken(): Promise<string | null> {
  const session = await getSession();
  return session?.token ?? null;
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  // Build URL with query params
  let url = `${API_BASE_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }

  // Get auth token
  const token = await getAuthToken();

  // Set headers
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...fetchOptions.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  });

  // Handle non-OK responses
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(
      response.status,
      errorData.detail || response.statusText,
      errorData
    );
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// HTTP method helpers
export const api = {
  get: <T>(endpoint: string, params?: Record<string, string>) =>
    apiClient<T>(endpoint, { method: "GET", params }),

  post: <T>(endpoint: string, data?: unknown) =>
    apiClient<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: unknown) =>
    apiClient<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(endpoint: string, data?: unknown) =>
    apiClient<T>(endpoint, {
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string) =>
    apiClient<T>(endpoint, { method: "DELETE" }),
};

export { ApiError };
```

## Tasks API Template

```typescript
// lib/api/tasks.ts
import { api } from "./client";
import { Task, TaskCreate, TaskUpdate } from "@/types/task";

export const tasksApi = {
  /**
   * List all tasks for the current user
   */
  list: async (): Promise<Task[]> => {
    return api.get<Task[]>("/api/tasks");
  },

  /**
   * Get a single task by ID
   */
  get: async (taskId: number): Promise<Task> => {
    return api.get<Task>(`/api/tasks/${taskId}`);
  },

  /**
   * Create a new task
   */
  create: async (data: TaskCreate): Promise<Task> => {
    return api.post<Task>("/api/tasks", data);
  },

  /**
   * Update an existing task
   */
  update: async (taskId: number, data: TaskUpdate): Promise<Task> => {
    return api.put<Task>(`/api/tasks/${taskId}`, data);
  },

  /**
   * Delete a task
   */
  delete: async (taskId: number): Promise<void> => {
    return api.delete(`/api/tasks/${taskId}`);
  },

  /**
   * Toggle task completion status
   */
  toggleComplete: async (taskId: number): Promise<Task> => {
    return api.patch<Task>(`/api/tasks/${taskId}/complete`);
  },
};

// Export individual functions for convenience
export const {
  list: getTasks,
  get: getTask,
  create: createTask,
  update: updateTask,
  delete: deleteTask,
  toggleComplete: toggleTaskComplete,
} = tasksApi;
```

## React Query Integration (Optional)

```typescript
// lib/api/tasks.hooks.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { tasksApi } from "./tasks";
import { TaskCreate, TaskUpdate } from "@/types/task";

export const taskKeys = {
  all: ["tasks"] as const,
  detail: (id: number) => [...taskKeys.all, id] as const,
};

export function useTasks() {
  return useQuery({
    queryKey: taskKeys.all,
    queryFn: tasksApi.list,
  });
}

export function useTask(taskId: number) {
  return useQuery({
    queryKey: taskKeys.detail(taskId),
    queryFn: () => tasksApi.get(taskId),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TaskCreate) => tasksApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TaskUpdate }) =>
      tasksApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
      queryClient.invalidateQueries({ queryKey: taskKeys.detail(id) });
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskId: number) => tasksApi.delete(taskId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.all });
    },
  });
}
```

## Server Actions Alternative

```typescript
// app/actions/tasks.ts
"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

const API_URL = process.env.API_URL || "http://localhost:8000";

async function getToken() {
  const cookieStore = cookies();
  return cookieStore.get("session")?.value;
}

export async function createTaskAction(formData: FormData) {
  const token = await getToken();

  const response = await fetch(`${API_URL}/api/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: formData.get("title"),
      description: formData.get("description"),
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create task");
  }

  revalidatePath("/dashboard");
  return response.json();
}
```

## Key Principles

1. **Type Safety**: Use TypeScript generics for all API responses
2. **Error Handling**: Throw typed errors with status codes
3. **Authentication**: Automatically attach JWT tokens
4. **Reusability**: Export both object API and individual functions
5. **Server/Client**: Support both client components and server actions
