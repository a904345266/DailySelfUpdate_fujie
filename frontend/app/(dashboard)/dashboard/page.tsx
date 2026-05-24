'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { Mic, Calendar, Heart, Users, Sparkles, BarChart3, TrendingUp, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthStore } from '@/store/authStore';
import { getDailyRecords, type DailyRecords } from '@/lib/recordsApi';
import { DailyQuoteCard } from '@/components/DailyQuoteCard';

function thisMonday(): string {
  const d = new Date();
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  return format(d, 'yyyy-MM-dd');
}

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const today = format(new Date(), 'yyyy-MM-dd');
  const [data, setData] = useState<DailyRecords | null>(null);

  useEffect(() => {
    getDailyRecords(today).then(setData).catch(() => { /* silent */ });
  }, [today]);

  const cards = [
    { icon: Calendar, label: '工作', count: data?.work.length ?? 0, tint: 'bg-blue-500/10 text-blue-600 dark:text-blue-400' },
    { icon: Users, label: '朋友', count: data?.friends.length ?? 0, tint: 'bg-purple-500/10 text-purple-600 dark:text-purple-400' },
    { icon: Heart, label: '伴侣', count: data?.partner.length ?? 0, tint: 'bg-pink-500/10 text-pink-600 dark:text-pink-400' },
    { icon: Sparkles, label: '感恩', count: data?.gratitude.length ?? 0, tint: 'bg-amber-500/10 text-amber-600 dark:text-amber-400' },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 11 ? '早上好' : hour < 14 ? '中午好' : hour < 18 ? '下午好' : '晚上好';

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6 sm:py-10">
      <div className="animate-rise">
        <h1 className="text-3xl font-bold tracking-tight">
          {greeting}，<span className="text-gradient">{user?.username || user?.email?.split('@')[0]}</span>
        </h1>
        <p className="mt-1 text-muted-foreground">{format(new Date(), 'yyyy 年 M 月 d 日')} · 今天也要三省吾身</p>
      </div>

      {/* Primary CTA */}
      <Card className="animate-rise overflow-hidden border-0 bg-gradient-to-br from-blue-500 via-indigo-600 to-violet-600 text-white shadow-lg" style={{ animationDelay: '60ms' }}>
        <CardContent className="relative flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <h2 className="text-xl font-semibold">开始今天的记录</h2>
            <p className="mt-1 text-sm text-blue-50">语音说出今天的工作、朋友、伴侣与感恩</p>
          </div>
          <Button asChild size="lg" variant="secondary" className="relative gap-2 shadow-md">
            <Link href={`/record/${today}`}><Mic className="h-5 w-5" /> 开始记录</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Today's progress */}
      <div className="grid animate-rise grid-cols-2 gap-3 sm:grid-cols-4" style={{ animationDelay: '120ms' }}>
        {cards.map((c) => {
          const Icon = c.icon;
          const done = c.count > 0;
          return (
            <Link key={c.label} href={`/record/${today}`} className="block">
              <Card className="card-hover h-full">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${c.tint}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        done
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {done ? '已完成' : '未完成'}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-medium">{c.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {done ? `今日 ${c.count} 条` : '今日暂无'}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Insights shortcuts */}
      <div className="grid animate-rise grid-cols-1 gap-3 sm:grid-cols-2" style={{ animationDelay: '180ms' }}>
        <Link href={`/summary/${thisMonday()}`} className="block">
          <Card className="card-hover h-full">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">本周总结</p>
                <p className="text-xs text-muted-foreground">查看本周数据洞察</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
        <Link href="/analysis" className="block">
          <Card className="card-hover h-full">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">趋势分析</p>
                <p className="text-xs text-muted-foreground">跨周的成长轨迹</p>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Daily book quote */}
      <div className="animate-rise" style={{ animationDelay: '240ms' }}>
        <DailyQuoteCard />
      </div>
    </main>
  );
}
