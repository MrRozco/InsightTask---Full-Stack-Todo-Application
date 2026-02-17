"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  PointerSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { toast } from "sonner";

import type { Task, TaskStatus } from "@/types/task";
import { TaskCard } from "@/components/tasks/task-card";
import { resolveDropStatus } from "@/components/kanban/kanban-utils";

const columns: Array<{ id: TaskStatus; label: string }> = [
  { id: "todo", label: "To Do" },
  { id: "in_progress", label: "In Progress" },
  { id: "done", label: "Done" },
];

const taskCounts = (tasks: Task[], status: TaskStatus) =>
  tasks.filter((task) => (task.status ?? "todo") === status).length;

const statusStyles: Record<TaskStatus, string> = {
  todo: "bg-slate-400",
  in_progress: "bg-amber-400",
  done: "bg-emerald-400",
};

interface KanbanBoardProps {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  onStatusChange: (taskId: string, status: Task["status"]) => Promise<void>;
  onTasksChanged: () => Promise<void>;
}

/**
 * Kanban board with drag and drop.
 */
export function KanbanBoard({
  tasks,
  isLoading,
  error,
  onStatusChange,
  onTasksChanged,
}: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const tasksByStatus = useMemo(() => {
    return {
      todo: tasks.filter(
        (task) => (task.status ?? "todo") === "todo",
      ),
      in_progress: tasks.filter(
        (task) => (task.status ?? "todo") === "in_progress",
      ),
      done: tasks.filter(
        (task) => (task.status ?? "todo") === "done",
      ),
    };
  }, [tasks]);

  if (isLoading) {
    return (
      <div className="grid gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <div className="h-4 w-28 animate-pulse rounded bg-muted" />
            <div className="h-3 w-64 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-9 w-32 animate-pulse rounded bg-muted" />
        </div>
        <div className="kanban-board">
          {columns.map((column) => (
            <div className="kanban-column" key={column.id}>
              <div className="kanban-column-header">
                <div className="h-3 w-20 animate-pulse rounded bg-muted" />
                <div className="h-3 w-6 animate-pulse rounded bg-muted" />
              </div>
              <div className="kanban-column-body">
                {[0, 1].map((item) => (
                  <div
                    key={item}
                    className="h-20 animate-pulse rounded-md border bg-muted/30"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-card p-6 text-sm text-destructive">
        {error}
      </div>
    );
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveTask(null);
      return;
    }

    if (active.id === over.id) {
      setActiveTask(null);
      return;
    }

    const activeTaskId = String(active.id);
    const overId = String(over.id);

    if (!activeTaskId || !overId) {
      setActiveTask(null);
      return;
    }

    const nextStatus = resolveDropStatus(tasks, overId);
    const currentTask = tasks.find((task) => task.id === activeTaskId);

    if (!currentTask || !nextStatus || currentTask.status === nextStatus) {
      setActiveTask(null);
      return;
    }

    try {
      await onStatusChange(activeTaskId, nextStatus);
    } catch {
      toast.error("Unable to move task. Please try again.");
    }

    setActiveTask(null);
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={({ active }) => {
        const taskId = String(active.id);
        const task = tasks.find((item) => item.id === taskId) ?? null;
        setActiveTask(task);
      }}
      onDragEnd={handleDragEnd}
      onDragCancel={() => setActiveTask(null)}
      collisionDetection={closestCenter}
    >
      <div className="kanban-board">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            label={column.label}
            tasks={tasksByStatus[column.id] ?? []}
            count={taskCounts(tasks, column.id)}
            onTasksChanged={onTasksChanged}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}

interface KanbanColumnProps {
  id: TaskStatus;
  label: string;
  tasks: Task[];
  count: number;
  onTasksChanged: () => Promise<void>;
}

function KanbanColumn({
  id,
  label,
  tasks,
  count,
  onTasksChanged,
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div className="kanban-column">
      <div className="kanban-column-header">
        <div className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${statusStyles[id]}`}
            aria-hidden="true"
          />
          <h2 className="text-sm font-medium">{label}</h2>
        </div>
        <span className="text-xs text-muted-foreground">{count}</span>
      </div>
      <div ref={setNodeRef} className="kanban-column-body">
        <SortableContext
          items={tasks.map((task) => task.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              draggableId={task.id}
              onTasksChanged={onTasksChanged}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
