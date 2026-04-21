import { NextFunction, Request, Response } from 'express';
import { createHmac } from 'node:crypto';
import { env } from '../../config/env.js';
import { UnauthorizedError } from '../../errors/app-error.js';

// Verifica JWT HS256 manualmente para não adicionar dependência de runtime.
// Para produção, considere a lib `jsonwebtoken`.
const base64url = (s: string) =>
  Buffer.from(s).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

const sign = (header: string, payload: string, secret: string) =>
  createHmac('sha256', secret)
    .update(`${header}.${payload}`)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

export const createToken = (sub: string): string => {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payload = base64url(
    JSON.stringify({ sub, iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 28800 }),
  );
  return `${header}.${payload}.${sign(header, payload, env.jwtSecret)}`;
};

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Token não informado'));
  }

  const [header, payload, sig] = auth.slice(7).split('.');
  if (!header || !payload || !sig) {
    return next(new UnauthorizedError('Token malformado'));
  }

  const expected = sign(header, payload, env.jwtSecret);
  if (sig !== expected) {
    return next(new UnauthorizedError('Assinatura inválida'));
  }

  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64').toString());
    if (exp && Date.now() / 1000 > exp) {
      return next(new UnauthorizedError('Token expirado'));
    }
  } catch {
    return next(new UnauthorizedError('Token malformado'));
  }

  next();
};
