"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { CircleAlert, CircleCheck, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error";

interface ToastItem {
  id: number;
  variant: ToastVariant;
  message: string;
}

interface ToastApi {
  success: (message: string) => void;
  error: (message: string) => void;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const DURATION_MS: Record<ToastVariant, number> = { success: 5000, error: 8000 };

const variantStyles: Record<ToastVariant, { container: string; icon: typeof CircleCheck }> = {
  success: {
    container: "border-hubee-400 bg-hubee-100 text-hubee-800 dark:border-hubee-500 dark:bg-hubee-50 dark:text-hubee-800",
    icon: CircleCheck,
  },
  error: {
    container: "border-red-300 bg-red-50 text-red-900 dark:border-red-400 dark:bg-red-50 dark:text-red-900",
    icon: CircleAlert,
  },
};

/**
 * Provedor de toasts. Já está ligado em `app/(logado)/layout.tsx`.
 *
 * @example
 * const toast = useToast();
 * toast.success("Alterações salvas.");
 * toast.error("Não foi possível salvar. Tente novamente.");
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setToasts((current) => current.filter((item) => item.id !== id));
  }, []);

  const push = useCallback(
    (variant: ToastVariant, message: string) => {
      const id = nextId.current++;
      setToasts((current) => [...current, { id, variant, message }]);
      timers.current.set(id, setTimeout(() => dismiss(id), DURATION_MS[variant]));
    },
    [dismiss],
  );

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      success: (message) => push("success", message),
      error: (message) => push("error", message),
      dismiss,
    }),
    [push, dismiss],
  );

  return (
    <ToastContext value={api}>
      {children}
      <div
        role="region"
        aria-label="Notificações"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-[60] flex flex-col items-stretch gap-2 sm:inset-x-auto sm:right-4 sm:w-96"
      >
        {toasts.map(({ id, variant, message }) => {
          const { container, icon: Icon } = variantStyles[variant];
          return (
            <div
              key={id}
              role={variant === "error" ? "alert" : "status"}
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-xl border p-3 text-sm font-medium shadow-lg duration-150 animate-in fade-in-0 slide-in-from-bottom-2 motion-reduce:animate-none",
                container,
              )}
            >
              <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
              <p className="min-w-0 flex-1 break-words">{message}</p>
              <button
                type="button"
                onClick={() => dismiss(id)}
                aria-label="Fechar notificação"
                className="-m-1 rounded-md p-1 outline-none hover:bg-black/5 focus-visible:ring-3 focus-visible:ring-hubee-600"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext>
  );
}

export function useToast(): Pick<ToastApi, "success" | "error"> {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast deve ser usado dentro de ToastProvider.");
  return context;
}
