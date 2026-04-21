import { Request, Response } from 'express';
import { ItemService } from './item.service.js';
import {
  createItemSchema,
  idParamSchema,
  listQuerySchema,
  updateItemSchema,
} from './item.schema.js';

export class ItemController {
  constructor(private readonly service: ItemService) {}

  list = async (req: Request, res: Response) => {
    const query = listQuerySchema.parse(req.query);
    const { items, total } = await this.service.list(query);
    res.json({
      data: items,
      meta: { total, page: query.page, limit: query.limit },
    });
  };

  getById = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const item = await this.service.getById(id);
    res.json({ data: item });
  };

  create = async (req: Request, res: Response) => {
    const payload = createItemSchema.parse(req.body);
    const created = await this.service.create(payload);
    res.status(201).json({ data: created });
  };

  update = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const payload = updateItemSchema.parse(req.body);
    const updated = await this.service.update(id, payload);
    res.json({ data: updated });
  };

  remove = async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    await this.service.remove(id);
    res.status(204).send();
  };
}
