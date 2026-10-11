import Link from "next/link";
import { LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { userMenuItems } from "./actions.config";

interface UserMenuProps {
  userName?: string;
  onLogout?: () => void;
}

export function UserMenu({ userName, onLogout }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {/* Muda dinamicamente o tamanho do botão para acomodar o nome, se existir */}
        <Button 
          type="button" 
          variant="hubee_header" 
          size={userName ? "default" : "icon"} 
          aria-label="Abrir menu do usuário"
          className="gap-2 font-semibold"
        >
          <User aria-hidden="true" className="size-[18px]" />
          {userName && <span>{userName}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52 bg-hubee-800 text-hubee-50 dark:bg-hubee-50 dark:text-hubee-800">
        {userMenuItems.map(({ href, label, icon: Icon }) => (
          <DropdownMenuItem key={href} asChild>
            <Link href={href}>
              <Icon aria-hidden="true" className="mr-2" />
              {label}
            </Link>
          </DropdownMenuItem>
        ))}
        {onLogout && (
          <DropdownMenuItem onClick={onLogout} className="cursor-pointer">
            <LogOut aria-hidden="true" className="mr-2" />
            Sair
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}