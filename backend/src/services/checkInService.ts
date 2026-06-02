import { prisma } from '../config/prisma';
import { BadRequestError } from '../utils/errors';
import { logger } from '../utils/logger';

export interface CheckInData {
  totalCheckIns: number;
  consecutiveDays: number;
  abilityPoints: number;
  lastCheckInDate: string | null;
  weeklyGoal: number;
  weeklyProgress: number;
  unlockedGifts: number;
}

export async function getCheckInData(userId: string): Promise<CheckInData> {
  // 获取用户的签到记录
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      checkInRecords: {
        orderBy: { date: 'desc' },
        take: 10, // 获取最近10条记录用于计算连续签到
      },
      totalCheckIns: true,
      abilityPoints: true,
      lastCheckInDate: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // 计算连续签到天数
  const consecutiveDays = calculateConsecutiveDays(user.checkInRecords, user.lastCheckInDate);

  // 计算本周签到进度 (周一到周日)
  const weeklyProgress = calculateWeeklyProgress(user.checkInRecords);

  // 计算已解锁的礼物数量 (每满7天解锁一个礼物)
  const unlockedGifts = Math.floor(user.totalCheckIns / 7);

  return {
    totalCheckIns: user.totalCheckIns || 0,
    consecutiveDays,
    abilityPoints: user.abilityPoints || 0,
    lastCheckInDate: user.lastCheckInDate ? user.lastCheckInDate.toISOString().split('T')[0] : null,
    weeklyGoal: 7, // 每周目标是7天
    weeklyProgress,
    unlockedGifts,
  };
}

export async function performCheckIn(userId: string): Promise<CheckInData> {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // 检查今天是否已经签到
  const existingCheckIn = await prisma.checkInRecord.findFirst({
    where: {
      userId,
      date: today,
    },
  });

  if (existingCheckIn) {
    throw new BadRequestError('今天已经签到过了');
  }

  // 在事务中执行签到操作
  return await prisma.$transaction(async (tx) => {
    // 创建签到记录
    await tx.checkInRecord.create({
      data: {
        userId,
        date: today,
      },
    });

    // 更新用户统计数据
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        totalCheckIns: { increment: 1 },
        abilityPoints: { increment: 5 }, // 每次签到+5能力值
        lastCheckInDate: today,
      },
      select: {
        totalCheckIns: true,
        abilityPoints: true,
        lastCheckInDate: true,
        checkInRecords: {
          orderBy: { date: 'desc' },
          take: 10,
        },
      },
    });

    // 计算连续签到天数
    const consecutiveDays = calculateConsecutiveDays(updatedUser.checkInRecords, updatedUser.lastCheckInDate);

    // 计算本周签到进度
    const weeklyProgress = calculateWeeklyProgress(updatedUser.checkInRecords);

    // 计算已解锁的礼物数量
    const unlockedGifts = Math.floor((updatedUser.totalCheckIns || 0) / 7);

    return {
      totalCheckIns: updatedUser.totalCheckIns || 0,
      consecutiveDays,
      abilityPoints: updatedUser.abilityPoints || 0,
      lastCheckInDate: updatedUser.lastCheckInDate ? updatedUser.lastCheckInDate.toISOString().split('T')[0] : null,
      weeklyGoal: 7,
      weeklyProgress,
      unlockedGifts,
    };
  });
}

// 计算连续签到天数
function calculateConsecutiveDays(records: Array<{ date: Date }>, lastCheckInDate: Date | null): number {
  if (!lastCheckInDate) return 0;

  // 如果今天不是最后一次签到，需要排除今天的记录
  const today = new Date();
  const isTodayLastCheckIn = 
    lastCheckInDate.getDate() === today.getDate() &&
    lastCheckInDate.getMonth() === today.getMonth() &&
    lastCheckInDate.getFullYear() === today.getFullYear();

  let checkInDates = records
    .map(record => new Date(
      record.date.getFullYear(),
      record.date.getMonth(),
      record.date.getDate()
    ))
    .sort((a, b) => b.getTime() - a.getTime()); // 降序排列

  // 如果今天还没签到，从昨天开始计算连续天数
  if (!isTodayLastCheckIn) {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    // 将最后签到日期设置为昨天，以便正确计算连续天数
    const adjustedLastCheckIn = new Date(
      lastCheckInDate.getFullYear(),
      lastCheckInDate.getMonth(),
      lastCheckInDate.getDate()
    );
    
    // 如果最后签到日期不是昨天或今天，则连续天数为1
    if (
      Math.floor((yesterday.getTime() - adjustedLastCheckIn.getTime()) / (1000 * 60 * 60 * 24)) > 1
    ) {
      return 1;
    }
  }

  if (checkInDates.length === 0) return 0;

  let consecutiveCount = 1;
  let currentDate = new Date(checkInDates[0]); // 最近一次签到日期

  for (let i = 1; i < checkInDates.length; i++) {
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);

    // 检查当前日期是否是前一个日期的前一天
    if (
      checkInDates[i].getDate() === prevDate.getDate() &&
      checkInDates[i].getMonth() === prevDate.getMonth() &&
      checkInDates[i].getFullYear() === prevDate.getFullYear()
    ) {
      consecutiveCount++;
      currentDate = checkInDates[i];
    } else {
      // 如果日期不连续，停止计算
      break;
    }
  }

  return consecutiveCount;
}

// 计算本周签到进度
function calculateWeeklyProgress(records: Array<{ date: Date }>): number {
  const now = new Date();
  // 计算本周周一日期
  const dayOfWeek = now.getDay(); // 0是周日，1是周一
  const monday = new Date(now);
  // 如果是周日(0)，需要减去6天到周一；如果是周一是1，不需要减；其他情况减去(day-1)天
  const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  monday.setDate(monday.getDate() - daysToMonday);
  monday.setHours(0, 0, 0, 0);

  // 统计本周内的签到次数
  return records.filter(record => {
    const recordDate = new Date(
      record.date.getFullYear(),
      record.date.getMonth(),
      record.date.getDate()
    );
    return recordDate >= monday;
  }).length;
}