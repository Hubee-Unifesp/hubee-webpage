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
import { accountNavItems } from "@/components/layout/logged/account-nav.config";
import { UserAvatar } from "@/components/layout/logged/user-avatar";

interface UserMenuProps {
  userName?: string;
  userEmail?: string;
  avatarUrl?: string | null;
  onLogout?: () => void;
}

export function UserMenu({ userName, userEmail, avatarUrl, onLogout }: UserMenuProps) {
  const displayName = userName ?? "Usuário";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          type="button" 
          variant="hubee_header" 
          size="icon" 
          aria-label={`Abrir menu de ${displayName}`}
        >
          <UserAvatar name={displayName} src={avatarUrl} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-56 bg-hubee-800 text-hubee-50 dark:bg-hubee-50 dark:text-hubee-800">
        {userName && (
          <>
            <DropdownMenuLabel className="flex flex-col gap-0.5 font-normal text-hubee-50 dark:text-hubee-800">
              <span className="truncate text-sm font-semibold">{displayName}</span>
              {userEmail && <span className="truncate text-xs opacity-75">{userEmail}</span>}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-hubee-50/20 dark:bg-hubee-800/20" />
          </>
        )}
        {accountNavItems.map(({ href, label, icon: Icon }) => (
          <DropdownMenuItem key={href} asChild>
            <Link href={href}>
              <Icon aria-hidden="true" />
              {label}
            </Link>
          </DropdownMenuItem>
        ))}
        {onLogout && (
          <>
            <DropdownMenuSeparator className="bg-hubee-50/20 dark:bg-hubee-800/20" />
            <DropdownMenuItem onClick={onLogout} className="cursor-pointer">
              <LogOut aria-hidden="true" />
              Sair
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}