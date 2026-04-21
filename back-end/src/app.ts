import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { itemsRouter } from './modules/items/item.routes.js';
import { errorHandler } from './middlewares/error-handler.js';
import { httpLogger } from './middlewares/http-logger.js';
import { notFoundHandler } from './middlewares/not-found.js';
import { requestId } from './middlewares/request-id.js';

export const buildApp = () => {
  const app = express();

  app.use(requestId);
  app.use(httpLogger);
  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', uptime: process.uptime() });
  });

  app.use('/auth', authRouter);
  app.use('/items', itemsRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
