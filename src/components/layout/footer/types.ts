export type FooterRole = "guest" | "user" | "organizer";

export interface FooterProps {
  role?: FooterRole;
  className?: string;
  homeHref?: string;
}

export interface FooterLinkItem {
  href: string;
  label: string;
}

export interface FooterColumn {
  title: string;
  items: readonly FooterLinkItem[];
}
