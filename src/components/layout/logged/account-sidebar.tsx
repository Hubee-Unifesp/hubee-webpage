"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, ChevronsUpDown } from "lucide-react";
import { isActiveRoute } from "@/components/layout/header";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganizacaoAtiva } from "@/hooks/useMeusEventos";
import { formatOrganizerRoleLabel } from "@/types/organizacao";
import { accountNavItems, organizerEventsNavItem } from "./account-nav.config";

const navLinkClassName =
  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium outline-none hover:bg-hubee-100 focus-visible:ring-3 focus-visible:ring-hubee-800 aria-[current=page]:bg-hubee-800 aria-[current=page]:font-semibold aria-[current=page]:text-hubee-50 dark:hover:bg-hubee-750 dark:focus-visible:ring-hubee-400 dark:aria-[current=page]:bg-hubee-400 dark:aria-[current=page]:text-hubee-800";

/** Menu lateral da conta (desktop, a partir de 768px). Separa "Minha Conta" da seção de Organização conforme o Figma. */
export function AccountSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { organizacoes, organizacaoAtiva, selecionarOrganizacao } = useOrganizacaoAtiva();

  const showOrganizerEvents =
    organizacoes.length > 0 ||
    (user?.organizations?.length ?? 0) > 0 ||
    user?.signupIntent === "ORGANIZE" ||
    isActiveRoute(pathname, "/conta/eventos");

  const OrganizerIcon = organizerEventsNavItem.icon;
  const activeOrgName = organizacaoAtiva?.nome ?? user?.organizations?.[0]?.name ?? "Hubee Eventos";

  return (
    <nav aria-label="Conta" className="hidden md:block">
      <div className="sticky top-6 flex flex-col">
        <p className="mb-1.5 px-3 text-xs font-semibold text-hubee-750/75 dark:text-hubee-200">
          Minha Conta
        </p>
        <ul className="flex flex-col gap-1">
          {accountNavItems.map(({ href, label, icon: Icon }) => (
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

        {showOrganizerEvents && (
          <>
            <hr className="my-3.5 border-hubee-800/15 dark:border-hubee-50/15" />

            <div className="flex flex-col gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    aria-label={`Organização ativa: ${activeOrgName}`}
                    className="flex w-full cursor-pointer items-center justify-between gap-2 rounded-lg border border-hubee-300/80 bg-hubee-neutral-25 px-3 py-2 text-left text-xs font-semibold text-hubee-800 outline-none hover:bg-hubee-100 focus-visible:ring-3 focus-visible:ring-hubee-800 dark:border-hubee-50/15 dark:bg-hubee-50/5 dark:text-hubee-50 dark:hover:bg-hubee-750 dark:focus-visible:ring-hubee-400"
                  >
                    <span className="truncate">Organização: {activeOrgName}</span>
                    <ChevronsUpDown aria-hidden="true" className="size-3.5 shrink-0 opacity-70" />
                  </button>
                </DropdownMenuTrigger>
                {organizacoes.length > 0 && (
                  <DropdownMenuContent
                    align="start"
                    className="w-52 rounded-xl border border-hubee-200 bg-hubee-neutral-25 p-1.5 text-hubee-800 shadow-lg dark:border-hubee-50/15 dark:bg-[#3a2803] dark:text-hubee-50"
                  >
                    {organizacoes.map((org) => {
                      const selecionada = org.orgId === organizacaoAtiva?.orgId;
                      return (
                        <DropdownMenuItem
                          key={org.orgId}
                          onSelect={() => selecionarOrganizacao(org.orgId)}
                          className="cursor-pointer justify-between gap-2 rounded-lg px-2.5 py-2 text-xs font-medium focus:bg-hubee-100 focus:text-hubee-800 dark:focus:bg-hubee-400/20 dark:focus:text-hubee-50"
                        >
                          <span className="truncate">
                            {org.nome} ({formatOrganizerRoleLabel(org.papel)})
                          </span>
                          {selecionada && <Check aria-hidden="true" className="size-3.5 shrink-0" />}
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                )}
              </DropdownMenu>

              <Link
                href={organizerEventsNavItem.href}
                aria-current={
                  isActiveRoute(pathname, organizerEventsNavItem.href) ? "page" : undefined
                }
                className={navLinkClassName}
              >
                <OrganizerIcon aria-hidden="true" className="size-4 shrink-0" />
                {organizerEventsNavItem.label}
              </Link>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
