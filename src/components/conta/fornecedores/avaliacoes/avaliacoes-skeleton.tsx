import { Skeleton } from "@/components/skeleton";

/** Esqueleto da página de avaliações: cabeçalho do fornecedor, resumo e lista. */
export function AvaliacoesSkeleton() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-5">
      <span className="sr-only">Carregando avaliações…</span>
      <Skeleton className="h-4 w-36 rounded-full" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-2/3 max-w-md rounded-lg" />
        <Skeleton className="h-4 w-1/2 max-w-xs rounded-full" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <Skeleton className="h-44 w-full rounded-xl" />
        <Skeleton className="h-44 w-full rounded-xl" />
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }, (_, index) => (
          <Skeleton key={index} className="h-40 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
