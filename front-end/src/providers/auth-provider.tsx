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

const base64UrlDecode = (value: string): string => {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (padded.length % 4)) % 4;
  return atob(`${padded}${'='.repeat(padLength)}`);
};

const isExpiredToken = (token: string): boolean => {
  try {
    const [, payload] = token.split('.');
    if (!payload) return true;
    const parsed = JSON.parse(base64UrlDecode(payload)) as { exp?: number };
    if (!parsed.exp) return false;
    return Date.now() / 1000 >= parsed.exp;
  } catch {
    return true;
  }
};

const parseAuthError = async (res: Response, fallback: string) => {
  try {
    const payload = (await res.json()) as { message?: string };
    return payload.message ?? fallback;
  } catch {
    return fallback;
  }
};

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
    const stored = sessionStorage.getItem(TOKEN_KEY);
    if (!stored) return null;
    if (isExpiredToken(stored)) {
      sessionStorage.removeItem(TOKEN_KEY);
      sessionStorage.removeItem(USERNAME_KEY);
      return null;
    }
    return stored;
  });
  const [username, setUsername] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const tokenStored = sessionStorage.getItem(TOKEN_KEY);
    if (!tokenStored || isExpiredToken(tokenStored)) return null;
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
    if (!res.ok) {
      throw new Error(await parseAuthError(res, 'Credenciais inválidas'));
    }
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
      throw new Error(await parseAuthError(res, 'Não foi possível cadastrar'));
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
