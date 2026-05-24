import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import * as c from '../controllers/booksController';

const router = Router();
router.use(requireAuth);

router.get('/intro', c.getBookIntro);
router.get('/:bookId/concepts/:conceptId', c.getConcept);

export default router;
