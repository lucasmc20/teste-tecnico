# Teste Técnico — Gestão de Itens

Aplicação full-stack desenvolvida como teste técnico para vaga de desenvolvedor
front-end com atuação também no back-end. O objetivo é um CRUD simples de itens
(produtos) consumindo uma API própria, com SSR na listagem inicial e tratamento
consistente de loading, erro e sucesso.

## Arquitetura

```
teste-tecnico/
├─ back-end/   # API REST em Node.js + Express + TypeScript + Zod
├─ front-end/  # Next.js 14 (App Router) + React 18 + Tailwind + React Query
└─ docker-compose.yml
```

| Camada     | Porta | Stack                                                   |
| ---------- | ----- | ------------------------------------------------------- |
| Front-end  | 3000  | Next.js 14 (App Router), React 18, TS, Tailwind, shadcn/ui, RQ v5  |
| Back-end   | 3333  | Node.js 20, Express 4, TypeScript, Zod                  |

## Como rodar localmente

Em dois terminais (ordem importa apenas para a primeira visita com SSR):

```bash
# terminal 1 — API
cd back-end
cp .env.example .env
npm install
npm run dev

# terminal 2 — UI
cd front-end
cp .env.example .env.local
npm install
npm run dev
```

Acesse `http://localhost:3000`.

## Como rodar com Docker

```bash
docker compose up --build
```

- Front-end: `http://localhost:3000`
- API:       `http://localhost:3333`

Usuário inicial no `docker-compose.yml`:

- usuário: `admin_local`
- senha: `secret`

Também é possível criar novos usuários na tela `/login` (aba `Cadastrar`).

## Testes

```bash
cd back-end  && npm test     # Vitest + Supertest (service + HTTP end-to-end)
cd front-end && npm test     # Vitest + Testing Library (formulário)
```

## Decisões técnicas

### Organização
- **Monorepo simples** com duas pastas — `back-end` e `front-end` — cada uma
  independente, com seu próprio `package.json`, Dockerfile e README. Evita
  overhead de workspaces num escopo pequeno.
- **TypeScript em ambos os lados**, compartilhando o mesmo formato de payload
  (`{ id, name, description, price, stock, createdAt, updatedAt }`).

### Back-end
- Estrutura em **camadas**: `routes → controller → service → repository`,
  mesmo num CRUD enxuto, para manter o código testável e pronto para evoluir.
- **Zod** na borda valida e já deriva os DTOs (`CreateItemDTO`, `UpdateItemDTO`).
- **Repositório em memória** atrás de uma interface — trocar por Postgres/Prisma
  não implica tocar em service/controller.
- **Error handler central** + `asyncHandler` eliminam `try/catch` repetitivo.
  Retornos padronizados: `422` para validação, `404` para não encontrado,
  `500` genérico só para o inesperado (sem vazar stacktrace em produção).
- **Testes**: unidade (service) e HTTP (Supertest) cobrindo o fluxo completo
  e os caminhos de erro.

### Front-end
- **App Router** com **Server Component** na página inicial — o fetch a `/items`
  acontece no servidor antes do HTML ser enviado.
- **React Query** no cliente hidrata-se com os dados vindos do SSR via
  `initialData`. Mutations atualizam o cache localmente (otimista), sem
  refetch agressivo, para manter a UI consistente.
- **Tailwind** para estilização e responsividade (grid `md:grid-cols-2`,
  cartões fluidos, tipografia Inter via `next/font`).
- **Toast provider** com Context API dá feedback imediato de sucesso/erro
  para cada operação.
- **Dois endpoints de base** (`API_URL` para SSR, `NEXT_PUBLIC_API_URL` para o
  navegador) permitem que o front-end em Docker fale com o backend pela rede
  interna e, ao mesmo tempo, o browser acesse via `localhost`.

### SSR — como foi implementado

1. `src/app/page.tsx` é um Server Component com
   `export const dynamic = 'force-dynamic'` (renderizado a cada request).
2. Dentro dele, chamamos `itemsApi.list()` — um fetcher isomórfico que usa
   `process.env.API_URL` quando `typeof window === 'undefined'`.
3. Tratamos falhas do SSR graciosamente: em vez de quebrar a página, exibimos
   um aviso e deixamos o client-side tentar novamente.
4. Os dados retornados são passados como `initialItems` para o
   `<ItemsPanel>` (Client Component). Dentro dele, `useItems({ initialData })`
   alimenta o cache do React Query — o usuário vê conteúdo já pronto no
   primeiro paint e as operações subsequentes acontecem via mutations.
5. A separação cliente/servidor é explícita: tudo que usa hooks (`'use client'`)
   está em `components/items/*` e `providers/*`; a página mantém-se server-only.

### Diferenciais aplicados

- TypeScript estrito nos dois projetos
- Testes automatizados (Vitest + Supertest no back, Testing Library no front)
- React Query para estado remoto
- Docker + docker-compose
- Estrutura em camadas no back-end

### Subir com Docker Compose

```bash
# Copie e ajuste as variáveis
cp back-end/.env.example back-end/.env

# Sobe tudo (Postgres, back-end, front-end)
docker compose up --build
```

### Deploy sugerido

- **Front-end**: Vercel (recomendado) ou Netlify.
  - Vercel: root directory `front-end`, variável `NEXT_PUBLIC_API_URL` apontando para a URL pública do backend.
  - Netlify: também usar root directory `front-end` e definir `NEXT_PUBLIC_API_URL`.
  - Para SSR interno do Next, definir também `API_URL` com a URL pública do backend.
- **Back-end**: Fly.io ou Render — configure `DATABASE_URL`, `JWT_SECRET`, `ADMIN_USER`, `ADMIN_PASS`.
