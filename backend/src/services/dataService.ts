import { prisma } from '../config/prisma';
import { parseDateParam } from '../utils/dateParam';
import { BadRequestError } from '../utils/errors';

export const EXPORT_VERSION = 1;

export interface ExportPayload {
  exportVersion: number;
  exportedAt: string;
  user: { id: string; email: string };
  work: unknown[];
  friend: unknown[];
  partner: unknown[];
  gratitude: unknown[];
  reflection: unknown[];
}

interface ExportOptions {
  startDate?: string;
  endDate?: string;
}

function dateWhere(opts: ExportOptions) {
  if (!opts.startDate && !opts.endDate) return undefined;
  const w: { gte?: Date; lte?: Date } = {};
  if (opts.startDate) w.gte = parseDateParam(opts.startDate);
  if (opts.endDate) w.lte = parseDateParam(opts.endDate);
  return w;
}

export async function exportUserData(userId: string, opts: ExportOptions = {}): Promise<ExportPayload> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true },
  });
  if (!user) throw new BadRequestError('用户不存在');

  const where = { userId, ...(dateWhere(opts) ? { date: dateWhere(opts) } : {}) };

  const [work, friend, partner, gratitude, reflection] = await Promise.all([
    prisma.workRecord.findMany({ where, orderBy: { createdAt: 'asc' } }),
    prisma.friendRecord.findMany({ where, orderBy: { createdAt: 'asc' } }),
    prisma.partnerRecord.findMany({ where, orderBy: { createdAt: 'asc' } }),
    prisma.gratitudeRecord.findMany({ where, orderBy: { createdAt: 'asc' } }),
    prisma.dailyReflection.findMany({ where, orderBy: { createdAt: 'asc' } }),
  ]);

  return {
    exportVersion: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    user,
    work,
    friend,
    partner,
    gratitude,
    reflection,
  };
}

// ---- CSV ----

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return '';
  let s: string;
  if (value instanceof Date) s = value.toISOString();
  else if (Array.isArray(value)) s = JSON.stringify(value);
  else if (typeof value === 'object') s = JSON.stringify(value);
  else s = String(value);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function rowsToCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const header = columns.join(',');
  const body = rows.map((r) => columns.map((c) => csvEscape(r[c])).join(',')).join('\n');
  return header + '\n' + body + '\n';
}

export function exportToCsvBundle(data: ExportPayload): string {
  // Bundle 5 CSVs with section markers — easy enough to open in a spreadsheet,
  // and easy for re-import via a custom parser. For real spreadsheets users
  // can still open the JSON file in any tool. Keep this simple.
  const sections: string[] = [];

  sections.push(
    '## work',
    rowsToCsv(data.work as Record<string, unknown>[], [
      'id', 'date', 'content', 'category', 'emotion', 'importance',
      'timeSpent', 'tags', 'followUpAction', 'createdAt',
    ])
  );
  sections.push(
    '## friend',
    rowsToCsv(data.friend as Record<string, unknown>[], [
      'id', 'date', 'friendName', 'interactionType', 'content',
      'emotion', 'importance', 'createdAt',
    ])
  );
  sections.push(
    '## partner',
    rowsToCsv(data.partner as Record<string, unknown>[], [
      'id', 'date', 'partnerName', 'interactionType', 'content',
      'emotion', 'importance', 'resolved', 'createdAt',
    ])
  );
  sections.push(
    '## gratitude',
    rowsToCsv(data.gratitude as Record<string, unknown>[], [
      'id', 'date', 'content', 'category', 'emotion', 'impactLevel',
      'photoUrl', 'locationAddress', 'createdAt',
    ])
  );
  sections.push(
    '## reflection',
    rowsToCsv(data.reflection as Record<string, unknown>[], [
      'id', 'date', 'morningGoal', 'morningMood', 'noonCheck', 'noonProgress',
      'eveningReflection', 'eveningAchievements', 'eveningChallenges',
      'overallRating', 'sleepPrediction', 'createdAt',
    ])
  );

  return sections.join('\n');
}

// ---- Import ----

export type ImportStrategy = 'merge' | 'replace';

export interface ImportResult {
  inserted: { work: number; friend: number; partner: number; gratitude: number; reflection: number };
  skipped: number;
  strategy: ImportStrategy;
}

interface ImportableRecord {
  date: string | Date;
  [key: string]: unknown;
}

function normalizeDate(value: unknown): Date {
  if (value instanceof Date) return value;
  if (typeof value === 'string') {
    // Accept "YYYY-MM-DD" or full ISO
    const d = value.length === 10 ? new Date(`${value}T00:00:00.000Z`) : new Date(value);
    if (!Number.isNaN(d.getTime())) return d;
  }
  throw new BadRequestError('记录中的 date 字段无效');
}

export async function importUserData(
  userId: string,
  payload: ExportPayload,
  strategy: ImportStrategy
): Promise<ImportResult> {
  if (!payload || typeof payload !== 'object' || payload.exportVersion !== EXPORT_VERSION) {
    throw new BadRequestError('文件格式不支持或版本不匹配');
  }

  const result: ImportResult = {
    inserted: { work: 0, friend: 0, partner: 0, gratitude: 0, reflection: 0 },
    skipped: 0,
    strategy,
  };

  await prisma.$transaction(async (tx) => {
    if (strategy === 'replace') {
      await tx.workRecord.deleteMany({ where: { userId } });
      await tx.friendRecord.deleteMany({ where: { userId } });
      await tx.partnerRecord.deleteMany({ where: { userId } });
      await tx.gratitudeRecord.deleteMany({ where: { userId } });
      await tx.dailyReflection.deleteMany({ where: { userId } });
    }

    for (const raw of payload.work as ImportableRecord[]) {
      try {
        await tx.workRecord.create({
          data: {
            userId,
            date: normalizeDate(raw.date),
            content: String(raw.content ?? ''),
            category: String(raw.category ?? 'routine'),
            emotion: String(raw.emotion ?? 'neutral'),
            importance: Number(raw.importance ?? 3),
            timeSpent: (raw.timeSpent as string | null) ?? null,
            tags: Array.isArray(raw.tags) ? (raw.tags as string[]) : [],
            followUpAction: (raw.followUpAction as string | null) ?? null,
          },
        });
        result.inserted.work++;
      } catch { result.skipped++; }
    }

    for (const raw of payload.friend as ImportableRecord[]) {
      try {
        await tx.friendRecord.create({
          data: {
            userId,
            date: normalizeDate(raw.date),
            friendName: String(raw.friendName ?? ''),
            interactionType: String(raw.interactionType ?? 'chat'),
            content: String(raw.content ?? ''),
            emotion: String(raw.emotion ?? 'neutral'),
            importance: Number(raw.importance ?? 3),
          },
        });
        result.inserted.friend++;
      } catch { result.skipped++; }
    }

    for (const raw of payload.partner as ImportableRecord[]) {
      try {
        await tx.partnerRecord.create({
          data: {
            userId,
            date: normalizeDate(raw.date),
            partnerName: String(raw.partnerName ?? ''),
            interactionType: String(raw.interactionType ?? 'conversation'),
            content: String(raw.content ?? ''),
            emotion: String(raw.emotion ?? 'neutral'),
            importance: Number(raw.importance ?? 3),
            resolved: Boolean(raw.resolved ?? false),
          },
        });
        result.inserted.partner++;
      } catch { result.skipped++; }
    }

    for (const raw of payload.gratitude as ImportableRecord[]) {
      try {
        await tx.gratitudeRecord.create({
          data: {
            userId,
            date: normalizeDate(raw.date),
            content: String(raw.content ?? ''),
            category: String(raw.category ?? 'moment'),
            emotion: String(raw.emotion ?? 'peaceful'),
            impactLevel: Number(raw.impactLevel ?? 3),
            photoUrl: (raw.photoUrl as string | null) ?? null,
            locationAddress: (raw.locationAddress as string | null) ?? null,
          },
        });
        result.inserted.gratitude++;
      } catch { result.skipped++; }
    }

    for (const raw of payload.reflection as ImportableRecord[]) {
      try {
        const date = normalizeDate(raw.date);
        // merge: upsert by (userId, date). replace: we already cleared so just create.
        if (strategy === 'merge') {
          await tx.dailyReflection.upsert({
            where: { userId_date: { userId, date } },
            update: {
              morningGoal: (raw.morningGoal as string | null) ?? undefined,
              morningMood: (raw.morningMood as string | null) ?? undefined,
              noonCheck: (raw.noonCheck as string | null) ?? undefined,
              noonProgress: (raw.noonProgress as number | null) ?? undefined,
              eveningReflection: (raw.eveningReflection as string | null) ?? undefined,
              eveningAchievements: Array.isArray(raw.eveningAchievements) ? (raw.eveningAchievements as string[]) : undefined,
              eveningChallenges: Array.isArray(raw.eveningChallenges) ? (raw.eveningChallenges as string[]) : undefined,
              overallRating: (raw.overallRating as number | null) ?? undefined,
              sleepPrediction: (raw.sleepPrediction as string | null) ?? undefined,
            },
            create: {
              userId,
              date,
              morningGoal: (raw.morningGoal as string | null) ?? null,
              morningMood: (raw.morningMood as string | null) ?? null,
              noonCheck: (raw.noonCheck as string | null) ?? null,
              noonProgress: (raw.noonProgress as number | null) ?? null,
              eveningReflection: (raw.eveningReflection as string | null) ?? null,
              eveningAchievements: Array.isArray(raw.eveningAchievements) ? (raw.eveningAchievements as string[]) : [],
              eveningChallenges: Array.isArray(raw.eveningChallenges) ? (raw.eveningChallenges as string[]) : [],
              overallRating: (raw.overallRating as number | null) ?? null,
              sleepPrediction: (raw.sleepPrediction as string | null) ?? null,
            },
          });
        } else {
          await tx.dailyReflection.create({
            data: {
              userId,
              date,
              morningGoal: (raw.morningGoal as string | null) ?? null,
              morningMood: (raw.morningMood as string | null) ?? null,
              noonCheck: (raw.noonCheck as string | null) ?? null,
              noonProgress: (raw.noonProgress as number | null) ?? null,
              eveningReflection: (raw.eveningReflection as string | null) ?? null,
              eveningAchievements: Array.isArray(raw.eveningAchievements) ? (raw.eveningAchievements as string[]) : [],
              eveningChallenges: Array.isArray(raw.eveningChallenges) ? (raw.eveningChallenges as string[]) : [],
              overallRating: (raw.overallRating as number | null) ?? null,
              sleepPrediction: (raw.sleepPrediction as string | null) ?? null,
            },
          });
        }
        result.inserted.reflection++;
      } catch { result.skipped++; }
    }
  });

  return result;
}
