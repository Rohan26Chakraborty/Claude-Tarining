# Todo App

A full-stack todo application built with React and Express, both in TypeScript.

## Tech Stack

**Frontend**
- React 19 with TypeScript
- Vite 7 (dev server + build)
- Tailwind CSS 4
- TanStack React Query (server state management)

**Backend**
- Express 5 with TypeScript
- In-memory storage
- UUID for unique todo IDs
- tsx for development (watch mode)

## Project Structure

```
my-react-app/
├── frontend/          # React SPA
│   ├── src/
│   │   ├── components/   # AddTodo, TodoItem, TodoList
│   │   ├── api/          # API client functions
│   │   ├── types.ts      # Shared types
│   │   ├── App.tsx        # Root component
│   │   └── main.tsx       # Entry point
│   └── vite.config.ts    # Vite config (proxies /api to backend)
├── backend/           # Express REST API
│   └── src/
│       ├── index.ts       # Server entry point (port 3001)
│       ├── routes/todos.ts # CRUD endpoints
│       └── types.ts       # Todo type definition
└── package.json       # Root scripts (concurrently runs both)
```

## API Endpoints

| Method   | Endpoint          | Description          |
|----------|-------------------|----------------------|
| `GET`    | `/api/todos`      | List all todos       |
| `POST`   | `/api/todos`      | Create a new todo    |
| `PATCH`  | `/api/todos/:id`  | Update a todo        |
| `DELETE` | `/api/todos/:id`  | Delete a todo        |

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- npm

### Installation

```bash
cd my-react-app

# Install root dependencies (concurrently)
npm install

# Install frontend and backend dependencies
npm run install:all
```

### Running in Development

```bash
npm run dev
```

This starts both the frontend (http://localhost:5173) and backend (http://localhost:3001) concurrently. The Vite dev server proxies `/api` requests to the backend.

### Building for Production

```bash
npm run build
```

Outputs the production frontend build to `frontend/dist/`.
