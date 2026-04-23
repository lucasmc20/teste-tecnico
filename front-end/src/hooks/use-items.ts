'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import { itemsApi, ListResponse } from '@/lib/api';
import type { Item, ItemInput } from '@/lib/types';

export const ITEMS_KEY = ['items'] as const;

interface UseItemsOptions {
  initialData?: Item[];
  search?: string;
  page?: number;
  limit?: number;
}

export function useItems({ initialData, search, page = 1, limit = 20 }: UseItemsOptions = {}) {
  return useQuery<ListResponse>({
    queryKey: [...ITEMS_KEY, { search, page, limit }],
    queryFn: () => itemsApi.list({ search, page, limit }),
    // initialData só faz sentido na primeira página sem filtro
    initialData: initialData && initialData.length > 0 && !search && page === 1
      ? { items: initialData, total: initialData.length, page: 1, limit }
      : undefined,
    placeholderData: (prev) => prev,
  });
}

export function useCreateItem(token?: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ItemInput) => itemsApi.create(payload, token),
    onSuccess: () => {
      // Invalida o cache para forçar refetch com paginação/filtros preservados.
      qc.invalidateQueries({ queryKey: ITEMS_KEY });
    },
  });
}

export function useUpdateItem(token?: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ItemInput> }) =>
      itemsApi.update(id, data, token),
    onSuccess: (updated) => {
      // Atualiza o item no cache de todas as queries de listagem ativas.
      qc.setQueriesData<ListResponse>({ queryKey: ITEMS_KEY }, (prev) =>
        prev
          ? { ...prev, items: prev.items.map((i) => (i.id === updated.id ? updated : i)) }
          : prev,
      );
    },
  });
}

export function useDeleteItem(token?: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => itemsApi.remove(id, token),
    onSuccess: (_data, id) => {
      qc.setQueriesData<ListResponse>({ queryKey: ITEMS_KEY }, (prev) =>
        prev
          ? {
              ...prev,
              items: prev.items.filter((i) => i.id !== id),
              total: Math.max(0, prev.total - 1),
            }
          : prev,
      );
      qc.invalidateQueries({ queryKey: ITEMS_KEY });
    },
  });
}
