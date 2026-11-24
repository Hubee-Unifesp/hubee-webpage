import { Skeleton } from "@/components/skeleton";

/** Esqueleto responsivo da página `/minha-organizacao` enquanto carrega a sessão ou os dados da organização. */
export function MinhaOrganizacaoSkeleton() {
  return (
    <div aria-busy="true" aria-label="Carregando página da organização" className="flex flex-col gap-12">
      <Skeleton className="min-h-[380px] w-full rounded-[32px]" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 rounded-[26px] border border-hubee-200 bg-hubee-100/60 p-6 md:p-8 dark:border-hubee-50/15 dark:bg-hubee-850">
        <Skeleton className="h-8 w-64 rounded-lg" />
        <Skeleton className="h-4 w-full max-w-xl rounded-md" />
        <div className="mt-2 grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
          <Skeleton className="h-20 rounded-xl" />
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-6xl gap-4 md:grid-cols-2">
        <Skeleton className="h-44 rounded-xl" />
        <Skeleton className="h-44 rounded-xl" />
      </div>
    </div>
  );
}
