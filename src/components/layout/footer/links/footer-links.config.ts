import type { FooterColumn, FooterLinkItem, FooterRole } from "../types";

const explorarItems: readonly FooterLinkItem[] = [
  { href: "#inicio", label: "Início" },
  { href: "#eventos", label: "Eventos" },
  { href: "/sobre", label: "Sobre o Hubee" },
];

const contaItemsByRole: Record<FooterRole, readonly FooterLinkItem[]> = {
  guest: [{ href: "/login", label: "Entrar" }],
  user: [
    { href: "/meus-ingressos", label: "Meus Ingressos" },
    { href: "/carrinho", label: "Carrinho" },
    { href: "/perfil", label: "Meu perfil" },
  ],
  organizer: [
    { href: "/meus-ingressos", label: "Meus Ingressos" },
    { href: "/carrinho", label: "Carrinho" },
    { href: "/perfil", label: "Meu perfil" },
  ],
};

export function getFooterColumns(role: FooterRole, homeHref: string): readonly FooterColumn[] {
  return [
    {
      title: "Explorar",
      items: explorarItems.map(({ href, label }) => ({
        href: href.startsWith("#") ? `${homeHref}${href}` : href,
        label,
      })),
    },
    {
      title: "Sua conta",
      items: contaItemsByRole[role],
    },
  ];
}
