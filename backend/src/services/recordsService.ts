import { prisma } from '../config/prisma';
import { NotFoundError } from '../utils/errors';
import { parseDateParam } from '../utils/dateParam';

// ---------- WorkRecord ----------

interface WorkRecordInput {
  date: string;
  content: string;
  category: 'achievement' | 'challenge' | 'learning' | 'routine';
  emotion: 'satisfied' | 'anxious' | 'neutral' | 'excited';
  importance: number;
  timeSpent?: string;
  tags?: string[];
  followUpAction?: string;
}

export async function createWorkRecord(userId: string, input: WorkRecordInput) {
  return prisma.workRecord.create({
    data: {
      userId,
      date: parseDateParam(input.date),
      content: input.content,
      category: input.category,
      emotion: input.emotion,
      importance: input.importance,
      timeSpent: input.timeSpent,
      tags: input.tags ?? [],
      followUpAction: input.followUpAction,
    },
  });
}

export async function updateWorkRecord(
  userId: string,
  id: string,
  input: Partial<WorkRecordInput>
) {
  const existing = await prisma.workRecord.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    throw new NotFoundError('记录不存在');
  }
  return prisma.workRecord.update({
    where: { id },
    data: {
      ...(input.date ? { date: parseDateParam(input.date) } : {}),
      ...(input.content !== undefined ? { content: input.content } : {}),
      ...(input.category ? { category: input.category } : {}),
      ...(input.emotion ? { emotion: input.emotion } : {}),
      ...(input.importance !== undefined ? { importance: input.importance } : {}),
      ...(input.timeSpent !== undefined ? { timeSpent: input.timeSpent } : {}),
      ...(input.tags !== undefined ? { tags: input.tags } : {}),
      ...(input.followUpAction !== undefined ? { followUpAction: input.followUpAction } : {}),
    },
  });
}

export async function deleteWorkRecord(userId: string, id: string) {
  const existing = await prisma.workRecord.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    throw new NotFoundError('记录不存在');
  }
  await prisma.workRecord.delete({ where: { id } });
}

// ---------- FriendRecord ----------

interface FriendRecordInput {
  date: string;
  friendName: string;
  interactionType: 'chat' | 'meet' | 'call' | 'message';
  content: string;
  emotion: string;
  importance: number;
}

export async function createFriendRecord(userId: string, input: FriendRecordInput) {
  return prisma.friendRecord.create({
    data: {
      userId,
      date: parseDateParam(input.date),
      friendName: input.friendName,
      interactionType: input.interactionType,
      content: input.content,
      emotion: input.emotion,
      importance: input.importance,
    },
  });
}

export async function deleteFriendRecord(userId: string, id: string) {
  const existing = await prisma.friendRecord.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) throw new NotFoundError('记录不存在');
  await prisma.friendRecord.delete({ where: { id } });
}

// ---------- PartnerRecord ----------

interface PartnerRecordInput {
  date: string;
  partnerName: string;
  interactionType: 'quality_time' | 'conversation' | 'argument' | 'support';
  content: string;
  emotion: string;
  importance: number;
  resolved?: boolean;
  photoUrl?: string;
}

export async function createPartnerRecord(userId: string, input: PartnerRecordInput) {
  return prisma.partnerRecord.create({
    data: {
      userId,
      date: parseDateParam(input.date),
      partnerName: input.partnerName,
      interactionType: input.interactionType,
      content: input.content,
      emotion: input.emotion,
      importance: input.importance,
      resolved: input.resolved ?? false,
      photoUrl: input.photoUrl,
    },
  });
}

export async function deletePartnerRecord(userId: string, id: string) {
  const existing = await prisma.partnerRecord.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) throw new NotFoundError('记录不存在');
  await prisma.partnerRecord.delete({ where: { id } });
}

// ---------- GratitudeRecord ----------

interface GratitudeRecordInput {
  date: string;
  content: string;
  category: 'nature' | 'person' | 'achievement' | 'moment' | 'health';
  emotion: string;
  impactLevel: number;
  photoUrl?: string;
  locationLatitude?: number;
  locationLongitude?: number;
  locationAddress?: string;
}

export async function createGratitudeRecord(userId: string, input: GratitudeRecordInput) {
  return prisma.gratitudeRecord.create({
    data: {
      userId,
      date: parseDateParam(input.date),
      content: input.content,
      category: input.category,
      emotion: input.emotion,
      impactLevel: input.impactLevel,
      photoUrl: input.photoUrl,
      locationLatitude: input.locationLatitude,
      locationLongitude: input.locationLongitude,
      locationAddress: input.locationAddress,
    },
  });
}

export async function deleteGratitudeRecord(userId: string, id: string) {
  const existing = await prisma.gratitudeRecord.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) throw new NotFoundError('记录不存在');
  await prisma.gratitudeRecord.delete({ where: { id } });
}

// ---------- DailyReflection ----------

interface ReflectionInput {
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
}

/**
 * Daily reflection is unique per (user, date), so upsert.
 * Letting users append morning/noon/evening separately across the day.
 */
export async function upsertReflection(userId: string, input: ReflectionInput) {
  const date = parseDateParam(input.date);
  return prisma.dailyReflection.upsert({
    where: { userId_date: { userId, date } },
    update: {
      ...(input.morningGoal !== undefined ? { morningGoal: input.morningGoal } : {}),
      ...(input.morningMood !== undefined ? { morningMood: input.morningMood } : {}),
      ...(input.noonCheck !== undefined ? { noonCheck: input.noonCheck } : {}),
      ...(input.noonProgress !== undefined ? { noonProgress: input.noonProgress } : {}),
      ...(input.eveningReflection !== undefined ? { eveningReflection: input.eveningReflection } : {}),
      ...(input.eveningAchievements !== undefined ? { eveningAchievements: input.eveningAchievements } : {}),
      ...(input.eveningChallenges !== undefined ? { eveningChallenges: input.eveningChallenges } : {}),
      ...(input.overallRating !== undefined ? { overallRating: input.overallRating } : {}),
      ...(input.sleepPrediction !== undefined ? { sleepPrediction: input.sleepPrediction } : {}),
    },
    create: {
      userId,
      date,
      morningGoal: input.morningGoal,
      morningMood: input.morningMood,
      noonCheck: input.noonCheck,
      noonProgress: input.noonProgress,
      eveningReflection: input.eveningReflection,
      eveningAchievements: input.eveningAchievements ?? [],
      eveningChallenges: input.eveningChallenges ?? [],
      overallRating: input.overallRating,
      sleepPrediction: input.sleepPrediction,
    },
  });
}

// ---------- Daily aggregator ----------

export async function getDailyRecords(userId: string, dateStr: string) {
  const date = parseDateParam(dateStr);
  const [work, friends, partner, gratitude, reflection] = await Promise.all([
    prisma.workRecord.findMany({
      where: { userId, date },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.friendRecord.findMany({
      where: { userId, date },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.partnerRecord.findMany({
      where: { userId, date },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.gratitudeRecord.findMany({
      where: { userId, date },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.dailyReflection.findUnique({
      where: { userId_date: { userId, date } },
    }),
  ]);
  return { date: dateStr, work, friends, partner, gratitude, reflection };
}
