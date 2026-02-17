import { describe, expect, it } from "vitest";

import type { Task } from "@/types/task";
import { filterTasksByQuery } from "@/components/kanban/kanban-utils";

describe("filterTasksByQuery", () => {
  const tasks: Task[] = [
    {
      id: "task-1",
      user_id: "user-1",
      title: "Plan week",
      description: "Outline priorities",
      priority: "high",
      status: "todo",
      due_date: null,
      created_at: null,
    },
    {
      id: "task-2",
      user_id: "user-1",
      title: "Build UI",
      description: null,
      priority: "low",
      status: "done",
      due_date: null,
      created_at: null,
    },
  ];

  it("returns all tasks when query is empty", () => {
    expect(filterTasksByQuery(tasks, "")).toHaveLength(2);
  });

  it("filters tasks by title or description", () => {
    const results = filterTasksByQuery(tasks, "outline");
    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe("task-1");
  });
});
