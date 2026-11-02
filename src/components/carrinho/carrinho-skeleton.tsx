import { Skeleton } from "@/components/skeleton";

export function CarrinhoSkeleton() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-8">
      <span className="sr-only">Carregando carrinho de compras…</span>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex flex-col gap-3">
          <Skeleton className="h-8 w-full rounded-full" />
          {Array.from({ length: 4 }, (_, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between gap-4 rounded-2xl border border-hubee-200 bg-hubee-100 p-4 dark:border-hubee-700 dark:bg-hubee-900/60"
            >
              <div className="flex items-center gap-3.5">
                <Skeleton className="size-16 shrink-0 rounded-xl" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-44 rounded-full" />
                  <Skeleton className="h-3 w-28 rounded-full" />
                </div>
              </div>
              <Skeleton className="h-9 w-24 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-hubee-200 bg-hubee-100 p-6 dark:border-hubee-700 dark:bg-hubee-900/60">
          <Skeleton className="h-5 w-20 rounded-full" />
          <div className="mt-3 flex gap-2.5">
            <Skeleton className="h-10 flex-1 rounded-xl" />
            <Skeleton className="h-10 w-24 rounded-xl" />
          </div>
          <hr className="my-5 border-hubee-200 dark:border-hubee-700" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-full rounded-full" />
            <Skeleton className="h-4 w-full rounded-full" />
            <Skeleton className="h-6 w-full rounded-full" />
          </div>
          <hr className="my-5 border-hubee-200 dark:border-hubee-700" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

