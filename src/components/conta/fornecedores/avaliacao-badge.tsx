import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Fornecedor } from "@/types/fornecedor";
import {
  formatarNotaMedia,
  getNotaMedia,
  getTotalAvaliacoes,
  NOTA_DESTAQUE,
  temAvaliacao,
} from "./fornecedores.data";

interface AvaliacaoBadgeProps {
  fornecedor: Pick<
    Fornecedor,
    "ratingAverage" | "ratingCount" | "averageRating" | "reviewsCount"
  >;
  className?: string;
}

/**
 * Indicador de reputação do fornecedor (`GOL-249`):
 * - `>= 4,5`: pílula de destaque (`★ 4,9 (24)`)
 * - `< 4,5`: indicador inline sem pílula (`★ 3,8 (5)`)
 * - sem avaliações: rótulo neutro `Sem avaliações`
 */
export function AvaliacaoBadge({ fornecedor, className }: AvaliacaoBadgeProps) {
  const notaMedia = getNotaMedia(fornecedor);
  const total = getTotalAvaliacoes(fornecedor);

  if (!temAvaliacao(fornecedor) || notaMedia === null) {
    return (
      <span
        className={cn(
          "text-xs font-normal whitespace-nowrap text-hubee-neutral-300 dark:text-hubee-200/75",
          className,
        )}
      >
        Sem avaliações
      </span>
    );
  }

  const notaFormatada = formatarNotaMedia(notaMedia);
  const labelAcessivel = `Avaliação ${notaFormatada} de 5 estrelas (${total} ${
    total === 1 ? "avaliação" : "avaliações"
  })`;
  const destaque = notaMedia >= NOTA_DESTAQUE;

  if (destaque) {
    return (
      <span
        aria-label={labelAcessivel}
        className={cn(
          "inline-flex items-center gap-1 rounded-full border border-hubee-300 bg-hubee-100 px-2.5 py-0.5 text-xs whitespace-nowrap tabular-nums dark:border-hubee-600/60 dark:bg-hubee-800",
          className,
        )}
      >
        <Star
          aria-hidden="true"
          className="size-3.5 shrink-0 fill-current text-hubee-500 stroke-hubee-600 dark:text-hubee-400 dark:stroke-hubee-400"
        />
        <span className="font-semibold text-hubee-800 dark:text-hubee-50">{notaFormatada}</span>
        <span className="font-semibold text-hubee-750/80 dark:text-hubee-200">({total})</span>
      </span>
    );
  }

  return (
    <span
      aria-label={labelAcessivel}
      className={cn("inline-flex items-center gap-1 text-xs whitespace-nowrap tabular-nums", className)}
    >
      <Star
        aria-hidden="true"
        className="size-3.5 shrink-0 fill-current text-hubee-500 stroke-hubee-600 dark:text-hubee-400 dark:stroke-hubee-400"
      />
      <span className="font-semibold text-hubee-800 dark:text-hubee-50">{notaFormatada}</span>
      <span className="font-normal text-hubee-neutral-300 dark:text-hubee-200">({total})</span>
    </span>
  );
}
