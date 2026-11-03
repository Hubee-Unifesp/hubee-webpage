"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { accountActions, loginItem } from "./actions.config";
import { LoggedUserMenu } from "@/components/layout/logged";
import { cartHref, formatCartLabel } from "@/components/layout/logged/account-nav.config";
import { useCart } from "@/contexts/CartContext";
import type { Usuario } from "@/types/usuario";

interface HeaderActionsProps {
  user?: Usuario | null;
  signedIn?: boolean;
}

export function HeaderActions({ user, signedIn = !!user }: HeaderActionsProps) {
  const isLogged = Boolean(user && signedIn);
  const { totalItens } = useCart();

  return (
    <div className="flex items-center gap-0.5">
      {isLogged && user ? (
        <div className="hidden items-center gap-0.5 md:flex">
          {accountActions.map(({ href, label, icon: Icon }) => {
            const isCart = href === cartHref;

            return (
              <Button
                key={href}
                variant="hubee_header"
                size="icon"
                className={isCart ? "relative" : undefined}
                asChild
              >
                <Link href={href} aria-label={isCart ? formatCartLabel(totalItens) : label}>
                  <Icon aria-hidden="true" className="size-[18px]" />
                  {isCart && totalItens > 0 && (
                    <span
                      aria-hidden="true"
                      className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-hubee-400 px-1 text-[10px] leading-none font-bold text-hubee-800 dark:bg-hubee-800 dark:text-hubee-50"
                    >
                      {totalItens > 99 ? "99+" : totalItens}
                    </span>
                  )}
                </Link>
              </Button>
            );
          })}
          <LoggedUserMenu usuario={user} />
        </div>
      ) : (
        <Button variant="hubee_header" size="default" className="border-current font-semibold" asChild>
          <Link href={loginItem.href}>{loginItem.label}</Link>
        </Button>
      )}
    </div>
  );
}
