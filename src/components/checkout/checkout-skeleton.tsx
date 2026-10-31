import { Skeleton } from "@/components/skeleton";

/** Esqueleto do card lateral de Resumo do Pedido. */
export function CheckoutOrderSummarySkeleton() {
  return (
    <div className="rounded-xl border border-hubee-200 bg-hubee-neutral-25 p-5 shadow-sm md:p-6 dark:border-hubee-50/10 dark:bg-hubee-50/7">
      <Skeleton className="h-5 w-36 rounded-full" />

      <div className="mt-4 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <Skeleton className="size-12 shrink-0 rounded-xl" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-4/5 rounded-full" />
            <Skeleton className="h-3 w-3/5 rounded-full" />
            <Skeleton className="h-3 w-2/3 rounded-full" />
          </div>
        </div>

        <hr className="border-hubee-200 dark:border-hubee-50/15" />

        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-40 rounded-full" />
            <Skeleton className="h-3.5 w-14 rounded-full" />
          </div>
          <div className="flex items-center justify-between">
            <Skeleton className="h-3.5 w-32 rounded-full" />
            <Skeleton className="h-3.5 w-12 rounded-full" />
          </div>
        </div>

        <hr className="border-hubee-200 dark:border-hubee-50/15" />

        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>

        <div className="flex items-center gap-2">
          <Skeleton className="size-4 shrink-0 rounded-xs" />
          <Skeleton className="h-3 w-full rounded-full" />
        </div>

        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-3 w-5/6 rounded-full" />
      </div>
    </div>
  );
}

/** Esqueleto completo da tela de Checkout (GOL-180). */
export function CheckoutSkeleton() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-6">
      <span className="sr-only">Carregando dados do checkout…</span>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-md" />
          <Skeleton className="h-8 w-52 rounded-full" />
        </div>
        <Skeleton className="h-3.5 w-80 max-w-full rounded-full" />
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-hubee-200 bg-hubee-neutral-25 p-5 shadow-sm md:p-6 dark:border-hubee-50/10 dark:bg-hubee-50/7">
            <Skeleton className="h-5 w-56 rounded-full" />
            <Skeleton className="mt-2 h-3 w-72 max-w-full rounded-full" />

            <div className="mt-4 flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <Skeleton className="size-4 rounded-xs" />
                <Skeleton className="h-3.5 w-56 rounded-full" />
              </div>

              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-3 w-28 rounded-full" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>

              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-3 w-20 rounded-full" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-3 w-12 rounded-full" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Skeleton className="h-3 w-32 rounded-full" />
                  <Skeleton className="h-10 w-full rounded-md" />
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-hubee-200 bg-hubee-neutral-25 p-5 shadow-sm md:p-6 dark:border-hubee-50/10 dark:bg-hubee-50/7">
            <Skeleton className="h-5 w-44 rounded-full" />
            <div className="mt-4 flex flex-col gap-4">
              <Skeleton className="h-10 w-full rounded-lg" />
              <Skeleton className="h-32 w-full rounded-xl" />
            </div>
          </div>
        </div>

        <CheckoutOrderSummarySkeleton />
      </div>
    </div>
  );
}

