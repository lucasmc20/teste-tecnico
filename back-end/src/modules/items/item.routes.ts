import { Router } from 'express';
import { createRequire } from 'node:module';
import { env } from '../../config/env.js';
import { logger } from '../../lib/logger.js';
import { asyncHandler } from '../../middlewares/async-handler.js';
import { requireAuth } from '../auth/auth.middleware.js';
import { ItemController } from './item.controller.js';
import { ItemService } from './item.service.js';
import { InMemoryItemRepository } from './item.repository.memory.js';
import { PrismaItemRepository } from './item.repository.prisma.js';
import type { ItemRepository } from './item.repository.js';

const buildRepository = (): ItemRepository => {
	if (!env.databaseUrl) {
		logger.info('[items] usando repositório em memória (DATABASE_URL ausente)');
		return new InMemoryItemRepository();
	}

	try {
		const require = createRequire(import.meta.url);
		const { PrismaClient } = require('@prisma/client') as {
			PrismaClient: new () => unknown;
		};
		const prisma = new PrismaClient();
		logger.info('[items] usando repositório Prisma');
		return new PrismaItemRepository(prisma as never);
	} catch (error) {
		logger.warn({ error }, '[items] falha ao inicializar Prisma, usando memória');
		return new InMemoryItemRepository();
	}
};

const repository: ItemRepository = buildRepository();
const service = new ItemService(repository);
const controller = new ItemController(service);

const router = Router();

router.get('/', asyncHandler(controller.list));
router.get('/:id', asyncHandler(controller.getById));
router.post('/', requireAuth, asyncHandler(controller.create));
router.put('/:id', requireAuth, asyncHandler(controller.update));
router.delete('/:id', requireAuth, asyncHandler(controller.remove));

export { router as itemsRouter, service as itemsService };
