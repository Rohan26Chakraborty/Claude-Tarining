import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import todosRouter from './routes/todos.js';
import authRouter, { activeSessions } from './routes/auth.js';

const app = express();
const PORT = 3001;

// Extend Request to carry userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];
  const userId = token ? activeSessions.get(token) : undefined;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  req.userId = userId;
  next();
}

app.use('/api/todos', requireAuth, todosRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
