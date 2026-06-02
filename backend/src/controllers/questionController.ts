import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as questionService from '../services/questionService';

const submitAnswerSchema = z.object({
  questionId: z.string().min(1),
  answer: z.string().min(1),
});

export async function getDailyQuestion(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const question = await questionService.getDailyQuestion(userId);
    res.json({ success: true, question });
  } catch (err) {
    next(err);
  }
}

export async function submitAnswer(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.userId!;
    const { questionId, answer } = submitAnswerSchema.parse(req.body);
    await questionService.submitAnswer(userId, questionId, answer);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
}