'use client';

import { useEffect, useState } from 'react';
import { X, BookOpen, User } from 'lucide-react';
import { getBookIntro, type BookIntro } from '@/lib/booksApi';
import { extractErrorMessage } from '@/lib/api';

interface Props {
  title: string; // 书名（如《亲密关系》）
  onClose: () => void;
}

/** Popup showing a book's author bio + intro, for the daily quote card. */
export function BookIntroDialog({ title, onClose }: Props) {
  const [data, setData] = useState<BookIntro | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    getBookIntro(title)
      .then((d) => active && setData(d))
      .catch((e) => active && setError(extractErrorMessage(e, '暂无该书简介')))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [title]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className="animate-rise flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border bg-card shadow-xl sm:rounded-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b p-5">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-semibold">{data?.title ?? title}</h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="关闭"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-5">
          {loading && <p className="text-sm text-muted-foreground">加载中…</p>}
          {error && <p className="text-sm text-muted-foreground">{error}</p>}
          {data && (
            <div className="space-y-5">
              <section>
                <h3 className="mb-1.5 flex items-center gap-1.5 text-sm font-semibold">
                  <User className="h-3.5 w-3.5 text-muted-foreground" /> 作者 · {data.author}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {data.authorBio ?? '暂无作者简介'}
                </p>
              </section>
              <section>
                <h3 className="mb-1.5 text-sm font-semibold">关于本书</h3>
                <p className="text-sm leading-relaxed text-foreground">
                  {data.intro ?? '暂无书籍简介'}
                </p>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
