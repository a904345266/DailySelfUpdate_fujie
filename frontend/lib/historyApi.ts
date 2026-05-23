import { api } from './api';

export type RecordType = 'work' | 'friend' | 'partner' | 'gratitude' | 'reflection';

export interface TimelineItem {
  id: string;
  type: RecordType;
  date: string; // YYYY-MM-DD
  createdAt: string; // ISO
  content: string;
  // Raw record from the matching table (shape varies per type). We keep it
  // typed as Record<string, unknown> and pick fields per render.
  record: Record<string, unknown>;
}

export interface HistoryParams {
  startDate?: string;
  endDate?: string;
  types?: RecordType[];
  category?: string;
  emotion?: string;
  minImportance?: number;
  cursor?: string;
  limit?: number;
}

function buildParams(p: HistoryParams): Record<string, string | number> {
  const q: Record<string, string | number> = {};
  if (p.startDate) q.startDate = p.startDate;
  if (p.endDate) q.endDate = p.endDate;
  if (p.types?.length) q.types = p.types.join(',');
  if (p.category) q.category = p.category;
  if (p.emotion) q.emotion = p.emotion;
  if (p.minImportance) q.minImportance = p.minImportance;
  if (p.cursor) q.cursor = p.cursor;
  if (p.limit) q.limit = p.limit;
  return q;
}

export async function fetchHistory(params: HistoryParams): Promise<{
  items: TimelineItem[];
  nextCursor: string | null;
}> {
  const res = await api.get('/records/history', { params: buildParams(params) });
  return { items: res.data.items, nextCursor: res.data.nextCursor };
}

export async function searchHistory(
  q: string,
  params: HistoryParams = {}
): Promise<{ items: TimelineItem[] }> {
  const res = await api.get('/records/search', {
    params: { q, ...buildParams(params) },
  });
  return { items: res.data.items };
}
