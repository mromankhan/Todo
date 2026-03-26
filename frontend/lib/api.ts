/**
 * API client for communicating with the Todo backend.
 * Handles authentication header injection and error handling.
 */
import type { Task, TaskCreate, TaskUpdate } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// In-memory token cache — avoids an extra /api/token round-trip on every request
// and prevents Neon DB cold-start failures on the first dashboard load after sign-in.
let _cachedToken: string | null = null;
let _tokenExpiry = 0;
let _inflight: Promise<string | null> | null = null;

async function fetchToken(): Promise<string | null> {
  try {
    const response = await fetch("/api/token", { credentials: "include" });
    if (response.ok) {
      const data = await response.json();
      if (data.token) {
        _cachedToken = data.token;
        _tokenExpiry = Date.now() + 10 * 60 * 1000; // cache for 10 minutes
        return data.token;
      }
    }
  } catch {
    // network error — caller will proceed without auth header
  }
  return null;
}

async function getAuthHeader(): Promise<HeadersInit> {
  // Return cached token if still valid
  if (_cachedToken && Date.now() < _tokenExpiry) {
    return { Authorization: `Bearer ${_cachedToken}` };
  }

  // Deduplicate concurrent token requests (e.g. parallel API calls on dashboard mount)
  if (!_inflight) {
    _inflight = fetchToken().finally(() => { _inflight = null; });
  }

  const token = await _inflight;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/**
 * Call after successful sign-in/sign-up to pre-warm the DB connection and
 * cache the JWT before the first dashboard API request fires.
 */
export async function prefetchToken(): Promise<void> {
  _cachedToken = null; // clear any stale token
  _tokenExpiry = 0;
  await fetchToken();
}

/** Call on sign-out to clear the cached token immediately. */
export function clearToken(): void {
  _cachedToken = null;
  _tokenExpiry = 0;
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
