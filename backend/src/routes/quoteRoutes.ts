import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import * as c from '../controllers/quoteController';

const router = Router();
router.use(requireAuth);

router.get('/daily', c.getDailyQuote);

export default router;
