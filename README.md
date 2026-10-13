# Hubee Webpage

Página web da **Hubee**, desenvolvida com Next.js, React, TypeScript e Tailwind CSS.

> O projeto está em desenvolvimento. A home possui header funcional e seções provisórias, e a área logada (conta e carrinho) já tem layout e telas **só visuais**, com dados fictícios.

O mock em `/login` é temporário. Consulte o [plano de remoção ao integrar a autenticação real](src/app/login/README.md).

## Identidade Visual

O design, a paleta de cores e os componentes base da aplicação podem ser consultados publicamente no nosso guia no Figma:

- [Guia de Estilo e UI - Hubee](https://www.figma.com/design/m5GCcD7WOpjYsjKsSR86pU/Hubee-Visual?node-id=2-287&t=RHEpDIWxwZl69ZRQ-1)

## Tecnologias

- [Next.js 16](https://nextjs.org/)
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [ESLint](https://eslint.org/)

## Pré-requisitos

Antes de começar, tenha instalado:

- [Node.js](https://nodejs.org/) 20.9 ou superior
- npm (incluído na instalação do Node.js)

## Instalação

Clone o repositório e acesse a pasta do projeto:

```bash
git clone <URL_DO_REPOSITORIO>
cd hubee-webpage
```

Instale as dependências:

```bash
npm install
```

Inicie o ambiente de desenvolvimento:

```bash
npm run dev
```

A aplicação estará disponível em [http://localhost:3001](http://localhost:3001).

## Variáveis de ambiente

Copie o arquivo de exemplo e ajuste a URL da API (`hubee-api`):

```bash
cp .env.example .env.local
```

| Variável              | Descrição                                                                   |
| --------------------- | --------------------------------------------------------------------------- |
| `NEXT_PUBLIC_API_URL` | URL base da `hubee-api`. A home busca os eventos nela, direto do navegador. |

Variáveis `NEXT_PUBLIC_*` só são lidas quando o servidor inicia: reinicie o `npm run dev` depois de alterar o `.env.local`. Se a API estiver apontando para `localhost:3000`, rode o Next em outra porta (`npm run dev -- -p 3001`), pois essa é a porta padrão dele.

## Páginas

| Rota                  | Descrição                                          | Estado                 |
| --------------------- | -------------------------------------------------- | ---------------------- |
| `/`                   | Home com eventos                                   | Integrada com a API    |
| `/login`              | Mock temporário de usuário logado                  | Provisória             |
| `/carrinho`           | Carrinho                                           | Placeholder            |
| `/notificacoes`       | Notificações                                       | Placeholder            |
| `/meus-ingressos`     | Meus ingressos                                     | Placeholder            |
| `/meus-eventos`       | Meus eventos                                       | Placeholder            |
| `/conta/pedidos`      | Lista de pedidos com filtro por status             | Integrada com a API    |
| `/conta/pedidos/[id]` | Detalhe do pedido, itens e ingressos               | Integrada com a API    |
| `/conta/perfil`       | Dados pessoais, troca de senha e exclusão de conta | Integrada com a API    |

As páginas da área logada ficam em `src/app/(logado)/` e compartilham o mesmo layout (header, navegação e toasts). Elas exigem sessão: sem token válido, a pessoa vai para `/login` e volta para a página pedida depois. Detalhes em [Layout da área logada](src/components/layout/logged/README.md).

## Estrutura do projeto

```text
src/
├── app/                 # Rotas (App Router); (logado)/ é a área logada
├── components/
│   ├── conta/           # Telas da conta: pedidos e perfil
│   ├── home/            # Seções e eventos da home
│   ├── layout/          # Header (home) e layout logado
│   ├── ui/              # Componentes base (shadcn/ui)
│   └── ...              # modal, toast, skeleton e estado vazio compartilhados
├── lib/                 # Cliente da API e utilitários
└── types/               # Tipos compartilhados
```

## Scripts disponíveis

| Comando           | Descrição                                 |
| ----------------- | ----------------------------------------- |
| `npm run dev`     | Inicia o servidor de desenvolvimento      |
| `npm run build`   | Gera a versão otimizada para produção     |
| `npm run start`   | Executa a versão de produção após o build |
| `npm run lint`    | Analisa o código com o ESLint             |
| `npm test`        | Roda os testes (Vitest) em modo watch     |
| `npm run test:ci` | Roda os testes uma vez, como na CI        |

## Padrão de commits

Os commits seguem o formato `tipo(GOL-N): assunto`, validado pelo commitlint, por exemplo:

```text
feat(GOL-42): adiciona validacao de login
```

O hook de `pre-push` roda `npm run lint` (sem avisos permitidos): rode-o antes de enviar a branch.
