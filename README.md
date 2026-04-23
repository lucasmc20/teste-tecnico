# Teste Técnico — Gestão de Itens

Aplicação full-stack desenvolvida como teste técnico para vaga de desenvolvedor
front-end com atuação também no back-end. O objetivo é um CRUD completo de itens
(produtos) consumindo uma API própria, com autenticação JWT, proteção de rotas,
máscara de moeda BRL e tratamento consistente de loading, erro e sucesso.

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

- usuário: `teste-tecnico`
- senha: `senha.123`

Também é possível criar novos usuários pela rota `/register`.

Ao subir pela primeira vez, o back-end popula automaticamente 7 itens de exemplo
(`prisma/seed.mjs`) para que a listagem já esteja preenchida.

## Deploy no Netlify (Front + Back no mesmo site)

Este repositório já está preparado para subir em um único site Netlify:

- Front-end Next.js (App Router)
- Back-end Express rodando em Netlify Function (`/api/*`)

Arquivo de configuração: `netlify.toml` (na raiz).

### Como configurar no painel do Netlify

1. Importe o repositório normalmente.
2. Não altere Build command/Publish directory manualmente (o `netlify.toml` já define).
3. Garanta Node 20 (já definido em `netlify.toml`).
4. Configure variáveis de ambiente do back-end:
  - `JWT_SECRET`
  - `ADMIN_USER`
  - `ADMIN_PASS`
  - `DATABASE_URL` (obrigatório em produção)

Com isso, deploys seguintes ficam automáticos a cada push.

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
- Senhas de usuários são armazenadas com hash (`bcryptjs`) e os endpoints de
  autenticação possuem rate-limit básico para mitigar brute force.
- **Testes**: unidade (service) e HTTP (Supertest) cobrindo o fluxo completo
  e os caminhos de erro.

### Front-end
- **App Router** com proteção de rotas via `AuthGuard` (Client Component):
  acessar `/` sem sessão válida redireciona automaticamente para `/login?next=/`.
- **React Query** gerencia estado remoto. Mutations atualizam o cache localmente,
  sem refetch agressivo, mantendo a UI consistente.
- **CurrencyInput** com máscara BRL automática (ex.: `1.234,56`) — dígitos são
  acumulados como centavos e formatados em tempo real via `Intl.NumberFormat`.
- **Tailwind** para estilização e responsividade (grid `md:grid-cols-2`,
  cartões fluidos).
- **Toast provider** com Context API dá feedback imediato de sucesso/erro
  para cada operação.
- **Dois endpoints de base** (`API_URL` para SSR, `NEXT_PUBLIC_API_URL` injetado
  em tempo de build via `ARG` no Dockerfile) permitem que o front-end em Docker
  fale com o backend pela rede interna e o browser acesse via `localhost`.

### Fluxo de autenticação

1. `src/app/page.tsx` renderiza o painel envolto em `<AuthGuard>`.
2. `AuthGuard` lê o token do `sessionStorage` via `useAuth()`. Se ausente ou
   expirado, redireciona para `/login?next=%2F`.
3. Após login bem-sucedido, `/login` devolve o usuário à rota original (`next`).
4. O token JWT é armazenado apenas em `sessionStorage` (sessão do navegador) —
   ao fechar a aba, a sessão é encerrada automaticamente.
5. A separação de responsabilidades segue SRP/OCP: `AuthGuard` cuida só de
   acesso; `AuthProvider` cuida de login/logout/registro; as páginas não
   conhecem detalhes de autenticação.

### Diferenciais aplicados

- TypeScript estrito nos dois projetos
- Testes automatizados (Vitest + Supertest no back, Testing Library no front)
- React Query para estado remoto
- `AuthGuard` com SRP/OCP — proteção de rotas sem acoplar lógica de auth às páginas
- `CurrencyInput` com máscara BRL reutilizável
- Seed idempotente de dados de exemplo (`prisma/seed.mjs`)
- Docker + docker-compose com `prisma db push` + seed automático no startup
- Estrutura em camadas no back-end

### Subir com Docker Compose

```bash
# Copie e ajuste as variáveis
cp back-end/.env.example back-end/.env

# Sobe tudo (Postgres, back-end, front-end)
docker compose up --build
```