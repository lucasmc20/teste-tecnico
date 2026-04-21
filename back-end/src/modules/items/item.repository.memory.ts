import { randomUUID } from 'node:crypto';
import { Item, CreateItemInput, UpdateItemInput } from './item.types.js';
import { ItemRepository, ListParams, ListResult } from './item.repository.js';

export class InMemoryItemRepository implements ItemRepository {
  private readonly store = new Map<string, Item>();

  constructor(seed: Item[] = []) {
    for (const item of seed) this.store.set(item.id, item);
  }

  async findAll({ search, page, limit }: ListParams): Promise<ListResult> {
    let items = Array.from(this.store.values()).sort(
      (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
    );

    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          (i.description?.toLowerCase().includes(q) ?? false),
      );
    }

    const total = items.length;
    const start = (page - 1) * limit;
    return { items: items.slice(start, start + limit), total };
  }

  async findById(id: string): Promise<Item | null> {
    return this.store.get(id) ?? null;
  }

  async create(data: CreateItemInput): Promise<Item> {
    const now = new Date().toISOString();
    const item: Item = {
      id: randomUUID(),
      name: data.name,
      description: data.description ?? null,
      price: data.price,
      stock: data.stock,
      createdAt: now,
      updatedAt: now,
    };
    this.store.set(item.id, item);
    return item;
  }

  async update(id: string, data: UpdateItemInput): Promise<Item | null> {
    const existing = this.store.get(id);
    if (!existing) return null;
    const updated: Item = {
      ...existing,
      ...data,
      description:
        data.description === undefined ? existing.description : data.description,
      updatedAt: new Date().toISOString(),
    };
    this.store.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }
}
