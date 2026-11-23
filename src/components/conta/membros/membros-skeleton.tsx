/** Esqueleto de carregamento da tela de Membros da organização (`/conta/membros`). */
export function MembrosSkeleton() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-4">
      <span className="sr-only">Carregando membros da organização...</span>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="h-10 flex-1 animate-pulse rounded-lg bg-hubee-200/70 motion-reduce:animate-none dark:bg-hubee-50/10" />
        <div className="grid grid-cols-2 gap-3 sm:contents">
          <div className="h-10 animate-pulse rounded-lg bg-hubee-200/70 sm:w-44 motion-reduce:animate-none dark:bg-hubee-50/10" />
          <div className="h-10 animate-pulse rounded-lg bg-hubee-200/70 sm:w-44 motion-reduce:animate-none dark:bg-hubee-50/10" />
        </div>
      </div>

      <div className="hidden flex-col gap-2 rounded-xl border border-hubee-200 bg-hubee-neutral-25 p-4 xl:flex dark:border-hubee-50/15 dark:bg-hubee-850">
        {Array.from({ length: 4 }, (_, index) => (
          <div
            key={index}
            className="h-12 animate-pulse rounded-lg bg-hubee-100/80 motion-reduce:animate-none dark:bg-hubee-50/10"
          />
        ))}
      </div>

      <div className="flex flex-col gap-3 xl:hidden">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-xl border border-hubee-200 bg-hubee-neutral-25 motion-reduce:animate-none dark:border-hubee-50/15 dark:bg-hubee-850"
          />
        ))}
      </div>
    </div>
  );
}
