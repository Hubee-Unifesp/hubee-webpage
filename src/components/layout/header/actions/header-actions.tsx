import Link from "next/link";
import { Button } from "@/components/ui/button";
import { accountActions, loginItem } from "./actions.config";
import { UserMenu } from "./user-menu";

interface HeaderActionsProps {
  signedIn: boolean;
  userName?: string;
  onLogout?: () => void;
}

export function HeaderActions({ signedIn, userName, onLogout }: HeaderActionsProps) {
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
          <UserMenu userName={userName} onLogout={onLogout} />
        </>
      ) : (
        <Button variant="hubee_header" size="default" className="border-current font-semibold" asChild>
          <Link href={loginItem.href}>{loginItem.label}</Link>
        </Button>
      )}
    </div>
  );
}