import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatCurrencyBRL, type CartSummary } from "./carrinho.data";

interface CarrinhoResumoProps {
  summary: CartSummary;
}

/**
 * Resumo financeiro do carrinho. Não há campo de cupom: a API não tem desconto nem taxa,
 * e mostrar um abatimento que não é aplicado deixaria o total da tela diferente do cobrado.
 */
export function CarrinhoResumo({ summary }: CarrinhoResumoProps) {
  return (
    <aside
      aria-labelledby="resumo-carrinho-titulo"
      className="flex flex-col rounded-2xl border border-hubee-300 bg-hubee-100 p-5 text-hubee-800 shadow-xs md:p-6 dark:border-hubee-600/80 dark:bg-hubee-900/90 dark:text-hubee-50"
    >
      <h2 id="resumo-carrinho-titulo" className="sr-only">
        Resumo financeiro do carrinho
      </h2>

      {/* Valores: Subtotal, Taxas e Total */}
      <dl className="flex flex-col gap-2.5 text-xs md:text-sm">
        <div className="flex items-center justify-between gap-2">
          <dt className="text-hubee-800 dark:text-hubee-100">Subtotal</dt>
          <dd className="font-medium tabular-nums">
            {formatCurrencyBRL(summary.subtotal)}
          </dd>
        </div>

        <div className="flex items-center justify-between gap-2">
          <dt className="text-hubee-800 dark:text-hubee-100">Taxas</dt>
          <dd className="font-medium tabular-nums">
            {formatCurrencyBRL(summary.serviceFee)}
          </dd>
        </div>

        <div className="mt-1 flex items-center justify-between gap-2 text-base font-bold md:text-lg">
          <dt>Total</dt>
          <dd className="tabular-nums">{formatCurrencyBRL(summary.total)}</dd>
        </div>
      </dl>

      <hr className="my-5 border-hubee-750/30 dark:border-hubee-50/25" />

      {/* Ações: Escolher mais produtos + Continuar compra */}
      <div className="flex flex-col gap-3">
        <Link
          href="/eventos"
          className="inline-flex h-10 w-full items-center rounded-xl bg-hubee-800 px-4 text-xs font-medium text-hubee-50 transition-colors outline-none hover:bg-hubee-900 focus-visible:ring-2 focus-visible:ring-hubee-400 dark:bg-hubee-800/80 dark:text-hubee-50 dark:hover:bg-hubee-750"
        >
          Escolher mais produtos
        </Link>

        <Link
          href="/checkout"
          className="inline-flex h-12 w-full items-center justify-between rounded-xl bg-hubee-800 px-4 text-sm font-medium text-hubee-50 transition-colors outline-none hover:bg-hubee-900 focus-visible:ring-2 focus-visible:ring-hubee-400 dark:bg-hubee-800/90 dark:text-hubee-50 dark:hover:bg-hubee-750"
        >
          <span>Continuar compra</span>
          <ArrowRight aria-hidden="true" className="size-4" />
        </Link>
      </div>
    </aside>
  );
}
