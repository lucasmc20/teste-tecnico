# Backend — Gestão de Itens

API REST em **Node.js + Express + TypeScript** para suporte ao front-end do teste técnico.

## Stack

- Node.js 20 / TypeScript (ESM + NodeNext)
- Express 4
- Zod (validação de entrada)
- Vitest + Supertest (testes unitários e HTTP)

## Como rodar

```bash
cp .env.example .env
npm install
npm run dev          # modo desenvolvimento (tsx watch)
npm run build        # compila para dist/
npm start            # executa a build
npm test             # roda a suíte completa
```

A API sobe por padrão em `http://localhost:3333`.

## Endpoints

| Método | Rota          | Descrição               |
| ------ | ------------- | ----------------------- |
| GET    | `/health`     | Healthcheck             |
| POST   | `/auth/register` | Cadastra usuário e retorna token |
| POST   | `/auth/login` | Login e retorno de token |
| GET    | `/items`      | Lista todos os itens    |
| GET    | `/items/:id`  | Busca um item           |
| POST   | `/items`      | Cria um item            |
| PUT    | `/items/:id`  | Atualiza um item        |
| DELETE | `/items/:id`  | Remove um item          |

### Payload

```json
{
  "name": "Teclado Mecânico",
  "description": "Switch marrom",
  "price": 499.9,
  "stock": 10
}
```

Erros de validação retornam HTTP 422 com a lista de problemas por campo:

```json
{
  "error": "ValidationError",
  "message": "Dados inválidos",
  "details": [{ "path": "price", "message": "O preço não pode ser negativo" }]
}
```

## Organização

```
src/
├─ app.ts              # composição do Express
├─ server.ts           # bootstrap
├─ config/env.ts       # carregamento de variáveis (dotenv)
├─ errors/             # hierarquia de erros de domínio
├─ middlewares/        # async-handler, 404, error-handler central
└─ modules/items/
   ├─ item.types.ts       # contratos do domínio
   ├─ item.schema.ts      # validação com Zod
   ├─ item.repository.ts  # interface
   ├─ item.repository.memory.ts
   ├─ item.service.ts     # regras de negócio
   ├─ item.controller.ts  # adaptação HTTP
   └─ item.routes.ts      # composição do módulo
tests/                 # testes de unidade e HTTP (Vitest + Supertest)
```

## Autenticação

- `POST /auth/register`: cria um novo usuário em memória e já retorna token JWT.
- `POST /auth/login`: autentica com usuário/senha e retorna token JWT.
- Um usuário admin inicial é carregado por `ADMIN_USER` e `ADMIN_PASS`.
- Rotas de escrita de itens exigem `Authorization: Bearer <token>`.
- Senhas são armazenadas com hash (`bcryptjs`) e comparadas de forma segura.
- Endpoints de autenticação usam rate limit simples para reduzir brute force.

A persistência é em memória — a interface `ItemRepository` isola essa decisão,
permitindo trocar por Postgres/Prisma sem alterações em services/controllers.

## Decisões

- **Separação de camadas** (controller → service → repository): facilita testes e
  evolução, mesmo num CRUD enxuto.
- **Zod** na borda: valida, normaliza e já gera os tipos do DTO.
- **Error handler central + `asyncHandler`**: remove `try/catch` repetitivo.
- **Sem banco**: o teste não exige persistência — priorizei clareza de código.

## Docker

```bash
docker build -t teste-tecnico-backend .
docker run --rm -p 3333:3333 teste-tecnico-backend
```
