import { z } from 'zod';

export const itemSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Mínimo 2 caracteres')
    .max(120, 'Máximo 120 caracteres'),
  description: z
    .string()
    .trim()
    .max(500, 'Máximo 500 caracteres')
    .nullable(),
  price: z
    .number({ error: 'Preço deve ser numérico' })
    .nonnegative('Não pode ser negativo')
    .max(1_000_000, 'Preço acima do permitido'),
  stock: z
    .number({ error: 'Estoque deve ser numérico' })
    .int('Deve ser inteiro')
    .nonnegative('Não pode ser negativo'),
});

export type ItemFormValues = z.infer<typeof itemSchema>;
