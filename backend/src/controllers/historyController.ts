import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import * as history from '../services/historyService';

const dateField = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式必须为 YYYY-MM-DD');
const recordType = z.enum(['work', 'friend', 'partner', 'gratitude', 'reflection']);

const historyQuerySchema = z.object({
  startDate: dateField.optional(),
  endDate: dateField.optional(),
  types: z.union([z.array(recordType), recordType]).optional(),
  category: z.string().max(40).optional(),
  emotion: z.string().max(40).optional(),
  minImportance: z.coerce.number().int().min(1).max(5).optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});

const searchQuerySchema = historyQuerySchema.extend({
  q: z.string().trim().min(1, '请输入搜索内容').max(200),
});

function parseQuery(req: Request) {
  // Normalize types: ?types=work&types=friend OR ?types=work,friend
  const raw = req.query as Record<string, unknown>;
  let types = raw.types;
  if (typeof types === 'string' && types.includes(',')) {
    types = types.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return { ...raw, types };
}

export async function getHistory(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = historyQuerySchema.parse(parseQuery(req));
    const types = parsed.types
      ? (Array.isArray(parsed.types) ? parsed.types : [parsed.types])
      : undefined;
    const result = await history.getHistory(req.userId!, { ...parsed, types });
    res.json({ success: true, ...result });
  } catch (e) { next(e); }
}

export async function search(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = searchQuerySchema.parse(parseQuery(req));
    const types = parsed.types
      ? (Array.isArray(parsed.types) ? parsed.types : [parsed.types])
      : undefined;
    const result = await history.searchHistory(req.userId!, { ...parsed, types });
    res.json({ success: true, ...result });
  } catch (e) { next(e); }
}
