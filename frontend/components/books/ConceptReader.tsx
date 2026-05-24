'use client';

import { useEffect, useState } from 'react';
import { X, BookOpen, Quote, HelpCircle } from 'lucide-react';
import { getConcept, type ConceptDetail } from '@/lib/booksApi';
import { extractErrorMessage } from '@/lib/api';

interface Props {
  bookId: string;
  conceptId: string;
  onClose: () => void;
}

/**
 * A modal that shows the deep-dive reading for a book concept: chapter index,
 * our导读 explanation, representative quotes, and reflection questions.
 */
export function ConceptReader({ bookId, conceptId, onClose }: Props) {
  const [data, setData] = useState<ConceptDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    getConcept(bookId, conceptId)
      .then((d) => active && setData(d))
      .catch((e) => active && setError(extractErrorMessage(e, '加载失败')))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [bookId, conceptId]);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="animate-rise flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border bg-card shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b p-5">
          <div className="min-w-0">
            {data && (
              <>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <BookOpen className="h-3.5 w-3.5" />
                  {data.book.title} · {data.book.author}
                </div>
                <h2 className="mt-1 text-lg font-semibold">{data.concept.name}</h2>
                {data.concept.chapter && (
                  <p className="mt-0.5 text-xs text-muted-foreground">{data.concept.chapter}</p>
                )}
              </>
            )}
            {!data && <h2 className="text-lg font-semibold">书中智慧</h2>}
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="关闭"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-5">
          {loading && <p className="text-sm text-muted-foreground">加载中…</p>}
          {error && <p className="text-sm text-destructive">{error}</p>}
          {data && (
            <div className="space-y-5">
              <p className="text-sm leading-relaxed text-foreground">{data.concept.gist}</p>

              {data.concept.deepDive && (
                <section>
                  <h3 className="mb-1.5 text-sm font-semibold">深度导读</h3>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {data.concept.deepDive}
                  </p>
                </section>
              )}

              {data.concept.quotes.length > 0 && (
                <section>
                  <h3 className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold">
                    <Quote className="h-3.5 w-3.5 text-amber-500" /> 书中金句
                  </h3>
                  <div className="space-y-2">
                    {data.concept.quotes.map((q, i) => (
                      <blockquote
                        key={i}
                        className="border-l-2 border-amber-400 pl-3 text-sm italic leading-relaxed text-muted-foreground"
                      >
                        {q}
                      </blockquote>
                    ))}
                  </div>
                </section>
              )}

              {data.concept.reflectQuestions.length > 0 && (
                <section>
                  <h3 className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold">
                    <HelpCircle className="h-3.5 w-3.5 text-blue-500" /> 留给自己的问题
                  </h3>
                  <ul className="space-y-1.5">
                    {data.concept.reflectQuestions.map((q, i) => (
                      <li key={i} className="flex gap-2 text-sm text-muted-foreground">
                        <span className="text-blue-500">·</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <p className="border-t pt-3 text-xs text-muted-foreground">
                以上为基于《{data.book.title.replace(/[《》]/g, '')}》理论的导读与少量引用，供学习与自我反思之用。
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
