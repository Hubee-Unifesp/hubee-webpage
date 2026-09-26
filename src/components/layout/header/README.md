# Header Hubee

A home (`/`) usa o estado de visitante e `/login` apresenta o mock de usuário logado.

```tsx
<Header role="organizer" />
```

- `role`: `guest` (padrão), `user` ou `organizer`. Forneça o valor da sessão real. Essa propriedade controla apenas a apresentação, não a autorização.
- `fixed`: `true` por padrão, ocupa toda a largura da janela e fica fixo no topo. Reserve 64px no conteúdo em telas menores que 768px e 80px nas demais.
- `homeHref`: caminho da home para os links de início, eventos e logo (padrão `/`).
- `logoutHref`: destino opcional de “Sair” para a simulação.
- `className`: estilos adicionais para o container.

Em telas menores que 768px, a navegação principal fica oculta: o header mostra o logo, o botão de tema e as ações da conta (carrinho, notificações e usuário) ou “Entrar” para visitantes. O logo leva ao início e “Meus Eventos” continua no menu do usuário.
O texto LOGO segue o placeholder da referência e pode ser substituído pela marca final.

O link “Eventos” aponta para `/#eventos`, a seção da home reservada para a futura listagem com scroll infinito. O espaçamento da âncora considera a altura do header fixo.

Os destinos `/meus-eventos`, `/carrinho`, `/notificacoes` e `/perfil` são contratos de navegação para integração: essas páginas ainda não existem no projeto.

A rota `/login` exibe uma cópia da home com usuário simulado (`role="user"`). Não há autenticação, sessão ou acesso a dados reais. “Início” e “Eventos” navegam dentro dessa versão; “Sair” no menu do usuário retorna à home de visitante.

A página de mock é temporária e deve ser removida ou substituída ao integrar a autenticação real. Veja o [plano de remoção](../../../app/login/README.md).

## Organização

```text
header/
├── index.ts                    # API pública do módulo
├── header.tsx                  # Composição do header e integração com a rota
├── types.ts                    # Contratos do header e dos itens de navegação
├── navigation/
│   ├── navigation.config.ts    # Links, visibilidade por perfil e regra de rota ativa
│   └── main-navigation.tsx     # Navegação principal (oculta no mobile)
└── actions/
    ├── actions.config.ts       # Destinos de login, atalhos e itens da conta
    ├── header-actions.tsx      # Organização das ações à direita
    ├── theme-toggle.tsx        # Botão de sol/lua
    └── user-menu.tsx           # Menu da conta e saída do mock
```

Importe o componente e seus tipos por `@/components/layout/header`. Os componentes internos não fazem parte da API pública. A fronteira de cliente fica em `header.tsx`; os módulos renderizados por ele pertencem à mesma árvore de cliente.

## Como ampliar a navegação

- Adicione links principais em `navigation/navigation.config.ts`. Esses links aparecem apenas no desktop.
- Use `roles` quando um item só deve aparecer para determinados perfis. Omitir `roles` deixa o link visível para todos; isso controla apresentação, não autorização.
- Para seções da home, use `#nome-da-secao`. O destino será combinado com `homeHref`, preservando o mock em `/login`.
- Adicione atalhos com ícones e itens do menu de conta em `actions/actions.config.ts`. “Entrar” também tem um destino único nesse arquivo.
- Mantenha comportamento de tema em `theme-toggle.tsx`, comportamento da conta em `user-menu.tsx` e a navegação principal em `navigation/main-navigation.tsx`.
- O tema claro/escuro é global: `ThemeProvider` (`src/components/theme-provider.tsx`, ligado em `src/app/layout.tsx`) aplica a classe `.dark` no `<html>` e expõe `useTheme()`. O tema começa claro e não é salvo entre visitas. Estilize as duas versões com a variante `dark:` do Tailwind e as cores `hubee-*` de `globals.css`.
- Botões e links clicáveis usam o `Button` de `@/components/ui/button` com a variante `hubee_header`, que herda a cor do texto e aplica o hover e o foco da header. Ao aumentar a quantidade de links, revise o espaço disponível no desktop e o breakpoint de 768px.

A identificação de rota ativa usa o pathname e não tenta inferir a seção visível da home. Os links com âncora continuam navegando normalmente, sem sublinhado.
