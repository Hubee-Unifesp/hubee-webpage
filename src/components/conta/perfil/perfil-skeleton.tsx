import { Skeleton } from "@/components/skeleton";

/** Esqueleto do Meu Perfil: três cartões (dados, senha, exclusão) enquanto o usuário carrega. */
export function PerfilSkeleton() {
  return (
    <div role="status" aria-live="polite" className="flex flex-col gap-4">
      <span className="sr-only">Carregando seu perfil…</span>
      <Skeleton className="h-96 w-full rounded-xl" />
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-72 w-full rounded-xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
    </div>
  );
}
