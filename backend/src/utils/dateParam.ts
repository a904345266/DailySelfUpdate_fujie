import { BadRequestError } from './errors';

/**
 * Parse a YYYY-MM-DD date string into a UTC Date pinned to midnight.
 * The DB column is `@db.Date`, so the time component is dropped on storage.
 */
export function parseDateParam(value: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new BadRequestError('日期格式必须为 YYYY-MM-DD');
  }
  const d = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) {
    throw new BadRequestError('日期无效');
  }
  return d;
}

export function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
