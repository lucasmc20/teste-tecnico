import { Item, CreateItemInput, UpdateItemInput } from './item.types.js';

export interface ListParams {
  search?: string;
  page: number;
  limit: number;
}

export interface ListResult {
  items: Item[];
  total: number;
}

export interface ItemRepository {
  findAll(params: ListParams): Promise<ListResult>;
  findById(id: string): Promise<Item | null>;
  create(data: CreateItemInput): Promise<Item>;
  update(id: string, data: UpdateItemInput): Promise<Item | null>;
  delete(id: string): Promise<boolean>;
}
