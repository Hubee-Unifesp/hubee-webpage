import { Skeleton } from "@/components/skeleton";

/** Esqueleto da listagem de fornecedores: filtros, tabela (desktop) ou cards (mobile) e contador. */
export function FornecedoresSkeleton() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-4">
      <span className="sr-only">Carregando fornecedores…</span>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-1 flex-col gap-1.5">
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
        <div className="grid grid-cols-2 gap-3 sm:contents">
          <div className="flex flex-col gap-1.5 sm:w-44">
            <Skeleton className="h-3 w-16 rounded-full" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
          <div className="flex flex-col gap-1.5 sm:w-44">
            <Skeleton className="h-3 w-28 rounded-full" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5 sm:w-48">
          <Skeleton className="h-3 w-20 rounded-full" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </div>
      </div>

      <div className="hidden flex-col overflow-hidden rounded-xl border border-hubee-200 xl:flex dark:border-hubee-750">
        <Skeleton className="h-11 w-full rounded-none" />
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className="flex items-center gap-6 border-t border-hubee-200 px-4 py-5 dark:border-hubee-750"
          >
            <Skeleton className="h-4 w-1/5 rounded-full" />
            <Skeleton className="h-4 w-1/6 rounded-full" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
            <Skeleton className="h-4 w-1/6 rounded-full" />
            <Skeleton className="h-4 flex-1 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-md" />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 xl:hidden">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-44 w-full rounded-xl" />
        ))}
      </div>

      <Skeleton className="h-3 w-44 rounded-full" />
    </div>
  );
}
