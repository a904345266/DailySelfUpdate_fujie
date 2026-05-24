'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  // Gate on the long-lived refresh token: an expired access token will be
  // refreshed automatically by the axios interceptor, so the user stays logged
  // in for the full refresh-token lifetime (7d) without re-login.
  const refreshToken = useAuthStore((s) => s.refreshToken);

  useEffect(() => {
    // Only decide AFTER persisted state has loaded from localStorage,
    // otherwise we'd bounce a logged-in user on first paint.
    if (hasHydrated && !refreshToken) {
      router.replace('/login');
    }
  }, [hasHydrated, refreshToken, router]);

  // Still loading persisted session — don't render or redirect yet.
  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        加载中...
      </div>
    );
  }

  // Hydrated but no session → redirect is in flight; render nothing.
  if (!refreshToken) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted-foreground">
        正在跳转登录…
      </div>
    );
  }

  return <>{children}</>;
}
