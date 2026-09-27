# Footer Hubee

```tsx
<Footer role="user" />
```

- `role`: `guest` (padrão), `user` ou `organizer`. Controla apenas a apresentação da coluna "Sua conta", igual ao `Header`.
- `homeHref`: caminho da home para o logo, "Voltar ao topo" e os links com âncora (padrão `/`).
- `className`: estilos adicionais para o container.

No tema claro o rodapé é escuro (`hubee-800`) com texto claro; no tema escuro ele é amarelo (`hubee-400`) com texto escuro — a mesma inversão de cor usada no `Header`.

Em telas menores que 768px (`md`), as colunas de links viram um acordeão (`Accordion` de `@/components/ui/accordion`) para economizar espaço vertical; a partir de `md` elas aparecem lado a lado.

## Organização

```text
footer/
├── index.ts                       # API pública do módulo
├── footer.tsx                     # Composição do rodapé
├── types.ts                       # Contratos do footer e das colunas de link
└── links/
    ├── footer-links.config.ts     # Colunas e itens, com visibilidade por perfil
    └── footer-links.tsx           # Lista (desktop) e acordeão (mobile)
```

Importe o componente e seus tipos por `@/components/layout/footer`.

## Como ampliar

- Adicione ou edite colunas em `links/footer-links.config.ts`. Use `#nome-da-secao` para links de âncora da home; o destino é combinado com `homeHref`.
- Os itens da coluna "Sua conta" variam por perfil (`contaItemsByRole`), no mesmo espírito do `roles` do `Header`.
- Mantenha o texto legal/copyright direto em `footer.tsx` — se precisar de mais de uma linha ou de links legais (termos, privacidade), extraia para um componente próprio antes de crescer demais.
