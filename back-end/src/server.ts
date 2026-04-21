import { buildApp } from './app.js';
import { env } from './config/env.js';

const app = buildApp();

app.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`[api] pronta em http://localhost:${env.port} (${env.nodeEnv})`);
});
