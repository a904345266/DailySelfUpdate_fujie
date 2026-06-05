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

export interface BookChapter {
  title: string;
  author: string;
  chapter: string;
  keyPoints: string;
}

export interface AiAnalysis {
  aiAnalysis: string;
  bookChapters: BookChapter[];
}

export async function getAiAnalysis(questionId: string, userAnswer: string): Promise<AiAnalysis | null> {
  const res = await api.post('/questions/ai-analysis', { questionId, userAnswer });
  return res.data.analysis ?? null;
}