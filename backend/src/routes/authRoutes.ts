import { Router } from 'express';
import * as authController from '../controllers/authController';
import { validateBody } from '../middleware/validate';
import { authLimiter, loginLimiter } from '../middleware/rateLimit';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.post(
  '/register',
  authLimiter,
  validateBody(authController.registerSchema),
  authController.register
);

router.post(
  '/login',
  loginLimiter,
  validateBody(authController.loginSchema),
  authController.login
);

router.post(
  '/refresh',
  validateBody(authController.refreshSchema),
  authController.refresh
);

router.post('/logout', authController.logout);

router.post(
  '/forgot-password',
  authLimiter,
  validateBody(authController.forgotPasswordSchema),
  authController.forgotPassword
);

router.post(
  '/reset-password',
  authLimiter,
  validateBody(authController.resetPasswordSchema),
  authController.resetPassword
);

router.get('/me', requireAuth, authController.me);

export default router;
