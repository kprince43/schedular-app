'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { loginSchema, LoginFormValues } from '@/lib/validations';
import { useAuthStore } from '@/lib/store';
import { useRedirectIfAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  useRedirectIfAuth();

  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setServerError(null);
    try {
      await login(values);
      router.replace('/dashboard');
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Login failed');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
        <p className="text-slate-500 mt-1.5 text-sm">Sign in to continue to your workspace</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* Server error */}
        {serverError && (
          <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 animate-fade-in">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Email */}
        <div>
          <label htmlFor="email" className="form-label">Email address</label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            {...register('email')}
            className={cn('form-input', errors.email && 'border-red-400 focus:border-red-400 focus:ring-red-400/20')}
          />
          {errors.email && (
            <p className="error-text">
              <AlertCircle className="h-3 w-3" />
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="form-label mb-0">Password</label>
            <Link
              href="/auth/forgot-password"
              className="text-xs text-brand-600 hover:text-brand-700 font-medium transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              {...register('password')}
              className={cn('form-input pr-11', errors.password && 'border-red-400 focus:border-red-400 focus:ring-red-400/20')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="error-text">
              <AlertCircle className="h-3 w-3" />
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit */}
        <button type="submit" disabled={isLoading} className="btn-primary mt-2">
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing in…
            </>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{' '}
        <Link href="/auth/register" className="font-semibold text-brand-600 hover:text-brand-700 transition-colors">
          Create one free
        </Link>
      </p>

      {/* Demo credentials */}
      <div className="mt-8 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
        <p className="text-xs text-slate-500 font-medium mb-2">Demo credentials</p>
        <p className="text-xs text-slate-600 font-mono">demo@scheduler.pro</p>
        <p className="text-xs text-slate-600 font-mono">Demo@123456</p>
      </div>
    </div>
  );
}
