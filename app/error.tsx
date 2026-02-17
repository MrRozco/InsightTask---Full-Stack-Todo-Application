"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

interface AppErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global error boundary.
 */
export default function AppError({ error, reset }: AppErrorProps) {
  useEffect(() => {
    console.error("App error", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-sm text-muted-foreground">
        Please try again or refresh the page.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
