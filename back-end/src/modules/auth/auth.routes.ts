import { Router } from 'express';
import { z } from 'zod';
import { UnauthorizedError } from '../../errors/app-error.js';
import { asyncHandler } from '../../middlewares/async-handler.js';
import { createToken } from './auth.middleware.js';
import { authService } from './auth.service.js';

const credentialsSchema = z.object({
  username: z
    .string()
    .trim()
    .min(3, 'Usuário deve ter ao menos 3 caracteres')
    .max(40, 'Usuário deve ter no máximo 40 caracteres'),
  password: z
    .string()
    .min(4, 'Senha deve ter ao menos 4 caracteres')
    .max(72, 'Senha deve ter no máximo 72 caracteres'),
});

const router = Router();

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const { username, password } = credentialsSchema.parse(req.body);
    authService.register({ username, password });
    res.status(201).json({ data: { token: createToken(username), username } });
  }),
);

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const { username, password } = credentialsSchema.parse(req.body);
    if (!authService.validate({ username, password })) {
      throw new UnauthorizedError('Credenciais inválidas');
    }
    res.json({ data: { token: createToken(username), username } });
  }),
);

export { router as authRouter };
