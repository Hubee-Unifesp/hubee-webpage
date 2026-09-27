"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { HeaderActions } from "./actions/header-actions";
import { MainNavigation } from "./navigation/main-navigation";
import { getNavigationItems } from "./navigation/navigation.config";
import { ThemeToggle } from "./theme-toggle";
import type { HeaderProps } from "./types";

export function Header({
  role = "guest",
  className,
  fixed = false,
  homeHref = "/",
  logoutHref,
}: HeaderProps) {
  const pathname = usePathname();
  const items = getNavigationItems(role, homeHref);

  return (
    <div
      className={cn(
        "w-full px-4 pt-4 sm:px-8 md:grid md:items-center md:px-6 md:grid-cols-[1fr_minmax(0,52rem)_1fr] md:gap-4",
        fixed && "fixed inset-x-0 top-0 z-40",
        className,
      )}
    >
      <div className="hidden justify-self-start md:block">
        <ThemeToggle className="text-hubee-800 hover:text-hubee-600 focus-visible:ring-hubee-800 dark:text-hubee-400 dark:hover:text-hubee-200 dark:focus-visible:ring-hubee-400" />
      </div>
      <header className="flex h-14 min-w-0 items-center justify-between gap-3 rounded-xl bg-hubee-800 px-4 text-hubee-50 shadow-md shadow-hubee-800/25 md:gap-6 md:px-5 dark:bg-hubee-400 dark:text-hubee-800 dark:shadow-hubee-900/40">
        <Link
          href={`${homeHref}#inicio`}
          aria-label="Hubee — página inicial"
          className="rounded-md font-heading text-[26px] leading-none font-extrabold tracking-tighter outline-none hover:text-hubee-400 focus-visible:ring-3 focus-visible:ring-hubee-400 md:text-[28px] dark:hover:text-hubee-50 dark:focus-visible:ring-hubee-800"
        >
          LOGO
        </Link>
        <MainNavigation items={items} pathname={pathname} />
        <div className="flex items-center gap-0.5">
          <ThemeToggle className="md:hidden" />
          <HeaderActions signedIn={role !== "guest"} logoutHref={logoutHref} />
        </div>
      </header>
    </div>
  );
}
