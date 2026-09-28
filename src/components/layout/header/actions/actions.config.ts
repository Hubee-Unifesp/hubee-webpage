import { Bell, CalendarDays, ShoppingCart, User, type LucideIcon } from "lucide-react";
import type { NavigationItem } from "../types";

interface IconNavigationItem extends NavigationItem {
  icon: LucideIcon;
}

export const loginItem: NavigationItem = { href: "/login", label: "Entrar" };

export const accountActions: readonly IconNavigationItem[] = [
  { href: "/carrinho", label: "Carrinho", icon: ShoppingCart },
  { href: "/notificacoes", label: "Notificações", icon: Bell },
];

export const userMenuItems: readonly IconNavigationItem[] = [
  { href: "/perfil", label: "Meu perfil", icon: User },
  { href: "/meus-eventos", label: "Meus Eventos", icon: CalendarDays },
];
