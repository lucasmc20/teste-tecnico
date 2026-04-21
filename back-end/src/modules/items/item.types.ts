export interface Item {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

export type CreateItemInput = Pick<Item, 'name' | 'description' | 'price' | 'stock'>;
export type UpdateItemInput = Partial<CreateItemInput>;
