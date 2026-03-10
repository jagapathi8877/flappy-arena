import { Router } from 'express';
import { submitScore, getMyScores } from '../controllers/scoreController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/submit', authMiddleware, submitScore);
router.get('/my', authMiddleware, getMyScores);

export default router;
