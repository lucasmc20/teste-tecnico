'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import { clientApiBase } from '@/lib/api';

interface AuthContextValue {
  token: string | null;
  username: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const TOKEN_KEY = 'auth_token';
const USERNAME_KEY = 'auth_username';

interface AuthResponse {
  data: {
    token: string;
    username: string;
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  // Token persiste apenas na sessão atual do navegador.
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(TOKEN_KEY);
  });
  const [username, setUsername] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(USERNAME_KEY);
  });

  const persistAuth = useCallback((nextToken: string, nextUsername: string) => {
    sessionStorage.setItem(TOKEN_KEY, nextToken);
    sessionStorage.setItem(USERNAME_KEY, nextUsername);
    setToken(nextToken);
    setUsername(nextUsername);
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const res = await fetch(`${clientApiBase()}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) throw new Error('Credenciais inválidas');
    const { data } = (await res.json()) as AuthResponse;
    persistAuth(data.token, data.username);
  }, [persistAuth]);

  const register = useCallback(async (username: string, password: string) => {
    const res = await fetch(`${clientApiBase()}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      const payload = (await res.json().catch(() => ({}))) as { message?: string };
      throw new Error(payload.message ?? 'Não foi possível cadastrar');
    }

    const { data } = (await res.json()) as AuthResponse;
    persistAuth(data.token, data.username);
  }, [persistAuth]);

  const logout = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USERNAME_KEY);
    setToken(null);
    setUsername(null);
  }, []);

  const value = useMemo(
    () => ({ token, username, login, register, logout }),
    [token, username, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
};
