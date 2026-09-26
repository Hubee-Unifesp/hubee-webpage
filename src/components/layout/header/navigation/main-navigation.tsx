import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { NavigationProps } from "../types";
import { isActiveRoute } from "./navigation.config";

export function MainNavigation({ items, pathname }: NavigationProps) {
  return (
    <nav className="hidden items-center justify-center gap-2 md:flex" aria-label="Navegação principal">
      {items.map(({ href, label }) => (
        <Button key={href} variant="hubee_header" size="lg" className="font-bold" asChild>
          <Link href={href} aria-current={isActiveRoute(pathname, href) ? "page" : undefined}>
            {label}
          </Link>
        </Button>
      ))}
    </nav>
  );
}
