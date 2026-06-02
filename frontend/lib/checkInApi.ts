import { api } from './api';

export interface CheckInData {
  totalCheckIns: number;
  consecutiveDays: number;
  abilityPoints: number;
  lastCheckInDate: string | null;
  weeklyGoal: number;
  weeklyProgress: number;
  unlockedGifts: number;
}

export async function checkIn(): Promise<CheckInData> {
  const res = await api.post('/check-in');
  return res.data.checkInData;
}

export async function getCheckInData(): Promise<CheckInData> {
  const res = await api.get('/check-in');
  return res.data.checkInData;
}