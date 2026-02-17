import { Suspense } from "react";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import { DashboardView } from "@/components/dashboard/dashboard-view";

/**
 * Auth guard rendered inside Suspense to avoid blocking route streaming.
 */
async function DashboardContent() {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.auth.getClaims();

    if (error || !data?.claims) {
      redirect("/auth/login");
    }
  } catch (error) {
    console.error("Failed to validate session", error);
    redirect("/auth/login");
  }

  return (
    <div className="flex min-h-[calc(100vh-1px)] w-full flex-col gap-6 px-6 py-8">
      <DashboardView />
    </div>
  );
}

/**
 * Dashboard page (protected).
 */
export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading dashboard…</div>}>
      <DashboardContent />
    </Suspense>
  );
}
