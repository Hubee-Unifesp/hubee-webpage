"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { HeaderActions } from "./actions/header-actions";
import { MainNavigation } from "./navigation/main-navigation";
import { getNavigationItems } from "./navigation/navigation.config";
import { ThemeToggle } from "./theme-toggle";
import type { HeaderProps, HeaderRole } from "./types";
import { useAuth } from "@/contexts/AuthContext";
import { ThemedHubeeLogo } from "@/components/brand";
import { MobileMenu } from "@/components/layout/logged";

export function Header({
  className,
  fixed = false,
  homeHref = "/",
  unreadNotifications = 0,
}: Omit<HeaderProps, 'role' | 'logoutHref'>) {
  const pathname = usePathname();
  const { user, isOrganizer } = useAuth();
  const currentRole: HeaderRole = user
    ? (isOrganizer ? 'organizer' : 'user')
    : 'guest';

  const items = getNavigationItems(currentRole, homeHref);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div
      data-scrolled={scrolled}
      className={cn(
        "group/nav w-full px-4 pt-4 transition-[padding,background-color,box-shadow] duration-300 sm:px-8 md:grid md:items-center md:px-6 md:grid-cols-[1fr_minmax(0,52rem)_1fr] md:gap-4 motion-reduce:transition-none",
        "data-[scrolled=true]:bg-hubee-800 data-[scrolled=true]:pt-0 data-[scrolled=true]:shadow-md data-[scrolled=true]:shadow-hubee-900/20 dark:data-[scrolled=true]:bg-hubee-850 dark:data-[scrolled=true]:shadow-none",
        fixed ? "fixed inset-x-0 top-0 z-40" : "sticky top-0 z-40",
        className,
      )}
    >
      <div className="hidden justify-self-start rounded-full bg-hubee-50 transition-colors md:block dark:bg-hubee-900 group-data-[scrolled=true]/nav:bg-transparent">
        <ThemeToggle className="text-hubee-800 hover:text-hubee-600 focus-visible:ring-hubee-800 dark:text-hubee-400 dark:hover:text-hubee-200 dark:focus-visible:ring-hubee-400 group-data-[scrolled=true]/nav:text-hubee-50 group-data-[scrolled=true]/nav:hover:text-hubee-400" />
      </div>
      <header className="flex h-14 min-w-0 items-center justify-between gap-3 rounded-xl bg-hubee-800 px-4 text-hubee-50 shadow-md shadow-hubee-800/25 transition-[border-radius,box-shadow] duration-300 md:gap-6 md:px-5 dark:bg-hubee-850 dark:text-hubee-50 dark:shadow-none group-data-[scrolled=true]/nav:rounded-none group-data-[scrolled=true]/nav:shadow-none motion-reduce:transition-none">
        <Link
          href={`${homeHref}#inicio`}
          aria-label="Hubee — página inicial"
          className="inline-flex shrink-0 items-center rounded-md outline-none hover:opacity-85 focus-visible:ring-3 focus-visible:ring-hubee-400"
        >
          <ThemedHubeeLogo light="white" dark="white" className="h-8 md:h-9" priority />
        </Link>
        <MainNavigation items={items} pathname={pathname} />
        <div className="flex items-center gap-0.5">
          <ThemeToggle className="md:hidden" />
          <HeaderActions user={user} unreadNotifications={unreadNotifications} />
          <MobileMenu
            navigationItems={items}
            homeHref={homeHref}
            unreadNotifications={unreadNotifications}
          />
        </div>
      </header>
    </div>
  );
}
