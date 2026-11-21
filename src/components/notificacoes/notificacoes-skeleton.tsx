import { Skeleton, SkeletonText } from "@/components/skeleton";

/** Esqueleto estrutural da página `/notificacoes`: barra de filtros/ação e 4 cards de notificação. */
export function NotificacoesSkeleton() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-4">
      <span className="sr-only">Carregando suas notificações…</span>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-full" />
          <Skeleton className="h-8 w-28 rounded-full" />
        </div>
        <Skeleton className="h-9 w-44 rounded-lg" />
      </div>

      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="flex items-start gap-3.5 rounded-xl border border-hubee-200 bg-hubee-neutral-25 p-4 md:gap-4 md:p-5 dark:border-hubee-50/10 dark:bg-hubee-50/7"
          >
            <Skeleton className="size-10 shrink-0 rounded-xl" />
            <div className="flex flex-1 flex-col gap-2.5">
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-4 w-2/5 rounded-full" />
                <Skeleton className="h-3 w-14 rounded-full" />
              </div>
              <SkeletonText lines={2} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
