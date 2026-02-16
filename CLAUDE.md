# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack todo app with a React frontend and Express backend in a monorepo layout under `my-react-app/`.

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

## Architecture

- **`my-react-app/frontend/`** — React 19 SPA built with Vite 7, styled with Tailwind CSS 4
  - `src/api/todos.ts` — All API calls and TanStack React Query hooks. Mutations invalidate `['todos']` and `['activity']` query keys.
  - `src/components/` — React components (AddTodo, TodoList, TodoItem, ActivityLog)
  - `src/types.ts` — Shared TypeScript interfaces (Todo, ActivityLog)

- **`my-react-app/backend/`** — Express 5 REST API on port 3001
  - `src/routes/todos.ts` — All CRUD endpoints and in-memory data storage (no database)
  - `src/types.ts` — TypeScript interfaces (duplicated from frontend)

- Vite proxies `/api` requests to `http://localhost:3001` in development
- Data is stored in-memory arrays — restarting the backend clears all data
- Backend types and frontend types are defined separately but must stay in sync

## API Endpoints

All under `/api/todos`:
- `GET /` — List todos
- `POST /` — Create todo (body: `{ title }`)
- `PATCH /:id` — Update todo (body: `{ completed?, title? }`)
- `DELETE /:id` — Delete todo
- `GET /activity` — List activity logs (newest first)

## Tech Stack

Frontend: React 19, TypeScript, Vite 7, Tailwind CSS 4, TanStack React Query 5
Backend: Express 5, TypeScript, tsx (dev runner), uuid
