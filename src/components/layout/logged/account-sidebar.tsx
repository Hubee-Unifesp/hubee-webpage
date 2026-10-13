"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActiveRoute } from "@/components/layout/header";
import { accountNavItems } from "./account-nav.config";

/** Menu lateral da conta (desktop, a partir de 768px). O item da página atual fica destacado. */
export function AccountSidebar() {
  const pathname = usePathname();

  return (
    <nav aria-label="Conta" className="hidden md:block">
      <ul className="sticky top-6 flex flex-col gap-1">
        {accountNavItems.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              aria-current={isActiveRoute(pathname, href) ? "page" : undefined}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium outline-none hover:bg-hubee-100 focus-visible:ring-3 focus-visible:ring-hubee-800 aria-[current=page]:bg-hubee-800 aria-[current=page]:text-hubee-50 dark:hover:bg-hubee-750 dark:focus-visible:ring-hubee-400 dark:aria-[current=page]:bg-hubee-400 dark:aria-[current=page]:text-hubee-800"
            >
              <Icon aria-hidden="true" className="size-4 shrink-0" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
