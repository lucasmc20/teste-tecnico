import { NextFunction, Request, Response } from 'express';
import { logger } from '../lib/logger.js';

export const httpLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    logger.info({
      requestId: res.getHeader('X-Request-Id'),
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      ms: Date.now() - start,
    });
  });
  next();
};
