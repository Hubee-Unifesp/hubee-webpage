import { Skeleton, SkeletonText } from "@/components/skeleton";
import { cn } from "@/lib/utils";
import { EventPageShell, containerClassName } from "./event-page-shell";
import { sectionCardClassName } from "./section-card";

/** Estado de carregamento com a mesma estrutura da página de detalhes. */
export function EventDetailsSkeleton() {
  return (
    <EventPageShell label="Carregando evento">
      <div role="status" aria-live="polite">
        <span className="sr-only">Carregando evento…</span>

        <div className="border-b border-hubee-200/70 dark:border-hubee-750">
          <div className={cn(containerClassName, "py-3")}>
            <Skeleton className="h-3 w-28 rounded-full md:w-56" />
          </div>
        </div>

        <div aria-hidden="true" className="relative overflow-hidden bg-hubee-200/70 dark:bg-hubee-750">
          <div className={cn(containerClassName, "flex min-h-[26rem] flex-col justify-end gap-3 pb-6 md:min-h-[32rem] md:pb-7")}>
            <Skeleton className="h-2.5 w-40 rounded-full bg-hubee-100 dark:bg-hubee-700" />
            <Skeleton className="h-10 w-4/5 max-w-sm bg-hubee-100 md:h-12 dark:bg-hubee-700" />
            <Skeleton className="h-10 w-3/5 max-w-xs bg-hubee-100 md:h-12 dark:bg-hubee-700" />
            <Skeleton className="h-3 w-48 rounded-full bg-hubee-100 dark:bg-hubee-700" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-20 bg-hubee-100 dark:bg-hubee-700" />
              <Skeleton className="h-6 w-14 bg-hubee-100 dark:bg-hubee-700" />
            </div>
          </div>
        </div>

        <div aria-hidden="true" className={cn(containerClassName, "space-y-10 py-8 md:space-y-12 md:py-10")}>
          <div>
            <Skeleton className="h-7 w-56" />
            <SkeletonText lines={3} className="mt-4 max-w-3xl" />
            <SkeletonText lines={3} className="mt-4 max-w-3xl" />
            <Skeleton className="mt-4 h-4 w-14" />
          </div>

          <div>
            <Skeleton className="h-7 w-64" />
            <div className={cn(sectionCardClassName, "mt-4 flex gap-4 p-4 md:p-5")}>
              <Skeleton className="size-10 shrink-0" />
              <SkeletonText lines={4} className="flex-1" />
            </div>
          </div>

          <div>
            <Skeleton className="h-7 w-52" />
            <div className="mt-4 flex items-center gap-3">
              <Skeleton className="size-12 rounded-full" />
              <SkeletonText lines={2} className="w-28" />
              <Skeleton className="ml-auto h-4 w-16" />
            </div>
          </div>

          <div>
            <Skeleton className="h-7 w-28" />
            <Skeleton className="mt-2 h-4 w-72 max-w-full" />
            <div className="mt-4 grid gap-3 md:grid-cols-3 md:gap-4">
              {Array.from({ length: 3 }, (_, index) => (
                <div key={index} className={cn(sectionCardClassName, "p-4 md:p-5")}>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-14" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Skeleton className="mt-4 h-7 w-28" />
                  <Skeleton className="mt-2 h-3 w-20" />
                  <Skeleton className="mt-5 h-10 w-full" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </EventPageShell>
  );
}
