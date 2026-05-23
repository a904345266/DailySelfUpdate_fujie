'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Home, History, BarChart3, TrendingUp, Settings, LogOut, Menu, X, NotebookPen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { useAuthStore } from '@/store/authStore';
import { logoutApi } from '@/lib/authApi';

function thisMonday(): string {
  const d = new Date();
  const day = d.getDay();
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day));
  return format(d, 'yyyy-MM-dd');
}

export function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const logout = useAuthStore((s) => s.logout);
  const [mobileOpen, setMobileOpen] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');

  const links = [
    { href: '/dashboard', label: '主页', icon: Home },
    { href: `/record/${today}`, label: '记录', icon: NotebookPen, match: '/record' },
    { href: '/history', label: '历史', icon: History },
    { href: `/summary/${thisMonday()}`, label: '周总结', icon: BarChart3, match: '/summary' },
    { href: '/analysis', label: '趋势', icon: TrendingUp },
    { href: '/settings', label: '设置', icon: Settings },
  ];

  const isActive = (href: string, match?: string) =>
    match ? pathname.startsWith(match) : pathname === href;

  const handleLogout = async () => {
    try { await logoutApi(refreshToken); } catch { /* ignore */ }
    logout();
    toast.success('已登出');
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b glass">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-2 px-4 sm:px-6">
        {/* Brand */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-sm">
            <NotebookPen className="h-5 w-5" />
          </div>
          <span className="hidden text-base font-bold tracking-tight sm:inline">
            Daily<span className="text-gradient">SelfUpdate</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {links.map(({ href, label, icon: Icon, match }) => (
            <Link
              key={label}
              href={href}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive(href, match)
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-accent hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={handleLogout} className="hidden md:inline-flex" title="登出">
            <LogOut className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="菜单"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <nav className="border-t bg-background md:hidden">
          <div className="mx-auto max-w-5xl space-y-1 px-4 py-3">
            {links.map(({ href, label, icon: Icon, match }) => (
              <Link
                key={label}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium',
                  isActive(href, match)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              登出{user?.email ? `（${user.email}）` : ''}
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
