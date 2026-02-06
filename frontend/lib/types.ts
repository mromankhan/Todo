/**
 * TypeScript types for the Todo application.
 * These types mirror the backend SQLModel schemas.
 */

/**
 * Task entity as returned from the API.
 */
export interface Task {
  id: number;
  user_id: string;
  title: string;
  description: string | null;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Input for creating a new task.
 */
export interface TaskCreate {
  title: string;
  description?: string | null;
}

/**
 * Input for updating an existing task.
 */
export interface TaskUpdate {
  title?: string;
  description?: string | null;
}
