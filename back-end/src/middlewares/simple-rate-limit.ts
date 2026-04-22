import { NextFunction, Request, Response } from 'express';
import { TooManyRequestsError } from '../errors/app-error.js';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
}

interface Counter {
  count: number;
  resetAt: number;
}

const clients = new Map<string, Counter>();

const keyFrom = (req: Request) => {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || 'unknown';
};

export const createSimpleRateLimit = ({ windowMs, max, message }: RateLimitOptions) => {
  const errorMessage = message ?? 'Muitas tentativas. Aguarde um momento e tente novamente.';

  return (req: Request, _res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = keyFrom(req);
    const previous = clients.get(key);

    if (!previous || now > previous.resetAt) {
      clients.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (previous.count >= max) {
      return next(new TooManyRequestsError(errorMessage));
    }

    previous.count += 1;
    clients.set(key, previous);
    next();
  };
};
