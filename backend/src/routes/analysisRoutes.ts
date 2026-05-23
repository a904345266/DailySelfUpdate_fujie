import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import * as c from '../controllers/analysisController';

const router = Router();
router.use(requireAuth);

router.get('/weekly/:weekStart', c.getWeekly);
router.post('/generate-weekly', validateBody(c.generateBodySchema), c.generateWeekly);
router.get('/trends', c.trends);

export default router;
