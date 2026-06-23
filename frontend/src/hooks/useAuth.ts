'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import Cookies from 'js-cookie';

export function useRequireAuth() {
  const router = useRouter();
  const { isAuthenticated, isLoading, fetchUser, user } = useAuthStore();

  useEffect(() => {
    const token = Cookies.get('accessToken');
    if (!token && !isAuthenticated) {
      router.replace('/auth/login');
      return;
    }
    if (token && !user) {
      fetchUser();
    }
  }, [isAuthenticated, user, router, fetchUser]);

  return { isAuthenticated, isLoading, user };
}

export function useRedirectIfAuth() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, router]);
}
