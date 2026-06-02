import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import * as c from '../controllers/checkInController';

const router = Router();

router.use(requireAuth);

// 获取签到数据
router.get('/', c.getCheckInData);

// 执行签到
router.post('/', c.checkIn);

export default router;