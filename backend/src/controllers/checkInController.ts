import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as checkInService from '../services/checkInService';

export async function getCheckInData(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const data = await checkInService.getCheckInData(userId);
    res.json({ success: true, checkInData: data });
  } catch (err) {
    next(err);
  }
}

export async function checkIn(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const data = await checkInService.performCheckIn(userId);
    res.json({ success: true, checkInData: data });
  } catch (err) {
    next(err);
  }
}