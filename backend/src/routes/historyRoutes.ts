import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import * as c from '../controllers/historyController';

const router = Router();
router.use(requireAuth);

router.get('/history', c.getHistory);
router.get('/search', c.search);

export default router;
