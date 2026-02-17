# InsightTask

InsightTask is a modern, Trello-inspired personal task manager with a Kanban board, realtime updates, and AI-powered weekly insights.

## Features

- Kanban board with drag-and-drop tasks
- Task CRUD (title, description, priority, due date, status)
- Supabase auth + Postgres with Row Level Security
- Realtime task updates across tabs
- AI weekly insights via Grok API
- Dark mode support

## Tech Stack

- Next.js 15 (App Router)
- TypeScript (strict)
- Supabase (auth, Postgres, realtime)
- shadcn/ui + Tailwind CSS
- @dnd-kit (drag-and-drop)
- Zod validation

## Setup

1. Install dependencies

```bash
npm install
```

2. Configure environment variables in .env.local

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
XAI_API_KEY=your-grok-api-key
```

3. Create the database schema in Supabase

```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT CHECK (status IN ('todo', 'in_progress', 'done')),
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can access own tasks" ON tasks FOR ALL USING (auth.uid() = user_id);
```

4. Enable Realtime on the tasks table

Supabase Dashboard → Database → Replication → Enable Realtime for tasks.

5. Run the app

```bash
npm run dev
```

## Scripts

- `npm run dev` – start dev server
- `npm run test` – run Vitest suite

## Notes

- AI insights are powered by Grok and require a valid XAI API key.
- Realtime updates require the tasks table to be enabled for replication.
