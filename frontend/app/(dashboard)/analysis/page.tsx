'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NativeSelect } from '@/components/ui/select-native';
import { Label } from '@/components/ui/label';
import { getTrends, type TrendPoint } from '@/lib/analysisApi';
import { extractErrorMessage } from '@/lib/api';
import { TrendsChart, RatingTrendChart } from '@/components/analysis/Charts';

export default function AnalysisPage() {
  const [weeks, setWeeks] = useState(12);
  const [points, setPoints] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getTrends(weeks)
      .then(setPoints)
      .catch((e) => toast.error(extractErrorMessage(e, '加载失败')))
      .finally(() => setLoading(false));
  }, [weeks]);

  // Summary stats over the window
  const totalRecords = points.reduce(
    (sum, p) => sum + p.work + p.friend + p.partner + p.gratitude,
    0
  );
  const ratings = points.map((p) => p.avgRating).filter((r): r is number => typeof r === 'number');
  const avgRating = ratings.length > 0
    ? Number((ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(2))
    : null;
  const mostActiveWeek = [...points].sort(
    (a, b) => (b.work + b.friend + b.partner + b.gratitude) - (a.work + a.friend + a.partner + a.gratitude)
  )[0];

  return (
    <main className="px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="flex items-center gap-2 text-3xl font-bold tracking-tight">
            <TrendingUp className="h-7 w-7" /> 趋势分析
          </h1>
          <p className="text-muted-foreground">查看你的反思习惯随时间的变化</p>
        </div>

        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <Label htmlFor="weeks-range" className="m-0">观察窗口</Label>
            <NativeSelect
              id="weeks-range"
              value={String(weeks)}
              onChange={(e) => setWeeks(Number(e.target.value))}
              className="w-auto"
            >
              <option value="4">最近 4 周</option>
              <option value="8">最近 8 周</option>
              <option value="12">最近 12 周</option>
              <option value="26">最近 26 周</option>
              <option value="52">最近 52 周</option>
            </NativeSelect>
          </CardContent>
        </Card>

        {loading ? (
          <p className="text-center text-muted-foreground">加载中...</p>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">总记录数</div><div className="text-2xl font-bold">{totalRecords}</div></CardContent></Card>
              <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground">平均周评分</div><div className="text-2xl font-bold">{avgRating ?? '—'}</div></CardContent></Card>
              <Card>
                <CardContent className="p-4">
                  <div className="text-xs text-muted-foreground">最活跃周</div>
                  <div className="text-sm font-medium mt-1">
                    {mostActiveWeek
                      ? <Link href={`/summary/${mostActiveWeek.weekStart}`} className="text-primary hover:underline">{mostActiveWeek.weekStart}</Link>
                      : '—'}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">记录数趋势</CardTitle>
                <CardDescription>四类记录的每周数量</CardDescription>
              </CardHeader>
              <CardContent>
                <TrendsChart data={points} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">周平均评分趋势</CardTitle>
                <CardDescription>由每日三省的整体评分聚合</CardDescription>
              </CardHeader>
              <CardContent>
                <RatingTrendChart data={points} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">按周浏览</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1 text-sm">
                  {points.slice().reverse().map((p) => {
                    const total = p.work + p.friend + p.partner + p.gratitude;
                    return (
                      <Link
                        key={p.weekStart}
                        href={`/summary/${p.weekStart}`}
                        className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted"
                      >
                        <span className="font-medium">{p.weekStart} – {p.weekEnd}</span>
                        <span className="text-muted-foreground">
                          {total} 条记录
                          {p.avgRating !== null && ` · ${p.avgRating} ★`}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </main>
  );
}
