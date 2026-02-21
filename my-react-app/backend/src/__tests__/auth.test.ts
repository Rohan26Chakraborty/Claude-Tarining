import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import express from 'express';
import { createServer, type Server } from 'http';

let server: Server;
let base: string;

beforeAll(async () => {
  vi.resetModules();
  const { default: authRouter } = await import('../routes/auth.js');

  const app = express();
  app.use(express.json());
  app.use('/', authRouter);

  server = createServer(app);
  await new Promise<void>(resolve => server.listen(0, resolve));
  const addr = server.address() as { port: number };
  base = `http://localhost:${addr.port}`;
});

afterAll(() => server?.close());

const post = (path: string, body: object, headers: Record<string, string> = {}) =>
  fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });

// ─── POST /register ───────────────────────────────────────────────────────────

describe('POST /register', () => {
  it('creates a user and returns a token', async () => {
    const res = await post('/register', { name: 'Alice', email: 'alice@test.com', password: 'pass123' });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(typeof body.token).toBe('string');
    expect(body.user.email).toBe('alice@test.com');
    expect(body.user.name).toBe('Alice');
    expect(body.user).not.toHaveProperty('passwordHash');
  });

  it('returns 409 when email already registered', async () => {
    await post('/register', { name: 'Bob', email: 'bob@test.com', password: 'pass' });
    const res = await post('/register', { name: 'Bob2', email: 'bob@test.com', password: 'other' });
    expect(res.status).toBe(409);
    const body = await res.json();
    expect(body.error).toMatch(/already/i);
  });

  it('returns 400 when fields are missing', async () => {
    const res = await post('/register', { email: 'x@x.com' });
    expect(res.status).toBe(400);
  });

  it('normalises email to lowercase', async () => {
    const res = await post('/register', { name: 'Carol', email: 'Carol@Test.COM', password: 'p' });
    const body = await res.json();
    expect(body.user.email).toBe('carol@test.com');
  });
});

// ─── POST /login ──────────────────────────────────────────────────────────────

describe('POST /login', () => {
  beforeAll(async () => {
    await post('/register', { name: 'Dave', email: 'dave@test.com', password: 'secret99' });
  });

  it('returns a token for correct credentials', async () => {
    const res = await post('/login', { email: 'dave@test.com', password: 'secret99' });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(typeof body.token).toBe('string');
    expect(body.user.email).toBe('dave@test.com');
  });

  it('returns 401 for wrong password', async () => {
    const res = await post('/login', { email: 'dave@test.com', password: 'wrong' });
    expect(res.status).toBe(401);
  });

  it('returns 401 for unknown email', async () => {
    const res = await post('/login', { email: 'nobody@test.com', password: 'pass' });
    expect(res.status).toBe(401);
  });

  it('returns 401 when fields are missing', async () => {
    const res = await post('/login', {});
    expect(res.status).toBe(401);
  });

  it('each login produces a unique token', async () => {
    const r1 = await post('/login', { email: 'dave@test.com', password: 'secret99' });
    const r2 = await post('/login', { email: 'dave@test.com', password: 'secret99' });
    expect((await r1.json()).token).not.toBe((await r2.json()).token);
  });
});

// ─── POST /logout ─────────────────────────────────────────────────────────────

describe('POST /logout', () => {
  it('returns { success: true } with a valid token', async () => {
    const { token } = await (await post('/register', { name: 'Eve', email: 'eve@test.com', password: 'p' })).json();
    const res = await post('/logout', {}, { Authorization: `Bearer ${token}` });
    expect(res.status).toBe(200);
    expect((await res.json()).success).toBe(true);
  });

  it('returns success even with no token', async () => {
    const res = await post('/logout', {});
    expect(res.status).toBe(200);
  });
});
