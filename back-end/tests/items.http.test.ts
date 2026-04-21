import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { buildApp } from '../src/app.js';
import { createToken } from '../src/modules/auth/auth.middleware.js';

const app = buildApp();
// Token de teste gerado com as credenciais padrão de dev.
let token: string;

beforeAll(() => {
  token = createToken('admin');
});

describe('Items HTTP', () => {
  it('GET /health responde ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('POST /auth/login retorna token com credenciais corretas', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: process.env.ADMIN_USER ?? 'admin', password: process.env.ADMIN_PASS ?? 'admin' });
    expect(res.status).toBe(200);
    expect(typeof res.body.data.token).toBe('string');
  });

  it('POST /auth/login retorna 401 com credenciais erradas', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'admin', password: 'errada' });
    expect(res.status).toBe(401);
  });

  it('POST /items retorna 401 sem token', async () => {
    const res = await request(app)
      .post('/items')
      .send({ name: 'Sem auth', price: 10, stock: 1 });
    expect(res.status).toBe(401);
  });

  it('fluxo CRUD completo', async () => {
    const created = await request(app)
      .post('/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Monitor', description: null, price: 1200, stock: 4 });
    expect(created.status).toBe(201);
    const id = created.body.data.id as string;

    const list = await request(app).get('/items');
    expect(list.status).toBe(200);
    expect(list.body.data).toHaveLength(1);
    expect(list.body.meta.total).toBe(1);

    const listSearch = await request(app).get('/items?search=monitor');
    expect(listSearch.body.data).toHaveLength(1);

    const listNoMatch = await request(app).get('/items?search=naoexiste');
    expect(listNoMatch.body.data).toHaveLength(0);
    expect(listNoMatch.body.meta.total).toBe(0);

    const updated = await request(app)
      .put(`/items/${id}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ price: 1100 });
    expect(updated.status).toBe(200);
    expect(updated.body.data.price).toBe(1100);

    const removed = await request(app)
      .delete(`/items/${id}`)
      .set('Authorization', `Bearer ${token}`);
    expect(removed.status).toBe(204);

    const afterDelete = await request(app).get(`/items/${id}`);
    expect(afterDelete.status).toBe(404);
  });

  it('retorna 422 quando o payload é inválido', async () => {
    const res = await request(app)
      .post('/items')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'a', price: -1, stock: 1.5 });
    expect(res.status).toBe(422);
    expect(res.body.error).toBe('ValidationError');
    expect(Array.isArray(res.body.details)).toBe(true);
  });
});
