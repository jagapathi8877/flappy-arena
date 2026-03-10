import { Router } from 'express';
import { getAllTimeLeaderboard, getWeeklyLeaderboard } from '../controllers/leaderboardController';

const router = Router();

router.get('/alltime', getAllTimeLeaderboard);
router.get('/weekly', getWeeklyLeaderboard);

export default router;
