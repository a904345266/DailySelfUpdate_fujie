'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { addDays, format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { ChevronLeft, ChevronRight, Sparkles, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  getWeeklyAnalysis,
  generateWeekly,
  type WeeklyAnalysis,
  type ReferencedBook,
} from '@/lib/analysisApi';
import { extractErrorMessage, resolveAssetUrl } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { BarByKey, DailyRatingChart, PieByKey } from '@/components/analysis/Charts';
import { ConceptReader } from '@/components/books/ConceptReader';

// Translation helpers (frontend mirrors backend enum labels)
const WORK_CATEGORY: Record<string, string> = {
  achievement: '成就', challenge: '挑战', learning: '学习', routine: '日常',
};
const WORK_EMOTION: Record<string, string> = {
  satisfied: '满意', anxious: '焦虑', neutral: '平静', excited: '兴奋',
};
const GRAT_CATEGORY: Record<string, string> = {
  nature: '自然', person: '人物', achievement: '成就', moment: '美好时刻', health: '健康',
};
const PARTNER_INTERACTION: Record<string, string> = {
  quality_time: '共处时光', conversation: '深入对话', argument: '争论', support: '互相支持',
};

function translateKeys(data: Record<string, number>, map: Record<string, string>) {
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(data)) out[map[k] ?? k] = v;
  return out;
}

function thisMonday(): string {
  const d = new Date();
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return format(d, 'yyyy-MM-dd');
}

export default function WeeklySummaryPage() {
  const params = useParams<{ week: string }>();
  const router = useRouter();
  const week = params.week;
  const user = useAuthStore((s) => s.user);

  const [data, setData] = useState<WeeklyAnalysis | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [referencedBooks, setReferencedBooks] = useState<ReferencedBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [insightSource, setInsightSource] = useState<'ai' | 'rules' | null>(null);
  const [reader, setReader] = useState<{ bookId: string; conceptId: string } | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setInsightSource(null);
    try {
      const { analysis, coverImageUrl, insightSource, referencedBooks } =
        await getWeeklyAnalysis(week);
      setData(analysis);
      setCoverImageUrl(coverImageUrl);
      setInsightSource(insightSource);
      setReferencedBooks(referencedBooks);
    } catch (e) {
      toast.error(extractErrorMessage(e, '加载失败'));
    } finally {
      setLoading(false);
    }
  }, [week]);

  useEffect(() => { load(); }, [load]);

  const handleGenerate = async () => {
    setGenerating(true);
    const toastId = toast.loading('正在生成周总结与封面图…');
    try {
      const result = await generateWeekly(week);
      setData(result.analysis);
      setInsightSource(result.insightSource);
      setReferencedBooks(result.referencedBooks);
      if (result.coverImageUrl) setCoverImageUrl(result.coverImageUrl);
      toast.success(
        result.insightSource === 'ai' ? 'AI 周总结已生成' : '周总结已生成（规则）',
        { id: toastId }
      );
      // Scroll back to the top so the user sees the fresh cover + insights,
      // instead of being stranded at the generate button down the page.
      topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } catch (e) {
      toast.error(extractErrorMessage(e, '生成失败'), { id: toastId });
    } finally {
      setGenerating(false);
    }
  };

  const gotoWeek = (offset: number) => {
    const next = format(addDays(parseISO(week), offset * 7), 'yyyy-MM-dd');
    router.push(`/summary/${next}`);
  };

  if (loading || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center text-muted-foreground">
        加载中...
      </main>
    );
  }

  const isThisWeek = week === thisMonday();
  const displayRange = `${format(parseISO(data.weekStart), 'M 月 d 日')} – ${format(parseISO(data.weekEnd), 'M 月 d 日')}`;
  const hasAnyData =
    data.totals.work + data.totals.friend + data.totals.partner + data.totals.gratitude + data.totals.reflectionDays > 0;

  return (
    <main className="px-4 py-8 sm:px-6 sm:py-10">
      <div ref={topRef} className="mx-auto max-w-4xl space-y-6 scroll-mt-20">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 rounded-2xl border bg-card p-3 shadow-sm">
          <Button variant="ghost" size="icon" onClick={() => gotoWeek(-1)} aria-label="上一周">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <h1 className="text-lg font-semibold">{displayRange}</h1>
            {isThisWeek ? (
              <p className="text-xs text-muted-foreground">本周</p>
            ) : (
              <button
                className="text-xs text-primary hover:underline"
                onClick={() => router.push(`/summary/${thisMonday()}`)}
              >
                回到本周
              </button>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={() => gotoWeek(1)} aria-label="下一周">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Cover image (only when generated) */}
        {coverImageUrl && (
          <div className="animate-rise overflow-hidden rounded-2xl border shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={resolveAssetUrl(coverImageUrl)}
              alt="本周封面"
              className="aspect-[16/9] w-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        {/* Totals */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">工作</div><div className="text-2xl font-bold">{data.totals.work}</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">人际（朋友+伴侣）</div><div className="text-2xl font-bold">{data.totals.friend + data.totals.partner}</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">感恩</div><div className="text-2xl font-bold">{data.totals.gratitude}</div></CardContent></Card>
          <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">活跃天数</div><div className="text-2xl font-bold">{data.totals.activeDays} / 7</div></CardContent></Card>
        </div>

        {/* Empty state */}
        {!hasAnyData && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              本周还没有任何记录。
              <div className="mt-4">
                <Button asChild>
                  <Link href={`/record/${format(new Date(), 'yyyy-MM-dd')}`}>开始记录</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* AI insights / recommendations */}
        {data.recommendations.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Sparkles className="h-5 w-5 text-amber-500" /> 本周洞察与建议
                {insightSource === 'ai' && (
                  <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-xs font-medium text-violet-600 dark:text-violet-400">
                    AI 生成
                  </span>
                )}
                {insightSource === 'rules' && (
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    规则生成
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                {insightSource === 'ai'
                  ? '由 AI 基于本周数据生成'
                  : '点击下方「生成」获取个性化洞察'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {data.recommendations.map((r, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-muted-foreground">·</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
              {referencedBooks.length > 0 && (
                <div className="mt-4 border-t pt-3">
                  <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>本周智慧来自（点击深读）：</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {referencedBooks.flatMap((b) =>
                      b.concepts.map((c) => (
                        <button
                          key={`${b.bookId}-${c.id}`}
                          type="button"
                          onClick={() => setReader({ bookId: b.bookId, conceptId: c.id })}
                          className="rounded-full bg-amber-500/10 px-3 py-1 text-xs text-amber-700 transition-colors hover:bg-amber-500/20 dark:text-amber-300"
                          title={`${b.title} · ${c.name}`}
                        >
                          {b.title}「{c.name}」
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Daily rating line */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">每日整体评分</CardTitle>
            <CardDescription>
              {data.emotional.avgOverallRating !== null
                ? `本周平均 ${data.emotional.avgOverallRating} ★`
                : '本周还没有评分记录'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DailyRatingChart data={data.emotional.dailyRating} />
          </CardContent>
        </Card>

        {/* Two-column charts */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">工作分类</CardTitle>
              <CardDescription>
                {data.work.topCategory && `最多：${WORK_CATEGORY[data.work.topCategory] ?? data.work.topCategory}`}
                {data.work.avgImportance !== null && ` · 平均重要性 ${data.work.avgImportance}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BarByKey data={translateKeys(data.work.byCategory, WORK_CATEGORY)} color="#3b82f6" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">工作情绪</CardTitle>
            </CardHeader>
            <CardContent>
              <PieByKey data={translateKeys(data.work.byEmotion, WORK_EMOTION)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">感恩来源</CardTitle>
              <CardDescription>
                {data.gratitude.avgImpact !== null && `平均影响力 ${data.gratitude.avgImpact} ★`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PieByKey data={translateKeys(data.gratitude.byCategory, GRAT_CATEGORY)} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">伴侣互动</CardTitle>
              <CardDescription>
                {data.relationship.unresolvedArguments > 0 &&
                  `${data.relationship.unresolvedArguments} 次未解决争论`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BarByKey
                data={translateKeys(data.relationship.partnerInteractions, PARTNER_INTERACTION)}
                color="#ec4899"
              />
            </CardContent>
          </Card>
        </div>

        {/* Friends contacted */}
        {data.relationship.friendsContacted.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">本周联系的朋友</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {data.relationship.friendsContacted.map((n) => (
                  <span key={n} className="rounded-full bg-purple-500/15 px-3 py-1 text-sm text-purple-600 dark:text-purple-400">
                    {n}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Achievements / challenges */}
        {(data.growth.achievements.length > 0 || data.growth.challenges.length > 0) && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">本周成就</CardTitle>
              </CardHeader>
              <CardContent>
                {data.growth.achievements.length === 0 ? (
                  <p className="text-sm text-muted-foreground">暂无</p>
                ) : (
                  <ul className="space-y-1 text-sm">
                    {data.growth.achievements.map((a, i) => <li key={i}>✓ {a}</li>)}
                  </ul>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">本周挑战</CardTitle>
              </CardHeader>
              <CardContent>
                {data.growth.challenges.length === 0 ? (
                  <p className="text-sm text-muted-foreground">暂无</p>
                ) : (
                  <ul className="space-y-1 text-sm">
                    {data.growth.challenges.map((c, i) => <li key={i}>◇ {c}</li>)}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Generate (persist) button */}
        <div className="flex items-center justify-end gap-3">
          <span className="text-xs text-muted-foreground">
            {user?.tier === 'vip' ? 'VIP · 高质量 AI 洞察' : '免费版 · AI 洞察'}
          </span>
          <Button onClick={handleGenerate} disabled={generating} size="sm">
            <Sparkles className={`mr-2 h-4 w-4 ${generating ? 'animate-spin' : ''}`} />
            {generating ? '生成中...' : '生成 AI 周总结'}
          </Button>
        </div>
      </div>

      {reader && (
        <ConceptReader
          bookId={reader.bookId}
          conceptId={reader.conceptId}
          onClose={() => setReader(null)}
        />
      )}
    </main>
  );
}
