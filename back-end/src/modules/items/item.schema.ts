import { z } from 'zod';

const nameSchema = z
  .string({ required_error: 'O nome é obrigatório' })
  .trim()
  .min(2, 'O nome deve ter pelo menos 2 caracteres')
  .max(120, 'O nome deve ter no máximo 120 caracteres');

const descriptionSchema = z
  .string()
  .trim()
  .max(500, 'A descrição deve ter no máximo 500 caracteres')
  .optional()
  .nullable()
  .transform((value) => (value === undefined || value === '' ? null : value));

const priceSchema = z
  .number({ invalid_type_error: 'O preço deve ser numérico' })
  .nonnegative('O preço não pode ser negativo')
  .max(1_000_000, 'Preço acima do permitido');

const stockSchema = z
  .number({ invalid_type_error: 'O estoque deve ser numérico' })
  .int('O estoque deve ser inteiro')
  .nonnegative('O estoque não pode ser negativo');

export const createItemSchema = z.object({
  name: nameSchema,
  description: descriptionSchema,
  price: priceSchema,
  stock: stockSchema,
});

export const updateItemSchema = createItemSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'Informe ao menos um campo para atualizar' },
);

export const idParamSchema = z.object({
  id: z.string().uuid('ID inválido'),
});

export const listQuerySchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export type CreateItemDTO = z.infer<typeof createItemSchema>;
export type UpdateItemDTO = z.infer<typeof updateItemSchema>;
export type ListQueryDTO = z.infer<typeof listQuerySchema>;
