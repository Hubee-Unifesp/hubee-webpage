import { Skeleton } from "@/components/skeleton";

/** Esqueleto da lista de pedidos: filtros e quatro linhas. */
export function PedidosSkeleton() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-4">
      <span className="sr-only">Carregando seus pedidos…</span>
      <div className="flex gap-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-6 w-20 rounded-full" />
        ))}
      </div>
      <div className="divide-y divide-hubee-300 overflow-hidden rounded-xl border border-hubee-300 bg-hubee-100 shadow-sm">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="flex items-center gap-3 p-3 md:gap-4 md:px-4">
            <Skeleton className="size-11 shrink-0 rounded-lg md:size-12" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-4 w-1/3 rounded" />
              <Skeleton className="h-3 w-1/2 rounded" />
            </div>
            <div className="flex flex-col items-end gap-1.5">
              <Skeleton className="h-4 w-16 rounded" />
              <Skeleton className="h-4 w-12 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Esqueleto do detalhe: título, resumo da compra e ingressos. */
export function PedidoDetalheSkeleton() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-6">
      <span className="sr-only">Carregando o pedido…</span>
      <Skeleton className="h-9 w-64 rounded-full" />
      <Skeleton className="h-44 w-full rounded-xl" />
      <Skeleton className="h-56 w-full rounded-xl" />
    </div>
  );
}
