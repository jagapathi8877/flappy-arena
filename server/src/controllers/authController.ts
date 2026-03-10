import type { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import type { AuthRequest } from '../middleware/auth';

const JWT_SECRET = () => process.env.JWT_SECRET || 'flappy-arena-secret-key';
const JWT_EXPIRES_IN = '7d';

export async function login(req: AuthRequest, res: Response): Promise<void> {
  const { rollNumber, password } = req.body;
  if (!rollNumber || !password) {
    res.status(400).json({ error: 'Roll number and password are required' });
    return;
  }

  const user = await User.findOne({ rollNumber: rollNumber.toUpperCase().trim() });
  if (!user) {
    res.status(401).json({ error: 'Student not found' });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  const token = jwt.sign(
    { userId: user._id, rollNumber: user.rollNumber },
    JWT_SECRET(),
    { expiresIn: JWT_EXPIRES_IN },
  );

  res.json({
    token,
    user: {
      id: user._id,
      rollNumber: user.rollNumber,
      name: user.name,
      bestScore: user.bestScore,
    },
  });
}

export async function changePassword(req: AuthRequest, res: Response): Promise<void> {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    res.status(400).json({ error: 'Current and new password are required' });
    return;
  }
  if (newPassword.length < 4) {
    res.status(400).json({ error: 'Password must be at least 4 characters' });
    return;
  }

  const user = await User.findById(req.userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: 'Current password is incorrect' });
    return;
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();
  res.json({ message: 'Password changed successfully' });
}

export async function getMe(req: AuthRequest, res: Response): Promise<void> {
  const user = await User.findById(req.userId).select('-passwordHash');
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({
    id: user._id,
    rollNumber: user.rollNumber,
    name: user.name,
    bestScore: user.bestScore,
  });
}
