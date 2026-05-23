import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { validateBody } from '../middleware/validate';
import * as c from '../controllers/recordsController';

const router = Router();

router.use(requireAuth);

// Aggregator
router.get('/daily/:date', c.getDaily);

// Work
router.post('/work', validateBody(c.workSchema), c.createWork);
router.put('/work/:id', validateBody(c.workUpdateSchema), c.updateWork);
router.delete('/work/:id', c.deleteWork);

// Friend
router.post('/friend', validateBody(c.friendSchema), c.createFriend);
router.delete('/friend/:id', c.deleteFriend);

// Partner
router.post('/partner', validateBody(c.partnerSchema), c.createPartner);
router.delete('/partner/:id', c.deletePartner);

// Gratitude
router.post('/gratitude', validateBody(c.gratitudeSchema), c.createGratitude);
router.delete('/gratitude/:id', c.deleteGratitude);

// Reflection (upsert per (user, date))
router.post('/reflection', validateBody(c.reflectionSchema), c.upsertReflection);

export default router;
