import type { ReactNode } from "react";
import { AccountSidebar, AccountTabs } from "@/components/layout/logged";

/** Navegação da conta: lateral no desktop e abas no mobile. O carrinho não usa este layout. */
export default function ContaLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AccountTabs />
      <div className="grid gap-6 md:grid-cols-[13rem_minmax(0,1fr)] md:gap-8">
        <AccountSidebar />
        <div className="min-w-0">{children}</div>
      </div>
    </>
  );
}
