import rateLimit from 'express-rate-limit';

// Login: 5 attempts per 15 minutes per IP (per requirements doc)
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: '登录失败次数过多，请 15 分钟后再试',
    },
  },
});

// Generic auth endpoints (register, forgot-password, etc): 10 / 15 min
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'TOO_MANY_REQUESTS', message: '请求过于频繁，请稍后再试' },
  },
});
