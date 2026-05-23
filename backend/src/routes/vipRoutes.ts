import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import { authLimiter } from '../middleware/rateLimit';
import * as c from '../controllers/vipController';

const router = Router();
router.use(requireAuth);

router.get('/status', c.status);
// Rate-limited to prevent brute-forcing the redemption code.
router.post('/redeem', authLimiter, validateBody(c.redeemSchema), c.redeem);

export default router;
