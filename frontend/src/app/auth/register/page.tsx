'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, AlertCircle, Check } from 'lucide-react';
import { registerSchema, RegisterFormValues } from '@/lib/validations';
import { useAuthStore } from '@/lib/store';
import { useRedirectIfAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const passwordRules = [
  { label: 'At least 8 characters', test: (v: string) => v.length >= 8 },
  { label: 'One uppercase letter', test: (v: string) => /[A-Z]/.test(v) },
  { label: 'One lowercase letter', test: (v: string) => /[a-z]/.test(v) },
  { label: 'One number', test: (v: string) => /\d/.test(v) },
];

export default function RegisterPage() {
  useRedirectIfAuth();

  const router = useRouter();
  const { register: signup, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
    mode: 'onChange',
  });

  const passwordValue = watch('password') || '';

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError(null);
    try {
      await signup(values);
      router.replace('/dashboard');
    } catch (err: unknown) {
      setServerError(err instanceof Error ? err.message : 'Registration failed');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
        <p className="text-slate-500 mt-1.5 text-sm">Free forever. No credit card required.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {serverError && (
          <div className="flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 animate-fade-in">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        {/* Name */}
        <div>
          <label htmlFor="name" className="form-label">Full name</label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Alex Johnson"
            {...register('name')}
            className={cn('form-input', errors.name && 'border-red-400 focus:border-red-400 focus:ring-red-400/20')}
          />
          {errors.name && (
            <p className="error-text"><AlertCircle className="h-3 w-3" />{errors.name.message}</p>
          )}
        </div>

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
            <p className="error-text"><AlertCircle className="h-3 w-3" />{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="form-label">Password</label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Create a strong password"
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

          {/* Password strength indicators */}
          {passwordValue && (
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {passwordRules.map(({ label, test }) => {
                const passed = test(passwordValue);
                return (
                  <div key={label} className={cn('flex items-center gap-1.5 text-xs transition-colors', passed ? 'text-emerald-600' : 'text-slate-400')}>
                    <div className={cn('w-3.5 h-3.5 rounded-full flex items-center justify-center border transition-all', passed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300')}>
                      {passed && <Check className="h-2 w-2 text-white" strokeWidth={3} />}
                    </div>
                    {label}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="form-label">Confirm password</label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirm ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Repeat your password"
              {...register('confirmPassword')}
              className={cn('form-input pr-11', errors.confirmPassword && 'border-red-400 focus:border-red-400 focus:ring-red-400/20')}
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="error-text"><AlertCircle className="h-3 w-3" />{errors.confirmPassword.message}</p>
          )}
        </div>

        <button type="submit" disabled={isLoading} className="btn-primary mt-2">
          {isLoading ? (
            <><Loader2 className="h-4 w-4 animate-spin" />Creating account…</>
          ) : (
            'Create account'
          )}
        </button>

        <p className="text-xs text-slate-400 text-center">
          By signing up, you agree to our{' '}
          <Link href="/terms" className="text-brand-600 hover:underline">Terms</Link>{' '}
          and{' '}
          <Link href="/privacy" className="text-brand-600 hover:underline">Privacy Policy</Link>.
        </p>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link href="/auth/login" className="font-semibold text-brand-600 hover:text-brand-700 transition-colors">
          Sign in
        </Link>
      </p>
    </div>
  );
}
