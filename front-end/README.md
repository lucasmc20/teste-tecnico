# Front-end — Gestão de Itens

Interface em **Next.js 14 (App Router)** com **React 18**, **TypeScript**,
**Tailwind CSS**, **shadcn/ui** e **React Query** para o teste técnico.

## Stack

- Next.js 14 (App Router, Server Components)
- React 18
- TypeScript
- Tailwind CSS
- shadcn/ui (Radix primitives + CVA)
- TanStack React Query v5
- Vitest + Testing Library

## Como rodar

```bash
cp .env.example .env.local
npm install
npm run dev       # http://localhost:3000
```

> Antes, suba o backend em `http://localhost:3333` (veja `../back-end`).

### Scripts

| Comando           | Descrição                              |
| ----------------- | -------------------------------------- |
| `npm run dev`     | Dev server com HMR                     |
| `npm run build`   | Build de produção                      |
| `npm start`       | Executa a build                        |
| `npm run lint`    | ESLint (next/core-web-vitals)          |
| `npm run typecheck` | `tsc --noEmit`                       |
| `npm test`        | Testes com Vitest + Testing Library    |

## Variáveis de ambiente

| Variável              | Uso                                                             |
| --------------------- | --------------------------------------------------------------- |
| `API_URL`             | URL usada **no servidor** (SSR, Route Handlers, Docker network) |
| `NEXT_PUBLIC_API_URL` | URL usada **no navegador** pelo React Query                     |

A separação permite, por exemplo, que dentro do Docker o front-end fale com
`http://backend:3333` enquanto o navegador acessa `http://localhost:3333`.

## SSR

A página `src/app/page.tsx` é um **Server Component** com
`export const dynamic = 'force-dynamic'`, ou seja, é renderizada a cada
requisição. O fetch para `/items` ocorre no servidor via `itemsApi.list()`
(com `cache: 'no-store'`) **antes** da resposta HTML ser enviada.

A lista retornada é passada para `<ItemsPanel initialItems={...} />`
(Client Component), que a usa como `initialData` do React Query. Assim:

- O usuário vê dados já renderizados no primeiro paint (sem spinner inicial).
- Se a API cair durante o SSR, um aviso amarelo aparece e o cliente ainda
  tenta refazer a chamada.
- Mutations (criar/editar/excluir) atualizam o cache React Query de forma
  otimista, mantendo consistência sem full reload.

## Login e cadastro

- As telas de autenticação estão em `/login` e `/register`.
- No cadastro, a API já autentica o usuário e devolve token.
- O front-end guarda token e username em `sessionStorage` para manter a sessão no navegador.

## Organização

```
src/
├─ app/
│  ├─ layout.tsx        # providers globais + shell visual
│  ├─ page.tsx          # SSR: carrega /items antes da renderização
│  └─ globals.css       # Tailwind base
├─ components/
│  ├─ items/
│  │  ├─ item-form.tsx  # formulário controlado com validação
│  │  ├─ item-list.tsx  # cards responsivos
│  │  └─ items-panel.tsx# orquestra form + lista + mutations
│  ├─ auth/
│  │  └─ login-modal.tsx # modal legado (opcional)
│  └─ ui/               # primitivos shadcn (Button, Dialog, Tabs, Card, etc.)
├─ hooks/use-items.ts   # useQuery + mutations (cache otimista)
├─ lib/
│  ├─ api.ts            # fetcher tipado + ApiError + bases cliente/servidor
│  ├─ format.ts         # formatação BRL/pt-BR
│  └─ types.ts          # contratos compartilhados
└─ providers/
   ├─ query-provider.tsx
   └─ toast-provider.tsx
```

## Decisões

- **App Router + Server Components** para SSR natural e menos boilerplate
  do que `getServerSideProps`.
- **React Query** no cliente: cache compartilhado, estados de loading/erro
  unificados, mutations com atualização local (sem precisar re-fetch).
- **Tailwind** no lugar de CSS-in-JS: zero runtime, foco em responsividade.
- **Validação no cliente** + confiança na validação do backend (Zod)
  para erros de servidor, exibidos via toast.
- **Dois provedores** (`QueryProvider`, `ToastProvider`) isolando
  preocupações — evita acoplamento entre estado remoto e feedback visual.

## Testes

```bash
npm test
```

Cobertura atual: validação do formulário, submissão bem-sucedida e modo
edição.

## Docker

```bash
docker build -t teste-tecnico-frontend .
docker run --rm -p 3000:3000 \
  -e API_URL=http://host.docker.internal:3333 \
  -e NEXT_PUBLIC_API_URL=http://localhost:3333 \
  teste-tecnico-frontend
```
