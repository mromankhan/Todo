/**
 * API client for communicating with the Todo backend.
 * Handles authentication header injection and error handling.
 */
import type { Task, TaskCreate, TaskUpdate } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Get the authentication header for API requests.
 * Uses custom token endpoint that generates HS256-signed JWTs for backend compatibility.
 */
async function getAuthHeader(): Promise<HeadersInit> {
  try {
    // Call our custom token endpoint that generates HS256-signed JWTs
    const response = await fetch("/api/token", {
      credentials: "include", // Include cookies for session authentication
    });

    if (response.ok) {
      const data = await response.json();
      if (data.token) {
        return {
          Authorization: `Bearer ${data.token}`,
        };
      }
    }
  } catch {
    // Token endpoint not available, continue without auth
  }
  return {};
}

/**
 * Make an authenticated API request.
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const authHeader = await getAuthHeader();

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeader,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  // Handle 204 No Content responses
  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

/**
 * API client with typed methods for all endpoints.
 */
export const api = {
  tasks: {
    /**
     * List all tasks for a user.
     */
    list: (userId: string): Promise<Task[]> =>
      apiRequest<Task[]>(`/api/${userId}/tasks`),

    /**
     * Get a single task by ID.
     */
    get: (userId: string, taskId: number): Promise<Task> =>
      apiRequest<Task>(`/api/${userId}/tasks/${taskId}`),

    /**
     * Create a new task.
     */
    create: (userId: string, data: TaskCreate): Promise<Task> =>
      apiRequest<Task>(`/api/${userId}/tasks`, {
        method: "POST",
        body: JSON.stringify(data),
      }),

    /**
     * Update an existing task.
     */
    update: (userId: string, taskId: number, data: TaskUpdate): Promise<Task> =>
      apiRequest<Task>(`/api/${userId}/tasks/${taskId}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),

    /**
     * Delete a task.
     */
    delete: (userId: string, taskId: number): Promise<void> =>
      apiRequest<void>(`/api/${userId}/tasks/${taskId}`, {
        method: "DELETE",
      }),

    /**
     * Toggle task completion status.
     */
    toggleComplete: (userId: string, taskId: number): Promise<Task> =>
      apiRequest<Task>(`/api/${userId}/tasks/${taskId}/complete`, {
        method: "PATCH",
      }),
  },
};
