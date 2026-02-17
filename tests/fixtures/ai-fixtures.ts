import type { Task } from "@/types/task";

export function buildPromptForTest(tasks: Task[]) {
  return [
    {
      role: "system",
      content:
        "You are a productivity coach. Return exactly 3 bullet lines: Progress, Bottlenecks, Predictions. Each bullet must be on its own line, concise, and under 120 words total.",
    },
    {
      role: "user",
      content: `Tasks JSON: ${JSON.stringify(tasks)}`,
    },
  ];
}
