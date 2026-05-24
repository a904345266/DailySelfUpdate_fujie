import { NextFunction, Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { computeEffectiveTier } from '../services/vipService';
import { getDailyQuoteCached, type UserTier } from '../services/ai/quoteService';

/** GET /api/quotes/daily?refresh=0|1 — today's personalized book quote. */
export async function getDailyQuote(req: Request, res: Response, next: NextFunction) {
  try {
    const refresh = req.query.refresh === '1' || req.query.refresh === 'true';
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { tier: true, vipExpiresAt: true },
    });
    const tier = (user ? computeEffectiveTier(user) : 'free') as UserTier;
    const quote = await getDailyQuoteCached(req.userId!, tier, refresh);
    res.json({ success: true, ...quote });
  } catch (e) {
    next(e);
  }
}
