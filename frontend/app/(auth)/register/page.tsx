'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { registerApi } from '@/lib/authApi';
import { useAuthStore } from '@/store/authStore';
import { extractErrorMessage } from '@/lib/api';

const schema = z.object({
  email: z.string().email('邮箱格式不正确'),
  username: z.string().trim().max(100).optional().or(z.literal('')),
  password: z
    .string()
    .min(8, '密码至少 8 位')
    .regex(/[A-Za-z]/, '密码必须包含字母')
    .regex(/\d/, '密码必须包含数字'),
  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: '请阅读并同意用户协议' }),
  }),
});

type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const res = await registerApi({
        email: values.email,
        password: values.password,
        username: values.username || undefined,
        agreeToTerms: true,
      });
      setSession(res.user, res.tokens.accessToken, res.tokens.refreshToken);
      toast.success('注册成功，已为你登录');
      router.push('/dashboard');
    } catch (err) {
      toast.error(extractErrorMessage(err, '注册失败'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>创建账号</CardTitle>
        <CardDescription>开启你的每日自我反思之旅</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">邮箱 *</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">用户名（可选）</Label>
            <Input
              id="username"
              type="text"
              autoComplete="nickname"
              placeholder="留空可稍后设置"
              {...register('username')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">密码 *</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              {...register('password')}
            />
            <p className="text-xs text-muted-foreground">至少 8 位，包含字母和数字</p>
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="flex items-start gap-2 text-sm">
              <Checkbox id="agreeToTerms" {...register('agreeToTerms')} />
              <span className="leading-tight">
                我已阅读并同意《用户协议》和《隐私政策》
              </span>
            </label>
            {errors.agreeToTerms && (
              <p className="text-sm text-destructive">{errors.agreeToTerms.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? '注册中...' : '注册'}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            已有账号？{' '}
            <Link href="/login" className="text-primary hover:underline">
              立即登录
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
