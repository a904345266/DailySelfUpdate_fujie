import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import * as c from '../controllers/textController';

const router = Router();
router.use(requireAuth);

router.post('/refine', validateBody(c.refineSchema), c.refine);

export default router;
