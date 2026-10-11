import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FormAlertProps {
  variant: "error" | "success";
  children: ReactNode;
}

export function FormAlert({ variant, children }: FormAlertProps) {
  return (
    <p
      role={variant === "error" ? "alert" : "status"}
      className={cn(
        "mb-4 rounded-md border px-3 py-2 text-sm",
        variant === "error"
          ? "border-red-700/30 bg-red-700/10 text-red-700 dark:border-red-300/40 dark:text-red-300"
          : "border-green-800/30 bg-green-800/10 text-green-800 dark:border-green-300/40 dark:text-green-300",
      )}
    >
      {children}
    </p>
  );
}
