import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  id: string;
  email: string;
  username: string | null;
  emailVerified: boolean;
  tier?: 'free' | 'vip' | string;
  vipExpiresAt?: string | null;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  /** True once persisted state has been loaded from localStorage. */
  hasHydrated: boolean;
  setSession: (user: AuthUser, accessToken: string, refreshToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setUser: (user: AuthUser | null) => void;
  setHasHydrated: (v: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      hasHydrated: false,
      setSession: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken }),
      setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
      setUser: (user) => set({ user }),
      setHasHydrated: (v) => set({ hasHydrated: v }),
      logout: () => set({ user: null, accessToken: null, refreshToken: null }),
    }),
    {
      name: 'dailyselfupdate-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
      // Mark hydration done so AuthGuard waits for localStorage before judging.
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
