import type { CartItem, NovoItemCarrinho } from "@/types/carrinho";

/**
 * Limites do `CreateOrderDto` da API, repetidos aqui para o carrinho barrar antes de
 * enviar: 20 lotes por pedido e 10 ingressos por lote.
 */
export const MAX_ITENS_PEDIDO = 20;
export const MAX_QUANTIDADE_POR_LOTE = 10;

/** Por que a adição não entrou (ou entrou), para a tela dar o aviso certo. */
export type StatusAdicao =
  | "adicionado"
  | "quantidade-aumentada"
  | "limite-do-lote"
  | "limite-do-pedido"
  | "esgotado";

export interface ResultadoAdicao {
  status: StatusAdicao;
  /** Carrinho resultante; igual ao anterior quando a adição não foi aceita. */
  itens: CartItem[];
}

/** Teto de ingressos do lote nesta compra: o que sobrou no lote, limitado ao máximo da API. */
export function tetoDoLote(disponivel: number): number {
  return Math.max(0, Math.min(disponivel, MAX_QUANTIDADE_POR_LOTE));
}

/**
 * Adiciona o lote ao carrinho. Se o lote já está lá, soma à quantidade atual em vez
 * de criar outra linha; nunca passa do teto do lote nem do limite de lotes do pedido.
 */
export function adicionarItem(
  itens: readonly CartItem[],
  novo: NovoItemCarrinho,
  quantidade = 1,
): ResultadoAdicao {
  const teto = tetoDoLote(novo.maxQuantity);
  if (teto === 0) return { status: "esgotado", itens: [...itens] };

  const atual = itens.find((item) => item.ticketTypeId === novo.ticketTypeId);

  if (!atual) {
    if (itens.length >= MAX_ITENS_PEDIDO) return { status: "limite-do-pedido", itens: [...itens] };
    const quantidadeFinal = Math.min(Math.max(1, quantidade), teto);
    return { status: "adicionado", itens: [...itens, { ...novo, quantity: quantidadeFinal }] };
  }

  const quantidadeFinal = Math.min(atual.quantity + Math.max(1, quantidade), teto);
  if (quantidadeFinal === atual.quantity) return { status: "limite-do-lote", itens: [...itens] };

  return {
    status: "quantidade-aumentada",
    // O lote pode ter mudado de preço ou de saldo desde que entrou no carrinho: vale o dado novo.
    itens: itens.map((item) =>
      item.ticketTypeId === novo.ticketTypeId ? { ...novo, quantity: quantidadeFinal } : item,
    ),
  };
}

/** Define a quantidade do lote, presa entre 1 e o teto do lote. */
export function definirQuantidade(
  itens: readonly CartItem[],
  ticketTypeId: string,
  quantidade: number,
): CartItem[] {
  return itens.map((item) => {
    if (item.ticketTypeId !== ticketTypeId) return item;
    const teto = Math.max(1, tetoDoLote(item.maxQuantity));
    return { ...item, quantity: Math.min(Math.max(1, quantidade), teto) };
  });
}

export function removerItem(itens: readonly CartItem[], ticketTypeId: string): CartItem[] {
  return itens.filter((item) => item.ticketTypeId !== ticketTypeId);
}

/** Total de ingressos no carrinho, que é o número do contador no header. */
export function totalDeIngressos(itens: readonly CartItem[]): number {
  return itens.reduce((total, item) => total + item.quantity, 0);
}

/**
 * Soma em reais para exibição. Conta em centavos, como a API faz, para não acumular
 * erro de ponto flutuante em preços quebrados.
 */
export function subtotal(itens: readonly CartItem[]): number {
  const centavos = itens.reduce(
    (total, item) => total + Math.round(item.unitPrice * 100) * item.quantity,
    0,
  );
  return centavos / 100;
}

/** Itens no formato que o `createOrder` espera. */
export function paraItensDoPedido(
  itens: readonly CartItem[],
): { ticketTypeId: string; quantidade: number }[] {
  return itens.map(({ ticketTypeId, quantity }) => ({ ticketTypeId, quantidade: quantity }));
}

/**
 * Lê o carrinho gravado na sessão. O conteúdo é editável pela pessoa e pode ser de uma
 * versão antiga do formato, então tudo que não casar com o tipo é descartado em silêncio:
 * um carrinho vazio é melhor do que a tela quebrada.
 */
export function lerCarrinhoSalvo(raw: string | null): CartItem[] {
  if (!raw) return [];

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isCartItem).slice(0, MAX_ITENS_PEDIDO);
  } catch {
    return [];
  }
}

function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== "object" || value === null) return false;
  const item = value as Record<string, unknown>;

  return (
    isNonEmptyString(item.ticketTypeId) &&
    isNonEmptyString(item.eventId) &&
    isNonEmptyString(item.title) &&
    typeof item.organization === "string" &&
    typeof item.batchLabel === "string" &&
    isNonEmptyString(item.category) &&
    isFiniteNumber(item.unitPrice) &&
    isFiniteNumber(item.quantity) &&
    item.quantity >= 1 &&
    isFiniteNumber(item.maxQuantity)
  );
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}
