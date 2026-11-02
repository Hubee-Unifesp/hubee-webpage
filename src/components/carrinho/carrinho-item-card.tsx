"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { categoryConfig } from "@/components/home/events/categories.config";
import { HexPattern } from "@/components/home/events/event-media";
import { cn } from "@/lib/utils";
import { formatCurrencyBRL, type CartItem } from "./carrinho.data";

interface CarrinhoItemCardProps {
  item: CartItem;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onRemove: (id: string) => void;
}

export function CarrinhoItemCard({
  item,
  onIncrement,
  onDecrement,
  onRemove,
}: CarrinhoItemCardProps) {
  const { icon: CategoryIcon, mediaClassName, patternClassName } =
    categoryConfig[item.category];
  const isAtMin = item.quantity <= 1;
  const isAtMax = item.quantity >= item.maxQuantity;

  return (
    <article
      aria-label={`Item do carrinho: ${item.title}`}
      className="flex flex-col gap-3 rounded-2xl border border-hubee-300 bg-hubee-100 p-4 text-hubee-800 shadow-xs transition-colors md:grid md:grid-cols-[minmax(0,1fr)_9.5rem_7.5rem] md:items-center md:gap-4 dark:border-hubee-600/80 dark:bg-hubee-900/90 dark:text-hubee-50"
    >
      {/* Bloco do Produto (Miniatura + Título + Organização/Lote) */}
      <div className="flex min-w-0 items-center gap-3.5">
        <div
          aria-hidden="true"
          className={cn(
            "relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-hubee-300/60 dark:border-hubee-700",
            mediaClassName,
          )}
        >
          <HexPattern className={patternClassName} />
          <CategoryIcon className="relative size-7" strokeWidth={1.75} />
        </div>

        <div className="flex min-w-0 flex-col gap-0.5">
          <h3 className="truncate font-sans text-sm font-semibold text-hubee-800 md:text-base dark:text-hubee-50">
            {item.title}
          </h3>
          <p className="truncate text-xs text-hubee-750 dark:text-hubee-100">
            {item.organization}
          </p>
          <p className="truncate text-[11px] text-hubee-neutral-300 dark:text-hubee-200">
            {item.batchLabel}
          </p>
        </div>
      </div>

      {/* Linha de controles: Quantidade + Preço + Remover */}
      <div className="flex items-end justify-between gap-3 md:contents">
        <div className="flex flex-col items-start md:items-center">
          <span className="mb-1 text-[11px] text-hubee-750 md:sr-only dark:text-hubee-200">
            Quantidade
          </span>
          <div
            role="group"
            aria-label={`Quantidade de ${item.title}`}
            className="inline-flex h-9 items-center gap-3 rounded-full border border-hubee-200 bg-white px-2 text-hubee-800 shadow-2xs dark:border-hubee-700 dark:bg-hubee-800 dark:text-hubee-50"
          >
            <button
              type="button"
              onClick={() => onDecrement(item.id)}
              disabled={isAtMin}
              aria-label={`Diminuir quantidade de ${item.title}`}
              className="inline-flex size-6 cursor-pointer items-center justify-center rounded-full bg-hubee-800 text-hubee-50 transition-opacity outline-none hover:bg-hubee-900 focus-visible:ring-2 focus-visible:ring-hubee-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Minus aria-hidden="true" className="size-3.5" strokeWidth={2.5} />
            </button>

            <span
              aria-live="polite"
              className="min-w-4 text-center text-xs font-semibold tabular-nums text-hubee-800 dark:text-hubee-50"
            >
              {item.quantity}
            </span>

            <button
              type="button"
              onClick={() => onIncrement(item.id)}
              disabled={isAtMax}
              aria-label={`Aumentar quantidade de ${item.title}`}
              className="inline-flex size-6 cursor-pointer items-center justify-center rounded-full bg-hubee-800 text-hubee-50 transition-opacity outline-none hover:bg-hubee-900 focus-visible:ring-2 focus-visible:ring-hubee-500 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Plus aria-hidden="true" className="size-3.5" strokeWidth={2.5} />
            </button>
          </div>

          {isAtMax && (
            <span
              role="status"
              className="mt-1 text-[10px] font-medium text-hubee-700 dark:text-hubee-300"
            >
              Limite máx. ({item.maxQuantity}) atingido
            </span>
          )}
        </div>

        <div className="flex items-end justify-between gap-4 md:flex-row md:items-center md:gap-2">
          <div className="flex flex-col items-start">
            <span className="mb-1 text-[11px] text-hubee-750 md:sr-only dark:text-hubee-200">
              Preço
            </span>
            <span className="flex h-9 items-center text-sm font-medium tabular-nums text-hubee-800 dark:text-hubee-50">
              {formatCurrencyBRL(item.unitPrice)}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onRemove(item.id)}
            aria-label={`Remover ${item.title} do carrinho`}
            className="inline-flex size-9 cursor-pointer items-center justify-center rounded-lg text-hubee-800 transition-colors outline-none hover:bg-hubee-200 focus-visible:ring-2 focus-visible:ring-hubee-400 dark:text-hubee-50 dark:hover:bg-hubee-800"
          >
            <Trash2 aria-hidden="true" className="size-4" />
          </button>
        </div>
      </div>
    </article>
  );
}

