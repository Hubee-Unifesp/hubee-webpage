import Link from "next/link";
import { Button } from "@/components/ui/button";
import { accountActions, loginItem } from "./actions.config";
import { ThemeToggle } from "./theme-toggle";
import { UserMenu } from "./user-menu";

interface HeaderActionsProps {
  signedIn: boolean;
  logoutHref?: string;
}

export function HeaderActions({ signedIn, logoutHref }: HeaderActionsProps) {
  return (
    <div className="flex items-center gap-1">
      <ThemeToggle />
      {signedIn ? (
        <>
          {accountActions.map(({ href, label, icon: Icon }) => (
            <Button key={href} variant="hubee_header" size="icon-lg" asChild>
              <Link href={href} aria-label={label}>
                <Icon aria-hidden="true" className="size-5" />
              </Link>
            </Button>
          ))}
          <UserMenu logoutHref={logoutHref} />
        </>
      ) : (
        <Button variant="hubee_header" size="lg" className="border-current font-bold" asChild>
          <Link href={loginItem.href}>{loginItem.label}</Link>
        </Button>
      )}
    </div>
  );
}
