'use client';

import { useEffect, useState } from 'react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useThemeStore, type Theme } from '@/store/themeStore';

const OPTIONS: Array<{ value: Theme; icon: React.ElementType; label: string }> = [
  { value: 'light', icon: Sun, label: '浅色' },
  { value: 'dark', icon: Moon, label: '深色' },
  { value: 'system', icon: Monitor, label: '跟随系统' },
];

export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const setTheme = useThemeStore((s) => s.setTheme);
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch — store is rehydrated client-side only.
  useEffect(() => setMounted(true), []);
  if (!mounted) {
    return <div className="h-9 w-[108px] rounded-full bg-muted" aria-hidden />;
  }

  return (
    <div className="inline-flex items-center gap-0.5 rounded-full border border-border bg-muted/50 p-0.5">
      {OPTIONS.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          type="button"
          onClick={() => setTheme(value)}
          title={label}
          aria-label={label}
          aria-pressed={theme === value}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full transition-colors',
            theme === value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          )}
        >
          <Icon className="h-4 w-4" />
        </button>
      ))}
    </div>
  );
}
