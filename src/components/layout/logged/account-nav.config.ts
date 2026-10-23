import { CalendarDays, ShoppingBag, User, type LucideIcon } from "lucide-react";

export interface AccountNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export const organizerEventsNavItem: AccountNavItem = {
  href: "/conta/eventos",
  label: "Meus eventos",
  icon: CalendarDays,
};

export const organizerManageEventsNavItem: AccountNavItem = {
  href: "/conta/eventos",
  label: "Gerenciar eventos",
  icon: CalendarDays,
};

/** Seções padrão da conta ("Minha Conta" — participante). */
export const accountNavItems: readonly AccountNavItem[] = [
  { href: "/conta/pedidos", label: "Meus pedidos", icon: ShoppingBag },
  { href: "/conta/perfil", label: "Meu perfil", icon: User },
];

/**
 * Retorna os itens de navegação da conta (usado em `AccountTabs` e `MobileMenu`).
 * Inclui "Meus eventos" ao final quando a usuária possui organização vinculada (ou está na rota `/conta/eventos`).
 */
export function getAccountNavItems(includeOrganizerEvents: boolean): readonly AccountNavItem[] {
  if (!includeOrganizerEvents) return accountNavItems;
  return [...accountNavItems, organizerEventsNavItem];
}

export const cartHref = "/carrinho";
export const notificationsHref = "/notificacoes";

export function formatCartLabel(count: number): string {
  if (count === 0) return "Carrinho vazio";
  return `Carrinho, ${count} ${count === 1 ? "item" : "itens"}`;
}
