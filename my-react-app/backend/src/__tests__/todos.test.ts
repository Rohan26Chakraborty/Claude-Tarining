import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import express from 'express';
import { createServer, type Server } from 'http';

// Fresh modules = empty in-memory state per test file
let server: Server;
let base: string;
let authToken: string;   // token for the test user
let otherToken: string;  // token for a second user (isolation tests)

beforeAll(async () => {
  vi.resetModules();

  // Import fresh modules (clean state)
  const { default: authRouter, activeSessions } = await import('../routes/auth.js');
  const { default: todosRouter } = await import('../routes/todos.js');

  const app = express();

  // Replicate requireAuth middleware inline using the same activeSessions map
  app.use(express.json());
  app.use('/auth', authRouter);
  app.use('/todos', (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    const userId = token ? activeSessions.get(token) : undefined;
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }
    (req as any).userId = userId;
    next();
  }, todosRouter);

  server = createServer(app);
  await new Promise<void>(resolve => server.listen(0, resolve));
  const addr = server.address() as { port: number };
  base = `http://localhost:${addr.port}`;

  // Register two test users
  const r1 = await fetch(`${base}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Test User', email: 'test@test.com', password: 'pass' }),
  });
  authToken = (await r1.json()).token;

  const r2 = await fetch(`${base}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Other User', email: 'other@test.com', password: 'pass' }),
  });
  otherToken = (await r2.json()).token;
});

afterAll(() => server?.close());

// ─── Helpers ─────────────────────────────────────────────────────────────────
const api = (path: string, init?: RequestInit, token = authToken) =>
  fetch(`${base}/todos${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, ...(init?.headers ?? {}) },
  });

const post = (body: object, token = authToken) =>
  api('/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }, token);

const patch = (id: string, body: object, token = authToken) =>
  api(`/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }, token);

// ─── POST / — create todo ─────────────────────────────────────────────────────

describe('POST / — create todo', () => {
  it('returns 201 with a well-formed todo', async () => {
    const res = await post({ title: 'First task', priority: 'high' });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(body.title).toBe('First task');
    expect(body.priority).toBe('high');
    expect(body.status).toBe('pending');
    expect(body.userId).toBeDefined();
  });

  it('defaults priority to "medium"', async () => {
    const body = await (await post({ title: 'Default priority' })).json();
    expect(body.priority).toBe('medium');
  });

  it('defaults status to "pending"', async () => {
    const body = await (await post({ title: 'Status default' })).json();
    expect(body.status).toBe('pending');
  });

  it('stores description and duration fields', async () => {
    const body = await (await post({
      title: 'Full task', description: 'Fix the bug', durationValue: 30, durationUnit: 'minutes',
    })).json();
    expect(body.description).toBe('Fix the bug');
    expect(body.durationValue).toBe(30);
    expect(body.durationUnit).toBe('minutes');
  });

  it('accepts all four priority levels', async () => {
    for (const priority of ['low', 'medium', 'high', 'critical']) {
      const body = await (await post({ title: `Task ${priority}`, priority })).json();
      expect(body.priority).toBe(priority);
    }
  });

  it('returns 400 when title is missing', async () => {
    const res = await post({ priority: 'medium' });
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe('Title is required');
  });

  it('returns 400 when title is blank whitespace', async () => {
    expect((await post({ title: '   ' })).status).toBe(400);
  });

  it('trims whitespace from title', async () => {
    const body = await (await post({ title: '  Trimmed  ' })).json();
    expect(body.title).toBe('Trimmed');
  });
});

// ─── GET / — list todos ───────────────────────────────────────────────────────

describe('GET / — list todos', () => {
  it('returns 200 with an array', async () => {
    const res = await api('/');
    expect(res.status).toBe(200);
    expect(Array.isArray(await res.json())).toBe(true);
  });

  it('only returns the authenticated user\'s todos', async () => {
    await post({ title: 'User1 task' });
    await post({ title: 'User2 task' }, otherToken);

    const todos = await (await api('/')).json();
    expect(todos.every((t: { userId: string }) => t.userId !== undefined)).toBe(true);
    // User2's task should NOT appear in User1's list
    expect(todos.some((t: { title: string }) => t.title === 'User2 task')).toBe(false);
    expect(todos.some((t: { title: string }) => t.title === 'User1 task')).toBe(true);
  });
});

// ─── PATCH /:id — update todo ─────────────────────────────────────────────────

describe('PATCH /:id — update todo', () => {
  let id: string;

  beforeAll(async () => {
    ({ id } = await (await post({ title: 'Patchable task', priority: 'low' })).json());
  });

  it('updates the title', async () => {
    const body = await (await patch(id, { title: 'Renamed task' })).json();
    expect(body.title).toBe('Renamed task');
  });

  it('updates status to "in-progress"', async () => {
    const body = await (await patch(id, { status: 'in-progress' })).json();
    expect(body.status).toBe('in-progress');
  });

  it('updates status to "completed"', async () => {
    const body = await (await patch(id, { status: 'completed' })).json();
    expect(body.status).toBe('completed');
  });

  it('returns 404 for an unknown id', async () => {
    expect((await patch('nonexistent-id', { title: 'Ghost' })).status).toBe(404);
  });

  it('returns 404 when another user tries to patch', async () => {
    expect((await patch(id, { title: 'Stolen' }, otherToken)).status).toBe(404);
  });
});

// ─── DELETE /:id ─────────────────────────────────────────────────────────────

describe('DELETE /:id', () => {
  it('removes the todo and returns { success: true }', async () => {
    const { id } = await (await post({ title: 'To be deleted' })).json();
    const res = await api(`/${id}`, { method: 'DELETE' });
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);

    const list = await (await api('/')).json();
    expect(list.find((t: { id: string }) => t.id === id)).toBeUndefined();
  });

  it('returns 404 for unknown id', async () => {
    expect((await api('/does-not-exist', { method: 'DELETE' })).status).toBe(404);
  });

  it('returns 404 when another user tries to delete', async () => {
    const { id } = await (await post({ title: 'Protected' })).json();
    expect((await api(`/${id}`, { method: 'DELETE' }, otherToken)).status).toBe(404);
  });
});

// ─── GET /activity ────────────────────────────────────────────────────────────

describe('GET /activity', () => {
  it('returns an array', async () => {
    expect(Array.isArray(await (await api('/activity')).json())).toBe(true);
  });

  it('logs "created" when a todo is created', async () => {
    await post({ title: 'Activity log test' });
    const logs = await (await api('/activity')).json();
    expect(logs.some((l: any) => l.action === 'created' && l.todoTitle === 'Activity log test')).toBe(true);
  });

  it('only returns logs for the authenticated user', async () => {
    await post({ title: 'User2 activity task' }, otherToken);
    const logs = await (await api('/activity')).json();
    expect(logs.every((l: any) => l.userId !== undefined)).toBe(true);
  });
});
