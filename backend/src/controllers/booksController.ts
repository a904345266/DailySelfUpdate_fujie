import { NextFunction, Request, Response } from 'express';
import { findConcept } from '../services/ai/books';
import { NotFoundError } from '../utils/errors';

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
