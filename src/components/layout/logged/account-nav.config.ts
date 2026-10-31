import { CalendarDays, ShoppingBag, User, type LucideIcon } from "lucide-react";

export interface AccountNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Só aparece para quem pertence a uma organização. */
  organizerOnly?: boolean;
}

export const organizerEventsNavItem: AccountNavItem = {
  href: "/meus-eventos",
  label: "Meus eventos",
  icon: CalendarDays,
  organizerOnly: true,
};

export const organizerManageEventsNavItem: AccountNavItem = {
  href: "/meus-eventos",
  label: "Gerenciar eventos",
  icon: CalendarDays,
  organizerOnly: true,
};

/** Seções pessoais da conta ("Minha Conta" — participante). */
export const buyerAccountNavItems: readonly AccountNavItem[] = [
  { href: "/conta/pedidos", label: "Meus pedidos", icon: ShoppingBag },
  { href: "/conta/perfil", label: "Meu perfil", icon: User },
];

/** Seções da conta pessoal. Usadas pelas abas mobile e pela sidebar da conta. */
export const accountNavItems: readonly AccountNavItem[] = [
  ...buyerAccountNavItems,
];

/** Seções da conta pessoal que a pessoa usuária pode acessar. */
export function getAccountNavItems(): readonly AccountNavItem[] {
  return accountNavItems;
}

export const cartHref = "/carrinho";
export const notificationsHref = "/notificacoes";

export function formatCartLabel(count: number): string {
  if (count === 0) return "Carrinho vazio";
  return `Carrinho, ${count} ${count === 1 ? "item" : "itens"}`;
}
