import { Skeleton } from "@/components/skeleton";

/** Esqueleto da lista de pedidos: filtros e quatro cartões. */
export function PedidosSkeleton() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-4">
      <span className="sr-only">Carregando seus pedidos…</span>
      <div className="flex gap-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-6 w-20 rounded-full" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-40 w-full rounded-xl" />
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
