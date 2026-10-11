import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export const inputClassName =
  "h-10 border-hubee-200 bg-white text-hubee-800 placeholder:text-hubee-neutral-200 focus-visible:border-hubee-600 focus-visible:ring-hubee-600/40 dark:border-hubee-50/10 dark:bg-hubee-900/60 dark:text-hubee-50 dark:focus-visible:border-hubee-400 dark:focus-visible:ring-hubee-400/40";

export const submitButtonClassName =
  "h-10 w-full bg-hubee-800 text-xs font-semibold text-hubee-50 hover:bg-hubee-900 focus-visible:ring-hubee-800/40 dark:bg-hubee-50 dark:text-hubee-800 dark:hover:bg-hubee-100 dark:focus-visible:ring-hubee-400/40";

interface CampoProps extends ComponentProps<"input"> {
  id: string;
  label: string;
  erro?: string;
}

/** Campo de formulário: rótulo, input e mensagem de erro associados por id. */
export function Campo({ id, label, erro, className, ...props }: CampoProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-xs">
        {label}
      </Label>
      <Input
        id={id}
        aria-invalid={erro ? true : undefined}
        aria-describedby={erro ? `${id}-erro` : undefined}
        className={cn(inputClassName, className)}
        {...props}
      />
      {erro && (
        <p id={`${id}-erro`} role="alert" className="text-xs font-medium text-red-700 dark:text-red-300">
          {erro}
        </p>
      )}
    </div>
  );
}
