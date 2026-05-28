import { api } from './api';

export type WorkCategory = 'achievement' | 'challenge' | 'learning' | 'routine';
export type WorkEmotion = 'satisfied' | 'anxious' | 'neutral' | 'excited';
export type FriendInteraction = 'chat' | 'meet' | 'call' | 'message';
export type PartnerInteraction = 'quality_time' | 'conversation' | 'argument' | 'support';
export type GratitudeCategory = 'nature' | 'person' | 'achievement' | 'moment' | 'health';

export interface WorkRecord {
  id: string;
  date: string;
  content: string;
  category: WorkCategory;
  emotion: WorkEmotion;
  importance: number;
  timeSpent: string | null;
  tags: string[];
  followUpAction: string | null;
  createdAt: string;
}

export interface FriendRecord {
  id: string;
  date: string;
  friendName: string;
  interactionType: FriendInteraction;
  content: string;
  emotion: string;
  importance: number;
  createdAt: string;
}

export interface PartnerRecord {
  id: string;
  date: string;
  partnerName: string;
  interactionType: PartnerInteraction;
  content: string;
  emotion: string;
  importance: number;
  resolved: boolean;
  photoUrl: string | null;
  createdAt: string;
}

export interface GratitudeRecord {
  id: string;
  date: string;
  content: string;
  category: GratitudeCategory;
  emotion: string;
  impactLevel: number;
  photoUrl: string | null;
  locationAddress: string | null;
  createdAt: string;
}

export interface DailyReflection {
  id: string;
  date: string;
  morningGoal: string | null;
  morningMood: string | null;
  noonCheck: string | null;
  noonProgress: number | null;
  eveningReflection: string | null;
  eveningAchievements: string[];
  eveningChallenges: string[];
  overallRating: number | null;
  sleepPrediction: string | null;
}

export interface DailyRecords {
  date: string;
  work: WorkRecord[];
  friends: FriendRecord[];
  partner: PartnerRecord[];
  gratitude: GratitudeRecord[];
  reflection: DailyReflection | null;
}

export async function getDailyRecords(date: string): Promise<DailyRecords> {
  const res = await api.get(`/records/daily/${date}`);
  const { success: _ignored, ...rest } = res.data;
  void _ignored;
  return rest as DailyRecords;
}

export async function createWork(input: {
  date: string;
  content: string;
  category: WorkCategory;
  emotion: WorkEmotion;
  importance: number;
  timeSpent?: string;
  tags?: string[];
  followUpAction?: string;
}): Promise<WorkRecord> {
  const res = await api.post('/records/work', input);
  return res.data.record;
}

export async function deleteWork(id: string): Promise<void> {
  await api.delete(`/records/work/${id}`);
}

export async function createFriend(input: {
  date: string;
  friendName: string;
  interactionType: FriendInteraction;
  content: string;
  emotion: string;
  importance: number;
}): Promise<FriendRecord> {
  const res = await api.post('/records/friend', input);
  return res.data.record;
}

export async function deleteFriend(id: string): Promise<void> {
  await api.delete(`/records/friend/${id}`);
}

export async function createPartner(input: {
  date: string;
  partnerName: string;
  interactionType: PartnerInteraction;
  content: string;
  emotion: string;
  importance: number;
  resolved?: boolean;
  photoUrl?: string;
}): Promise<PartnerRecord> {
  const res = await api.post('/records/partner', input);
  return res.data.record;
}

export async function deletePartner(id: string): Promise<void> {
  await api.delete(`/records/partner/${id}`);
}

export async function createGratitude(input: {
  date: string;
  content: string;
  category: GratitudeCategory;
  emotion: string;
  impactLevel: number;
}): Promise<GratitudeRecord> {
  const res = await api.post('/records/gratitude', input);
  return res.data.record;
}

export async function deleteGratitude(id: string): Promise<void> {
  await api.delete(`/records/gratitude/${id}`);
}

export async function upsertReflection(input: {
  date: string;
  morningGoal?: string;
  morningMood?: string;
  noonCheck?: string;
  noonProgress?: number;
  eveningReflection?: string;
  eveningAchievements?: string[];
  eveningChallenges?: string[];
  overallRating?: number;
  sleepPrediction?: string;
}): Promise<DailyReflection> {
  const res = await api.post('/records/reflection', input);
  return res.data.record;
}
