"use client";

import { useRouter } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { EmptyState } from "@/components/empty-state";
import { useCart } from "@/contexts/CartContext";
import { CarrinhoItemCard } from "./carrinho-item-card";
import { CarrinhoResumo } from "./carrinho-resumo";
import { CarrinhoSkeleton } from "./carrinho-skeleton";
import { calculateCartSummary } from "./carrinho.data";

export function EmptyCartState() {
  const router = useRouter();

  return (
    <EmptyState
      icon={ShoppingCart}
      title="Seu carrinho está vazio"
      description="Você ainda não selecionou nenhum ingresso. Explore os próximos eventos universitários e garanta sua participação."
      action={{
        label: "Explorar eventos",
        onClick: () => router.push("/eventos"),
      }}
    />
  );
}

export function CarrinhoContent() {
  const { itens, carregado, alterarQuantidade, remover } = useCart();

  // O carrinho só existe depois de ler a sessão: sem esperar, a tela piscaria "carrinho vazio".
  if (!carregado) return <CarrinhoSkeleton />;

  if (itens.length === 0) {
    return (
      <section aria-labelledby="carrinho-titulo" className="space-y-6">
        <h1
          id="carrinho-titulo"
          className="font-heading text-2xl font-bold tracking-tight text-hubee-800 md:text-3xl dark:text-hubee-50"
        >
          Carrinho de compras
        </h1>
        <EmptyCartState />
      </section>
    );
  }

  const summary = calculateCartSummary(itens);

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
            {itens.map((item) => (
              <li key={item.ticketTypeId}>
                <CarrinhoItemCard
                  item={item}
                  onIncrement={(ticketTypeId) =>
                    alterarQuantidade(ticketTypeId, item.quantity + 1)
                  }
                  onDecrement={(ticketTypeId) =>
                    alterarQuantidade(ticketTypeId, item.quantity - 1)
                  }
                  onRemove={remover}
                />
              </li>
            ))}
          </ul>
        </div>

        <CarrinhoResumo summary={summary} />
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
