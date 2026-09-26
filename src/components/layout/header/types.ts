export type HeaderRole = "guest" | "user" | "organizer";

export interface HeaderProps {
  role?: HeaderRole;
  className?: string;
  fixed?: boolean;
  homeHref?: string;
  logoutHref?: string;
}

export interface NavigationItem {
  href: string;
  label: string;
}

export interface NavigationProps {
  items: readonly NavigationItem[];
  pathname: string;
}
