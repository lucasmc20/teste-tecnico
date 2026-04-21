'use client';

import { useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/field';
import { useAuth } from '@/providers/auth-provider';
import { useToast } from '@/providers/toast-provider';

interface Props {
  onClose: () => void;
}

interface LoginForm {
  username: string;
  password: string;
}

export function LoginModal({ onClose }: Props) {
  const { login } = useAuth();
  const { notify } = useToast();
  const backdropRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>();

  const onSubmit = async ({ username, password }: LoginForm) => {
    try {
      await login(username, password);
      notify('Login realizado com sucesso.', 'success');
      onClose();
    } catch {
      notify('Credenciais inválidas.', 'error');
    }
  };

  return (
    <div
      ref={backdropRef}
      role="dialog"
      aria-modal="true"
      aria-label="Login"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
    >
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-base font-semibold text-slate-900">Entrar</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <Field label="Usuário" htmlFor="username" error={errors.username?.message}>
            <Input
              id="username"
              autoComplete="username"
              {...register('username', { required: 'Informe o usuário' })}
            />
          </Field>
          <Field label="Senha" htmlFor="password" error={errors.password?.message}>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              {...register('password', { required: 'Informe a senha' })}
            />
          </Field>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Entrar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
