'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { requestOtp, verifyOtp } from '@/lib/api/auth';
import { getMe } from '@/lib/api/users';
import { clearToken, getToken, setToken } from '@/lib/auth/token';
import type { User } from '@/types/api';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (phone: string, code: string) => Promise<void>;
  requestCode: (phone: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      return;
    }

    try {
      const me = await getMe();
      setUser(me);
    } catch {
      clearToken();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    void Promise.resolve()
      .then(() => refreshUser())
      .finally(() => setLoading(false));
  }, [refreshUser]);

  const requestCode = useCallback(async (phone: string) => {
    await requestOtp({ phone });
  }, []);

  const login = useCallback(
    async (phone: string, code: string) => {
      const response = await verifyOtp({ phone, code });
      const token = response.token;
      if (!token) throw new Error('توکن دریافت نشد');
      setToken(token);
      await refreshUser();
    },
    [refreshUser]
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      login,
      requestCode,
      logout,
      refreshUser,
    }),
    [user, loading, login, requestCode, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
