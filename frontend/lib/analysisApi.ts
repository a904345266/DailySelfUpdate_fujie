import { api } from './api';

export interface WeeklyAnalysis {
  weekStart: string;
  weekEnd: string;
  totals: {
    work: number;
    friend: number;
    partner: number;
    gratitude: number;
    reflectionDays: number;
    activeDays: number;
  };
  work: {
    count: number;
    byCategory: Record<string, number>;
    byEmotion: Record<string, number>;
    avgImportance: number | null;
    topCategory: string | null;
    followUps: number;
  };
  relationship: {
    friendCount: number;
    partnerCount: number;
    friendsContacted: string[];
    partnerInteractions: Record<string, number>;
    unresolvedArguments: number;
  };
  gratitude: {
    count: number;
    byCategory: Record<string, number>;
    avgImpact: number | null;
  };
  emotional: {
    dailyRating: Array<{ date: string; rating: number | null }>;
    avgOverallRating: number | null;
    emotionDistribution: Record<string, number>;
  };
  growth: { achievements: string[]; challenges: string[] };
  recommendations: string[];
}

export interface TrendPoint {
  weekStart: string;
  weekEnd: string;
  work: number;
  friend: number;
  partner: number;
  gratitude: number;
  avgRating: number | null;
}

export async function getWeeklyAnalysis(weekStart: string): Promise<WeeklyAnalysis> {
  const res = await api.get(`/analysis/weekly/${weekStart}`);
  return res.data.analysis;
}

export type InsightSource = 'ai' | 'rules';

export interface GenerateResult {
  analysis: WeeklyAnalysis;
  insightSource: InsightSource;
  provider?: string | null;
}

export async function generateWeekly(weekStart: string): Promise<GenerateResult> {
  const res = await api.post('/analysis/generate-weekly', { weekStart });
  return {
    analysis: res.data.analysis,
    insightSource: res.data.insightSource ?? 'rules',
    provider: res.data.provider ?? null,
  };
}

export async function getTrends(weeks = 12): Promise<TrendPoint[]> {
  const res = await api.get('/analysis/trends', { params: { weeks } });
  return res.data.points;
}
