"use server";

import { z } from "zod";

import { createClient } from "@/lib/supabase/server";
import type { Task } from "@/types/task";

const responseSchema = z.object({
  summary: z.string().min(1),
});

interface InsightResult {
  success: boolean;
  summary?: string;
  error?: string;
}

function buildPrompt(tasks: Task[]) {
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

/**
 * Fetches weekly productivity insights using Grok API.
 */
export async function getWeeklyInsights(): Promise<InsightResult> {
  const supabase = await createClient();

  try {
    const apiKey = process.env.XAI_API_KEY;

    if (!apiKey) {
      return { success: false, error: "Missing Grok API key." };
    }

    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError || !userData.user) {
      return { success: false, error: "You must be logged in." };
    }

    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("*")
      .eq("user_id", userData.user.id);

    if (tasksError) {
      console.error("Failed to fetch tasks", tasksError);
      return { success: false, error: "Unable to fetch tasks." };
    }

    if (!tasks || tasks.length === 0) {
      return {
        success: true,
        summary: "No tasks available yet. Add tasks to generate insights.",
      };
    }

    const response = await fetch("https://api.x.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "grok-4",
        messages: buildPrompt(tasks as Task[]),
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Grok API error", text);
      return { success: false, error: "Unable to generate insights." };
    }

    const payload = await response.json();
    const summary = payload?.choices?.[0]?.message?.content?.trim();

    const parsed = responseSchema.safeParse({ summary });

    if (!parsed.success) {
      return { success: false, error: "Unexpected response from Grok." };
    }

    return { success: true, summary: parsed.data.summary };
  } catch (error) {
    console.error("Failed to generate insights", error);
    return { success: false, error: "Unable to generate insights." };
  }
}
