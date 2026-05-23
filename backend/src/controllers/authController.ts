import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as authService from '../services/authService';

const passwordSchema = z
  .string()
  .min(8, '密码至少 8 位')
  .regex(/[A-Za-z]/, '密码必须包含字母')
  .regex(/\d/, '密码必须包含数字');

export const registerSchema = z.object({
  email: z.string().email('邮箱格式不正确'),
  password: passwordSchema,
  username: z.string().trim().min(1).max(100).optional(),
  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: '必须同意用户协议' }),
  }),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  rememberMe: z.boolean().optional(),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
});

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password, username } = req.body as z.infer<typeof registerSchema>;
    const result = await authService.register({ email, password, username });
    res.status(201).json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body as z.infer<typeof loginSchema>;
    const result = await authService.login({ email, password });
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const { refreshToken } = req.body as z.infer<typeof refreshSchema>;
    const tokens = await authService.refresh(refreshToken);
    res.json({ success: true, tokens });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshToken = (req.body?.refreshToken as string | undefined) ?? undefined;
    await authService.logout(refreshToken);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}

export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { email } = req.body as z.infer<typeof forgotPasswordSchema>;
    await authService.forgotPassword(email);
    // Always return success — don't reveal whether the email exists
    res.json({
      success: true,
      message: '如果该邮箱已注册，我们已发送重置链接',
    });
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, password } = req.body as z.infer<typeof resetPasswordSchema>;
    await authService.resetPassword(token, password);
    res.json({ success: true, message: '密码已重置，请使用新密码登录' });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.getCurrentUser(req.userId!);
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
}
