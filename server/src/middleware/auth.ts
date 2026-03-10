import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
  rollNumber?: string;
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  const token = header.slice(7);
  try {
    const secret = process.env.JWT_SECRET || 'flappy-arena-secret-key';
    const payload = jwt.verify(token, secret) as { userId: string; rollNumber: string };
    req.userId = payload.userId;
    req.rollNumber = payload.rollNumber;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}
