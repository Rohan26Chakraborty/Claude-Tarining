import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Todo, ActivityLog, Priority, Status, DurationUnit } from '../types.js';

const router = Router();

let todos: Todo[] = [];
let activityLogs: ActivityLog[] = [];

function logActivity(userId: string, action: ActivityLog['action'], todoTitle: string) {
  activityLogs.unshift({
    id: uuidv4(),
    userId,
    action,
    todoTitle,
    timestamp: new Date().toISOString(),
  });
}

// GET /api/todos — list caller's todos
router.get('/', (req: Request, res: Response) => {
  res.json(todos.filter(t => t.userId === req.userId));
});

// POST /api/todos — create
router.post('/', (req: Request, res: Response) => {
  const { title, description, priority, durationValue, durationUnit, dueDate } = req.body as {
    title?: string;
    description?: string;
    priority?: Priority;
    durationValue?: number;
    durationUnit?: DurationUnit;
    dueDate?: string;
  };
  if (!title || !title.trim()) {
    res.status(400).json({ error: 'Title is required' });
    return;
  }
  const todo: Todo = {
    id: uuidv4(),
    userId: req.userId!,
    title: title.trim(),
    description: description?.trim() || undefined,
    status: 'pending',
    priority: priority || 'medium',
    durationValue: durationValue || undefined,
    durationUnit: durationUnit || undefined,
    dueDate: dueDate || undefined,
    createdAt: new Date().toISOString(),
  };
  todos.push(todo);
  logActivity(req.userId!, 'created', todo.title);
  res.status(201).json(todo);
});

// PATCH /api/todos/:id — update (owner only)
router.patch('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const todo = todos.find(t => t.id === id && t.userId === req.userId);
  if (!todo) {
    res.status(404).json({ error: 'Todo not found' });
    return;
  }
  const { title, description, status, priority, durationValue, durationUnit, dueDate } = req.body as {
    title?: string;
    description?: string;
    status?: Status;
    priority?: Priority;
    durationValue?: number | null;
    durationUnit?: DurationUnit | null;
    dueDate?: string | null;
  };
  if (title !== undefined) todo.title = title.trim();
  if (description !== undefined) todo.description = description?.trim() || undefined;
  if (priority !== undefined) todo.priority = priority;
  if (durationValue !== undefined) todo.durationValue = durationValue || undefined;
  if (durationUnit !== undefined) todo.durationUnit = durationUnit || undefined;
  if (dueDate !== undefined) todo.dueDate = dueDate || undefined;
  if (status !== undefined && status !== todo.status) {
    const prev = todo.status;
    todo.status = status;
    if (status === 'completed') logActivity(req.userId!, 'completed', todo.title);
    else if (status === 'in-progress') logActivity(req.userId!, 'in-progress', todo.title);
    else if (prev === 'completed') logActivity(req.userId!, 'uncompleted', todo.title);
  }
  res.json(todo);
});

// DELETE /api/todos/:id — delete (owner only)
router.delete('/:id', (req: Request, res: Response) => {
  const index = todos.findIndex(t => t.id === req.params.id && t.userId === req.userId);
  if (index === -1) {
    res.status(404).json({ error: 'Todo not found' });
    return;
  }
  const deleted = todos.splice(index, 1)[0];
  logActivity(req.userId!, 'deleted', deleted.title);
  res.json({ success: true });
});

// GET /api/todos/activity — caller's logs
router.get('/activity', (req: Request, res: Response) => {
  res.json(activityLogs.filter(l => l.userId === req.userId));
});

export default router;
