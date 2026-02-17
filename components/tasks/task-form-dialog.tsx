"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import {
  createTaskAction,
  updateTaskAction,
} from "@/app/actions/task-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Task, TaskPriority, TaskStatus } from "@/types/task";

interface TaskFormDialogProps {
  task?: Task;
  onComplete?: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  triggerLabel?: string;
}

const priorities: TaskPriority[] = ["low", "medium", "high"];
const statuses: TaskStatus[] = ["todo", "in_progress", "done"];

/**
 * Task create/update dialog.
 */
export function TaskFormDialog({
  task,
  onComplete,
  open,
  onOpenChange,
  triggerLabel = "Add task",
}: TaskFormDialogProps) {
  const isControlled = typeof open === "boolean";
  const [internalOpen, setInternalOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isOpen = isControlled ? open : internalOpen;
  const setOpen = isControlled ? onOpenChange ?? (() => {}) : setInternalOpen;

  const initialState = useMemo(
    () => ({
      title: task?.title ?? "",
      description: task?.description ?? "",
      priority: task?.priority ?? "medium",
      status: task?.status ?? "todo",
      due_date: task?.due_date ? task.due_date.slice(0, 10) : "",
    }),
    [task],
  );

  const [formState, setFormState] = useState(initialState);

  useEffect(() => {
    if (isOpen) {
      setFormState(initialState);
    }
  }, [initialState, isOpen]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startTransition(async () => {
      const payload = {
        title: formState.title.trim(),
        description: formState.description.trim() || null,
        priority: formState.priority as TaskPriority,
        status: formState.status as TaskStatus,
        due_date: formState.due_date || null,
      };

      const result = task
        ? await updateTaskAction({ id: task.id, ...payload })
        : await createTaskAction(payload);

      if (!result.success) {
        toast.error(result.error ?? "Something went wrong.");
        return;
      }

      toast.success(task ? "Task updated." : "Task created.");
      setOpen(false);
      onComplete?.();
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button>{triggerLabel}</Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{task ? "Edit task" : "New task"}</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formState.title}
              onChange={(event) =>
                setFormState((state) => ({
                  ...state,
                  title: event.target.value,
                }))
              }
              placeholder="Write a short task title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              className="min-h-[90px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              value={formState.description}
              onChange={(event) =>
                setFormState((state) => ({
                  ...state,
                  description: event.target.value,
                }))
              }
              placeholder="Optional details"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select
                value={formState.priority}
                onValueChange={(value) =>
                  setFormState((state) => ({
                    ...state,
                    priority: value as TaskPriority,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formState.status}
                onValueChange={(value) =>
                  setFormState((state) => ({
                    ...state,
                    status: value as TaskStatus,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Due date</Label>
              <Input
                id="due_date"
                type="date"
                value={formState.due_date}
                onChange={(event) =>
                  setFormState((state) => ({
                    ...state,
                    due_date: event.target.value,
                  }))
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : task ? "Save changes" : "Create task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
