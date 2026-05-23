import { Router } from 'express';
import express from 'express';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import * as c from '../controllers/dataController';

const router = Router();
router.use(requireAuth);

router.get('/export', c.exportData);
// Import payloads can be large — bump body limit just for this route
router.post('/import', express.json({ limit: '20mb' }), validateBody(c.importBodySchema), c.importData);

export default router;
