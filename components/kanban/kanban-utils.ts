import type { Task, TaskStatus } from "@/types/task";

/**
 * Resolves the next status based on the drop target.
 */
export function resolveDropStatus(
  tasks: Task[],
  overId: string | null,
): TaskStatus | null {
  if (!overId) {
    return null;
  }

  if (overId === "todo" || overId === "in_progress" || overId === "done") {
    return overId;
  }

  const overTask = tasks.find((task) => task.id === overId);
  return overTask?.status ?? null;
}

/**
 * Filters tasks based on a search query.
 */
export function filterTasksByQuery(tasks: Task[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return tasks;
  }

  return tasks.filter((task) =>
    `${task.title} ${task.description ?? ""}`
      .toLowerCase()
      .includes(normalizedQuery),
  );
}
