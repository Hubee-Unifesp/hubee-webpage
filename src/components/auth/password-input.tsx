"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState, type ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { AuthInput } from "./auth-field";

type PasswordInputProps = Omit<ComponentProps<typeof AuthInput>, "type">;

export function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;

  return (
    <div className="relative">
      <AuthInput {...props} type={visible ? "text" : "password"} className={cn("pr-10", className)} />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex w-10 items-center justify-center rounded-md text-hubee-800 outline-none focus-visible:ring-2 focus-visible:ring-hubee-500 dark:text-hubee-50"
      >
        <Icon aria-hidden="true" className="size-4" />
      </button>
    </div>
  );
}
