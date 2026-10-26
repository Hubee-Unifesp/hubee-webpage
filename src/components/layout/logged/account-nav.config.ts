import { CalendarDays, ShoppingBag, User, type LucideIcon } from "lucide-react";

export interface AccountNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Só aparece para quem pertence a uma organização. */
  organizerOnly?: boolean;
}

/** Seções da conta. Usadas pelo menu do usuário, pela lateral, pelas abas e pelo menu mobile. */
export const accountNavItems: readonly AccountNavItem[] = [
  { href: "/conta/pedidos", label: "Meus pedidos", icon: ShoppingBag },
  { href: "/meus-eventos", label: "Meus eventos", icon: CalendarDays, organizerOnly: true },
  { href: "/conta/perfil", label: "Meu perfil", icon: User },
];

/** Seções da conta que a pessoa pode ver: o comprador não recebe as de organizador. */
export function getAccountNavItems(isOrganizer: boolean): readonly AccountNavItem[] {
  return accountNavItems.filter((item) => !item.organizerOnly || isOrganizer);
}

export const cartHref = "/carrinho";
export const notificationsHref = "/notificacoes";

export function formatCartLabel(count: number): string {
  if (count === 0) return "Carrinho vazio";
  return `Carrinho, ${count} ${count === 1 ? "item" : "itens"}`;
}
