import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { IUser } from '@indiatownship/types';
import { storeTokens, getAccessToken, clearTokens } from '@/lib/auth';
import { loginApi, registerApi, getMe, registerTokenGetter } from '@/lib/api';

interface AuthState {
  user: IUser | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (phone: string, password: string) => Promise<void>;
  register: (name: string, phone: string, password: string, email?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, loading: true });

  useEffect(() => {
    registerTokenGetter(getAccessToken);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessToken();
        if (token) {
          const user = await getMe();
          setState({ user, loading: false });
        } else {
          setState({ user: null, loading: false });
        }
      } catch {
        await clearTokens();
        setState({ user: null, loading: false });
      }
    })();
  }, []);

  const login = useCallback(async (phone: string, password: string) => {
    const data = await loginApi({ phone, password });
    await storeTokens(data.accessToken, data.refreshToken);
    setState({ user: data.user, loading: false });
  }, []);

  const register = useCallback(async (name: string, phone: string, password: string, email?: string) => {
    const data = await registerApi({ name, phone, password, email });
    await storeTokens(data.accessToken, data.refreshToken);
    setState({ user: data.user, loading: false });
  }, []);

  const logout = useCallback(async () => {
    await clearTokens();
    setState({ user: null, loading: false });
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const user = await getMe();
      setState((s) => ({ ...s, user }));
    } catch {
      // ignore
    }
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
