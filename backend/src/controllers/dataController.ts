import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import {
  exportUserData,
  exportToCsvBundle,
  importUserData,
  type ImportStrategy,
  EXPORT_VERSION,
} from '../services/dataService';

const dateField = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式必须为 YYYY-MM-DD');

const exportQuerySchema = z.object({
  format: z.enum(['json', 'csv']).default('json'),
  startDate: dateField.optional(),
  endDate: dateField.optional(),
});

export async function exportData(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = exportQuerySchema.parse(req.query);
    const data = await exportUserData(req.userId!, {
      startDate: parsed.startDate,
      endDate: parsed.endDate,
    });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

    if (parsed.format === 'csv') {
      const csv = exportToCsvBundle(data);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="dailyselfupdate-${stamp}.csv"`
      );
      return res.send(csv);
    }

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="dailyselfupdate-${stamp}.json"`
    );
    return res.send(JSON.stringify(data, null, 2));
  } catch (e) { next(e); }
}

export const importBodySchema = z.object({
  strategy: z.enum(['merge', 'replace']).default('merge'),
  payload: z.object({
    exportVersion: z.literal(EXPORT_VERSION),
    exportedAt: z.string(),
    user: z.object({ id: z.string(), email: z.string() }).passthrough(),
    work: z.array(z.unknown()),
    friend: z.array(z.unknown()),
    partner: z.array(z.unknown()),
    gratitude: z.array(z.unknown()),
    reflection: z.array(z.unknown()),
  }).passthrough(),
});

export async function importData(req: Request, res: Response, next: NextFunction) {
  try {
    const body = importBodySchema.parse(req.body);
    const result = await importUserData(req.userId!, body.payload, body.strategy as ImportStrategy);
    res.json({ success: true, result });
  } catch (e) { next(e); }
}
