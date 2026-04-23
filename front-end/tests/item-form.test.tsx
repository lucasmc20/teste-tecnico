import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ItemForm } from '@/components/items/item-form';

describe('ItemForm', () => {
  it('valida campos antes de submeter', async () => {
    const onSubmit = vi.fn();
    render(<ItemForm onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: /adicionar/i }));

    await waitFor(() => {
      expect(
        screen.getByText(/mínimo 2 caracteres/i),
      ).toBeInTheDocument();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('envia payload normalizado quando válido', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(<ItemForm onSubmit={onSubmit} />);

    await user.clear(screen.getByLabelText(/nome/i));
    await user.type(screen.getByLabelText(/nome/i), 'Cadeira Gamer');

    await user.clear(screen.getByLabelText(/preço/i));
    await user.type(screen.getByLabelText(/preço/i), '120050');

    await user.clear(screen.getByLabelText(/estoque/i));
    await user.type(screen.getByLabelText(/estoque/i), '3');

    await user.click(screen.getByRole('button', { name: /adicionar/i }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Cadeira Gamer',
        price: 1200.5,
        stock: 3,
      }),
    );
  });

  it('pré-preenche o formulário em modo edição', () => {
    const onSubmit = vi.fn();
    render(
      <ItemForm
        onSubmit={onSubmit}
        initialValue={{
          id: 'abc',
          name: 'Mouse',
          description: 'Sem fio',
          price: 150,
          stock: 7,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }}
      />,
    );

    expect(screen.getByLabelText(/nome/i)).toHaveValue('Mouse');
    expect(screen.getByLabelText(/descrição/i)).toHaveValue('Sem fio');
    expect(screen.getByRole('button', { name: /salvar alterações/i })).toBeInTheDocument();
  });
});
