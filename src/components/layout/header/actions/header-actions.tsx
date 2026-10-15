import Link from "next/link";
import { Button } from "@/components/ui/button";
import { accountActions, loginItem } from "./actions.config";
import { UserMenu } from "./user-menu";
import { LoggedUserMenu } from "@/components/layout/logged";
import type { Usuario } from "@/types/usuario";

interface HeaderActionsProps {
  signedIn: boolean;
  user?: Usuario | null;
  userName?: string;
  onLogout?: () => void;
}

export function HeaderActions({ signedIn, user, userName, onLogout }: HeaderActionsProps) {
  return (
    <div className="flex items-center gap-0.5">
      {signedIn ? (
        <>
          {accountActions.map(({ href, label, icon: Icon }) => (
            <Button key={href} variant="hubee_header" size="icon" asChild>
              <Link href={href} aria-label={label}>
                <Icon aria-hidden="true" className="size-[18px]" />
              </Link>
            </Button>
          ))}
          {user ? (
            <LoggedUserMenu usuario={user} />
          ) : (
            <UserMenu userName={userName} onLogout={onLogout} />
          )}
        </>
      ) : (
        <Button variant="hubee_header" size="default" className="border-current font-semibold" asChild>
          <Link href={loginItem.href}>{loginItem.label}</Link>
        </Button>
      )}
    </div>
  );
}