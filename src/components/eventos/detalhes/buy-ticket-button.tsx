"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import type { NovoItemCarrinho } from "@/types/carrinho";

interface BuyTicketButtonProps {
  lote: NovoItemCarrinho;
  /** Nome do lote, para o rótulo acessível ("Comprar 1º Lote"). */
  batch: string;
}

/**
 * Adiciona o lote ao carrinho e leva para `/carrinho`, que é a confirmação visual da
 * ação. A rota está na área logada (`RequireSession`), então quem não tem sessão vai
 * para o login e volta; o carrinho fica na sessão e sobrevive a esse desvio.
 */
export function BuyTicketButton({ lote, batch }: BuyTicketButtonProps) {
  const { adicionar } = useCart();
  const router = useRouter();

  function handleClick() {
    adicionar(lote);
    router.push("/carrinho");
  }

  return (
    <Button
      type="button"
      onClick={handleClick}
      className="mt-5 h-10 w-full cursor-pointer bg-hubee-400 text-sm font-semibold text-hubee-800 hover:bg-hubee-300 focus-visible:ring-hubee-400"
    >
      Comprar
      <span className="sr-only"> {batch}</span>
    </Button>
  );
}
