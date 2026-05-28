import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import * as records from '../services/recordsService';

const dateField = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日期格式必须为 YYYY-MM-DD');
const importance = z.number().int().min(1).max(5);

// ---------- Work ----------
export const workSchema = z.object({
  date: dateField,
  content: z.string().min(1).max(2000),
  category: z.enum(['achievement', 'challenge', 'learning', 'routine']),
  emotion: z.enum(['satisfied', 'anxious', 'neutral', 'excited']),
  importance,
  timeSpent: z.string().max(50).optional(),
  tags: z.array(z.string().max(40)).max(20).optional(),
  followUpAction: z.string().max(500).optional(),
});

export const workUpdateSchema = workSchema.partial();

export async function createWork(req: Request, res: Response, next: NextFunction) {
  try {
    const record = await records.createWorkRecord(req.userId!, req.body);
    res.status(201).json({ success: true, record });
  } catch (e) { next(e); }
}

export async function updateWork(req: Request, res: Response, next: NextFunction) {
  try {
    const record = await records.updateWorkRecord(req.userId!, req.params.id, req.body);
    res.json({ success: true, record });
  } catch (e) { next(e); }
}

export async function deleteWork(req: Request, res: Response, next: NextFunction) {
  try {
    await records.deleteWorkRecord(req.userId!, req.params.id);
    res.json({ success: true });
  } catch (e) { next(e); }
}

// ---------- Friend ----------
export const friendSchema = z.object({
  date: dateField,
  friendName: z.string().min(1).max(100),
  interactionType: z.enum(['chat', 'meet', 'call', 'message']),
  content: z.string().min(1).max(2000),
  emotion: z.string().min(1).max(40),
  importance,
});

export async function createFriend(req: Request, res: Response, next: NextFunction) {
  try {
    const record = await records.createFriendRecord(req.userId!, req.body);
    res.status(201).json({ success: true, record });
  } catch (e) { next(e); }
}

export async function deleteFriend(req: Request, res: Response, next: NextFunction) {
  try {
    await records.deleteFriendRecord(req.userId!, req.params.id);
    res.json({ success: true });
  } catch (e) { next(e); }
}

// ---------- Partner ----------
export const partnerSchema = z.object({
  date: dateField,
  partnerName: z.string().min(1).max(100),
  interactionType: z.enum(['quality_time', 'conversation', 'argument', 'support']),
  content: z.string().min(1).max(2000),
  emotion: z.string().min(1).max(40),
  importance,
  resolved: z.boolean().optional(),
  photoUrl: z.string().url().optional(),
});

export async function createPartner(req: Request, res: Response, next: NextFunction) {
  try {
    const record = await records.createPartnerRecord(req.userId!, req.body);
    res.status(201).json({ success: true, record });
  } catch (e) { next(e); }
}

export async function deletePartner(req: Request, res: Response, next: NextFunction) {
  try {
    await records.deletePartnerRecord(req.userId!, req.params.id);
    res.json({ success: true });
  } catch (e) { next(e); }
}

// ---------- Gratitude ----------
export const gratitudeSchema = z.object({
  date: dateField,
  content: z.string().min(1).max(2000),
  category: z.enum(['nature', 'person', 'achievement', 'moment', 'health']),
  emotion: z.string().min(1).max(40),
  impactLevel: z.number().int().min(1).max(5),
  photoUrl: z.string().url().optional(),
  locationLatitude: z.number().min(-90).max(90).optional(),
  locationLongitude: z.number().min(-180).max(180).optional(),
  locationAddress: z.string().max(500).optional(),
});

export async function createGratitude(req: Request, res: Response, next: NextFunction) {
  try {
    const record = await records.createGratitudeRecord(req.userId!, req.body);
    res.status(201).json({ success: true, record });
  } catch (e) { next(e); }
}

export async function deleteGratitude(req: Request, res: Response, next: NextFunction) {
  try {
    await records.deleteGratitudeRecord(req.userId!, req.params.id);
    res.json({ success: true });
  } catch (e) { next(e); }
}

// ---------- Reflection ----------
export const reflectionSchema = z.object({
  date: dateField,
  morningGoal: z.string().max(2000).optional(),
  morningMood: z.string().max(40).optional(),
  noonCheck: z.string().max(2000).optional(),
  noonProgress: z.number().int().min(0).max(100).optional(),
  eveningReflection: z.string().max(2000).optional(),
  eveningAchievements: z.array(z.string().max(500)).max(20).optional(),
  eveningChallenges: z.array(z.string().max(500)).max(20).optional(),
  overallRating: z.number().int().min(1).max(5).optional(),
  sleepPrediction: z.string().max(40).optional(),
});

export async function upsertReflection(req: Request, res: Response, next: NextFunction) {
  try {
    const record = await records.upsertReflection(req.userId!, req.body);
    res.json({ success: true, record });
  } catch (e) { next(e); }
}

// ---------- Daily aggregator ----------
export async function getDaily(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await records.getDailyRecords(req.userId!, req.params.date);
    res.json({ success: true, ...data });
  } catch (e) { next(e); }
}
