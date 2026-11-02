"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { CarrinhoItemCard } from "./carrinho-item-card";
import { CarrinhoResumo } from "./carrinho-resumo";
import {
  DEFAULT_COUPON_CODE,
  DEFAULT_COUPON_DISCOUNT,
  INITIAL_CART_ITEMS,
  calculateCartSummary,
  type CartItem,
} from "./carrinho.data";

export function EmptyCartState({ onRestore }: { onRestore?: () => void }) {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center gap-4">
      <EmptyState
        icon={ShoppingCart}
        title="Seu carrinho está vazio"
        description="Você ainda não selecionou nenhum ingresso. Explore os próximos eventos universitários e garanta sua participação."
        action={{
          label: "Explorar eventos",
          onClick: () => router.push("/eventos"),
        }}
      />
      {onRestore && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onRestore}
          className="border-hubee-400 text-xs text-hubee-750 hover:bg-hubee-100 dark:border-hubee-500 dark:text-hubee-50 dark:hover:bg-hubee-750"
        >
          Restaurar itens de demonstração
        </Button>
      )}
    </div>
  );
}

export function CarrinhoContent() {
  const [items, setItems] = useState<CartItem[]>(() => [...INITIAL_CART_ITEMS]);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(
    DEFAULT_COUPON_CODE,
  );
  const [discountAmount, setDiscountAmount] = useState<number>(
    DEFAULT_COUPON_DISCOUNT,
  );

  const handleIncrement = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id && item.quantity < item.maxQuantity
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    );
  };

  const handleDecrement = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item,
      ),
    );
  };

  const handleRemove = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleApplyCoupon = (code: string, discount: number) => {
    setAppliedCoupon(code);
    setDiscountAmount(discount);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
  };

  const handleRestoreDefaults = () => {
    setItems([...INITIAL_CART_ITEMS]);
    setAppliedCoupon(DEFAULT_COUPON_CODE);
    setDiscountAmount(DEFAULT_COUPON_DISCOUNT);
  };

  const summary = calculateCartSummary(items, discountAmount, 0);

  if (items.length === 0) {
    return (
      <section aria-labelledby="carrinho-titulo" className="space-y-6">
        <h1
          id="carrinho-titulo"
          className="font-heading text-2xl font-bold tracking-tight text-hubee-800 md:text-3xl dark:text-hubee-50"
        >
          Carrinho de compras
        </h1>
        <EmptyCartState onRestore={handleRestoreDefaults} />
      </section>
    );
  }

  return (
    <section aria-labelledby="carrinho-titulo" className="space-y-8">
      <h1 id="carrinho-titulo" className="sr-only">
        Carrinho de compras
      </h1>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex flex-col gap-3">
          {/* Cabeçalho Mobile */}
          <h2 className="font-sans text-base font-medium text-hubee-800 md:hidden dark:text-hubee-50">
            Produto
          </h2>

          {/* Cabeçalho Desktop (Produto | Quantidade | Preço) */}
          <div
            aria-hidden="true"
            className="hidden rounded-full border border-hubee-300 bg-hubee-100/70 px-5 py-1.5 text-xs font-medium text-hubee-800 md:grid md:grid-cols-[minmax(0,1fr)_9.5rem_7.5rem] md:items-center md:gap-4 dark:border-hubee-600/80 dark:bg-hubee-900/70 dark:text-hubee-50"
          >
            <span>Produto</span>
            <span className="text-center">Quantidade</span>
            <span>Preço</span>
          </div>

          {/* Lista de Itens (rolável no mobile conforme o Figma) */}
          <ul
            aria-label="Ingressos selecionados no carrinho"
            className="flex max-h-[420px] flex-col gap-3 overflow-y-auto pr-1 md:max-h-none md:overflow-visible md:pr-0"
          >
            {items.map((item) => (
              <li key={item.id}>
                <CarrinhoItemCard
                  item={item}
                  onIncrement={handleIncrement}
                  onDecrement={handleDecrement}
                  onRemove={handleRemove}
                />
              </li>
            ))}
          </ul>
        </div>

        <CarrinhoResumo
          summary={summary}
          appliedCoupon={appliedCoupon}
          onApplyCoupon={handleApplyCoupon}
          onRemoveCoupon={handleRemoveCoupon}
        />
      </div>

      <footer
        aria-labelledby="formas-pagamento-titulo"
        className="rounded-2xl border border-hubee-300/60 bg-hubee-100 px-6 py-6 text-hubee-800 dark:border-hubee-700/60 dark:bg-hubee-900/90 dark:text-hubee-50"
      >
        <h2
          id="formas-pagamento-titulo"
          className="font-sans text-sm font-bold tracking-wide uppercase md:text-base"
        >
          Formas de pagamento
        </h2>

        <div className="mt-4 inline-flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-flex size-5 rotate-45 items-center justify-center rounded-xs bg-hubee-800 text-hubee-50 dark:bg-hubee-50 dark:text-hubee-800"
          >
            <span className="size-1.5 rounded-full bg-current" />
          </span>
          <span className="font-sans text-base font-light tracking-wider lowercase">
            pix
          </span>
        </div>
      </footer>
    </section>
  );
}

