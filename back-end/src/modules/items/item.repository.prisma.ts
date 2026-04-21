import { Item, CreateItemInput, UpdateItemInput } from './item.types.js';
import { ItemRepository, ListParams, ListResult } from './item.repository.js';

// Interface local para não exigir `prisma generate` na compilação.
// Instancie com `new PrismaClient()` do `@prisma/client`.
type PrismaLike = {
  item: {
    findMany(args?: Record<string, unknown>): Promise<PrismaRaw[]>;
    findUnique(args: Record<string, unknown>): Promise<PrismaRaw | null>;
    create(args: Record<string, unknown>): Promise<PrismaRaw>;
    update(args: Record<string, unknown>): Promise<PrismaRaw>;
    delete(args: Record<string, unknown>): Promise<void>;
    count(args?: Record<string, unknown>): Promise<number>;
  };
};

type PrismaRaw = {
  id: string;
  name: string;
  description: string | null;
  price: { toString(): string };
  stock: number;
  createdAt: Date;
  updatedAt: Date;
};

const toItem = (r: PrismaRaw): Item => ({
  id: r.id,
  name: r.name,
  description: r.description,
  price: Number(r.price.toString()),
  stock: r.stock,
  createdAt: r.createdAt.toISOString(),
  updatedAt: r.updatedAt.toISOString(),
});

export class PrismaItemRepository implements ItemRepository {
  constructor(private readonly prisma: PrismaLike) {}

  async findAll({ search, page, limit }: ListParams): Promise<ListResult> {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }
      : undefined;

    const [rows, total] = await Promise.all([
      this.prisma.item.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.item.count({ where }),
    ]);

    return { items: rows.map(toItem), total };
  }

  async findById(id: string): Promise<Item | null> {
    const row = await this.prisma.item.findUnique({ where: { id } });
    return row ? toItem(row) : null;
  }

  async create(data: CreateItemInput): Promise<Item> {
    const row = await this.prisma.item.create({ data });
    return toItem(row);
  }

  async update(id: string, data: UpdateItemInput): Promise<Item | null> {
    try {
      const row = await this.prisma.item.update({ where: { id }, data });
      return toItem(row);
    } catch {
      // Prisma lança P2025 quando o registro não existe
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.item.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}
