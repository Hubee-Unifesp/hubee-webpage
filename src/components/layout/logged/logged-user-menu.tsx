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
import type { Usuario } from "@/types/usuario";
import { accountNavItems } from "./account-nav.config";
import { UserAvatar } from "./user-avatar";

export function LoggedUserMenu({ usuario }: { usuario: Usuario }) {
  const { logoutState } = useAuth();

  return (
    <DropdownMenu modal={false}>
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
      <DropdownMenuContent align="end" className="min-w-56 bg-hubee-800 text-hubee-50 dark:bg-hubee-50 dark:text-hubee-800">
        <DropdownMenuLabel className="flex flex-col gap-0.5 font-normal text-hubee-50 dark:text-hubee-800">
          <span className="truncate text-sm font-semibold">{usuario.fullName}</span>
          <span className="truncate text-xs opacity-75">{usuario.email}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-hubee-50/20 dark:bg-hubee-800/20" />
        {accountNavItems.map(({ href, label, icon: Icon }) => (
          <DropdownMenuItem key={href} asChild>
            <Link href={href}>
              <Icon aria-hidden="true" />
              {label}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className="bg-hubee-50/20 dark:bg-hubee-800/20" />
        <DropdownMenuItem onSelect={() => void logoutState()}>
          <LogOut aria-hidden="true" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
