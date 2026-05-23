import { prisma } from '../config/prisma';
import { env } from '../config/env';
import { BadRequestError } from '../utils/errors';
import { logger } from '../utils/logger';

export type EffectiveTier = 'free' | 'vip';

export interface VipStatus {
  tier: EffectiveTier;
  vipExpiresAt: string | null; // ISO, or null if not a (valid) VIP / permanent
  isPermanent: boolean;
}

/**
 * The single source of truth for "is this user effectively VIP right now".
 * A user is VIP iff tier === 'vip' AND (no expiry OR expiry in the future).
 * Everything that gates on tier MUST go through this — never read user.tier raw.
 */
export function computeEffectiveTier(user: {
  tier: string;
  vipExpiresAt: Date | null;
}): EffectiveTier {
  if (user.tier !== 'vip') return 'free';
  if (user.vipExpiresAt === null) return 'vip'; // permanent
  return user.vipExpiresAt.getTime() > Date.now() ? 'vip' : 'free';
}

export function toVipStatus(user: { tier: string; vipExpiresAt: Date | null }): VipStatus {
  const tier = computeEffectiveTier(user);
  const isPermanent = tier === 'vip' && user.vipExpiresAt === null;
  return {
    tier,
    vipExpiresAt: tier === 'vip' && user.vipExpiresAt ? user.vipExpiresAt.toISOString() : null,
    isPermanent,
  };
}

export async function getVipStatus(userId: string): Promise<VipStatus> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tier: true, vipExpiresAt: true },
  });
  if (!user) throw new BadRequestError('用户不存在');
  return toVipStatus(user);
}

export interface RedeemResult extends VipStatus {
  grantedHours: number;
}

/**
 * Redeem a trial code. Stackable: extends from max(now, current expiry).
 * Designed so a future subscription flow can reuse the same expiry field —
 * subscribing is just "extend vipExpiresAt by the plan period".
 */
export async function redeemTrialCode(userId: string, code: string): Promise<RedeemResult> {
  const expected = env.VIP_TRIAL_CODE?.trim();
  if (!expected) {
    throw new BadRequestError('当前未开放兑换');
  }
  if (code.trim() !== expected) {
    throw new BadRequestError('兑换口令不正确');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { tier: true, vipExpiresAt: true },
  });
  if (!user) throw new BadRequestError('用户不存在');

  const hours = env.VIP_TRIAL_DURATION_HOURS;
  const now = Date.now();

  // If the user is already a permanent VIP, redeeming shouldn't downgrade them.
  if (user.tier === 'vip' && user.vipExpiresAt === null) {
    return { ...toVipStatus(user), grantedHours: 0 };
  }

  // Stack on top of remaining time if still valid, else start from now.
  const base = user.vipExpiresAt && user.vipExpiresAt.getTime() > now
    ? user.vipExpiresAt.getTime()
    : now;
  const newExpiry = new Date(base + hours * 60 * 60 * 1000);

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { tier: 'vip', vipExpiresAt: newExpiry },
    select: { tier: true, vipExpiresAt: true },
  });

  logger.info(`VIP trial redeemed by ${userId}, now valid until ${newExpiry.toISOString()}`);
  return { ...toVipStatus(updated), grantedHours: hours };
}
