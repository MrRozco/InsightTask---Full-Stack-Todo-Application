import { describe, expect, it } from "vitest";

import type { Task } from "@/types/task";
import { resolveDropStatus } from "@/components/kanban/kanban-utils";

describe("resolveDropStatus", () => {
  const tasks: Task[] = [
    {
      id: "task-1",
      user_id: "user-1",
      title: "Task 1",
      description: null,
      priority: "low",
      status: "todo",
      due_date: null,
      created_at: null,
    },
    {
      id: "task-2",
      user_id: "user-1",
      title: "Task 2",
      description: null,
      priority: "high",
      status: "done",
      due_date: null,
      created_at: null,
    },
  ];

  it("returns column status when dropped on a column", () => {
    expect(resolveDropStatus(tasks, "in_progress")).toBe("in_progress");
  });

  it("returns task status when dropped on another task", () => {
    expect(resolveDropStatus(tasks, "task-2")).toBe("done");
  });

  it("returns null for unknown targets", () => {
    expect(resolveDropStatus(tasks, "missing")).toBeNull();
  });
});
