'use client';

import { Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/providers/auth-provider';
import { useToast } from '@/providers/toast-provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

interface RegisterFormData {
  username: string;
  password: string;
}

function RegisterPageContent() {
  const { register: registerUser, token } = useAuth();
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
  } = useForm<RegisterFormData>();

  const onSubmit = async ({ username, password }: RegisterFormData) => {
    try {
      await registerUser(username, password);
      notify('Cadastro realizado com sucesso.', 'success');
      router.push(next);
    } catch (error) {
      notify(error instanceof Error ? error.message : 'Não foi possível cadastrar.', 'error');
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#dbeafe,_transparent_45%),radial-gradient(circle_at_bottom_left,_#dcfce7,_transparent_40%)]" />
      <Card className="relative w-full max-w-5xl overflow-hidden rounded-3xl border-slate-200/90 bg-white/95 shadow-xl backdrop-blur">
        <div className="grid md:grid-cols-[1.15fr_1fr]">
          <section className="border-b border-slate-200 p-8 md:border-b-0 md:border-r md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Novo acesso
            </p>
            <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-slate-900">
              Crie sua conta
            </h1>
            <p className="mt-4 max-w-md text-sm text-slate-600">
              Inicie seu ambiente com autenticação e controle de itens em uma interface moderna.
            </p>
            <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
              Após o cadastro, você será autenticado automaticamente para acessar o sistema.
            </div>
          </section>

          <section className="p-8 md:p-10">
            <CardHeader className="p-0">
              <CardTitle className="text-2xl">Registre-se</CardTitle>
              <CardDescription>
                Configure seu usuário para começar.
              </CardDescription>
            </CardHeader>

            <CardContent className="mt-6 p-0">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                <Field label="Usuário" htmlFor="register-username" error={errors.username?.message}>
                  <Input
                    id="register-username"
                    autoComplete="username"
                    placeholder="Escolha um usuário"
                    {...register('username', {
                      required: 'Informe o usuário',
                      minLength: { value: 3, message: 'Mínimo de 3 caracteres' },
                    })}
                  />
                </Field>
                <Field label="Senha" htmlFor="register-password" error={errors.password?.message}>
                  <Input
                    id="register-password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Crie uma senha segura"
                    {...register('password', {
                      required: 'Informe a senha',
                      minLength: { value: 4, message: 'Mínimo de 4 caracteres' },
                    })}
                  />
                </Field>
                <Button type="submit" className="mt-2 w-full" loading={isSubmitting}>
                  Criar conta
                </Button>
              </form>

              <p className="mt-5 text-center text-sm text-slate-600">
                Já possui acesso?{' '}
                <Link
                  className="font-semibold text-brand-600 underline-offset-2 hover:underline"
                  href={`/login?next=${encodeURIComponent(next)}`}
                >
                  Entrar
                </Link>
              </p>
            </CardContent>
          </section>
        </div>
      </Card>
    </main>
  );
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center px-4 py-12">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-xl">Registre-se</CardTitle>
              <CardDescription>Carregando...</CardDescription>
            </CardHeader>
          </Card>
        </main>
      }
    >
      <RegisterPageContent />
    </Suspense>
  );
}
