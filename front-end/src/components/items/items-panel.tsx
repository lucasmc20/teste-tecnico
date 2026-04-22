'use client';

import { useState } from 'react';
import { ItemForm } from './item-form';
import { ItemDataTable } from './item-data-table';
import {
  useCreateItem,
  useDeleteItem,
  useItems,
  useUpdateItem,
} from '@/hooks/use-items';
import { useDebounce } from '@/hooks/use-debounce';
import { ApiError } from '@/lib/api';
import { useToast } from '@/providers/toast-provider';
import { useAuth } from '@/providers/auth-provider';
import type { Item, ItemInput } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ConfirmModal } from '@/components/ui/confirm-modal';
import { LoginModal } from '@/components/auth/login-modal';

interface ItemsPanelProps {
  initialItems?: Item[];
}

const PAGE_SIZE = 10;

const describeApiError = (error: unknown) => {
  if (error instanceof ApiError) {
    if (error.payload?.details?.length) {
      return error.payload.details.map((d) => `${d.path}: ${d.message}`).join(' · ');
    }
    return error.message;
  }
  if (error instanceof Error) return error.message;
  return 'Erro desconhecido';
};

export function ItemsPanel({ initialItems = [] }: ItemsPanelProps) {
  const { notify } = useToast();
  const { token, username, logout } = useAuth();

  const [editing, setEditing] = useState<Item | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const search = useDebounce(searchInput, 400);
  const [page, setPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState<Item | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const { data, isLoading, isError, error, refetch, isFetching } = useItems({
    initialData: initialItems,
    search: search || undefined,
    page,
    limit: PAGE_SIZE,
  });

  const createMutation = useCreateItem(token);
  const updateMutation = useUpdateItem(token);
  const deleteMutation = useDeleteItem(token);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleCreate = async (payload: ItemInput) => {
    try {
      await createMutation.mutateAsync(payload);
      notify('Item criado com sucesso.', 'success');
      setPage(1);
    } catch (err) {
      notify(describeApiError(err), 'error');
    }
  };

  const handleUpdate = async (payload: ItemInput) => {
    if (!editing) return;
    try {
      await updateMutation.mutateAsync({ id: editing.id, data: payload });
      notify('Item atualizado.', 'success');
      setEditing(null);
    } catch (err) {
      notify(describeApiError(err), 'error');
    }
  };

  const handleDeleteConfirmed = async () => {
    if (!confirmDelete) return;
    const item = confirmDelete;
    setConfirmDelete(null);
    try {
      await deleteMutation.mutateAsync(item.id);
      if (editing?.id === item.id) setEditing(null);
      notify('Item removido.', 'success');
    } catch (err) {
      notify(describeApiError(err), 'error');
    }
  };

  return (
    <section className="flex flex-col gap-6">
      {confirmDelete && (
        <ConfirmModal
          message={`Excluir "${confirmDelete.name}"?`}
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setConfirmDelete(null)}
        />
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
        <div className="mb-4 flex flex-col gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Gestão de itens</h2>
            {token && <p className="text-sm text-slate-500">Usuário conectado: {username}</p>}
          </div>
          {token ? (
            <Button variant="ghost" size="sm" onClick={logout}>
              Sair
            </Button>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => setLoginModalOpen(true)}>
              Entrar
            </Button>
          )}
        </div>

        {token && (
          <ItemForm
            initialValue={editing}
            submitting={editing ? updateMutation.isPending : createMutation.isPending}
            onSubmit={editing ? handleUpdate : handleCreate}
            onCancel={editing ? () => setEditing(null) : undefined}
          />
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Itens cadastrados</h3>
          <p className="text-xs text-slate-500">
            {total} {total === 1 ? 'item' : 'itens'}{search ? ` · filtrado por "${search}"` : ''}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Buscar por nome"
            value={searchInput}
            onChange={(e) => { setSearchInput(e.target.value); setPage(1); }}
            className="h-9 w-48 text-sm"
          />
          <Button
            variant="secondary"
            size="sm"
            loading={isFetching && !isLoading}
            onClick={() => refetch()}
          >
            Atualizar
          </Button>
        </div>
      </div>

      {isError ? (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800">
          <p>
            Não foi possível carregar os itens: <strong>{describeApiError(error)}</strong>
          </p>
          <Button size="sm" variant="danger" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        </div>
      ) : isLoading ? (
        <SkeletonList />
      ) : (
        <>
          <ItemDataTable
            items={items}
            onEdit={setEditing}
            onDelete={setConfirmDelete}
            deletingId={deleteMutation.isPending ? (deleteMutation.variables ?? null) : null}
          />
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Anterior
              </Button>
              <span className="text-xs text-slate-500">
                {page} / {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Próxima
              </Button>
            </div>
          )}
        </>
      )}

      {loginModalOpen && <LoginModal onClose={() => setLoginModalOpen(false)} />}
    </section>
  );
}

function SkeletonList() {
  return (
    <div className="grid gap-3" aria-hidden>
      {Array.from({ length: 4 }).map((_, idx) => (
        <div
          key={idx}
          className="h-20 animate-pulse rounded-xl border border-slate-200 bg-white"
        />
      ))}
    </div>
  );
}
