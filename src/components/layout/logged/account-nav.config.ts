import { CalendarDays, ShoppingBag, Ticket, Truck, User, type LucideIcon } from "lucide-react";

export interface AccountNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Só aparece para quem pertence a uma organização. */
  organizerOnly?: boolean;
}

export const myTicketsNavItem: AccountNavItem = {
  href: "/meus-ingressos",
  label: "Meus ingressos",
  icon: Ticket,
};

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

export const suppliersNavItem: AccountNavItem = {
  href: "/conta/fornecedores",
  label: "Fornecedores",
  icon: Truck,
  organizerOnly: true,
};

/** Itens exibidos no dropdown do perfil do usuário logado. */
export function getProfileMenuItems(isOrganizer = false): readonly AccountNavItem[] {
  return [
    myTicketsNavItem,
    ...(isOrganizer ? [organizerEventsNavItem] : []),
    ...buyerAccountNavItems,
  ];
}

/** Seções da conta. Usadas pelo menu mobile. */
export const accountNavItems: readonly AccountNavItem[] = [
  myTicketsNavItem,
  organizerEventsNavItem,
  ...buyerAccountNavItems,
  suppliersNavItem,
];

/** Seções da conta que a pessoa usuária pode acessar: as de organizador só para membros de organizações. */
export function getAccountNavItems(isOrganizer = false): readonly AccountNavItem[] {
  return accountNavItems.filter((item) => isOrganizer || !item.organizerOnly);
}

export interface AccountNavGroup {
  label: string;
  items: readonly AccountNavItem[];
}

export const organizationNavItems: readonly AccountNavItem[] = [suppliersNavItem];

/** Grupos da sidebar e das abas da conta: "Minha Conta" para todos e "Organização" só para organizadores. */
export function getAccountNavGroups(isOrganizer = false): readonly AccountNavGroup[] {
  const groups: AccountNavGroup[] = [{ label: "Minha Conta", items: buyerAccountNavItems }];
  if (isOrganizer) groups.push({ label: "Organização", items: organizationNavItems });
  return groups;
}

export const cartHref = "/carrinho";
export const notificationsHref = "/notificacoes";

export function formatCartLabel(count: number): string {
  if (count === 0) return "Carrinho vazio";
  return `Carrinho, ${count} ${count === 1 ? "item" : "itens"}`;
}
