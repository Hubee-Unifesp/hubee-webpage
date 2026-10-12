import { ShoppingBag, User, type LucideIcon } from "lucide-react";

export interface AccountNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

/** Seções da conta. Usadas pelo menu do usuário, pela lateral, pelas abas e pelo menu mobile. */
export const accountNavItems: readonly AccountNavItem[] = [
  { href: "/conta/pedidos", label: "Meus pedidos", icon: ShoppingBag },
  { href: "/conta/perfil", label: "Meu perfil", icon: User },
];

export const cartHref = "/carrinho";
export const notificationsHref = "/notificacoes";

export function formatCartLabel(count: number): string {
  if (count === 0) return "Carrinho vazio";
  return `Carrinho, ${count} ${count === 1 ? "item" : "itens"}`;
}
