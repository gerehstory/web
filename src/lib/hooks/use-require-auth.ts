'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/context';

export function useRequireAuth(options?: { admin?: boolean }) {
  const router = useRouter();
  const { user, loading, isAuthenticated, isAdmin } = useAuth();
  const needsAdmin = options?.admin ?? false;
  const allowed = isAuthenticated && (!needsAdmin || isAdmin);

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (needsAdmin && !isAdmin) {
      router.replace('/works');
    }
  }, [loading, isAuthenticated, isAdmin, needsAdmin, router]);

  return { user, loading, ready: !loading && allowed, isAdmin };
}
