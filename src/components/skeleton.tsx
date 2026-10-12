import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** Bloco pulsante genérico. Use `className` para definir tamanho e formato. */
export function Skeleton({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      aria-hidden="true"
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-hubee-200 motion-reduce:animate-none dark:bg-hubee-700", className)}
      {...props}
    />
  );
}

interface SkeletonTextProps {
  lines?: number;
  className?: string;
}

/** Linhas de texto em carregamento; a última é mais curta. */
export function SkeletonText({ lines = 3, className }: SkeletonTextProps) {
  return (
    <div aria-hidden="true" className={cn("flex flex-col gap-2.5", className)}>
      {Array.from({ length: lines }, (_, index) => (
        <Skeleton key={index} className={cn("h-4 rounded-full", index === lines - 1 ? "w-3/5" : "w-full")} />
      ))}
    </div>
  );
}

interface PageSkeletonProps {
  /** Texto lido por leitores de tela enquanto a página carrega. */
  label?: string;
  className?: string;
}

/** Esqueleto de página: título e uma lista de cartões. Pronto para usar em `loading.tsx`. */
export function PageSkeleton({ label = "Carregando…", className }: PageSkeletonProps) {
  return (
    <div role="status" aria-live="polite" className={cn("flex w-full flex-col gap-6", className)}>
      <span className="sr-only">{label}</span>
      <Skeleton className="h-8 w-48 rounded-full" />
      <div className="flex flex-col gap-4">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-28 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
