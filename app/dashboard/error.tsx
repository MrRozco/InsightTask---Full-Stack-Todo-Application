"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Error boundary for the dashboard route.
 */
export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    console.error("Dashboard error", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-sm text-muted-foreground">
        We couldn't load the dashboard. Please try again.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
