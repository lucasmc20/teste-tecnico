import { describe, it, expect, beforeEach } from 'vitest';
import { InMemoryItemRepository } from '../src/modules/items/item.repository.memory.js';
import { ItemService } from '../src/modules/items/item.service.js';
import { NotFoundError } from '../src/errors/app-error.js';

describe('ItemService', () => {
  let service: ItemService;

  beforeEach(() => {
    service = new ItemService(new InMemoryItemRepository());
  });

  it('cria um item com campos padrão', async () => {
    const item = await service.create({
      name: 'Teclado Mecânico',
      description: 'Switch marrom',
      price: 499.9,
      stock: 10,
    });

    expect(item.id).toBeDefined();
    expect(item.createdAt).toBe(item.updatedAt);
    expect(item.name).toBe('Teclado Mecânico');
  });

  it('lista itens em ordem decrescente de criação', async () => {
    const first = await service.create({
      name: 'Item A', description: null, price: 10, stock: 1,
    });
    await new Promise((r) => setTimeout(r, 5));
    const second = await service.create({
      name: 'Item B', description: null, price: 20, stock: 2,
    });

    const { items } = await service.list();
    expect(items.map((i) => i.id)).toEqual([second.id, first.id]);
  });

  it('filtra por busca textual', async () => {
    await service.create({ name: 'Teclado', description: null, price: 200, stock: 1 });
    await service.create({ name: 'Mouse', description: 'Sem fio', price: 100, stock: 2 });

    const { items, total } = await service.list({ search: 'tecl', page: 1, limit: 20 });
    expect(total).toBe(1);
    expect(items[0].name).toBe('Teclado');
  });

  it('pagina resultados corretamente', async () => {
    for (let i = 1; i <= 5; i++) {
      await service.create({ name: `Item ${i}`, description: null, price: i * 10, stock: i });
    }

    const { items, total } = await service.list({ page: 1, limit: 2 });
    expect(total).toBe(5);
    expect(items).toHaveLength(2);
  });

  it('atualiza parcialmente mantendo campos não informados', async () => {
    const created = await service.create({
      name: 'Mouse', description: 'Sem fio', price: 150, stock: 5,
    });
    const updated = await service.update(created.id, { price: 120 });

    expect(updated.price).toBe(120);
    expect(updated.name).toBe('Mouse');
    expect(updated.description).toBe('Sem fio');
    expect(updated.updatedAt >= created.updatedAt).toBe(true);
  });

  it('lança NotFoundError quando o item não existe', async () => {
    await expect(service.getById('00000000-0000-0000-0000-000000000000')).rejects.toBeInstanceOf(
      NotFoundError,
    );
    await expect(service.remove('00000000-0000-0000-0000-000000000000')).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it('remove um item existente', async () => {
    const created = await service.create({
      name: 'Cadeira', description: null, price: 900, stock: 3,
    });
    await service.remove(created.id);
    await expect(service.getById(created.id)).rejects.toBeInstanceOf(NotFoundError);
  });
});
