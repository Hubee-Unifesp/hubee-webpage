import type { EventCategory } from "@/lib/api/events";

export interface CartItem {
  id: string;
  eventId: string;
  title: string;
  organization: string;
  batchLabel: string;
  category: EventCategory;
  unitPrice: number;
  quantity: number;
  maxQuantity: number;
}

export interface CartSummary {
  totalItems: number;
  subtotal: number;
  serviceFee: number;
  discount: number;
  total: number;
}

export const DEFAULT_COUPON_CODE = "HUBEE4";
export const DEFAULT_COUPON_DISCOUNT = 4;

export const INITIAL_CART_ITEMS: readonly CartItem[] = [
  {
    id: "cart-item-1",
    eventId: "evt-eng-software",
    title: "Evento Engenharia de Software",
    organization: "UNIFESP - SJC",
    batchLabel: "1º Lote · Inscrição",
    category: "academicos",
    unitPrice: 0,
    quantity: 1,
    maxQuantity: 4,
  },
  {
    id: "cart-item-2",
    eventId: "evt-calourada-2027",
    title: "Calourada - 2027",
    organization: "UNIFESP - SJC",
    batchLabel: "1º Lote · Inteira",
    category: "festas",
    unitPrice: 75,
    quantity: 1,
    maxQuantity: 4,
  },
  {
    id: "cart-item-3",
    eventId: "evt-innovation-week",
    title: "Innovation Week",
    organization: "UNIFESP - SJC",
    batchLabel: "Lote Único · Estudante",
    category: "palestras",
    unitPrice: 2,
    quantity: 1,
    maxQuantity: 4,
  },
  {
    id: "cart-item-4",
    eventId: "evt-codeniver",
    title: "CodeNiver",
    organization: "CodeBless - SJC",
    batchLabel: "2º Lote · Geral",
    category: "shows",
    unitPrice: 70,
    quantity: 3,
    maxQuantity: 4,
  },
];

export function calculateCartSummary(
  items: readonly CartItem[],
  discountAmount = 0,
  serviceFee = 0,
): CartSummary {
  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce(
    (acc, item) => acc + item.unitPrice * item.quantity,
    0,
  );
  const safeDiscount = Math.min(subtotal + serviceFee, Math.max(0, discountAmount));
  const total = Math.max(0, subtotal + serviceFee - safeDiscount);

  return {
    totalItems,
    subtotal,
    serviceFee,
    discount: safeDiscount,
    total,
  };
}

export function formatCurrencyBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

