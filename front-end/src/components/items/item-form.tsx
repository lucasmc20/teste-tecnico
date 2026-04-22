'use client';

import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Field, Textarea } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { itemSchema, ItemFormValues } from '@/lib/schemas';
import type { Item, ItemInput } from '@/lib/types';

export interface ItemFormProps {
  initialValue?: Item | null;
  submitting?: boolean;
  onSubmit: (data: ItemInput) => void | Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
}

export function ItemForm({
  initialValue,
  onSubmit,
  onCancel,
  submitting,
  submitLabel,
}: ItemFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<ItemFormValues>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      name: '',
      description: null,
      price: 0,
      stock: 0,
    },
  });

  useEffect(() => {
    if (initialValue) {
      reset({
        name: initialValue.name,
        description: initialValue.description ?? null,
        price: initialValue.price,
        stock: initialValue.stock,
      });
    } else {
      reset({ name: '', description: null, price: 0, stock: 0 });
    }
  }, [initialValue, reset]);

  const handleFormSubmit = async (values: ItemFormValues) => {
    await onSubmit({
      name: values.name,
      description: values.description ?? null,
      price: values.price,
      stock: values.stock,
    });
    if (!initialValue) reset({ name: '', description: null, price: 0, stock: 0 });
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6"
      noValidate
    >
      <div className="flex flex-col gap-1">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-600">
          Cadastro de item
        </p>
        <h2 className="text-lg font-semibold text-slate-900">
          {initialValue ? 'Editar item' : 'Novo item'}
        </h2>
        <p className="text-sm text-slate-500">
          Preencha as seções abaixo para manter o inventário padronizado.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
            Identificação
          </p>
          <div className="mt-3">
            <Field htmlFor="name" label="Nome" error={errors.name?.message}>
              <Input
                id="name"
                placeholder="Ex.: Teclado Mecânico"
                autoComplete="off"
                {...register('name')}
              />
            </Field>
          </div>
          <div className="mt-4">
            <Field
              htmlFor="description"
              label="Descrição"
              error={errors.description?.message}
              hint="Opcional - até 500 caracteres"
            >
              <Controller
                control={control}
                name="description"
                render={({ field }) => (
                  <Textarea
                    id="description"
                    placeholder="Detalhes, características, observações..."
                    value={field.value ?? ''}
                    onBlur={field.onBlur}
                    onChange={(e) => field.onChange(e.target.value.trim() ? e.target.value : null)}
                    name={field.name}
                    ref={field.ref}
                  />
                )}
              />
            </Field>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-600">
            Comercial
          </p>
          <div className="mt-3 grid gap-4">
            <Field htmlFor="price" label="Preço (R$)" error={errors.price?.message}>
              <Controller
                control={control}
                name="price"
                render={({ field }) => (
                  <Input
                    id="price"
                    type="number"
                    inputMode="decimal"
                    step="0.01"
                    min="0"
                    placeholder="0,00"
                    value={Number.isFinite(field.value) ? field.value : ''}
                    onChange={(e) => {
                      const next = e.target.valueAsNumber;
                      field.onChange(Number.isNaN(next) ? 0 : next);
                    }}
                  />
                )}
              />
            </Field>

            <Field htmlFor="stock" label="Estoque" error={errors.stock?.message}>
              <Controller
                control={control}
                name="stock"
                render={({ field }) => (
                  <Input
                    id="stock"
                    type="number"
                    inputMode="numeric"
                    step="1"
                    min="0"
                    placeholder="0"
                    value={Number.isFinite(field.value) ? field.value : ''}
                    onChange={(e) => {
                      const next = e.target.valueAsNumber;
                      field.onChange(Number.isNaN(next) ? 0 : next);
                    }}
                  />
                )}
              />
            </Field>
          </div>
        </section>
      </div>

      <div className="flex items-center justify-end gap-2">
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel} disabled={submitting}>
            Cancelar
          </Button>
        ) : null}
        <Button type="submit" loading={submitting}>
          {submitLabel ?? (initialValue ? 'Salvar alterações' : 'Adicionar item')}
        </Button>
      </div>
    </form>
  );
}

