'use client';

import { Button } from '@/components/ui/button';
import { formatCurrency, formatDate } from '@/lib/format';
import type { Item } from '@/lib/types';

interface ItemListProps {
  items: Item[];
  onEdit: (item: Item) => void;
  onDelete: (item: Item) => void;
  deletingId?: string | null;
}

export function ItemList({ items, onEdit, onDelete, deletingId }: ItemListProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
        Nenhum item cadastrado ainda — use o formulário acima para começar.
      </div>
    );
  }

  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {items.map((item) => (
        <li
          key={item.id}
          className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="truncate text-base font-semibold text-slate-900">
                {item.name}
              </h3>
              {item.description ? (
                <p className="mt-1 line-clamp-3 text-sm text-slate-600">
                  {item.description}
                </p>
              ) : (
                <p className="mt-1 text-sm italic text-slate-400">Sem descrição</p>
              )}
            </div>
            <span className="shrink-0 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
              {formatCurrency(item.price)}
            </span>
          </div>

          <dl className="grid grid-cols-2 gap-2 text-xs text-slate-500">
            <div>
              <dt className="font-medium text-slate-500">Estoque</dt>
              <dd className="text-slate-800">{item.stock}</dd>
            </div>
            <div>
              <dt className="font-medium text-slate-500">Atualizado</dt>
              <dd className="text-slate-800">{formatDate(item.updatedAt)}</dd>
            </div>
          </dl>

          <div className="mt-auto flex items-center justify-end gap-2 pt-1">
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
        </li>
      ))}
    </ul>
  );
}
