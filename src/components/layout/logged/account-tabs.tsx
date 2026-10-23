"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActiveRoute } from "@/components/layout/header";
import { useAuth } from "@/contexts/AuthContext";
import { getAccountNavItems } from "./account-nav.config";

/** Abas da conta (mobile, abaixo de 768px). Rolam na horizontal se não couberem. */
export function AccountTabs() {
  const pathname = usePathname();
  const { user } = useAuth();
  const showOrganizerEvents =
    (user?.organizations?.length ?? 0) > 0 ||
    user?.signupIntent === "ORGANIZE" ||
    isActiveRoute(pathname, "/conta/eventos");
  const navItems = getAccountNavItems(showOrganizerEvents);

  return (
    <nav
      aria-label="Conta"
      className="-mx-4 mb-6 border-b border-hubee-800/20 sm:-mx-8 md:hidden dark:border-hubee-400/30"
    >
      <ul className="flex overflow-x-auto">
        {navItems.map(({ href, label, icon: Icon }) => (
          <li key={href} className="min-w-max flex-1">
            <Link
              href={href}
              aria-current={isActiveRoute(pathname, href) ? "page" : undefined}
              className="-mb-px flex h-12 items-center justify-center gap-2 border-b-2 border-transparent px-4 text-sm font-medium whitespace-nowrap outline-none focus-visible:ring-3 focus-visible:ring-inset focus-visible:ring-hubee-800 aria-[current=page]:border-hubee-800 aria-[current=page]:font-semibold dark:focus-visible:ring-hubee-400 dark:aria-[current=page]:border-hubee-400"
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
