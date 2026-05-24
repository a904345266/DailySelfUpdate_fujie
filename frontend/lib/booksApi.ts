import { api } from './api';

export interface ConceptDetail {
  book: { id: string; title: string; author: string };
  concept: {
    id: string;
    name: string;
    gist: string;
    chapter: string | null;
    deepDive: string | null;
    quotes: string[];
    reflectQuestions: string[];
  };
}

export async function getConcept(bookId: string, conceptId: string): Promise<ConceptDetail> {
  const res = await api.get(`/books/${bookId}/concepts/${conceptId}`);
  return { book: res.data.book, concept: res.data.concept };
}
