import 'dotenv/config';

const parseNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 && parsed <= 65535 ? parsed : fallback;
};

const nodeEnv = process.env.NODE_ENV ?? 'development';
const jwtSecret = process.env.JWT_SECRET ?? 'dev-secret-change-me';
const adminUser = process.env.ADMIN_USER ?? 'admin';
const adminPass = process.env.ADMIN_PASS ?? 'admin';

if (nodeEnv === 'production') {
  const insecureDefaults: string[] = [];
  if (!process.env.JWT_SECRET || jwtSecret === 'dev-secret-change-me') insecureDefaults.push('JWT_SECRET');
  if (!process.env.ADMIN_USER || adminUser === 'admin') insecureDefaults.push('ADMIN_USER');
  if (!process.env.ADMIN_PASS || adminPass === 'admin') insecureDefaults.push('ADMIN_PASS');

  if (insecureDefaults.length > 0) {
    throw new Error(
      `[env] Configuração insegura em produção. Defina: ${insecureDefaults.join(', ')}`,
    );
  }
}

export const env = {
  nodeEnv,
  port: parseNumber(process.env.PORT, 3333),
  corsOrigin: process.env.CORS_ORIGIN ?? process.env.URL ?? 'http://localhost:3000',
  jwtSecret,
  adminUser,
  adminPass,
  databaseUrl: process.env.DATABASE_URL,
} as const;
