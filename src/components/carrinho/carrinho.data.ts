import { subtotal as calcularSubtotal, totalDeIngressos } from "@/lib/carrinho";
import type { CartItem } from "@/types/carrinho";

/**
 * A API não cobra taxa de serviço: o total do pedido é a soma dos lotes, calculada no
 * `POST /orders` com o preço vigente de cada um. A linha continua na tela, zerada, para
 * deixar explícito que não há taxa — e para o total exibido ser igual ao cobrado.
 */
export const TAXA_DE_SERVICO = 0;

export interface CartSummary {
  totalItems: number;
  subtotal: number;
  serviceFee: number;
  total: number;
}

export function calculateCartSummary(items: readonly CartItem[]): CartSummary {
  const subtotal = calcularSubtotal(items);

  return {
    totalItems: totalDeIngressos(items),
    subtotal,
    serviceFee: TAXA_DE_SERVICO,
    total: subtotal + TAXA_DE_SERVICO,
  };
}

export function formatCurrencyBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}
