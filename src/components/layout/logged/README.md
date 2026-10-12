# Layout da área logada

Estrutura da área logada, integrada com a `hubee-api`: o header usa a sessão (`useAuth`), as rotas exigem login e “Sair” encerra a sessão.

## Rotas

```text
app/(logado)/layout.tsx            # header da sessão + <main> protegido + ToastProvider (todas as páginas logadas)
├── carrinho/page.tsx              # placeholder
├── notificacoes/page.tsx          # placeholder
├── meus-ingressos/page.tsx        # placeholder
├── meus-eventos/page.tsx          # placeholder
└── conta/
    ├── layout.tsx                 # lateral (desktop) e abas (mobile) da conta
    ├── pedidos/page.tsx           # lista de pedidos
    ├── pedidos/[id]/page.tsx      # detalhe do pedido
    └── perfil/page.tsx            # meu perfil
```

A navegação da conta fica em `conta/layout.tsx` para que o carrinho use o mesmo header, mas sem a lateral.

## Componentes

- `logged-header.tsx`: pílula do header. Reaproveita `ThemeToggle`, `MainNavigation` e `getNavigationItems` do header da home. Mostra carrinho com contador, notificações e o menu da usuária (avatar/iniciais).
- `logged-session.tsx`: `SessionHeader` (header com o usuário da sessão) e `RequireSession` (sem sessão válida, vai para `/login?redirect=…`; falha de rede não derruba a sessão).
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

## Sessão

O token fica no `localStorage` (lido pelo axios) e num cookie `token` (lido pelo `middleware.ts`, que roda no servidor), os dois gravados e limpos juntos por `lib/session.ts`. O cookie só indica que há sessão; quem valida o token é a API. O contador do carrinho fica em 0 até existir API de carrinho (`TODO(cart-api)`).

## Telas da conta

| Rota | Conteúdo | Código |
| --- | --- | --- |
| `/conta/pedidos` | Lista com filtro por status; carregando, vazio e erro | `components/conta/pedidos/`, `lib/api/orders.ts`, `hooks/usePedidos.ts` |
| `/conta/pedidos/[id]` | Detalhes da compra e ingressos; carregando, erro e não encontrado | `components/conta/pedidos/pedido-detalhe-content.tsx` |
| `/conta/perfil` | Dados pessoais, trocar senha e excluir conta (modal) | `components/conta/perfil/`, `lib/api/users.ts` |

### Pedidos: o que a API entrega

O pedido da API tem só valor, status e data. O evento e os itens vêm dos ingressos emitidos (`GET /users/me/tickets`), então um pedido pendente ou cancelado aparece sem evento e sem itens (a tela mostra data, valor e status). O número exibido é um código curto derivado do id. Procure por `TODO(orders-api)` para o QR code, que ainda é um placeholder.

### Perfil: regras que dependem da API

- O telefone vai só com dígitos (a máscara é só da tela); telefone vazio apaga o valor (`null`).
- E-mail repetido (409) aparece no campo e-mail; senha atual incorreta (401) aparece no campo da senha atual, sem derrubar a sessão (`skipAuthRedirect` em `lib/api/apiClient.ts`).
- A nova senha segue 8 a 72 caracteres (`NEW_PASSWORD_*` em `lib/validations/profile.schema.ts`).
- O banner “Complete seu perfil” aparece quando `profileComplete` é `false` e leva a `/conta/completar-perfil`.
