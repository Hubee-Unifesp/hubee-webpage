# Layout da área logada

Estrutura visual da área logada. **Só visual**: os dados vêm de `src/mocks/usuario.ts`, não há sessão, proteção de rotas nem chamadas à API, e “Sair” ainda não tem ação.

## Rotas

```text
app/(logado)/layout.tsx            # header + <main> + ToastProvider (todas as páginas logadas)
├── carrinho/page.tsx              # placeholder
└── conta/
    ├── layout.tsx                 # lateral (desktop) e abas (mobile) da conta
    ├── pedidos/page.tsx           # lista de pedidos
    ├── pedidos/[id]/page.tsx      # detalhe do pedido
    └── perfil/page.tsx            # meu perfil
```

A navegação da conta fica em `conta/layout.tsx` para que o carrinho use o mesmo header, mas sem a lateral.

## Componentes

- `logged-header.tsx`: pílula do header. Reaproveita `ThemeToggle`, `MainNavigation` e `getNavigationItems` do header da home. Mostra carrinho com contador, notificações e o menu da usuária (avatar/iniciais).
- `logged-user-menu.tsx`: menu com Meus pedidos, Meu perfil e Sair.
- `mobile-menu.tsx`: menu lateral abaixo de 768px (Radix Dialog: Esc fecha, foco preso, fecha ao navegar).
- `account-sidebar.tsx` / `account-tabs.tsx`: navegação da conta no desktop / mobile, com `aria-current="page"` no item ativo.
- `account-nav.config.ts`: **fonte única** das seções da conta. Para adicionar uma seção, inclua-a aqui e crie a página.

## Componentes compartilhados (em `src/components/`)

| Componente | Arquivo | Uso |
| --- | --- | --- |
| Skeleton | `skeleton.tsx` | `Skeleton`, `SkeletonText`, `PageSkeleton` (para `loading.tsx`) |
| Estado vazio | `empty-state.tsx` | `<EmptyState icon title description action />` |
| Toast | `toast/` | `const toast = useToast(); toast.success("…")` / `toast.error("…")` |
| Modal | `modal.tsx` | `<Modal open onOpenChange title description footer>`; primitivos em `ui/dialog.tsx` |

## Ao integrar a API

Substituir `usuarioLogadoMock` no `(logado)/layout.tsx` pela sessão real, proteger as rotas do grupo e ligar o “Sair” em `logged-user-menu.tsx` e `mobile-menu.tsx` (procure por `TODO(auth-api)`).

## Telas da conta (visual, com mocks)

| Rota | Conteúdo | Código |
| --- | --- | --- |
| `/conta/pedidos` | Lista com filtro por status | `components/conta/pedidos/`, `mocks/pedidos.ts` |
| `/conta/pedidos/[id]` | Detalhes da compra e ingressos (ids de teste: `1` a `4`) | `components/conta/pedidos/pedido-detalhe.tsx` |
| `/conta/perfil` | Dados pessoais, trocar senha e excluir conta (modal) | `components/conta/perfil/` |

Nenhuma ação chama a API: os formulários validam e mostram um toast. Procure por `TODO(orders-api)`, `TODO(profile-api)` e `TODO(auth-api)` ao integrar.
