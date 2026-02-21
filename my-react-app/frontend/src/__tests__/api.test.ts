import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── vi.hoisted: runs BEFORE ESM static imports ───────────────────────────────
// This guarantees fetch and localStorage are defined when the api module loads.
const { mockFetch, store } = vi.hoisted(() => {
  const store: Record<string, string> = {};
  const mockFetch = vi.fn();

  // Stub fetch globally
  globalThis.fetch = mockFetch;

  // localStorage doesn't exist in Node — define it on globalThis
  Object.defineProperty(globalThis, 'localStorage', {
    value: {
      getItem:    (key: string) => store[key] ?? null,
      setItem:    (key: string, val: string) => { store[key] = val; },
      removeItem: (key: string) => { delete store[key]; },
    },
    writable: true,
    configurable: true,
  });

  return { mockFetch, store };
});

import {
  fetchTodos,
  addTodo,
  updateTodo,
  deleteTodo,
  fetchActivityLogs,
  authHeaders,
} from '../api/todos';
import type { Todo } from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function okJson(data: unknown) {
  return { ok: true, json: async () => data } as Response;
}

const baseTodo: Todo = {
  id: 'abc-123',
  title: 'Test task',
  status: 'pending',
  priority: 'medium',
  createdAt: '2025-01-01T00:00:00.000Z',
};

// ─── authHeaders ──────────────────────────────────────────────────────────────

describe('authHeaders', () => {
  beforeEach(() => { Object.keys(store).forEach(k => delete store[k]); });

  it('returns empty object when no token in localStorage', () => {
    expect(authHeaders()).toEqual({});
  });

  it('returns Authorization header when token exists', () => {
    store['auth_token'] = 'my-token-99';
    expect(authHeaders()).toEqual({ Authorization: 'Bearer my-token-99' });
  });
});

// ─── fetchTodos ───────────────────────────────────────────────────────────────

describe('fetchTodos', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    Object.keys(store).forEach(k => delete store[k]);
  });

  it('calls GET /api/todos', async () => {
    mockFetch.mockResolvedValueOnce(okJson([]));
    await fetchTodos();
    expect(mockFetch).toHaveBeenCalledWith('/api/todos', expect.any(Object));
  });

  it('returns the parsed todo array', async () => {
    mockFetch.mockResolvedValueOnce(okJson([baseTodo]));
    const result = await fetchTodos();
    expect(result).toEqual([baseTodo]);
  });

  it('includes auth header when token is stored', async () => {
    store['auth_token'] = 'tok-xyz';
    mockFetch.mockResolvedValueOnce(okJson([]));
    await fetchTodos();
    const [, opts] = mockFetch.mock.calls[0];
    expect((opts as RequestInit).headers).toMatchObject({ Authorization: 'Bearer tok-xyz' });
  });

  it('throws when response is not ok', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false } as Response);
    await expect(fetchTodos()).rejects.toThrow('Failed to fetch todos');
  });
});

// ─── addTodo ─────────────────────────────────────────────────────────────────

describe('addTodo', () => {
  beforeEach(() => mockFetch.mockReset());

  it('sends POST to /api/todos', async () => {
    mockFetch.mockResolvedValueOnce(okJson(baseTodo));
    await addTodo({ title: 'New task', priority: 'high' });
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/todos',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('serialises all fields in the request body', async () => {
    mockFetch.mockResolvedValueOnce(okJson(baseTodo));
    await addTodo({
      title: 'Full task',
      description: 'Some description',
      priority: 'critical',
      durationValue: 45,
      durationUnit: 'minutes',
      dueDate: '2025-12-31',
    });
    const body = JSON.parse((mockFetch.mock.calls[0][1] as RequestInit).body as string);
    expect(body).toMatchObject({
      title: 'Full task',
      description: 'Some description',
      priority: 'critical',
      durationValue: 45,
      durationUnit: 'minutes',
      dueDate: '2025-12-31',
    });
  });

  it('returns the created todo', async () => {
    mockFetch.mockResolvedValueOnce(okJson(baseTodo));
    const result = await addTodo({ title: 'Test', priority: 'low' });
    expect(result).toEqual(baseTodo);
  });

  it('throws when response is not ok', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false } as Response);
    await expect(addTodo({ title: 'Fail', priority: 'medium' })).rejects.toThrow('Failed to add todo');
  });
});

// ─── updateTodo ───────────────────────────────────────────────────────────────

describe('updateTodo', () => {
  beforeEach(() => mockFetch.mockReset());

  it('sends PATCH to /api/todos/:id', async () => {
    mockFetch.mockResolvedValueOnce(okJson({ ...baseTodo, title: 'Updated' }));
    await updateTodo({ id: 'abc-123', title: 'Updated' });
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/todos/abc-123',
      expect.objectContaining({ method: 'PATCH' }),
    );
  });

  it('does not send id in body', async () => {
    mockFetch.mockResolvedValueOnce(okJson(baseTodo));
    await updateTodo({ id: 'abc-123', status: 'completed' });
    const body = JSON.parse((mockFetch.mock.calls[0][1] as RequestInit).body as string);
    expect(body).not.toHaveProperty('id');
    expect(body).toMatchObject({ status: 'completed' });
  });

  it('throws when response is not ok', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false } as Response);
    await expect(updateTodo({ id: 'x', title: 'x' })).rejects.toThrow('Failed to update todo');
  });
});

// ─── deleteTodo ───────────────────────────────────────────────────────────────

describe('deleteTodo', () => {
  beforeEach(() => mockFetch.mockReset());

  it('sends DELETE to /api/todos/:id', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true } as Response);
    await deleteTodo('abc-123');
    expect(mockFetch).toHaveBeenCalledWith(
      '/api/todos/abc-123',
      expect.objectContaining({ method: 'DELETE' }),
    );
  });

  it('throws when response is not ok', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false } as Response);
    await expect(deleteTodo('abc-123')).rejects.toThrow('Failed to delete todo');
  });
});

// ─── fetchActivityLogs ────────────────────────────────────────────────────────

describe('fetchActivityLogs', () => {
  beforeEach(() => mockFetch.mockReset());

  it('calls GET /api/todos/activity', async () => {
    mockFetch.mockResolvedValueOnce(okJson([]));
    await fetchActivityLogs();
    expect(mockFetch).toHaveBeenCalledWith('/api/todos/activity', expect.any(Object));
  });

  it('returns the log array', async () => {
    const logs = [{ id: '1', action: 'created', todoTitle: 'Task A', timestamp: '' }];
    mockFetch.mockResolvedValueOnce(okJson(logs));
    const result = await fetchActivityLogs();
    expect(result).toEqual(logs);
  });

  it('throws when response is not ok', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false } as Response);
    await expect(fetchActivityLogs()).rejects.toThrow('Failed to fetch activity logs');
  });
});
