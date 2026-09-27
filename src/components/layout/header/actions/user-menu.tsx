import Link from "next/link";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { userMenuItems } from "./actions.config";

interface UserMenuProps {
  logoutHref?: string;
}

export function UserMenu({ logoutHref }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="hubee_header" size="icon" aria-label="Abrir menu do usuário">
          <User aria-hidden="true" className="size-[18px]" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52 bg-hubee-800 text-hubee-50 dark:bg-hubee-50 dark:text-hubee-800">
        {userMenuItems.map(({ href, label, icon: Icon }) => (
          <DropdownMenuItem key={href} asChild>
            <Link href={href}><Icon aria-hidden="true" />{label}</Link>
          </DropdownMenuItem>
        ))}
        {logoutHref && (
          <DropdownMenuItem asChild>
            <Link href={logoutHref}><LogOut aria-hidden="true" />Sair</Link>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
