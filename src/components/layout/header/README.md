# Header Hubee

O header das páginas públicas (home, `/eventos`, detalhe do evento e `/sobre`) lê a sessão com `useAuth()`: sem usuário mostra o estado de visitante (`guest`), com usuário mostra `user` ou `organizer`. O perfil controla apenas a apresentação, não a autorização.

```tsx
<Header />
```

- `fixed`: `false` por padrão: o conjunto formado pelo botão de tema (à esquerda) e a header em formato de pílula (centralizada, até 832px de largura) fica grudado no topo (`sticky`) e acompanha a rolagem sem precisar reservar espaço no conteúdo. Com `true`, usa `position: fixed`; nesse caso reserve 80px no conteúdo em telas menores que 768px e 96px nas demais.
- `homeHref`: caminho da home para os links de início, eventos e logo (padrão `/`).
- `className`: estilos adicionais para o container.

No tema claro a pílula é escura (`hubee-800`) com hover amarelo (`hubee-400`); no tema escuro ela é amarela (`hubee-400`) com hover claro (`hubee-50`). O link da rota ativa usa a mesma cor do hover.

Em telas menores que 768px, a navegação principal e os botões de ação horizontais ficam ocultos na barra e passam a ser acessíveis pelo menu lateral (`MobileMenu` / gaveta hambúrguer), garantindo acesso a “Início”, “Eventos”, “Sobre”, “Meus Ingressos” e “Meus Eventos” (para organizadores), além das ações da conta (`Entrar` e `Criar conta` para visitantes, ou atalhos da conta e `Sair` para usuários autenticados) em todas as páginas públicas.
A marca é o `ThemedHubeeLogo` de `@/components/brand`, que troca a versão conforme o tema.

O link “Eventos” aponta para `/eventos`, a página dedicada com a listagem de todos os eventos da plataforma.

Os destinos `/meus-ingressos`, `/meus-eventos`, `/notificacoes`, `/carrinho` e `/conta/*` são páginas da área logada, integradas com a `hubee-api`. Veja [`../logged/README.md`](../logged/README.md).

A rota `/login` é a tela de login real (`LoginScreen`), que autentica na API e grava a sessão.

## Organização

```text
header/
├── index.ts                    # API pública do módulo (inclui ThemeToggle, MainNavigation e as regras de rota ativa, reaproveitados pelo header logado)
├── header.tsx                  # Composição do header e integração com a rota
├── types.ts                    # Contratos do header e dos itens de navegação
├── theme-toggle.tsx            # Botão de sol/lua (fora da pílula no desktop, dentro no mobile)
├── navigation/
│   ├── navigation.config.ts    # Links, visibilidade por perfil e regra de rota ativa
│   └── main-navigation.tsx     # Navegação principal (oculta no mobile)
└── actions/
    ├── actions.config.ts       # Destinos de login e atalhos da conta
    └── header-actions.tsx      # Organização das ações à direita
```

Importe o componente e seus tipos por `@/components/layout/header`. Os componentes internos não fazem parte da API pública. A fronteira de cliente fica em `header.tsx`; os módulos renderizados por ele pertencem à mesma árvore de cliente.

## Como ampliar a navegação

- Adicione links principais em `navigation/navigation.config.ts`. Esses links aparecem apenas no desktop.
- Use `roles` quando um item só deve aparecer para determinados perfis. Omitir `roles` deixa o link visível para todos; isso controla apresentação, não autorização.
- Para seções da home, use `#nome-da-secao`. O destino será combinado com `homeHref`.
- Adicione atalhos com ícones da conta em `actions/actions.config.ts`. “Entrar” também tem um destino único nesse arquivo.
- Mantenha comportamento de tema em `theme-toggle.tsx`, comportamento da conta em `LoggedUserMenu` e a navegação principal em `navigation/main-navigation.tsx`.
- O tema claro/escuro é global: `ThemeProvider` (`src/components/theme-provider.tsx`, ligado em `src/app/layout.tsx`) aplica a classe `.dark` no `<html>` e expõe `useTheme()`. A escolha é salva no cookie `hubee_theme` (`light` ou `dark`, válido por 1 ano) e mantida entre visitas e abas; um script no `<head>` do layout aplica `.dark` antes da primeira pintura, evitando o flash de tema claro. Sem cookie, o tema começa claro. Estilize as duas versões com a variante `dark:` do Tailwind e as cores `hubee-*` de `globals.css`.
- Botões e links clicáveis usam o `Button` de `@/components/ui/button` com a variante `hubee_header`, que herda a cor do texto e aplica o hover e o foco da header. Ao aumentar a quantidade de links, revise o espaço disponível no desktop e o breakpoint de 768px.

A identificação de rota ativa usa o pathname e não tenta inferir a seção visível da home. Os links com âncora continuam navegando normalmente, sem sublinhado.
