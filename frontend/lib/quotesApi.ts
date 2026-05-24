import { api } from './api';

export interface DailyQuote {
  quote: string;
  book: string;
  author: string;
  source: 'ai' | 'fallback';
}

export async function getDailyQuote(refresh = false): Promise<DailyQuote> {
  const res = await api.get('/quotes/daily', { params: { refresh: refresh ? 1 : 0 } });
  return {
    quote: res.data.quote,
    book: res.data.book,
    author: res.data.author,
    source: res.data.source,
  };
}
