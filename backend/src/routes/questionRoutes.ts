import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import * as c from '../controllers/questionController';

const router = Router();

router.use(requireAuth);

// 获取每日问题
router.get('/daily', c.getDailyQuestion);

// 提交答案
router.post('/answer', c.submitAnswer);

// AI 深度解析
router.post('/ai-analysis', c.getAiAnalysis);

export default router;