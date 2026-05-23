import { BadRequestError } from './errors';

/** Snap any YYYY-MM-DD to its ISO-week Monday (UTC). */
export function toMonday(dateStr: string): Date {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    throw new BadRequestError('日期格式必须为 YYYY-MM-DD');
  }
  const d = new Date(`${dateStr}T00:00:00.000Z`);
  if (Number.isNaN(d.getTime())) throw new BadRequestError('日期无效');
  const day = d.getUTCDay(); // 0=Sun..6=Sat
  const diff = day === 0 ? -6 : 1 - day;
  d.setUTCDate(d.getUTCDate() + diff);
  return d;
}

export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setUTCDate(x.getUTCDate() + n);
  return x;
}

export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function weekBoundsFromAny(dateStr: string): { weekStart: Date; weekEnd: Date } {
  const weekStart = toMonday(dateStr);
  const weekEnd = addDays(weekStart, 6);
  return { weekStart, weekEnd };
}
