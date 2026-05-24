import { NextFunction, Request, Response } from 'express';
import { findConcept, findBook } from '../services/ai/books';
import { NotFoundError } from '../utils/errors';

/** GET /api/books/intro?title=《书名》 — author bio + book intro for a popup. */
export async function getBookIntro(req: Request, res: Response, next: NextFunction) {
  try {
    const key = String(req.query.title ?? req.query.id ?? '').trim();
    const book = key ? findBook(key) : null;
    if (!book) throw new NotFoundError('未找到该书籍简介');
    res.json({
      success: true,
      book: {
        id: book.id,
        title: book.title,
        author: book.author,
        authorBio: book.authorBio ?? null,
        intro: book.intro ?? null,
      },
    });
  } catch (e) {
    next(e);
  }
}

/** GET /api/books/:bookId/concepts/:conceptId — deep-dive reading for a concept. */
export async function getConcept(req: Request, res: Response, next: NextFunction) {
  try {
    const { bookId, conceptId } = req.params;
    const found = findConcept(bookId, conceptId);
    if (!found) throw new NotFoundError('未找到对应的书籍理论');
    const { book, concept } = found;
    res.json({
      success: true,
      book: { id: book.id, title: book.title, author: book.author },
      concept: {
        id: concept.id,
        name: concept.name,
        gist: concept.gist,
        chapter: concept.chapter ?? null,
        deepDive: concept.deepDive ?? null,
        quotes: concept.quotes ?? [],
        reflectQuestions: concept.reflectQuestions ?? [],
      },
    });
  } catch (e) {
    next(e);
  }
}
