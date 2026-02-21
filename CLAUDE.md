# CLAUDE.md
We're building the app described in @SPEC.MD. Read that file for general architectural tasks or to double-check the exact database structure, tech stack or application architecture.

Keep your replies extremely concise and focus on conveying the key information. No unnecessary fluff, no long code snippets.


This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack todo/task management app with a React frontend and Express backend in a monorepo layout under `my-react-app/`.

## Commands

All commands run from `my-react-app/`:

```bash
npm run dev              # Start frontend (port 5173) + backend (port 3001) concurrently
npm run dev:frontend     # Frontend only (Vite dev server)
npm run dev:backend      # Backend only (tsx watch)
npm run build            # Production frontend build
npm run install:all      # Install frontend + backend dependencies
cd frontend && npm run lint  # ESLint on frontend
```

No test framework is configured.

> **Note:** `my-react-app/server/` is a legacy duplicate of `backend/` and is not actively used. The root scripts reference `backend/`.

## Architecture

- **`my-react-app/frontend/`** — React 19 SPA built with Vite 7, styled with Tailwind CSS 4
  - `src/api/todos.ts` — API calls and TanStack React Query hooks (`useTodos`, `useAddTodo`, `useToggleTodo`, `useUpdateTodo`, `useDeleteTodo`, `useActivityLogs`). Mutations invalidate `['todos']` and `['activity']` query keys.
  - `src/components/` — React components:
    - **AddTodo** — Title input with collapsible options panel for priority (`low`/`medium`/`high`) and due date picker
    - **TodoList** — Filterable list with All/Active/Completed tabs and item counter
    - **TodoItem** — Toggle, delete, inline editing (double-click), priority color dots, due date badge with overdue detection
    - **ActivityLog** — Displays activity history
  - `src/types.ts` — TypeScript interfaces (`Todo`, `ActivityLog`, `Priority`)
  - `App.tsx` — Gradient background, frosted glass card layout (`max-w-2xl`)

- **`my-react-app/backend/`** — Express 5 REST API on port 3001
  - `src/routes/todos.ts` — All CRUD endpoints and in-memory data storage (no database)
  - `src/types.ts` — TypeScript interfaces (duplicated from frontend, must stay in sync)

- Vite proxies `/api` requests to `http://localhost:3001` in development
- Data is stored in-memory arrays — restarting the backend clears all data
- Backend types and frontend types are defined separately but must stay in sync

## Data Model

```typescript
type Priority = 'low' | 'medium' | 'high';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  priority: Priority;    // defaults to 'medium'
  dueDate?: string;
  createdAt: string;
}

interface ActivityLog {
  id: string;
  action: 'created' | 'completed' | 'uncompleted' | 'deleted';
  todoTitle: string;
  timestamp: string;
}
```

## API Endpoints

All under `/api/todos`:
- `GET /` — List todos
- `POST /` — Create todo (body: `{ title, priority?, dueDate? }`)
- `PATCH /:id` — Update todo (body: `{ completed?, title?, priority?, dueDate? }`)
- `DELETE /:id` — Delete todo
- `GET /activity` — List activity logs (newest first)

## Claude Code Configuration

- **`.claude/agents/tailwind-designer.md`** — Tailwind CSS design sub-agent (Sonnet model)
- **`.claude/commands/explain-this-file.md`** — `/explain-this-file` slash command
- **`.claude/hooks/`** — PostToolUse/Stop hooks:
  - `changelog.ps1` / `changelog.sh` — Auto-log tool usage to `changelog.log` at project root
  - `notify.ps1` — Windows toast notification on task completion
- **`.claude/settings.local.json`** — Permission allowlists and hook wiring

## Tech Stack

Frontend: React 19, TypeScript, Vite 7, Tailwind CSS 4, TanStack React Query 5
Backend: Express 5, TypeScript, tsx (dev runner), uuid
