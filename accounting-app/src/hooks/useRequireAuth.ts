"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';

export function useRequireAuth(redirectTo = '/login') {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push(redirectTo);
    }
  }, [router, redirectTo]);

  return isAuthenticated();
} 