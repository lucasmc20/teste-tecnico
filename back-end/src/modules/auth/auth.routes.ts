import { Router } from 'express';
import { z } from 'zod';
import { UnauthorizedError } from '../../errors/app-error.js';
import { asyncHandler } from '../../middlewares/async-handler.js';
import { createSimpleRateLimit } from '../../middlewares/simple-rate-limit.js';
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
const authRateLimit = createSimpleRateLimit({
  windowMs: 60_000,
  max: 10,
  message: 'Muitas tentativas de autenticação. Aguarde 1 minuto.',
});

router.post(
  '/register',
  authRateLimit,
  asyncHandler(async (req, res) => {
    const { username, password } = credentialsSchema.parse(req.body);
    authService.register({ username, password });
    res.status(201).json({ data: { token: createToken(username), username } });
  }),
);

router.post(
  '/login',
  authRateLimit,
  asyncHandler(async (req, res) => {
    const { username, password } = credentialsSchema.parse(req.body);
    if (!authService.validate({ username, password })) {
      throw new UnauthorizedError('Credenciais inválidas');
    }
    res.json({ data: { token: createToken(username), username } });
  }),
);

export { router as authRouter };
