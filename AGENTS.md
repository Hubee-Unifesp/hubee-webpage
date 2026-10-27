<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AGENTS.md — Hubee Webpage

> **Instruções para Agentes de IA e Desenvolvedores Frontend**  
> Repositório: `hubee-webpage` (Frontend Web do ecossistema Hubee)  
> Documentação viva do time: [Alexandrita Docs](https://alexandrita-docs.vercel.app)

---

## 1. Visão Geral do Repositório

O `hubee-webpage` é a aplicação web cliente da plataforma Hubee, construída com **Next.js 16 (App Router)**, **React 19** e **Tailwind CSS v4**. O sistema atende tanto a participantes (busca de eventos, compra e visualização de ingressos) quanto a organizadores de eventos.

- **Porta de Execução:** `http://localhost:3001` (rodar na porta 3001 é **obrigatório** para não colidir com a `hubee-api` na porta 3000).
- **Backend Conectado:** `hubee-api` rodando em `http://localhost:3000` (configurado via `NEXT_PUBLIC_API_URL`).

---

## 2. Stack Tecnológica

| Componente | Tecnologia / Versão |
| :--- | :--- |
| **Framework** | Next.js 16 (App Router com React Server Components e Client Components) |
| **Biblioteca UI** | React 19 (`react`, `react-dom`) |
| **Estilização** | Tailwind CSS v4 (`@tailwindcss/postcss`, Radix UI, classes utilitárias) |
| **Componentes Base** | shadcn/ui (`class-variance-authority`, `cn`) |
| **Ícones** | `lucide-react` |
| **Formulários & Validação** | `react-hook-form`, `@hookform/resolvers`, `zod` |
| **Cliente HTTP** | Axios com interceptor centralizado (`src/lib/api/apiClient.ts`) |
| **Testes Unitários** | Vitest (`vitest.config.ts`) |
| **Tipagem & Linter** | TypeScript v5 (`strict: true`), ESLint (`--max-warnings=0`) |
| **Git Hooks** | Husky + Commitlint (`@commitlint/config-conventional`) |

---

## 3. Estrutura de Pastas e Módulos

```text
hubee-webpage/
├── public/
│   ├── logo/                    # Identidade visual oficial (Hubee1_dark.svg, Logo.svg, etc.)
│   │   ├── hubee/               # Variações da marca com nome
│   │   ├── hubee_s/             # Variações compactas
│   │   └── logo-icon/           # Apenas o ícone da abelha/marca
├── src/
│   ├── app/                     # Next.js App Router
│   │   ├── (auth)/              # Rotas públicas de login, cadastro, recuperação de senha
│   │   ├── (logado)/            # Rotas protegidas (perfil, pedidos, ingressos, painel do organizador)
│   │   │   ├── conta/           # /conta/perfil, /conta/pedidos, /conta/completar-perfil
│   │   │   └── layout.tsx       # Layout com LoggedSession e Sidebar/Header da área logada
│   │   ├── eventos/             # /eventos (busca) e /eventos/[id] (detalhes)
│   │   ├── layout.tsx           # Root layout com ThemeProvider e AuthProvider
│   │   └── page.tsx             # Home page pública
│   ├── components/
│   │   ├── auth/                # Formulários de login e cadastro
│   │   ├── conta/               # Componentes de perfil, pedidos e ingressos
│   │   ├── home/                # Seções da landing page e vitrine de eventos
│   │   ├── layout/              # Header público, Footer, Menu mobile e menus logados
│   │   └── ui/                  # Componentes reutilizáveis (button, card, dialog, input, etc.)
│   ├── contexts/
│   │   └── AuthContext.tsx      # Contexto de autenticação (user, token, login, logoutState)
│   ├── hooks/                   # Hooks customizados (usePedidos, useAuth, useTheme)
│   ├── lib/
│   │   ├── api/                 # Camada de comunicação com a hubee-api
│   │   │   ├── apiClient.ts     # Instância Axios com injeção automática de Bearer token
│   │   │   ├── auth.ts          # Chamadas de /auth/login e /auth/register
│   │   │   ├── events.ts        # Chamadas de /events
│   │   │   ├── orders.ts        # Chamadas de /orders
│   │   │   └── users.ts         # Chamadas de /users/me
│   │   ├── validations/         # Schemas Zod de validação de formulários
│   │   └── utils.ts             # Funções auxiliares (cn, formatações de data/moeda)
│   └── types/                   # Interfaces e tipos TypeScript compartilhados
```

---

## 4. Comandos Canônicos do Repositório

Sempre execute a partir da raiz `hubee-webpage`:

```bash
# Instalação de dependências
npm install

# Desenvolvimento local (porta 3001)
npm run dev

# Validação estrita de lint (Zero warnings tolerados)
npm run lint

# Checagem completa de tipos TypeScript
npm run typecheck

# Execução de testes unitários (Vitest)
npx vitest run

# Build de produção
npm run build

# Execução do build em produção (porta 3001)
npm run start
```

---

## 5. Regras e Boas Práticas de Desenvolvimento Frontend

### 5.1. Comunicação com a API
- **NUNCA** faça chamadas `fetch` ou crie instâncias soltas de `axios` dentro dos componentes.
- **Sempre** utilize ou adicione métodos dentro de `src/lib/api/` reutilizando o `apiClient`:
  ```typescript
  import { apiClient } from '@/lib/api/apiClient';
  
  export const getEvents = async (params?: EventFilters) => {
    const { data } = await apiClient.get('/events', { params });
    return data;
  };
  ```
- O `apiClient` já injeta automaticamente o token JWT presente nos cookies/sessão e normaliza erros via `errors.ts`.

### 5.2. Componentes Server vs Client
- Páginas que dependem de estado interativo, hooks (`useAuth`, `useForm`, `useState`, `useEffect`) ou eventos de clique (`onClick`) **DEVEM** incluir `'use client';` na primeira linha.
- Componentes estáticos e de layout sem interatividade devem ser mantidos como Server Components para melhor performance e SEO.

### 5.3. Formulários e Validação
- Formulários devem ser implementados com `react-hook-form` e validados via schemas `zod` em `src/lib/validations/`.
- Mensagens de validação e feedback de erro devem ser amigáveis e em **Português (pt-BR)**.

### 5.4. Uso de Imagens e Logos Oficiais
- Não use textos provisórios (ex: `"LOGO"` ou placeholders cinzas).
- Os assets oficiais estão centralizados em `public/logo/`. Exemplo de uso:
  ```tsx
  import Image from 'next/image';
  
  <Image
    src="/logo/hubee/Hubee1_dark.svg"
    alt="Hubee"
    width={120}
    height={40}
    priority
  />
  ```

---

## 6. Governança Git e Husky (Obrigatório)

### 6.1. Branching
- Base padrão: `develop`.
- Nunca commitar na `develop` ou `main`.
- Nomenclatura de branch: `<tipo>/GOL-<ID>-<slug>` (ex: `feat/GOL-134-pagina-busca`).

### 6.2. Padrão Rigoroso de Commitlint
O hook do projeto exige exatamente o formato:
`tipo(GOL-ID): descrição em português`

**Exemplos Válidos:**
- `feat(GOL-134): adiciona filtros e cards na tela de busca de eventos`
- `fix(GOL-150): restaura header e atualiza logotipo oficial`
- `docs(GOL-148): adiciona AGENTS.md com instrucoes de desenvolvimento`

### 6.3. Verificação Antes de Commit / Push
Antes de comitar ou subir alterações, execute obrigatoriamente:
```bash
npm run lint && npm run typecheck
```

### 6.4. Proibição de Commits/Push sem Permissão
- ⚠️ **NUNCA commite ou faça push sem autorização explícita do desenvolvedor.**
- O agente deve apresentar o resumo das alterações de frontend, confirmar que `npm run lint` e `npm run typecheck` passaram sem erros, e aguardar a aprovação expressa do desenvolvedor antes de executar `git commit` ou `git push`.

### 6.5. Regra de Transição no YouTrack
- Ao iniciar a tarefa, transicione para `State In Progress`.
- ⚠️ **REGRA OBRIGATÓRIA:** NUNCA mova o status para verificação (`To Verify`) automaticamente. O encerramento da task e a mudança de status devem ser **explicitamente confirmados pelo desenvolvedor responsável**.
