import type { HeaderRole, NavigationItem } from "../types";

interface NavigationEntry {
  label: string;
  href: string;
  roles?: readonly HeaderRole[];
}

const navigationEntries: readonly NavigationEntry[] = [
  { href: "#inicio", label: "Início" },
  { href: "#eventos", label: "Eventos" },
  { href: "/meus-eventos", label: "Meus Eventos", roles: ["user", "organizer"] },
];

export function getNavigationItems(role: HeaderRole, homeHref: string): NavigationItem[] {
  return navigationEntries
    .filter((item) => !item.roles || item.roles.includes(role))
    .map(({ href, label }) => ({
      href: href.startsWith("#") ? `${homeHref}${href}` : href,
      label,
    }));
}

export function isActiveRoute(pathname: string, href: string): boolean {
  if (href.includes("#")) return false;
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}
