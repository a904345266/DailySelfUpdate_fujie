import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/prisma';
import { computeEffectiveTier } from '../services/vipService';
import { refineText, type UserTier } from '../services/ai/textService';

export const refineSchema = z.object({
  text: z.string().min(1, '内容不能为空').max(4000),
});

/** POST /api/text/refine — AI 整理文本（免费=精简去冗余，VIP=提炼润色）。 */
export async function refine(req: Request, res: Response, next: NextFunction) {
  try {
    const { text } = req.body as z.infer<typeof refineSchema>;
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { tier: true, vipExpiresAt: true },
    });
    const tier = (user ? computeEffectiveTier(user) : 'free') as UserTier;
    const result = await refineText(text, tier);
    res.json({ success: true, ...result });
  } catch (e) {
    next(e);
  }
}
