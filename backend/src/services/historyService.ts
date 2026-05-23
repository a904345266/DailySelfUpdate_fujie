import { prisma } from '../config/prisma';
import { parseDateParam } from '../utils/dateParam';

type RecordType = 'work' | 'friend' | 'partner' | 'gratitude' | 'reflection';
const ALL_TYPES: RecordType[] = ['work', 'friend', 'partner', 'gratitude', 'reflection'];

export interface HistoryQuery {
  startDate?: string;
  endDate?: string;
  types?: RecordType[];
  /** category/interactionType filter — applied per record type when present */
  category?: string;
  emotion?: string;
  /** minimum importance / impactLevel */
  minImportance?: number;
  /** for paginated unified timeline */
  cursor?: string;
  limit?: number;
}

export interface SearchQuery extends HistoryQuery {
  q: string;
}

export interface TimelineItem {
  id: string;
  type: RecordType;
  date: string; // YYYY-MM-DD
  createdAt: Date;
  content: string;
  /** Type-specific payload, raw from Prisma */
  record: unknown;
}

function dateRangeWhere(startDate?: string, endDate?: string): { gte?: Date; lte?: Date } | undefined {
  const where: { gte?: Date; lte?: Date } = {};
  if (startDate) where.gte = parseDateParam(startDate);
  if (endDate) where.lte = parseDateParam(endDate);
  return Object.keys(where).length ? where : undefined;
}

function toIsoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Unified timeline across all record types. Returns up to `limit` items
 * (default 50, max 200) ordered by createdAt DESC.
 *
 * We fetch each table separately (bounded by limit), merge, sort, then slice.
 * The cursor is an ISO timestamp — items with createdAt < cursor are returned.
 */
export async function getHistory(userId: string, q: HistoryQuery) {
  const limit = Math.min(Math.max(q.limit ?? 50, 1), 200);
  const types = (q.types && q.types.length ? q.types : ALL_TYPES).filter((t) => ALL_TYPES.includes(t));
  const dateWhere = dateRangeWhere(q.startDate, q.endDate);
  const cursorDate = q.cursor ? new Date(q.cursor) : undefined;
  const createdAtFilter = cursorDate ? { lt: cursorDate } : undefined;

  const queries: Array<Promise<TimelineItem[]>> = [];

  if (types.includes('work')) {
    queries.push(
      prisma.workRecord
        .findMany({
          where: {
            userId,
            ...(dateWhere ? { date: dateWhere } : {}),
            ...(createdAtFilter ? { createdAt: createdAtFilter } : {}),
            ...(q.category ? { category: q.category } : {}),
            ...(q.emotion ? { emotion: q.emotion } : {}),
            ...(q.minImportance ? { importance: { gte: q.minImportance } } : {}),
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
        })
        .then((rows) =>
          rows.map((r): TimelineItem => ({
            id: r.id,
            type: 'work',
            date: toIsoDate(r.date),
            createdAt: r.createdAt,
            content: r.content,
            record: r,
          }))
        )
    );
  }

  if (types.includes('friend')) {
    queries.push(
      prisma.friendRecord
        .findMany({
          where: {
            userId,
            ...(dateWhere ? { date: dateWhere } : {}),
            ...(createdAtFilter ? { createdAt: createdAtFilter } : {}),
            ...(q.category ? { interactionType: q.category } : {}),
            ...(q.emotion ? { emotion: q.emotion } : {}),
            ...(q.minImportance ? { importance: { gte: q.minImportance } } : {}),
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
        })
        .then((rows) =>
          rows.map((r): TimelineItem => ({
            id: r.id,
            type: 'friend',
            date: toIsoDate(r.date),
            createdAt: r.createdAt,
            content: r.content,
            record: r,
          }))
        )
    );
  }

  if (types.includes('partner')) {
    queries.push(
      prisma.partnerRecord
        .findMany({
          where: {
            userId,
            ...(dateWhere ? { date: dateWhere } : {}),
            ...(createdAtFilter ? { createdAt: createdAtFilter } : {}),
            ...(q.category ? { interactionType: q.category } : {}),
            ...(q.emotion ? { emotion: q.emotion } : {}),
            ...(q.minImportance ? { importance: { gte: q.minImportance } } : {}),
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
        })
        .then((rows) =>
          rows.map((r): TimelineItem => ({
            id: r.id,
            type: 'partner',
            date: toIsoDate(r.date),
            createdAt: r.createdAt,
            content: r.content,
            record: r,
          }))
        )
    );
  }

  if (types.includes('gratitude')) {
    queries.push(
      prisma.gratitudeRecord
        .findMany({
          where: {
            userId,
            ...(dateWhere ? { date: dateWhere } : {}),
            ...(createdAtFilter ? { createdAt: createdAtFilter } : {}),
            ...(q.category ? { category: q.category } : {}),
            ...(q.emotion ? { emotion: q.emotion } : {}),
            ...(q.minImportance ? { impactLevel: { gte: q.minImportance } } : {}),
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
        })
        .then((rows) =>
          rows.map((r): TimelineItem => ({
            id: r.id,
            type: 'gratitude',
            date: toIsoDate(r.date),
            createdAt: r.createdAt,
            content: r.content,
            record: r,
          }))
        )
    );
  }

  if (types.includes('reflection')) {
    queries.push(
      prisma.dailyReflection
        .findMany({
          where: {
            userId,
            ...(dateWhere ? { date: dateWhere } : {}),
            ...(createdAtFilter ? { createdAt: createdAtFilter } : {}),
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
        })
        .then((rows) =>
          rows.map((r): TimelineItem => ({
            id: r.id,
            type: 'reflection',
            date: toIsoDate(r.date),
            createdAt: r.createdAt,
            content: [r.morningGoal, r.noonCheck, r.eveningReflection].filter(Boolean).join(' / '),
            record: r,
          }))
        )
    );
  }

  const allChunks = await Promise.all(queries);
  const merged = allChunks
    .flat()
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);

  const nextCursor =
    merged.length === limit ? merged[merged.length - 1].createdAt.toISOString() : null;

  return { items: merged, nextCursor };
}

/**
 * Full-text-ish search using ILIKE on content fields, scoped to user.
 * No tsvector for now — dataset is small per-user and this keeps the
 * migration simple.
 */
export async function searchHistory(userId: string, q: SearchQuery) {
  const limit = Math.min(Math.max(q.limit ?? 50, 1), 200);
  const types = (q.types && q.types.length ? q.types : ALL_TYPES).filter((t) => ALL_TYPES.includes(t));
  const dateWhere = dateRangeWhere(q.startDate, q.endDate);
  const term = q.q.trim();
  if (!term) return { items: [], nextCursor: null };

  const ilike = { contains: term, mode: 'insensitive' as const };

  const queries: Array<Promise<TimelineItem[]>> = [];

  if (types.includes('work')) {
    queries.push(
      prisma.workRecord
        .findMany({
          where: {
            userId,
            ...(dateWhere ? { date: dateWhere } : {}),
            OR: [{ content: ilike }, { followUpAction: ilike }, { tags: { has: term } }],
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
        })
        .then((rows) =>
          rows.map((r): TimelineItem => ({
            id: r.id,
            type: 'work',
            date: toIsoDate(r.date),
            createdAt: r.createdAt,
            content: r.content,
            record: r,
          }))
        )
    );
  }
  if (types.includes('friend')) {
    queries.push(
      prisma.friendRecord
        .findMany({
          where: {
            userId,
            ...(dateWhere ? { date: dateWhere } : {}),
            OR: [{ content: ilike }, { friendName: ilike }],
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
        })
        .then((rows) =>
          rows.map((r): TimelineItem => ({
            id: r.id,
            type: 'friend',
            date: toIsoDate(r.date),
            createdAt: r.createdAt,
            content: r.content,
            record: r,
          }))
        )
    );
  }
  if (types.includes('partner')) {
    queries.push(
      prisma.partnerRecord
        .findMany({
          where: {
            userId,
            ...(dateWhere ? { date: dateWhere } : {}),
            OR: [{ content: ilike }, { partnerName: ilike }],
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
        })
        .then((rows) =>
          rows.map((r): TimelineItem => ({
            id: r.id,
            type: 'partner',
            date: toIsoDate(r.date),
            createdAt: r.createdAt,
            content: r.content,
            record: r,
          }))
        )
    );
  }
  if (types.includes('gratitude')) {
    queries.push(
      prisma.gratitudeRecord
        .findMany({
          where: {
            userId,
            ...(dateWhere ? { date: dateWhere } : {}),
            OR: [{ content: ilike }, { locationAddress: ilike }],
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
        })
        .then((rows) =>
          rows.map((r): TimelineItem => ({
            id: r.id,
            type: 'gratitude',
            date: toIsoDate(r.date),
            createdAt: r.createdAt,
            content: r.content,
            record: r,
          }))
        )
    );
  }
  if (types.includes('reflection')) {
    queries.push(
      prisma.dailyReflection
        .findMany({
          where: {
            userId,
            ...(dateWhere ? { date: dateWhere } : {}),
            OR: [
              { morningGoal: ilike },
              { noonCheck: ilike },
              { eveningReflection: ilike },
            ],
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
        })
        .then((rows) =>
          rows.map((r): TimelineItem => ({
            id: r.id,
            type: 'reflection',
            date: toIsoDate(r.date),
            createdAt: r.createdAt,
            content: [r.morningGoal, r.noonCheck, r.eveningReflection]
              .filter(Boolean)
              .join(' / '),
            record: r,
          }))
        )
    );
  }

  const allChunks = await Promise.all(queries);
  const merged = allChunks
    .flat()
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, limit);

  return { items: merged, nextCursor: null, total: merged.length };
}
