import type { ReactNode } from "react";
import { AuthIllustration } from "@/components/auth/auth-illustration";
import { AuthHeader } from "../../components/auth/auth-header";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative grid min-h-dvh bg-hubee-50 text-hubee-800 lg:grid-cols-[1.7fr_1fr] dark:bg-hubee-neutral-500 dark:text-hubee-50">
      <div className="relative flex flex-col overflow-hidden">
        <header className="flex h-[120px] shrink-0 items-center bg-hubee-800 px-8 text-hubee-50 lg:h-16 lg:bg-transparent lg:px-6 lg:text-current dark:bg-hubee-900 lg:dark:bg-transparent">
          <AuthHeader />
        </header>
        <main className="relative z-10 flex flex-1 items-start justify-center px-5 pb-60 pt-18 lg:items-center lg:px-10 lg:py-8">
          {children}
        </main>
      </div>
      <aside aria-hidden="true" className="hidden overflow-hidden bg-hubee-900 lg:block">
      </aside>
      <AuthIllustration />
    </div>
  );
}