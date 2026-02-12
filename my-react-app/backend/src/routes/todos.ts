import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { Todo } from '../types.js';

const router = Router();

let todos: Todo[] = [];

// GET /api/todos — list all
router.get('/', (_req: Request, res: Response) => {
  res.json(todos);
});

// POST /api/todos — create
router.post('/', (req: Request, res: Response) => {
  const { title } = req.body as { title?: string };
  if (!title || !title.trim()) {
    res.status(400).json({ error: 'Title is required' });
    return;
  }
  const todo: Todo = {
    id: uuidv4(),
    title: title.trim(),
    completed: false,
  };
  todos.push(todo);
  res.status(201).json(todo);
});

// PATCH /api/todos/:id — toggle complete / update title
router.patch('/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const todo = todos.find((t) => t.id === id);
  if (!todo) {
    res.status(404).json({ error: 'Todo not found' });
    return;
  }
  const { title, completed } = req.body as { title?: string; completed?: boolean };
  if (title !== undefined) todo.title = title.trim();
  if (completed !== undefined) todo.completed = completed;
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
  todos.splice(index, 1);
  res.json({ success: true });
});

export default router;
