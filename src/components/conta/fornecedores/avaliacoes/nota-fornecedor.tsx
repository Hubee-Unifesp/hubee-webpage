import { Skeleton } from "@/components/skeleton";
import { formatarNota } from "./avaliacoes.data";
import { EstrelasNota } from "./estrelas";

/** Média compacta para a listagem: estrelas, nota e quantidade. `undefined` enquanto carrega. */
export function NotaFornecedor({ avaliacao }: { avaliacao: { media: number; total: number } | undefined }) {
  if (!avaliacao) return <Skeleton className="h-4 w-24 rounded-full" />;

  if (avaliacao.total === 0) {
    return <span className="text-xs whitespace-nowrap text-hubee-neutral-300 dark:text-hubee-200">Sem avaliações</span>;
  }

  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
      <EstrelasNota nota={avaliacao.media} tamanho="sm" />
      <span className="font-semibold tabular-nums">{formatarNota(avaliacao.media)}</span>
      <span className="text-hubee-neutral-300 tabular-nums dark:text-hubee-200">({avaliacao.total})</span>
    </span>
  );
}
