import Link from "next/link";
import { Button } from "@/components/ui/button";
import { accountActions, loginItem } from "./actions.config";
import { LoggedUserMenu } from "@/components/layout/logged";
import type { Usuario } from "@/types/usuario";

interface HeaderActionsProps {
  user?: Usuario | null;
  signedIn?: boolean;
}

export function HeaderActions({ user, signedIn = !!user }: HeaderActionsProps) {
  const isLogged = Boolean(user && signedIn);

  return (
    <div className="flex items-center gap-0.5">
      {isLogged && user ? (
        <div className="hidden items-center gap-0.5 md:flex">
          {accountActions.map(({ href, label, icon: Icon }) => (
            <Button key={href} variant="hubee_header" size="icon" asChild>
              <Link href={href} aria-label={label}>
                <Icon aria-hidden="true" className="size-[18px]" />
              </Link>
            </Button>
          ))}
          <LoggedUserMenu usuario={user} />
        </div>
      ) : (
        <Button variant="hubee_header" size="default" className="border-current font-semibold" asChild>
          <Link href={loginItem.href}>{loginItem.label}</Link>
        </Button>
      )}
    </div>
  );
}
