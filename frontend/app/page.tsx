import Link from 'next/link';
import { Mic, NotebookPen, BarChart3, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

const FEATURES = [
  { icon: Mic, title: '语音优先', desc: '点一下麦克风，开口即记录，反思不再是负担' },
  { icon: NotebookPen, title: '五维记录', desc: '工作、朋友、伴侣、感恩、每日三省，全面回顾每一天' },
  { icon: BarChart3, title: '智能周总结', desc: '自动统计与图表，发现你的情绪与成长趋势' },
  { icon: Sparkles, title: '成长洞察', desc: '基于数据的个性化建议，帮你持续精进' },
];

export default function HomePage() {
  return (
    <main className="relative min-h-screen app-gradient">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-sm">
            <NotebookPen className="h-5 w-5" />
          </div>
          <span className="text-base font-bold tracking-tight">
            Daily<span className="text-gradient">SelfUpdate</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/login">登录</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 pb-12 pt-12 text-center sm:pt-20">
        <div className="animate-rise inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" /> 吾日三省吾身 · 语音优先的成长记录
        </div>
        <h1 className="animate-rise mt-6 text-4xl font-bold tracking-tight sm:text-6xl" style={{ animationDelay: '60ms' }}>
          每一天，<br className="sm:hidden" />都值得<span className="text-gradient">认真复盘</span>
        </h1>
        <p className="animate-rise mx-auto mt-6 max-w-xl text-base text-muted-foreground sm:text-lg" style={{ animationDelay: '120ms' }}>
          用语音轻松记录工作、人际与感恩，让 DailySelfUpdate 帮你看见自己的成长轨迹。
        </p>
        <div className="animate-rise mt-10 flex flex-col justify-center gap-3 sm:flex-row" style={{ animationDelay: '180ms' }}>
          <Button asChild size="lg" className="gap-2 shadow-md">
            <Link href="/register"><Mic className="h-5 w-5" /> 免费开始</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/login">已有账号，登录</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-4 px-6 pb-20 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f, i) => {
          const Icon = f.icon;
          return (
            <div
              key={f.title}
              className="card-hover animate-rise rounded-2xl border bg-card p-6 shadow-sm"
              style={{ animationDelay: `${240 + i * 60}ms` }}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/15 to-violet-500/15 text-primary">
                <Icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-semibold">{f.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{f.desc}</p>
            </div>
          );
        })}
      </section>
    </main>
  );
}
