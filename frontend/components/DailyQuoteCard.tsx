'use client';

import { useCallback, useEffect, useState } from 'react';
import { BookOpen, Quote, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getDailyQuote, type DailyQuote } from '@/lib/quotesApi';
import { BookIntroDialog } from '@/components/books/BookIntroDialog';

/**
 * Dashboard card: a daily quote from a classic book, personalized to the user's
 * recent records. Async-loads on mount, "换一句" re-fetches a fresh one.
 */
export function DailyQuoteCard() {
  const [data, setData] = useState<DailyQuote | null>(null);
  const [loading, setLoading] = useState(true);
  const [showIntro, setShowIntro] = useState(false);

  const load = useCallback(async (refresh: boolean) => {
    setLoading(true);
    try {
      setData(await getDailyQuote(refresh));
    } catch {
      // Endpoint already returns a fallback; on network error just show nothing special.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(false);
  }, [load]);

  return (
    <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-amber-400/15 via-orange-300/10 to-rose-300/10 dark:from-amber-500/10 dark:via-orange-400/5 dark:to-rose-400/5">
      <div className="pointer-events-none absolute -right-6 -top-6 text-amber-400/20 dark:text-amber-300/10">
        <Quote className="h-28 w-28" />
      </div>
      <CardContent className="relative p-6">
        <div className="mb-3 flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 dark:text-amber-300">
            <BookOpen className="h-3.5 w-3.5" /> 每日书句
          </span>
          <button
            type="button"
            onClick={() => load(true)}
            disabled={loading}
            className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-background/60 hover:text-foreground disabled:opacity-50"
            title="换一句"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            换一句
          </button>
        </div>

        {loading && !data ? (
          <div className="space-y-2">
            <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-5 w-1/2 animate-pulse rounded bg-muted" />
          </div>
        ) : data ? (
          <figure>
            <blockquote className="text-lg font-medium leading-relaxed text-foreground">
              「{data.quote}」
            </blockquote>
            <figcaption className="mt-3 text-sm text-muted-foreground">
              —— {data.author ? `${data.author} ` : ''}
              {data.book && (
                <button
                  type="button"
                  onClick={() => setShowIntro(true)}
                  className="underline decoration-dotted underline-offset-2 hover:text-foreground"
                  title="查看作者与书籍简介"
                >
                  {data.book}
                </button>
              )}
            </figcaption>
          </figure>
        ) : (
          <p className="text-sm text-muted-foreground">暂时拿不到金句，稍后再试～</p>
        )}
      </CardContent>

      {showIntro && data?.book && (
        <BookIntroDialog title={data.book} onClose={() => setShowIntro(false)} />
      )}
    </Card>
  );
}
