'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import { toast } from 'sonner';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NativeSelect } from '@/components/ui/select-native';
import { Card, CardContent } from '@/components/ui/card';
import {
  fetchHistory,
  searchHistory,
  type HistoryParams,
  type RecordType,
  type TimelineItem,
} from '@/lib/historyApi';
import { extractErrorMessage } from '@/lib/api';

const TYPE_LABELS: Record<RecordType, string> = {
  work: '工作',
  friend: '朋友',
  partner: '伴侣',
  gratitude: '感恩',
  reflection: '三省',
};

const TYPE_COLORS: Record<RecordType, string> = {
  work: 'bg-blue-500/15 text-blue-600 dark:text-blue-400',
  friend: 'bg-purple-500/15 text-purple-600 dark:text-purple-400',
  partner: 'bg-pink-500/15 text-pink-600 dark:text-pink-400',
  gratitude: 'bg-amber-500/15 text-amber-600 dark:text-amber-400',
  reflection: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400',
};

export default function HistoryPage() {
  // Filters
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedTypes, setSelectedTypes] = useState<Set<RecordType>>(new Set());
  const [emotion, setEmotion] = useState<string>('');
  const [minImportance, setMinImportance] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Results
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);

  const buildParams = useCallback((): HistoryParams => ({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    types: selectedTypes.size > 0 ? Array.from(selectedTypes) : undefined,
    emotion: emotion || undefined,
    minImportance: minImportance > 0 ? minImportance : undefined,
  }), [startDate, endDate, selectedTypes, emotion, minImportance]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { items, nextCursor } = await fetchHistory({ ...buildParams(), limit: 50 });
      setItems(items);
      setNextCursor(nextCursor);
    } catch (e) {
      toast.error(extractErrorMessage(e, '加载失败'));
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  const loadMore = async () => {
    if (!nextCursor) return;
    try {
      const { items: more, nextCursor: nc } = await fetchHistory({
        ...buildParams(),
        cursor: nextCursor,
        limit: 50,
      });
      setItems((prev) => [...prev, ...more]);
      setNextCursor(nc);
    } catch (e) {
      toast.error(extractErrorMessage(e, '加载失败'));
    }
  };

  const runSearch = async () => {
    if (!searchTerm.trim()) {
      load();
      return;
    }
    setSearching(true);
    setLoading(true);
    try {
      const { items } = await searchHistory(searchTerm.trim(), buildParams());
      setItems(items);
      setNextCursor(null);
    } catch (e) {
      toast.error(extractErrorMessage(e, '搜索失败'));
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearching(false);
    load();
  };

  // Initial load + reload whenever filters change (but not on every keystroke
  // of searchTerm — search has its own button).
  useEffect(() => {
    if (!searching) load();
  }, [load, searching]);

  const toggleType = (t: RecordType) => {
    setSelectedTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedTypes(new Set());
    setEmotion('');
    setMinImportance(0);
    setSearchTerm('');
    setSearching(false);
  };

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">历史记录</h1>
          <p className="text-muted-foreground">回顾你过去的反思与成长</p>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="space-y-4 p-4 sm:p-6">
            <div className="flex flex-wrap gap-2">
              {(Object.keys(TYPE_LABELS) as RecordType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleType(t)}
                  className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                    selectedTypes.has(t)
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-background text-foreground hover:bg-muted'
                  }`}
                >
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <div className="space-y-1">
                <Label htmlFor="start-date">起始日期</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="end-date">结束日期</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="emotion-filter">情绪</Label>
                <Input
                  id="emotion-filter"
                  placeholder="如：satisfied"
                  value={emotion}
                  onChange={(e) => setEmotion(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="importance-filter">最低重要性</Label>
                <NativeSelect
                  id="importance-filter"
                  value={String(minImportance)}
                  onChange={(e) => setMinImportance(Number(e.target.value))}
                >
                  <option value="0">不限</option>
                  <option value="1">≥ 1 ★</option>
                  <option value="2">≥ 2 ★</option>
                  <option value="3">≥ 3 ★</option>
                  <option value="4">≥ 4 ★</option>
                  <option value="5">= 5 ★</option>
                </NativeSelect>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="全文搜索内容、姓名、标签..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && runSearch()}
                />
              </div>
              <Button onClick={runSearch}>搜索</Button>
              {(searching || searchTerm) && (
                <Button variant="ghost" onClick={clearSearch}>
                  <X className="h-4 w-4" />
                </Button>
              )}
              <Button variant="outline" onClick={resetFilters}>重置</Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {loading ? (
          <p className="text-center text-muted-foreground">加载中...</p>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              没有匹配的记录
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <TimelineEntry key={`${item.type}-${item.id}`} item={item} />
            ))}
            {nextCursor && !searching && (
              <div className="flex justify-center pt-2">
                <Button variant="outline" onClick={loadMore}>加载更多</Button>
              </div>
            )}
          </div>
        )}
    </main>
  );
}

function TimelineEntry({ item }: { item: TimelineItem }) {
  const date = format(parseISO(item.date), 'M 月 d 日');
  const time = format(parseISO(item.createdAt), 'HH:mm');
  const r = item.record;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-16 flex-shrink-0 text-right text-xs text-muted-foreground">
            <div>{date}</div>
            <div>{time}</div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
              <span className={`rounded-full px-2 py-0.5 font-medium ${TYPE_COLORS[item.type]}`}>
                {TYPE_LABELS[item.type]}
              </span>
              {renderMeta(item)}
            </div>
            <p className="whitespace-pre-wrap break-words text-sm">{item.content}</p>
            {item.type === 'work' && typeof r.followUpAction === 'string' && r.followUpAction && (
              <p className="mt-2 text-xs text-muted-foreground">
                ↳ 后续：{r.followUpAction}
              </p>
            )}
            <div className="mt-2">
              <Link
                href={`/record/${item.date}`}
                className="text-xs text-primary hover:underline"
              >
                在 {date} 的页面查看 →
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function renderMeta(item: TimelineItem): React.ReactNode {
  const r = item.record;
  const importance = (r.importance as number | undefined) ?? (r.impactLevel as number | undefined);
  const meta: string[] = [];

  switch (item.type) {
    case 'work':
      if (r.category) meta.push(String(r.category));
      if (r.emotion) meta.push(String(r.emotion));
      break;
    case 'friend':
      if (r.friendName) meta.push(String(r.friendName));
      if (r.interactionType) meta.push(String(r.interactionType));
      break;
    case 'partner':
      if (r.partnerName) meta.push(String(r.partnerName));
      if (r.interactionType) meta.push(String(r.interactionType));
      if (r.interactionType === 'argument') {
        meta.push(r.resolved ? '✓ 已解决' : '待解决');
      }
      break;
    case 'gratitude':
      if (r.category) meta.push(String(r.category));
      break;
    case 'reflection':
      if (r.overallRating) meta.push(`整体 ${r.overallRating}★`);
      break;
  }

  return (
    <span className="text-muted-foreground">
      {meta.join(' · ')}
      {importance && <span className="ml-1 text-yellow-500">{'★'.repeat(importance)}</span>}
    </span>
  );
}
