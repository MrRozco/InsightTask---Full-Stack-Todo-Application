import { describe, expect, it } from "vitest";

import type { Task } from "@/types/task";

import { buildPromptForTest } from "@/tests/fixtures/ai-fixtures";

describe("AI prompt builder", () => {
  it("includes tasks JSON in the prompt", () => {
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
    ];

    const messages = buildPromptForTest(tasks);
    const userMessage = messages.find((message) => message.role === "user");

    expect(userMessage?.content).toContain("Tasks JSON");
    expect(userMessage?.content).toContain("Plan week");
  });
});
