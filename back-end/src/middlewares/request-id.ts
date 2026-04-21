import { NextFunction, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';

export const requestId = (_req: Request, res: Response, next: NextFunction) => {
  const id = randomUUID();
  res.setHeader('X-Request-Id', id);
  next();
};
