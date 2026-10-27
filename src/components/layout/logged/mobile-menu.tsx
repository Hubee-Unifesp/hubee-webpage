"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, LogOut, Menu, ShoppingCart, X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Button } from "@/components/ui/button";
import { Dialog, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { isActiveRoute, type NavigationItem } from "@/components/layout/header";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { cartHref, formatCartLabel, getAccountNavItems, notificationsHref } from "./account-nav.config";
import { ThemedHubeeLogo } from "@/components/brand";

const itemClassName =
  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium outline-none hover:bg-hubee-100 focus-visible:ring-3 focus-visible:ring-hubee-800 aria-[current=page]:bg-hubee-400 aria-[current=page]:text-hubee-800 dark:hover:bg-hubee-750 dark:focus-visible:ring-hubee-400 dark:aria-[current=page]:bg-hubee-50 dark:aria-[current=page]:text-hubee-750 [&_svg]:size-[18px] [&_svg]:shrink-0";

const groupLabelClassName = "px-3 pb-1 text-xs font-medium text-hubee-neutral-300 dark:text-hubee-200";

interface MobileMenuProps {
  navigationItems: readonly NavigationItem[];
  itemsInCart: number;
}

/** Menu lateral em tela cheia para telas menores que 768px (Radix Dialog: Esc fecha, foco preso). */
export function MobileMenu({ navigationItems, itemsInCart }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { logoutState, isOrganizer } = useAuth();
  const close = () => setOpen(false);

  // Se a janela passar do breakpoint de desktop, o botão some: fecha o menu para não prender o foco.
  useEffect(() => {
    const query = window.matchMedia("(min-width: 768px)");
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) setOpen(false);
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="hubee_header" size="icon" aria-label="Abrir menu" className="md:hidden">
          <Menu aria-hidden="true" className="size-5" />
        </Button>
      </DialogTrigger>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 right-0 z-50 flex w-[min(85vw,20rem)] flex-col gap-4 overflow-y-auto border-l border-hubee-800/25 bg-hubee-50 pb-6 text-hubee-800 shadow-xl outline-none duration-200 data-open:animate-in data-open:slide-in-from-right data-closed:animate-out data-closed:slide-out-to-right motion-reduce:animate-none dark:border-hubee-400 dark:bg-hubee-800 dark:text-hubee-50"
        >
          <DialogTitle className="sr-only">Menu</DialogTitle>

          <div className="flex h-14 shrink-0 items-center justify-between bg-hubee-800 px-4 text-hubee-50 dark:bg-hubee-400 dark:text-hubee-800">
            <Link
              href="/#inicio"
              onClick={close}
              aria-label="Hubee — página inicial"
              className="inline-flex shrink-0 items-center rounded-md outline-none hover:opacity-85 focus-visible:ring-3 focus-visible:ring-hubee-400 dark:focus-visible:ring-hubee-800"
            >
              <ThemedHubeeLogo light="white" dark="dark_alt" className="h-8" />
            </Link>
            <DialogPrimitive.Close asChild>
              <Button type="button" variant="hubee_header" size="icon" aria-label="Fechar menu">
                <X aria-hidden="true" className="size-5" />
              </Button>
            </DialogPrimitive.Close>
          </div>

          <nav aria-label="Menu principal" className="flex flex-col gap-4 px-3">
            <div>
              <p className={groupLabelClassName}>Navegação</p>
              <ul className="flex flex-col gap-0.5">
                {navigationItems.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={close}
                      aria-current={isActiveRoute(pathname, href) ? "page" : undefined}
                      className={itemClassName}
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <hr className="border-hubee-800/20 dark:border-hubee-50/20" />

            <ul className="flex flex-col gap-0.5">
              <li>
                <Link
                  href={cartHref}
                  onClick={close}
                  aria-label={formatCartLabel(itemsInCart)}
                  aria-current={isActiveRoute(pathname, cartHref) ? "page" : undefined}
                  className={itemClassName}
                >
                  <ShoppingCart aria-hidden="true" />
                  Carrinho
                  {itemsInCart > 0 && (
                    <span
                      aria-hidden="true"
                      className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-hubee-800 px-1.5 text-xs font-bold text-hubee-50 dark:bg-hubee-400 dark:text-hubee-800"
                    >
                      {itemsInCart > 99 ? "99+" : itemsInCart}
                    </span>
                  )}
                </Link>
              </li>
              <li>
                <Link
                  href={notificationsHref}
                  onClick={close}
                  aria-current={isActiveRoute(pathname, notificationsHref) ? "page" : undefined}
                  className={itemClassName}
                >
                  <Bell aria-hidden="true" />
                  Notificações
                </Link>
              </li>
            </ul>

            <div>
              <p className={groupLabelClassName}>Conta</p>
              <ul className="flex flex-col gap-0.5">
                {getAccountNavItems(isOrganizer).map(({ href, label, icon: Icon }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={close}
                      aria-current={isActiveRoute(pathname, href) ? "page" : undefined}
                      className={itemClassName}
                    >
                      <Icon aria-hidden="true" />
                      {label}
                    </Link>
                  </li>
                ))}
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      close();
                      void logoutState();
                    }}
                    className={cn(itemClassName, "cursor-pointer")}
                  >
                    <LogOut aria-hidden="true" />
                    Sair
                  </button>
                </li>
              </ul>
            </div>
          </nav>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
