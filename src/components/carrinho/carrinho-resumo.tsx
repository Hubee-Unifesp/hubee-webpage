"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  DEFAULT_COUPON_CODE,
  DEFAULT_COUPON_DISCOUNT,
  formatCurrencyBRL,
  type CartSummary,
} from "./carrinho.data";

interface CarrinhoResumoProps {
  summary: CartSummary;
  appliedCoupon: string | null;
  onApplyCoupon: (code: string, discountAmount: number) => void;
  onRemoveCoupon: () => void;
}

export function CarrinhoResumo({
  summary,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
}: CarrinhoResumoProps) {
  const [couponInput, setCouponInput] = useState(appliedCoupon ?? "");
  const [couponFeedback, setCouponFeedback] = useState<string | null>(null);

  const handleCouponSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalized = couponInput.trim().toUpperCase();

    if (!normalized) {
      onRemoveCoupon();
      setCouponFeedback("Cupom removido.");
      return;
    }

    onApplyCoupon(normalized, DEFAULT_COUPON_DISCOUNT);
    setCouponFeedback(
      `Cupom ${normalized} aplicado (-${formatCurrencyBRL(DEFAULT_COUPON_DISCOUNT)}).`,
    );
  };

  return (
    <aside
      aria-labelledby="resumo-carrinho-titulo"
      className="flex flex-col rounded-2xl border border-hubee-300 bg-hubee-100 p-5 text-hubee-800 shadow-xs md:p-6 dark:border-hubee-600/80 dark:bg-hubee-900/90 dark:text-hubee-50"
    >
      <h2 id="resumo-carrinho-titulo" className="sr-only">
        Resumo financeiro do carrinho
      </h2>

      {/* Bloco de Cupom */}
      <form onSubmit={handleCouponSubmit} className="flex flex-col gap-2.5">
        <label
          htmlFor="carrinho-cupom-input"
          className="font-sans text-base font-medium text-hubee-800 dark:text-hubee-50"
        >
          Cupom
        </label>
        <div className="flex items-center gap-2.5">
          <input
            id="carrinho-cupom-input"
            type="text"
            value={couponInput}
            onChange={(event) => setCouponInput(event.target.value)}
            placeholder={DEFAULT_COUPON_CODE}
            aria-label="Código de cupom de desconto"
            className="h-10 min-w-0 flex-1 rounded-xl border border-hubee-200 bg-white px-3 text-xs font-medium text-hubee-800 placeholder:text-hubee-neutral-200 outline-none focus-visible:ring-2 focus-visible:ring-hubee-500 dark:border-hubee-700 dark:bg-white dark:text-hubee-800"
          />
          <button
            type="submit"
            className="inline-flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-hubee-750 bg-hubee-800 px-5 text-xs font-medium text-hubee-50 transition-colors outline-none hover:bg-hubee-900 focus-visible:ring-2 focus-visible:ring-hubee-400 dark:border-hubee-500 dark:bg-hubee-800 dark:text-hubee-50 dark:hover:bg-hubee-750"
          >
            Adicionar
          </button>
        </div>
        {couponFeedback && (
          <p role="status" className="text-[11px] text-hubee-750 dark:text-hubee-200">
            {couponFeedback}
          </p>
        )}
      </form>

      <hr className="my-5 border-hubee-750/30 dark:border-hubee-50/25" />

      {/* Valores: Subtotal, Taxas, Cupom e Total */}
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

        <div className="flex items-center justify-between gap-2">
          <dt className="text-hubee-800 dark:text-hubee-100">Cupom</dt>
          <dd className="font-medium tabular-nums">
            -{formatCurrencyBRL(summary.discount)}
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

