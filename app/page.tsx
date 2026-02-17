import Link from "next/link";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              ✓
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                InsightTask
              </p>
              <h1 className="text-2xl font-semibold">Your personal task OS</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/auth/login"
              className="rounded-md border border-input px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent"
            >
              Log in
            </Link>
            <Link
              href="/auth/sign-up"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              Create account
            </Link>
            <ThemeToggle />
          </div>
        </header>

        <section className="mt-16 grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <h2 className="text-4xl font-semibold leading-tight">
              Plan your week, move tasks with clarity, and let AI summarize your
              progress.
            </h2>
            <p className="text-base text-muted-foreground">
              InsightTask is a Trello-inspired Kanban workspace with realtime
              updates, smart filtering, and weekly insights powered by Grok.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/auth/sign-up"
                className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
              >
                Get started
              </Link>
              <Link
                href="/auth/login"
                className="rounded-md border border-input px-5 py-2 text-sm font-medium shadow-sm hover:bg-accent"
              >
                I already have an account
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border bg-card p-6 shadow-sm">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              What you get
            </h3>
            <ul className="mt-4 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-emerald-400" />
                Drag-and-drop Kanban board with realtime updates.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-amber-400" />
                My Day and Calendar views for due-date focus.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-sky-400" />
                AI weekly insights on progress and bottlenecks.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-2 w-2 rounded-full bg-violet-400" />
                Priorities, status tracking, and clean search.
              </li>
            </ul>
          </div>
        </section>

        <section className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              title: "Kanban clarity",
              description:
                "Move tasks across To Do, In Progress, and Done with color-coded signals.",
            },
            {
              title: "Focus your day",
              description:
                "Surface tasks due today with a dedicated My Day panel.",
            },
            {
              title: "Plan with confidence",
              description:
                "Calendar view highlights every upcoming due date.",
            },
          ].map((feature) => (
            <div key={feature.title} className="rounded-xl border bg-card p-5">
              <h3 className="text-base font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </section>

        <footer className="mt-auto flex flex-wrap items-center justify-between gap-4 border-t pt-6 text-xs text-muted-foreground">
          <p>InsightTask — Built for focused personal productivity.</p>
          <div className="flex gap-3">
            <Link href="/auth/login" className="hover:underline">
              Log in
            </Link>
            <Link href="/auth/sign-up" className="hover:underline">
              Create account
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
