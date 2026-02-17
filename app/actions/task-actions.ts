"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import type { TaskStatus } from "@/types/task";

const taskSchema = z.object({
  title: z.string().min(1, "Title is required").max(120),
  description: z.string().max(1000).optional().nullable(),
  priority: z.enum(["low", "medium", "high"]).optional().nullable(),
  status: z.enum(["todo", "in_progress", "done"]).optional().nullable(),
  due_date: z.string().optional().nullable(),
});

const updateSchema = taskSchema.extend({
  id: z.string().uuid(),
});

interface ActionResult {
  success: boolean;
  error?: string;
}

function normalizeInput<T extends z.infer<typeof taskSchema>>(input: T) {
  return {
    ...input,
    description: input.description?.trim() || null,
    priority: input.priority ?? null,
    status: (input.status ?? "todo") as TaskStatus,
    due_date: input.due_date ? input.due_date : null,
  };
}

/**
 * Creates a task for the current user.
 */
export async function createTaskAction(
  input: z.infer<typeof taskSchema>,
): Promise<ActionResult> {
  const supabase = await createClient();

  try {
    const parsed = taskSchema.parse(input);
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return { success: false, error: "You must be logged in." };
    }

    const payload = normalizeInput(parsed);

    const { error: insertError } = await supabase.from("tasks").insert({
      ...payload,
      user_id: data.user.id,
    });

    if (insertError) {
      console.error("Failed to create task", insertError);
      return { success: false, error: "Unable to create task." };
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("Failed to create task", err);
    return { success: false, error: "Unable to create task." };
  }
}

/**
 * Updates a task for the current user.
 */
export async function updateTaskAction(
  input: z.infer<typeof updateSchema>,
): Promise<ActionResult> {
  const supabase = await createClient();

  try {
    const parsed = updateSchema.parse(input);
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return { success: false, error: "You must be logged in." };
    }

    const { id, ...rest } = normalizeInput(parsed);

    const { error: updateError } = await supabase
      .from("tasks")
      .update(rest)
      .eq("id", id)
      .eq("user_id", data.user.id);

    if (updateError) {
      console.error("Failed to update task", updateError);
      return { success: false, error: "Unable to update task." };
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("Failed to update task", err);
    return { success: false, error: "Unable to update task." };
  }
}

/**
 * Deletes a task for the current user.
 */
export async function deleteTaskAction(taskId: string): Promise<ActionResult> {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.auth.getUser();

    if (error || !data.user) {
      return { success: false, error: "You must be logged in." };
    }

    const { error: deleteError } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId)
      .eq("user_id", data.user.id);

    if (deleteError) {
      console.error("Failed to delete task", deleteError);
      return { success: false, error: "Unable to delete task." };
    }

    revalidatePath("/dashboard");
    return { success: true };
  } catch (err) {
    console.error("Failed to delete task", err);
    return { success: false, error: "Unable to delete task." };
  }
}
