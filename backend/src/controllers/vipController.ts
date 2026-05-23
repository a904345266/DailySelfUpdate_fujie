import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { getVipStatus, redeemTrialCode } from '../services/vipService';

export const redeemSchema = z.object({
  code: z.string().min(1, '请输入兑换口令').max(200),
});

export async function redeem(req: Request, res: Response, next: NextFunction) {
  try {
    const { code } = req.body as z.infer<typeof redeemSchema>;
    const result = await redeemTrialCode(req.userId!, code);
    res.json({ success: true, ...result });
  } catch (e) {
    next(e);
  }
}

export async function status(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await getVipStatus(req.userId!);
    res.json({ success: true, ...result });
  } catch (e) {
    next(e);
  }
}
