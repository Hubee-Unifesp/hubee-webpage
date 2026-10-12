"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MainNavigation, ThemeToggle, getNavigationItems, isActiveRoute } from "@/components/layout/header";
import type { UsuarioLogado } from "@/types/usuario";
import { cartHref, formatCartLabel, notificationsHref } from "./account-nav.config";
import { LoggedUserMenu } from "./logged-user-menu";
import { MobileMenu } from "./mobile-menu";

/**
 * Header da área logada. Reaproveita o tema, a navegação principal e os botões do header da home;
 * muda as ações da conta (carrinho com contador, menu da usuária) e o menu mobile.
 */
export function LoggedHeader({ usuario, itensNoCarrinho }: UsuarioLogado) {
  const pathname = usePathname();
  const items = getNavigationItems("user", "/");

  return (
    <div className="w-full px-4 pt-4 sm:px-8 md:grid md:grid-cols-[1fr_minmax(0,52rem)_1fr] md:items-center md:gap-4 md:px-6">
      <div className="hidden justify-self-start md:block">
        <ThemeToggle className="text-hubee-800 hover:text-hubee-600 focus-visible:ring-hubee-800 dark:text-hubee-400 dark:hover:text-hubee-200 dark:focus-visible:ring-hubee-400" />
      </div>

      <header className="flex h-14 min-w-0 items-center justify-between gap-3 rounded-xl bg-hubee-800 px-4 text-hubee-50 shadow-md shadow-hubee-800/25 md:gap-6 md:px-5 dark:bg-hubee-400 dark:text-hubee-800 dark:shadow-hubee-900/40">
        <Link
          href="/#inicio"
          aria-label="Hubee — página inicial"
          className="rounded-md font-heading text-[26px] leading-none font-extrabold tracking-tighter outline-none hover:text-hubee-400 focus-visible:ring-3 focus-visible:ring-hubee-400 md:text-[28px] dark:hover:text-hubee-50 dark:focus-visible:ring-hubee-800"
        >
          LOGO
        </Link>

        <MainNavigation items={items} pathname={pathname} />

        <div className="flex items-center gap-0.5">
          <ThemeToggle className="md:hidden" />

          <div className="hidden items-center gap-0.5 md:flex">
            <Button variant="hubee_header" size="icon" className="relative" asChild>
              <Link
                href={cartHref}
                aria-label={formatCartLabel(itensNoCarrinho)}
                aria-current={isActiveRoute(pathname, cartHref) ? "page" : undefined}
              >
                <ShoppingCart aria-hidden="true" className="size-[18px]" />
                {itensNoCarrinho > 0 && (
                  <span
                    aria-hidden="true"
                    className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-hubee-400 px-1 text-[10px] leading-none font-bold text-hubee-800 dark:bg-hubee-800 dark:text-hubee-50"
                  >
                    {itensNoCarrinho > 99 ? "99+" : itensNoCarrinho}
                  </span>
                )}
              </Link>
            </Button>
            <Button variant="hubee_header" size="icon" asChild>
              <Link
                href={notificationsHref}
                aria-label="Notificações"
                aria-current={isActiveRoute(pathname, notificationsHref) ? "page" : undefined}
              >
                <Bell aria-hidden="true" className="size-[18px]" />
              </Link>
            </Button>
            <LoggedUserMenu usuario={usuario} />
          </div>

          <MobileMenu navigationItems={items} itemsInCart={itensNoCarrinho} />
        </div>
      </header>
    </div>
  );
}
