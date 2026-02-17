"use client";

import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { useTasks } from "@/hooks/useTasks";
import type { TaskPriority } from "@/types/task";

const priorityStyles: Record<TaskPriority, string> = {
  low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  high: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
};

/**
 * Displays the latest tasks for the authenticated user.
 */
export function TaskList() {
  const { tasks, isLoading, error } = useTasks();

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
        Loading tasks…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-card p-4 text-sm text-destructive">
        {error}
      </div>
    );
  }

  if (!tasks.length) {
    return (
      <div className="rounded-lg border bg-card p-4 text-sm text-muted-foreground">
        No tasks yet. Add a few tasks in Supabase to see them here.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="rounded-lg border bg-card p-4 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                {task.title}
              </h3>
              {task.description ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {task.description}
                </p>
              ) : null}
            </div>
            {task.priority ? (
              <Badge className={priorityStyles[task.priority]}>
                {task.priority}
              </Badge>
            ) : null}
          </div>
          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            <span>Status: {task.status ?? "todo"}</span>
            {task.due_date ? (
              <span>Due {format(new Date(task.due_date), "PPP")}</span>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
