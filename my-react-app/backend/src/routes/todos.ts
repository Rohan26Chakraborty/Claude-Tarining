import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Todo, ActivityLog, Priority } from '../types.js';

const router = Router();

let todos: Todo[] = [];
let activityLogs: ActivityLog[] = [];

function logActivity(action: ActivityLog['action'], todoTitle: string) {
  activityLogs.unshift({
    id: uuidv4(),
    action,
    todoTitle,
    timestamp: new Date().toISOString(),
  });
}

// GET /api/todos — list all
router.get('/', (_req: Request, res: Response) => {
  res.json(todos);
});

// POST /api/todos — create
router.post('/', (req: Request, res: Response) => {
  const { title, priority, dueDate } = req.body as {
    title?: string;
    priority?: Priority;
    dueDate?: string;
  };
  if (!title || !title.trim()) {
    res.status(400).json({ error: 'Title is required' });
    return;
  }
  const todo: Todo = {
    id: uuidv4(),
    title: title.trim(),
    completed: false,
    priority: priority || 'medium',
    dueDate: dueDate || undefined,
    createdAt: new Date().toISOString(),
  };
  todos.push(todo);
  logActivity('created', todo.title);
  res.status(201).json(todo);
});

// PATCH /api/todos/:id — toggle complete / update title / priority / dueDate
router.patch('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const todo = todos.find((t) => t.id === id);
  if (!todo) {
    res.status(404).json({ error: 'Todo not found' });
    return;
  }
  const { title, completed, priority, dueDate } = req.body as {
    title?: string;
    completed?: boolean;
    priority?: Priority;
    dueDate?: string | null;
  };
  if (title !== undefined) todo.title = title.trim();
  if (priority !== undefined) todo.priority = priority;
  if (dueDate !== undefined) todo.dueDate = dueDate || undefined;
  if (completed !== undefined) {
    todo.completed = completed;
    logActivity(completed ? 'completed' : 'uncompleted', todo.title);
  }
  res.json(todo);
});

// DELETE /api/todos/:id — delete
router.delete('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = todos.findIndex((t) => t.id === id);
  if (index === -1) {
    res.status(404).json({ error: 'Todo not found' });
    return;
  }
  const deleted = todos.splice(index, 1)[0];
  logActivity('deleted', deleted.title);
  res.json({ success: true });
});

// GET /api/todos/activity — list all activity logs
router.get('/activity', (_req: Request, res: Response) => {
  res.json(activityLogs);
});

export default router;
