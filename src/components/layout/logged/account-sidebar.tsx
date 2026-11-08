"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActiveRoute } from "@/components/layout/header";
import { useAuth } from "@/contexts/AuthContext";
import { getAccountNavGroups } from "./account-nav.config";

const navLinkClassName =
  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium outline-none hover:bg-hubee-100 focus-visible:ring-3 focus-visible:ring-hubee-800 aria-[current=page]:bg-hubee-800 aria-[current=page]:font-semibold aria-[current=page]:text-hubee-50 dark:hover:bg-hubee-750 dark:focus-visible:ring-hubee-400 dark:aria-[current=page]:bg-hubee-800 dark:aria-[current=page]:text-hubee-50";

/** Menu lateral da conta (desktop, a partir de 768px). */
export function AccountSidebar() {
  const pathname = usePathname();
  const { isOrganizer } = useAuth();

  return (
    <nav aria-label="Conta" className="hidden md:block">
      <div className="sticky top-6 flex flex-col gap-5">
        {getAccountNavGroups(isOrganizer).map((group) => (
          <div key={group.label} className="flex flex-col">
            <p className="mb-1.5 px-3 text-xs font-semibold text-hubee-750/75 dark:text-hubee-200">{group.label}</p>
            <ul className="flex flex-col gap-1">
              {group.items.map(({ href, label, icon: Icon }) => (
                <li key={href}>
                  <Link
                    href={href}
                    aria-current={isActiveRoute(pathname, href) ? "page" : undefined}
                    className={navLinkClassName}
                  >
                    <Icon aria-hidden="true" className="size-4 shrink-0" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </nav>
  );
}
