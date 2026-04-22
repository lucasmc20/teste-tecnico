import serverless from 'serverless-http';
import { buildApp } from '../../dist-netlify/app.js';

const app = buildApp();
const handler = serverless(app, {
  basePath: '/.netlify/functions/api',
});

export { handler };
