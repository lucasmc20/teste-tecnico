'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/providers/auth-provider';
import { useToast } from '@/providers/toast-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

interface CredentialsForm {
  username: string;
  password: string;
}

function LoginPageContent() {
  const { login, token } = useAuth();
  const { notify } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';

  useEffect(() => {
    if (token) {
      router.replace(next);
    }
  }, [token, router, next]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CredentialsForm>();

  const onSubmit = async ({ username, password }: CredentialsForm) => {
    try {
      await login(username, password);
      notify('Login realizado com sucesso.', 'success');
      router.push(next);
    } catch {
      notify('Credenciais inválidas.', 'error');
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_#dbeafe,_transparent_45%),radial-gradient(circle_at_bottom_right,_#ccfbf1,_transparent_40%)]" />
      <Card className="relative w-full max-w-5xl overflow-hidden rounded-3xl border-slate-200/90 bg-white/95 shadow-xl backdrop-blur">
        <div className="grid md:grid-cols-[1.15fr_1fr]">
          <section className="border-b border-slate-200 p-8 md:border-b-0 md:border-r md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
              Gestão de itens
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-slate-900">
              Entre para acessar seu painel
            </h1>
            <p className="mt-4 max-w-md text-sm text-slate-600">
              Controle total do inventário com cadastro estruturado, pesquisa rápida e visão tabular.
            </p>
            <div className="mt-8 grid gap-3 text-sm text-slate-600">
              <div className="rounded-xl border border-slate-200 bg-slate-50/90 p-3">
                Atualizações em tempo real com React Query.
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/90 p-3">
                Fluxo seguro para criar, editar e excluir itens.
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50/90 p-3">
                Interface focada em produtividade operacional.
              </div>
            </div>
          </section>

          <section className="p-8 md:p-10">
            <CardHeader className="p-0">
              <CardTitle className="text-2xl">Acesso</CardTitle>
              <CardDescription>
                Use suas credenciais para entrar no sistema.
              </CardDescription>
            </CardHeader>

            <CardContent className="mt-6 p-0">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <Field label="Usuário" htmlFor="login-username" error={errors.username?.message}>
                  <Input
                    id="login-username"
                    autoComplete="username"
                    placeholder="Seu usuário"
                    {...register('username', { required: 'Informe o usuário' })}
                  />
                </Field>
                <Field label="Senha" htmlFor="login-password" error={errors.password?.message}>
                  <Input
                    id="login-password"
                    type="password"
                    autoComplete="current-password"
                    placeholder="Sua senha"
                    {...register('password', { required: 'Informe a senha' })}
                  />
                </Field>
                <Button type="submit" className="mt-2 w-full" loading={isSubmitting}>
                  Entrar
                </Button>
              </form>

              <p className="mt-5 text-center text-sm text-slate-600">
                Ainda não tem conta?{' '}
                <Link
                  className="font-semibold text-brand-600 underline-offset-2 hover:underline"
                  href={`/register?next=${encodeURIComponent(next)}`}
                >
                  Registre-se
                </Link>
              </p>
            </CardContent>
          </section>
        </div>
      </Card>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[70vh] items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-xl">Acesso ao sistema</CardTitle>
              <CardDescription>Carregando autenticação...</CardDescription>
            </CardHeader>
          </Card>
        </main>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
