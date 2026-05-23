'use client';

import { useEffect } from 'react';
import { applyTheme, useThemeStore } from '@/store/themeStore';

/**
 * Applies the persisted theme on mount and keeps it in sync with OS changes
 * when the user has chosen "system".
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    applyTheme(theme);

    if (theme !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme('system');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [theme]);

  return <>{children}</>;
}
