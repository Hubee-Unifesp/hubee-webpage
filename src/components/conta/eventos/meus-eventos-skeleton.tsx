import { Skeleton } from "@/components/skeleton";

/** Esqueleto de carregamento da tela "Meus Eventos": cabeçalho, filtros e quatro cartões. */
export function MeusEventosSkeleton() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-5">
      <span className="sr-only">Carregando eventos da organização…</span>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-6 w-56 rounded-full" />
        <Skeleton className="h-9 w-36 rounded-full" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-7 w-24 rounded-full" />
          ))}
        </div>
        <Skeleton className="h-9 w-full rounded-lg sm:w-64" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-44 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

