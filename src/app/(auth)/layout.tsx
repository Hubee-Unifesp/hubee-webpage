import {AuthHeader} from "../../components/auth/auth-header";
import type ReactNode from "react";

export default function AuthLayout({children}: {children: React.ReactNode}) {
  return (
    <div className="grid min-h-screen bg-hubee-50 text-hubee-800 lg:grid-cols-[1.7fr_1fr] dark:bg-hubee-neutral-500 dark:text-hubee-50">
      <div className="relative flex flex-col overflow-hidden">
        <header className="flex h-16 shrink-0 items-center bg-hubee-800 px-4 text-hubee-50 lg:bg-transparent lg:px-6 lg:text-current dark:bg-hubee-900 lg:dark:bg-transparent">
          <AuthHeader />
        </header>
      </div>
    </div>

  );
}