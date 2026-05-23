import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import {
  computeWeeklySummary,
  generateAndPersistWeeklySummary,
  getTrends,
} from '../services/analysisService';

const dateField = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式必须为 YYYY-MM-DD');

export async function getWeekly(req: Request, res: Response, next: NextFunction) {
  try {
    const weekStart = dateField.parse(req.params.weekStart);
    const analysis = await computeWeeklySummary(req.userId!, weekStart);
    res.json({ success: true, analysis });
  } catch (e) { next(e); }
}

export const generateBodySchema = z.object({
  weekStart: dateField,
});

export async function generateWeekly(req: Request, res: Response, next: NextFunction) {
  try {
    const { weekStart } = generateBodySchema.parse(req.body);
    const result = await generateAndPersistWeeklySummary(req.userId!, weekStart);
    res.json({ success: true, ...result });
  } catch (e) { next(e); }
}

const trendsQuerySchema = z.object({
  weeks: z.coerce.number().int().min(1).max(52).default(12),
});

export async function trends(req: Request, res: Response, next: NextFunction) {
  try {
    const { weeks } = trendsQuerySchema.parse(req.query);
    const points = await getTrends(req.userId!, weeks);
    res.json({ success: true, points });
  } catch (e) { next(e); }
}
