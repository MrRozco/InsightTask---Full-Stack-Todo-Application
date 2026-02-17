"use client";

import { useMemo, useState } from "react";
import { Menu } from "lucide-react";
import { isSameDay, parseISO } from "date-fns";

import { KanbanBoard } from "@/components/kanban/kanban-board";
import { filterTasksByQuery } from "@/components/kanban/kanban-utils";
import {
  DashboardSidebar,
  type DashboardViewMode,
} from "@/components/dashboard/dashboard-sidebar";
import { InsightsDialog } from "@/components/insights/insights-dialog";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTasks } from "@/hooks/useTasks";
import type { Task } from "@/types/task";

/**
 * Client dashboard shell.
 */
export function DashboardView() {
  const { tasks, isLoading, error, updateTaskStatus, refetch } = useTasks();
  const [query, setQuery] = useState("");
  const [activeView, setActiveView] = useState<DashboardViewMode>("board");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const filteredTasks = useMemo(
    () => filterTasksByQuery(tasks, query),
    [query, tasks],
  );

  const dueToday = useMemo(
    () =>
      filteredTasks.filter(
        (task) => task.due_date && isSameDay(parseISO(task.due_date), new Date()),
      ),
    [filteredTasks],
  );

  const tasksByDate = useMemo(
    () =>
      filteredTasks.filter(
        (task) =>
          task.due_date && isSameDay(parseISO(task.due_date), selectedDate),
      ),
    [filteredTasks, selectedDate],
  );

  const dueDates = useMemo(
    () =>
      tasks
        .filter((task) => task.due_date)
        .map((task) => parseISO(task.due_date as string)),
    [tasks],
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">InsightTask</h1>
          <p className="text-sm text-muted-foreground">
            Your personal Kanban board with weekly insights.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Open menu"
                className="lg:hidden"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[360px] bg-background/95 backdrop-blur border shadow-lg">
              <DialogHeader>
                <DialogTitle>Menu</DialogTitle>
              </DialogHeader>
              <DashboardSidebar
                query={query}
                onQueryChange={setQuery}
                tasks={tasks}
                onTasksChanged={refetch}
                activeView={activeView}
                onViewChange={setActiveView}
                onClose={() => setIsMenuOpen(false)}
              />
            </DialogContent>
          </Dialog>
          <InsightsDialog />
          <ThemeToggle />
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="hidden w-full max-w-xs shrink-0 rounded-xl border bg-muted/40 p-4 lg:block">
          <DashboardSidebar
            query={query}
            onQueryChange={setQuery}
            tasks={tasks}
            onTasksChanged={refetch}
            activeView={activeView}
            onViewChange={setActiveView}
          />
        </aside>

        <main className="flex-1">
          {activeView === "board" ? (
            <KanbanBoard
              tasks={filteredTasks}
              isLoading={isLoading}
              error={error}
              onStatusChange={updateTaskStatus}
              onTasksChanged={refetch}
            />
          ) : null}

          {activeView === "my-day" ? (
            <MyDayPanel tasks={dueToday} isLoading={isLoading} />
          ) : null}

          {activeView === "calendar" ? (
            <CalendarPanel
              tasks={tasksByDate}
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              dueDates={dueDates}
              isLoading={isLoading}
            />
          ) : null}
        </main>
      </div>
    </div>
  );
}

interface PanelProps {
  tasks: Task[];
  isLoading: boolean;
}

function MyDayPanel({ tasks, isLoading }: PanelProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
        Loading tasks…
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-lg border bg-card p-6">
      <div>
        <h2 className="text-lg font-semibold">My Day</h2>
        <p className="text-sm text-muted-foreground">Tasks due today</p>
      </div>
      {tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No tasks due today.
        </p>
      ) : (
        <div className="grid gap-3">
          {tasks.map((task) => (
            <div key={task.id} className="rounded-md border p-3">
              <p className="text-sm font-semibold text-foreground">
                {task.title}
              </p>
              {task.description ? (
                <p className="text-xs text-muted-foreground">
                  {task.description}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface CalendarPanelProps {
  tasks: Task[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  dueDates: Date[];
  isLoading: boolean;
}

function CalendarPanel({
  tasks,
  selectedDate,
  onDateChange,
  dueDates,
  isLoading,
}: CalendarPanelProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-6 text-sm text-muted-foreground">
        Loading calendar…
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <div className="rounded-lg border bg-card p-4">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && onDateChange(date)}
          modifiers={{ due: dueDates }}
          modifiersClassNames={{
            due: "bg-primary/20 text-primary font-semibold",
          }}
          className="bg-transparent"
        />
      </div>
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-lg font-semibold">Tasks due</h2>
        <p className="text-sm text-muted-foreground">
          {selectedDate.toLocaleDateString()}
        </p>
        <div className="mt-4 grid gap-3">
          {tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No tasks due on this day.
            </p>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className="rounded-md border p-3">
                <p className="text-sm font-semibold text-foreground">
                  {task.title}
                </p>
                {task.description ? (
                  <p className="text-xs text-muted-foreground">
                    {task.description}
                  </p>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
