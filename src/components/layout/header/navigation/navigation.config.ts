import type { HeaderRole, NavigationItem } from "../types";

interface NavigationEntry {
  label: string;
  href: string;
}

const navigationEntries: readonly NavigationEntry[] = [
  { href: "#inicio", label: "Início" },
  { href: "/eventos", label: "Eventos" },
  { href: "/sobre", label: "Sobre" },
];

const organizerNavigationEntry: NavigationEntry = {
  href: "/minha-organizacao",
  label: "Organização",
};

export function getNavigationItems(role: HeaderRole, homeHref: string): NavigationItem[] {
  const entries =
    role === "organizer"
      ? [...navigationEntries, organizerNavigationEntry]
      : navigationEntries;

  return entries.map(({ href, label }) => ({
    href: href.startsWith("#") ? `${homeHref}${href}` : href,
    label,
  }));
}

export function isActiveRoute(pathname: string, href: string): boolean {
  if (href.includes("#")) return false;
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}
