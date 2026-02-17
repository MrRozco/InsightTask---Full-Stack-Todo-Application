/**
 * Task priority levels.
 */
export type TaskPriority = "low" | "medium" | "high";

/**
 * Task status values.
 */
export type TaskStatus = "todo" | "in_progress" | "done";

/**
 * Task entity from Supabase.
 */
export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  priority: TaskPriority | null;
  status: TaskStatus | null;
  due_date: string | null;
  created_at: string | null;
}
