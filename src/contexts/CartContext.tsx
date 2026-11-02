"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  adicionarItem,
  definirQuantidade,
  lerCarrinhoSalvo,
  removerItem,
  subtotal as calcularSubtotal,
  totalDeIngressos,
  type StatusAdicao,
} from "@/lib/carrinho";
import type { CartItem, NovoItemCarrinho } from "@/types/carrinho";

/**
 * Guardado em `sessionStorage`, e não em `localStorage`, de propósito: preço e saldo do
 * lote mudam, então um carrinho que sobrevive dias mostraria valor que não vale mais.
 * Na sessão o dado dura o bastante para navegar entre evento, carrinho e checkout.
 */
const STORAGE_KEY = "hubee:carrinho";

interface CartContextType {
  itens: CartItem[];
  /** Ingressos somados, que é o número do contador no header. */
  totalItens: number;
  /** Soma em reais, só para exibir: o valor cobrado é o que a API calcula. */
  subtotal: number;
  /**
   * `false` até ler o `sessionStorage`. O contador do header espera por isso para não
   * aparecer zerado por um instante e depois pular para o número certo.
   */
  carregado: boolean;
  /** Adiciona o lote (ou soma, se já estiver no carrinho) e diz o que aconteceu. */
  adicionar: (lote: NovoItemCarrinho, quantidade?: number) => StatusAdicao;
  alterarQuantidade: (ticketTypeId: string, quantidade: number) => void;
  remover: (ticketTypeId: string) => void;
  /** Esvazia o carrinho; usado depois do pagamento aprovado. */
  limpar: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<CartItem[]>([]);
  const [carregado, setCarregado] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- carga inicial do carrinho
    setItens(lerCarrinhoSalvo(window.sessionStorage.getItem(STORAGE_KEY)));
    setCarregado(true);
  }, []);

  useEffect(() => {
    // Antes de carregar, gravar sobrescreveria o carrinho salvo com a lista vazia inicial.
    if (!carregado) return;
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(itens));
    } catch {
      // Sem espaço ou storage bloqueado: o carrinho segue valendo em memória.
    }
  }, [itens, carregado]);

  // Depende de `itens` porque responde o status da adição na mesma hora, sem esperar o
  // próximo render: quem chama precisa saber se entrou, se somou ou se bateu no limite.
  const adicionar = useCallback(
    (lote: NovoItemCarrinho, quantidade = 1): StatusAdicao => {
      const { status, itens: proximos } = adicionarItem(itens, lote, quantidade);
      setItens(proximos);
      return status;
    },
    [itens],
  );

  const alterarQuantidade = useCallback((ticketTypeId: string, quantidade: number) => {
    setItens((atuais) => definirQuantidade(atuais, ticketTypeId, quantidade));
  }, []);

  const remover = useCallback((ticketTypeId: string) => {
    setItens((atuais) => removerItem(atuais, ticketTypeId));
  }, []);

  const limpar = useCallback(() => setItens([]), []);

  const value = useMemo<CartContextType>(
    () => ({
      itens,
      totalItens: totalDeIngressos(itens),
      subtotal: calcularSubtotal(itens),
      carregado,
      adicionar,
      alterarQuantidade,
      remover,
      limpar,
    }),
    [itens, carregado, adicionar, alterarQuantidade, remover, limpar],
  );

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart deve ser usado dentro de um CartProvider");
  }
  return context;
}
