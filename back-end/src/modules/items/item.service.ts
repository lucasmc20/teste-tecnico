import { NotFoundError } from '../../errors/app-error.js';
import { ItemRepository, ListResult } from './item.repository.js';
import { CreateItemDTO, ListQueryDTO, UpdateItemDTO } from './item.schema.js';
import { Item } from './item.types.js';

export class ItemService {
  constructor(private readonly repository: ItemRepository) {}

  list(query: ListQueryDTO = { page: 1, limit: 20 }): Promise<ListResult> {
    return this.repository.findAll({
      search: query.search,
      page: query.page,
      limit: query.limit,
    });
  }

  async getById(id: string): Promise<Item> {
    const item = await this.repository.findById(id);
    if (!item) throw new NotFoundError('Item');
    return item;
  }

  create(data: CreateItemDTO): Promise<Item> {
    return this.repository.create(data);
  }

  async update(id: string, data: UpdateItemDTO): Promise<Item> {
    const updated = await this.repository.update(id, data);
    if (!updated) throw new NotFoundError('Item');
    return updated;
  }

  async remove(id: string): Promise<void> {
    const removed = await this.repository.delete(id);
    if (!removed) throw new NotFoundError('Item');
  }
}
