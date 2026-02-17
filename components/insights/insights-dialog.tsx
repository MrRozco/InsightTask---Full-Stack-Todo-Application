"use client";

import { useState, useTransition } from "react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

import { getWeeklyInsights } from "@/app/actions/ai-actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * Dialog for AI insights.
 */
export function InsightsDialog() {
  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const formattedSummary = summary
    ? summary
        .replace(/\s-\s/g, "\n- ")
        .replace(/\n{2,}/g, "\n")
        .trim()
    : null;

  const handleGenerate = () => {
    startTransition(async () => {
      const result = await getWeeklyInsights();

      if (!result.success || !result.summary) {
        toast.error(result.error ?? "Unable to generate insights.");
        return;
      }

      setSummary(result.summary);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button onClick={handleGenerate} disabled={isPending}>
          <Sparkles className="mr-2 h-4 w-4" />
          {isPending ? "Generating…" : "Generate Insights"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>Weekly productivity insights</DialogTitle>
          <DialogDescription>
            A quick summary of progress, bottlenecks, and predictions.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-md border bg-muted/30 p-4 text-sm leading-relaxed whitespace-pre-line">
          {formattedSummary ?? "Click generate to see your insights."}
        </div>
        <DialogFooter>
          <Button onClick={handleGenerate} disabled={isPending}>
            {isPending ? "Generating…" : "Regenerate"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
