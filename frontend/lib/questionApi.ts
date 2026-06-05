import { api } from './api';

export interface BookRecommendation {
  title: string;
  author: string;
  reason: string;
}

export interface Question {
  id: string;
  type: 'philosophy' | 'psychology' | 'story' | 'reflection';
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  category: string;
  books: BookRecommendation[];
  alreadyAnswered: boolean;
  userAnswer?: string;
}

export async function getDailyQuestion(): Promise<Question> {
  const res = await api.get('/questions/daily');
  return res.data.question;
}

export async function submitAnswer(questionId: string, answer: string): Promise<void> {
  await api.post('/questions/answer', { questionId, answer });
}