'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';

interface AuthGuardProps {
  children: ReactNode;
}

/**
 * Protege rotas autenticadas.
 * Redireciona para /login?next=<rota-atual> quando não há sessão válida.
 * Segue SRP: única responsabilidade é garantir que apenas usuários
 * autenticados acessem o conteúdo encapsulado.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const { token } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (token === null) {
      const next = encodeURIComponent(pathname);
      router.replace(`/login?next=${next}`);
    }
  }, [token, router, pathname]);

  if (token === null) {
    return null;
  }

  return <>{children}</>;
}
