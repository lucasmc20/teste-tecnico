import { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/app-error.js';
import { env } from '../config/env.js';

const formatZod = (error: ZodError) =>
  error.issues.map((issue) => ({
    path: issue.path.join('.'),
    message: issue.message,
  }));

export const errorHandler = (
  error: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
) => {
  if (error instanceof ZodError) {
    return res.status(422).json({
      error: 'ValidationError',
      message: 'Dados inválidos',
      details: formatZod(error),
    });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      error: error.name,
      message: error.message,
      ...(error.details ? { details: error.details } : {}),
    });
  }

  // Erros inesperados — evitamos vazar detalhes em produção.
  if (env.nodeEnv !== 'test') {
    console.error('[unexpected-error]', error);
  }
  return res.status(500).json({
    error: 'InternalServerError',
    message: 'Erro interno do servidor',
  });
};
