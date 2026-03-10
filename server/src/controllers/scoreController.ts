import type { Response } from 'express';
import { User } from '../models/User';
import { Score } from '../models/Score';
import type { AuthRequest } from '../middleware/auth';
import { emitLeaderboardUpdate } from '../sockets/leaderboardSocket';

export async function submitScore(req: AuthRequest, res: Response): Promise<void> {
  const { score } = req.body;
  if (typeof score !== 'number' || score < 0 || !Number.isFinite(score)) {
    res.status(400).json({ error: 'Invalid score' });
    return;
  }

  const roundedScore = Math.floor(score);

  // Always record the score in history
  await Score.create({ userId: req.userId, score: roundedScore });

  // Update best score if new record
  const user = await User.findById(req.userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  let newBest = false;
  if (roundedScore > user.bestScore) {
    user.bestScore = roundedScore;
    await user.save();
    newBest = true;
    // Emit real-time leaderboard update to all clients
    await emitLeaderboardUpdate();
  }

  res.json({
    newBest,
    score: roundedScore,
    bestScore: user.bestScore,
  });
}

export async function getMyScores(req: AuthRequest, res: Response): Promise<void> {
  const scores = await Score.find({ userId: req.userId })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  res.json(scores);
}
