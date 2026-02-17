"use client";

import { CalendarClock, LayoutGrid, Sun } from "lucide-react";

import { TaskFormDialog } from "@/components/tasks/task-form-dialog";
import type { Task } from "@/types/task";
import { cn } from "@/lib/utils";

export type DashboardViewMode = "board" | "my-day" | "calendar";

interface DashboardSidebarProps {
  query: string;
  onQueryChange: (value: string) => void;
  tasks: Task[];
  onTasksChanged: () => Promise<void>;
  activeView: DashboardViewMode;
  onViewChange: (view: DashboardViewMode) => void;
  onClose?: () => void;
}

/**
 * Sidebar menu for navigation and filters.
 */
export function DashboardSidebar({
  query,
  onQueryChange,
  tasks,
  onTasksChanged,
  activeView,
  onViewChange,
  onClose,
}: DashboardSidebarProps) {
  const totalTasks = tasks.length;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <TaskFormDialog onComplete={onTasksChanged} triggerLabel="Add task" />
        <input
          className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
          placeholder="Search tasks"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <button
          type="button"
          onClick={() => {
            onViewChange("board");
            onClose?.();
          }}
          className={cn(
            "flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm transition hover:bg-accent",
            activeView === "board"
              ? "border-primary/30 bg-primary/10"
              : "border-transparent",
          )}
        >
          <span className="flex items-center gap-2">
            <LayoutGrid className="h-4 w-4" />
            Dashboard
          </span>
          <span className="text-xs text-muted-foreground">{totalTasks}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onViewChange("my-day");
            onClose?.();
          }}
          className={cn(
            "flex w-full items-center gap-2 rounded-md border px-3 py-2 text-sm transition hover:bg-accent",
            activeView === "my-day"
              ? "border-primary/30 bg-primary/10"
              : "border-transparent",
          )}
        >
          <Sun className="h-4 w-4" />
          My Day
        </button>

        <button
          type="button"
          onClick={() => {
            onViewChange("calendar");
            onClose?.();
          }}
          className={cn(
            "flex w-full items-center gap-2 rounded-md border px-3 py-2 text-sm transition hover:bg-accent",
            activeView === "calendar"
              ? "border-primary/30 bg-primary/10"
              : "border-transparent",
          )}
        >
          <CalendarClock className="h-4 w-4" />
          Calendar
        </button>
      </div>
    </div>
  );
}
