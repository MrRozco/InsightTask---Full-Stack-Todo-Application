"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { createClient } from "@/lib/supabase/client";
import type { Task } from "@/types/task";

interface UseTasksResult {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateTaskStatus: (taskId: string, status: Task["status"]) => Promise<void>;
}

/**
 * Fetches tasks for the authenticated user.
 */
export function useTasks(): UseTasksResult {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const channelRef = useRef<ReturnType<
    ReturnType<typeof createClient>["channel"]
  > | null>(null);

  const fetchTasks = useCallback(async () => {
    const supabase = createClient();

    setIsLoading(true);
    setError(null);

    try {
      const { data, error: queryError } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (queryError) {
        throw queryError;
      }

      setTasks(data ?? []);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
      setError("Unable to load tasks. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    let isMounted = true;
    const supabase = createClient();
    channelRef.current = null;

    const setup = async () => {
      try {
        const { data, error: userError } = await supabase.auth.getUser();

        if (userError || !data.user || !isMounted) {
          return;
        }

        const channel = supabase
          .channel(`tasks-realtime-${data.user.id}`)
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "tasks",
              filter: `user_id=eq.${data.user.id}`,
            },
            (payload) => {
              setTasks((current) => {
                const eventType = payload.eventType;
                const newRecord = payload.new as Task | null;
                const oldRecord = payload.old as Task | null;

                if (eventType === "INSERT" && newRecord) {
                  if (current.some((task) => task.id === newRecord.id)) {
                    return current;
                  }
                  return [newRecord, ...current];
                }

                if (eventType === "UPDATE" && newRecord) {
                  return current.map((task) =>
                    task.id === newRecord.id ? newRecord : task,
                  );
                }

                if (eventType === "DELETE" && oldRecord) {
                  return current.filter((task) => task.id !== oldRecord.id);
                }

                return current;
              });
            },
          )
          .subscribe();

        channelRef.current = channel;

        if (!isMounted) {
          await supabase.removeChannel(channel);
        }
      } catch (err) {
        console.error("Failed to subscribe to realtime tasks", err);
      }
    };

    void setup();

    return () => {
      isMounted = false;
      if (channelRef.current) {
        void supabase.removeChannel(channelRef.current);
      }
    };
  }, [fetchTasks]);

  const updateTaskStatus = useCallback(
    async (taskId: string, status: Task["status"]) => {
      const supabase = createClient();

      const previousTasks = tasks;
      setTasks((current) =>
        current.map((task) =>
          task.id === taskId ? { ...task, status } : task,
        ),
      );

      try {
        const { error: updateError } = await supabase
          .from("tasks")
          .update({ status })
          .eq("id", taskId);

        if (updateError) {
          throw updateError;
        }
      } catch (err) {
        console.error("Failed to update task status", err);
        setTasks(previousTasks);
        setError("Unable to update task status. Please try again.");
        throw err;
      }
    },
    [tasks],
  );

  return { tasks, isLoading, error, refetch: fetchTasks, updateTaskStatus };
}
