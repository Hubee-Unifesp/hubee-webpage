"use client";

import Link from "next/link";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganizacaoAtiva } from "@/hooks/useMeusEventos";
import { formatShortOrganizerRoleLabel } from "@/types/organizacao";
import type { Usuario } from "@/types/usuario";
import { buyerAccountNavItems } from "./account-nav.config";
import { UserAvatar } from "./user-avatar";

export function LoggedUserMenu({ usuario }: { usuario: Usuario }) {
  const { logoutState, isOrganizer } = useAuth();
  const { organizacoes, organizacaoAtiva } = useOrganizacaoAtiva();

  const activeOrg = organizacaoAtiva ?? organizacoes[0] ?? null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="hubee_header"
          size="icon"
          aria-label={`Abrir menu de ${usuario.fullName}`}
          className="group cursor-pointer transition-transform hover:scale-105 active:scale-95"
        >
          <UserAvatar
            name={usuario.fullName}
            src={usuario.avatarUrl}
            className="cursor-pointer transition-all ring-2 ring-transparent group-hover:ring-hubee-400 group-hover:brightness-105 dark:group-hover:ring-hubee-200"
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="min-w-60 rounded-xl border border-hubee-200 bg-hubee-neutral-25 p-2 text-hubee-800 shadow-lg dark:border-hubee-50/15 dark:bg-[#3a2803] dark:text-hubee-50"
      >
        <DropdownMenuLabel className="flex flex-col gap-0.5 px-2.5 py-2 font-normal text-hubee-800 dark:text-hubee-50">
          <span className="truncate text-sm font-bold">{usuario.fullName}</span>
          <span className="truncate text-xs text-hubee-neutral-300 dark:text-hubee-200">
            {usuario.email}
          </span>
          {isOrganizer && activeOrg && (
            <span className="mt-1.5 inline-flex w-fit max-w-full items-center truncate rounded-full border border-hubee-400/60 bg-hubee-100 px-2.5 py-0.5 text-[11px] font-semibold text-hubee-800 dark:border-hubee-300 dark:bg-hubee-100 dark:text-hubee-800">
              {formatShortOrganizerRoleLabel(activeOrg.papel)} • {activeOrg.nome}
            </span>
          )}
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="my-1.5 bg-hubee-800/10 dark:bg-hubee-50/15" />

        {buyerAccountNavItems.map(({ href, label, icon: Icon }) => (
          <DropdownMenuItem
            key={href}
            asChild
            className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-hubee-800 focus:bg-hubee-100 focus:text-hubee-800 dark:text-hubee-50 dark:focus:bg-hubee-400/20 dark:focus:text-hubee-50"
          >
            <Link href={href}>
              <Icon aria-hidden="true" className="size-4 text-current" />
              {label}
            </Link>
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator className="my-1.5 bg-hubee-800/10 dark:bg-hubee-50/15" />

        <DropdownMenuItem
          onSelect={() => void logoutState()}
          className="cursor-pointer gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-hubee-800 focus:bg-hubee-100 focus:text-hubee-800 dark:text-hubee-50 dark:focus:bg-hubee-400/20 dark:focus:text-hubee-50"
        >
          <LogOut aria-hidden="true" className="size-4 text-current" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
