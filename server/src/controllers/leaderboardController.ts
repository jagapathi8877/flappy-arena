import type { Request, Response } from 'express';
import { User } from '../models/User';
import { Score } from '../models/Score';

export async function getAllTimeLeaderboard(_req: Request, res: Response): Promise<void> {
  const users = await User.find()
    .sort({ bestScore: -1, rollNumber: 1 })
    .select('rollNumber name gender bestScore')
    .lean();

  res.json(
    users.map((u) => ({
      id: u._id,
      rollNumber: u.rollNumber,
      name: u.name,
      gender: u.gender || 'M',
      bestScore: u.bestScore,
    })),
  );
}

export async function getWeeklyLeaderboard(_req: Request, res: Response): Promise<void> {
  // Fixed week: Sunday 00:00 → Saturday 23:59:59
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay()); // most recent Sunday
  weekStart.setHours(0, 0, 0, 0);

  // Get top score per user from the current week
  const weeklyScores = await Score.aggregate([
    { $match: { createdAt: { $gte: weekStart } } },
    { $group: { _id: '$userId', topScore: { $max: '$score' } } },
    { $sort: { topScore: -1 } },
  ]);

  if (weeklyScores.length === 0) {
    res.json([]);
    return;
  }

  const userIds = weeklyScores.map((s) => s._id);
  const users = await User.find({ _id: { $in: userIds } })
    .select('rollNumber name gender bestScore')
    .lean();

  const userMap = new Map(users.map((u) => [u._id.toString(), u]));

  const results = weeklyScores
    .map((s) => {
      const u = userMap.get(s._id.toString());
      if (!u) return null;
      return {
        id: u._id,
        rollNumber: u.rollNumber,
        name: u.name,
        gender: u.gender || 'M',
        bestScore: s.topScore as number,
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (!a || !b) return 0;
      if (b.bestScore !== a.bestScore) return b.bestScore - a.bestScore;
      return a.rollNumber.localeCompare(b.rollNumber);
    });

  res.json(results);
}
