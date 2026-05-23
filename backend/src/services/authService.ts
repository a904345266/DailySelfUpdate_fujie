import crypto from 'crypto';
import { prisma } from '../config/prisma';
import { env } from '../config/env';
import {
  hashToken,
  parseDurationToMs,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/jwt';
import { hashPassword, verifyPassword } from '../utils/password';
import { sendPasswordResetEmail } from '../utils/mailer';
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} from '../utils/errors';
import { logger } from '../utils/logger';
import { computeEffectiveTier } from './vipService';

interface RegisterInput {
  email: string;
  password: string;
  username?: string;
}

interface LoginInput {
  email: string;
  password: string;
}

interface AuthResult {
  user: {
    id: string;
    email: string;
    username: string | null;
    emailVerified: boolean;
    tier: string;
    vipExpiresAt: string | null;
  };
  tokens: { accessToken: string; refreshToken: string; expiresIn: number };
}

async function issueTokens(userId: string, email: string): Promise<AuthResult['tokens']> {
  const accessToken = signAccessToken({ sub: userId, email });
  const { token: refreshToken, jti } = signRefreshToken({ sub: userId });

  const refreshExpiresMs = parseDurationToMs(env.REFRESH_TOKEN_EXPIRES_IN);
  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(jti),
      expiresAt: new Date(Date.now() + refreshExpiresMs),
    },
  });

  return {
    accessToken,
    refreshToken,
    expiresIn: Math.floor(parseDurationToMs(env.JWT_EXPIRES_IN) / 1000),
  };
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  const email = input.email.toLowerCase().trim();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ConflictError('该邮箱已被注册');
  }

  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email,
      username: input.username?.trim() || null,
      passwordHash,
      preferences: { create: {} },
    },
    select: { id: true, email: true, username: true, emailVerified: true, tier: true, vipExpiresAt: true },
  });

  const tokens = await issueTokens(user.id, user.email);
  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      emailVerified: user.emailVerified,
      tier: computeEffectiveTier(user),
      vipExpiresAt: user.vipExpiresAt ? user.vipExpiresAt.toISOString() : null,
    },
    tokens,
  };
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const email = input.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });

  // Same error for missing user / wrong password to avoid enumeration
  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    throw new UnauthorizedError('邮箱或密码错误');
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const tokens = await issueTokens(user.id, user.email);
  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      emailVerified: user.emailVerified,
      tier: computeEffectiveTier(user),
      vipExpiresAt: user.vipExpiresAt ? user.vipExpiresAt.toISOString() : null,
    },
    tokens,
  };
}

export async function refresh(refreshTokenStr: string): Promise<AuthResult['tokens']> {
  let payload;
  try {
    payload = verifyRefreshToken(refreshTokenStr);
  } catch {
    throw new UnauthorizedError('Refresh token 无效或已过期');
  }

  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash: hashToken(payload.jti) },
  });
  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    throw new UnauthorizedError('Refresh token 无效或已过期');
  }

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });
  if (!user) {
    throw new UnauthorizedError('用户不存在');
  }

  // Rotation: revoke old refresh token, issue a new pair
  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revoked: true },
  });

  return issueTokens(user.id, user.email);
}

export async function logout(refreshTokenStr: string | undefined): Promise<void> {
  if (!refreshTokenStr) return;
  try {
    const payload = verifyRefreshToken(refreshTokenStr);
    await prisma.refreshToken.updateMany({
      where: { tokenHash: hashToken(payload.jti), revoked: false },
      data: { revoked: true },
    });
  } catch {
    // ignore — logout should be idempotent
  }
}

export async function forgotPassword(emailInput: string): Promise<void> {
  const email = emailInput.toLowerCase().trim();
  const user = await prisma.user.findUnique({ where: { email } });

  // Don't reveal whether the email exists
  if (!user) {
    logger.info(`forgot-password: no user for ${email}`);
    return;
  }

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(
    Date.now() + parseDurationToMs(env.PASSWORD_RESET_TOKEN_EXPIRES_IN)
  );

  await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  const resetLink = `${env.FRONTEND_URL}/reset-password?token=${rawToken}`;
  await sendPasswordResetEmail(user.email, resetLink);
}

export async function resetPassword(rawToken: string, newPassword: string): Promise<void> {
  const tokenHash = hashToken(rawToken);
  const record = await prisma.passwordResetToken.findUnique({ where: { tokenHash } });

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    throw new BadRequestError('重置链接无效或已过期');
  }

  const passwordHash = await hashPassword(newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    }),
    // Revoke all existing refresh tokens — force re-login on other devices
    prisma.refreshToken.updateMany({
      where: { userId: record.userId, revoked: false },
      data: { revoked: true },
    }),
  ]);
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      emailVerified: true,
      tier: true,
      vipExpiresAt: true,
      avatarUrl: true,
      createdAt: true,
      lastLoginAt: true,
      preferences: true,
    },
  });
  if (!user) throw new NotFoundError('用户不存在');
  // Expose the *effective* tier (expiry-aware), keep raw expiry for the UI.
  return {
    ...user,
    tier: computeEffectiveTier(user),
    vipExpiresAt: user.vipExpiresAt ? user.vipExpiresAt.toISOString() : null,
  };
}
