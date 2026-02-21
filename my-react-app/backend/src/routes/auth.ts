import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import type { User } from '../types.js';

const router = Router();

// In-memory stores
const users: User[] = [];
// token → userId
export const activeSessions = new Map<string, string>();

// Simple reversible hash (no bcrypt available)
function hashPassword(password: string): string {
  return Buffer.from(password).toString('base64');
}
function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

export function getUserIdFromToken(token: string): string | undefined {
  return activeSessions.get(token);
}

// POST /api/auth/register
router.post('/register', (req: Request, res: Response) => {
  const { name, email, password } = req.body as {
    name?: string; email?: string; password?: string;
  };

  if (!name?.trim() || !email?.trim() || !password) {
    res.status(400).json({ error: 'Name, email and password are required' });
    return;
  }
  const normalizedEmail = email.trim().toLowerCase();
  if (users.find(u => u.email === normalizedEmail)) {
    res.status(409).json({ error: 'Email already registered' });
    return;
  }

  const user: User = {
    id: uuidv4(),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash: hashPassword(password),
  };
  users.push(user);

  const token = uuidv4();
  activeSessions.set(token, user.id);
  res.status(201).json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

// POST /api/auth/login
router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email?.trim() || !password) {
    res.status(401).json({ error: 'Email and password are required' });
    return;
  }
  const user = users.find(u => u.email === email.trim().toLowerCase());
  if (!user || !verifyPassword(password, user.passwordHash)) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const token = uuidv4();
  activeSessions.set(token, user.id);
  res.json({ token, user: { id: user.id, name: user.name, email: user.email } });
});

// POST /api/auth/logout
router.post('/logout', (req: Request, res: Response) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) activeSessions.delete(token);
  res.json({ success: true });
});

export default router;
