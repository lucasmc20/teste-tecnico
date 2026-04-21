'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Item } from '@/lib/types';

type SortableColumn = 'name' | 'price' | 'stock' | 'updatedAt';
type SortDirection = 'asc' | 'desc';

interface SortState {
  column: SortableColumn;
  direction: SortDirection;
}

interface ItemDataTableProps {
  items: Item[];
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
  deletingId?: string | null;
}

function nextSort(current: SortState, column: SortableColumn): SortState {
  if (current.column !== column) {
    return { column, direction: 'asc' };
  }

  return {
    column,
    direction: current.direction === 'asc' ? 'desc' : 'asc',
  };
}

const sortLabel: Record<SortableColumn, string> = {
  name: 'Nome',
  price: 'Preço',
  stock: 'Estoque',
  updatedAt: 'Atualizado',
};

function compareItems(a: Item, b: Item, sort: SortState) {
  const factor = sort.direction === 'asc' ? 1 : -1;

  if (sort.column === 'name') {
    return a.name.localeCompare(b.name, 'pt-BR') * factor;
  }

  if (sort.column === 'price') {
    return (a.price - b.price) * factor;
  }

  if (sort.column === 'stock') {
    return (a.stock - b.stock) * factor;
  }

  return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * factor;
}

export function ItemDataTable({ items, onEdit, onDelete, deletingId }: ItemDataTableProps) {
  const [sort, setSort] = useState<SortState>({ column: 'updatedAt', direction: 'desc' });

  const sortedItems = useMemo(
    () => [...items].sort((a, b) => compareItems(a, b, sort)),
    [items, sort],
  );

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
        Nenhum item encontrado para os filtros atuais.
      </div>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-900">Data-table de itens</h3>
        <p className="text-xs text-slate-500">
          Ordenado por {sortLabel[sort.column]} ({sort.direction === 'asc' ? 'crescente' : 'decrescente'})
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[780px] w-full border-collapse">
          <thead>
            <tr className="text-left text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900"
                  onClick={() => setSort((prev) => nextSort(prev, 'name'))}
                >
                  Nome
                </button>
              </th>
              <th className="px-4 py-3">Descrição</th>
              <th className="px-4 py-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900"
                  onClick={() => setSort((prev) => nextSort(prev, 'price'))}
                >
                  Preço
                </button>
              </th>
              <th className="px-4 py-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900"
                  onClick={() => setSort((prev) => nextSort(prev, 'stock'))}
                >
                  Estoque
                </button>
              </th>
              <th className="px-4 py-3">
                <button
                  type="button"
                  className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900"
                  onClick={() => setSort((prev) => nextSort(prev, 'updatedAt'))}
                >
                  Atualizado
                </button>
              </th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {sortedItems.map((item, index) => (
              <tr key={item.id} className="border-t border-slate-100 text-sm text-slate-700 hover:bg-slate-50/70">
                <td className="px-4 py-3 text-slate-400">{index + 1}</td>
                <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                <td className="max-w-[280px] px-4 py-3 text-slate-600">
                  <div className="line-clamp-2">{item.description ?? 'Sem descrição'}</div>
                </td>
                <td className="px-4 py-3">{formatCurrency(item.price)}</td>
                <td className="px-4 py-3">{item.stock}</td>
                <td className="px-4 py-3 text-slate-500">{formatDate(item.updatedAt)}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="secondary" onClick={() => onEdit(item)}>
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      loading={deletingId === item.id}
                      onClick={() => onDelete(item)}
                    >
                      Excluir
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
