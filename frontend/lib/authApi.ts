import { api } from './api';
import type { AuthUser } from '@/store/authStore';

export interface AuthSuccess {
  success: true;
  user: AuthUser;
  tokens: { accessToken: string; refreshToken: string; expiresIn: number };
}

export async function registerApi(input: {
  email: string;
  password: string;
  username?: string;
  agreeToTerms: true;
}): Promise<AuthSuccess> {
  const res = await api.post('/auth/register', input);
  return res.data;
}

export async function loginApi(input: {
  email: string;
  password: string;
  rememberMe?: boolean;
}): Promise<AuthSuccess> {
  const res = await api.post('/auth/login', input);
  return res.data;
}

export async function logoutApi(refreshToken: string | null): Promise<void> {
  await api.post('/auth/logout', refreshToken ? { refreshToken } : {});
}

export async function forgotPasswordApi(email: string): Promise<{ message: string }> {
  const res = await api.post('/auth/forgot-password', { email });
  return res.data;
}

export async function resetPasswordApi(
  token: string,
  password: string
): Promise<{ message: string }> {
  const res = await api.post('/auth/reset-password', { token, password });
  return res.data;
}

export async function meApi(): Promise<AuthUser> {
  const res = await api.get('/auth/me');
  return res.data.user;
}
