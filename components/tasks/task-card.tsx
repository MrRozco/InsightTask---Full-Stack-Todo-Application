"use client";

import { CSS } from "@dnd-kit/utilities";
import { useSortable } from "@dnd-kit/sortable";
import { format } from "date-fns";
import { CalendarClock, Flag, MoreHorizontal } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { deleteTaskAction } from "@/app/actions/task-actions";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Task, TaskPriority } from "@/types/task";
import { TaskFormDialog } from "@/components/tasks/task-form-dialog";

interface TaskCardProps {
  task: Task;
  isDragging?: boolean;
  draggableId?: string;
  onTasksChanged?: () => Promise<void>;
}

const priorityStyles: Record<TaskPriority, string> = {
  low: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  medium: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  high: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
};

const statusStyles: Record<string, string> = {
  todo: "border-l-slate-400",
  in_progress: "border-l-amber-400",
  done: "border-l-emerald-400",
};

function TaskCardContent({
  task,
  isDragging,
  actions,
}: TaskCardProps & { actions?: React.ReactNode }) {
  return (
    <article
      className={cn(
        "kanban-task border-l-4",
        statusStyles[task.status ?? "todo"],
        isDragging && "ring-2 ring-primary/40",
      )}
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
        <div className="flex items-center gap-2">
          {task.priority ? (
            <Badge className={priorityStyles[task.priority]}>
              <span className="capitalize">{task.priority}</span>
            </Badge>
          ) : null}
          {actions}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Flag className="h-3.5 w-3.5" />
          {task.status ?? "todo"}
        </span>
        {task.due_date ? (
          <span className="inline-flex items-center gap-1">
            <CalendarClock className="h-3.5 w-3.5" />
            {format(new Date(task.due_date), "MMM d")}
          </span>
        ) : null}
      </div>
    </article>
  );
}

/**
 * Renders a draggable task card.
 */
export function TaskCard({
  task,
  isDragging,
  draggableId,
  onTasksChanged,
}: TaskCardProps) {
  if (!draggableId) {
    return <TaskCardContent task={task} isDragging={isDragging} />;
  }

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSorting,
  } = useSortable({ id: draggableId });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleDelete = () => {
    if (!confirm("Delete this task?")) {
      return;
    }

    startTransition(async () => {
      const result = await deleteTaskAction(task.id);
      if (!result.success) {
        toast.error(result.error ?? "Unable to delete task.");
        return;
      }
      toast.success("Task deleted.");
      await onTasksChanged?.();
    });
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCardContent
        task={task}
        isDragging={isDragging || isSorting}
        actions={
          !isDragging ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="rounded-md p-1 text-muted-foreground hover:text-foreground"
                  aria-label="Task actions"
                  type="button"
                  disabled={isPending}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onSelect={(event) => {
                    event.preventDefault();
                    setIsEditOpen(true);
                  }}
                >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive"
                  onSelect={(event) => {
                    event.preventDefault();
                    handleDelete();
                  }}
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null
        }
      />

      <TaskFormDialog
        task={task}
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onComplete={onTasksChanged}
      />
    </div>
  );
}
