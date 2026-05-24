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

export interface BookIntro {
  id: string;
  title: string;
  author: string;
  authorBio: string | null;
  intro: string | null;
}

/** Author bio + book intro for the daily-quote popup. Looks up by title. */
export async function getBookIntro(title: string): Promise<BookIntro> {
  const res = await api.get('/books/intro', { params: { title } });
  return res.data.book;
}

