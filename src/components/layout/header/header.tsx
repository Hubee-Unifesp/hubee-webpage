"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { HeaderActions } from "./actions/header-actions";
import { MainNavigation } from "./navigation/main-navigation";
import { getNavigationItems } from "./navigation/navigation.config";
import type { HeaderProps } from "./types";

export function Header({
  role = "guest",
  className,
  fixed = true,
  homeHref = "/",
  logoutHref,
}: HeaderProps) {
  const pathname = usePathname();
  const items = getNavigationItems(role, homeHref);

  return (
    <header
      className={cn(
        "flex min-h-16 w-full items-center justify-between gap-3 rounded-b-[20px] bg-hubee-400 px-3 py-2.5 text-hubee-800 shadow-md shadow-hubee-800/20 md:min-h-20 md:gap-6 md:px-6 md:py-3 dark:bg-hubee-800 dark:text-hubee-50",
        fixed && "fixed inset-x-0 top-0 z-40",
        className,
      )}
    >
      <Link
        href={`${homeHref}#inicio`}
        aria-label="Hubee — página inicial"
        className="rounded-md font-heading text-[28px] leading-none font-extrabold tracking-tighter outline-none hover:text-hubee-50 focus-visible:ring-3 focus-visible:ring-hubee-900 md:text-4xl dark:hover:text-hubee-400 dark:focus-visible:ring-hubee-400"
      >
        LOGO
      </Link>
      <MainNavigation items={items} pathname={pathname} />
      <HeaderActions signedIn={role !== "guest"} logoutHref={logoutHref} />
    </header>
  );
}
