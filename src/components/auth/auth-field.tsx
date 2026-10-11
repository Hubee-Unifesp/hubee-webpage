import type { ComponentProps, ReactNode } from "react";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export const authInputClassName =
  "h-9 border-hubee-neutral-50 bg-white text-hubee-800 placeholder:text-hubee-neutral-200 focus-visible:border-hubee-500 focus-visible:ring-hubee-500/30 dark:border-hubee-700 dark:bg-hubee-900 dark:text-hubee-50 dark:placeholder:text-hubee-neutral-300";

export function AuthInput({ className, ...props }: ComponentProps<typeof Input>) {
  return <Input className={cn(authInputClassName, className)} {...props} />;
}

export function fieldA11y(id: string, error?: string) {
  return {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": error ? `${id}-error` : undefined,
  };
}

interface AuthFieldProps {
  id: string;
  label: string;
  error?: string;
  description?: ReactNode;
  children: ReactNode;
}

export function AuthField({ id, label, error, description, children }: AuthFieldProps) {
  return (
    <Field className="gap-1">
      <FieldLabel htmlFor={id} className="text-base text-hubee-800 dark:text-hubee-50">
        {label}
      </FieldLabel>
      {children}
      {description && (
        <FieldDescription className="text-xs text-hubee-750 dark:text-hubee-neutral-50">{description}</FieldDescription>
      )}
      <FieldError id={`${id}-error`} className="text-xs text-red-700 dark:text-red-300">
        {error}
      </FieldError>
    </Field>
  );
}
