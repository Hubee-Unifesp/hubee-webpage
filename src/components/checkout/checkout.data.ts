import type { PaymentMethod } from "@/lib/validations/checkout.schema";

export type CheckoutSimulationMode =
  | "form"
  | "pix-payment"
  | "loading"
  | "processing"
  | "pix-timeout"
  | "payment-error"
  | "success";

export const PIX_EXPIRATION_SECONDS = 15 * 60;

/** Formata segundos restantes no padrão `MM:SS` (ex.: `900` -> `15:00`). */
export function formatPixCountdown(secondsRemaining: number): string {
  const safeSeconds = Math.max(0, Math.floor(secondsRemaining));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export interface CheckoutOrderItem {
  id: string;
  title: string;
  successTitle: string;
  ticketStubTitle: string;
  eventName: string;
  quantity: number;
  unitPrice: number;
}

export interface CheckoutOrderData {
  orderNumber: string;
  confirmedAt: string;
  ticketCode: string;
  event: {
    id: string;
    title: string;
    summaryDate: string;
    ticketDate: string;
    summaryVenue: string;
    ticketVenue: string;
  };
  items: CheckoutOrderItem[];
  serviceFeeLabel: string;
  serviceFeeAmount: number;
  totalAmount: number;
  pix: {
    expirationLabel: string;
    copyPasteKey: string;
    displayKey: string;
  };
  installments: ReadonlyArray<{
    value: string;
    label: string;
  }>;
}

export interface CheckoutBuyerSummary {
  fullName: string;
  email: string;
  cpf: string;
  paymentMethod: PaymentMethod;
}

export const DEFAULT_CHECKOUT_BUYER = {
  fullName: "Gustavo Baptistella Ocampo",
  email: "gustavo@unifesp.br",
} as const;

export const CHECKOUT_MOCK_ORDER: CheckoutOrderData = {
  orderNumber: "HUB-9842",
  confirmedAt: "30 de out. de 2026 às 09:50",
  ticketCode: "HUB-2026-X9K4",
  event: {
    id: "evt-festival-universitario-2026",
    title: "Festival Universitário de Música 2026",
    summaryDate: "Sáb, 14 Nov 2026 • 20:00",
    ticketDate: "14 de nov. de 2026, 20:00",
    summaryVenue: "Arena Hubee — São José dos Campos, SP",
    ticketVenue: "Arena Hubee",
  },
  items: [
    {
      id: "item-lote-1",
      title: "Ingresso Inteira (1º Lote)",
      successTitle: "Ingresso Inteira • 1º Lote",
      ticketStubTitle: "Ingresso Inteira — 1º Lote",
      eventName: "Festival Universitário de Música 2026",
      quantity: 1,
      unitPrice: 60,
    },
  ],
  serviceFeeLabel: "Taxa de serviço (10%)",
  serviceFeeAmount: 7,
  totalAmount: 67,
  pix: {
    expirationLabel: "Expira em 15:00",
    copyPasteKey:
      "00020126580014br.gov.bcb.pix0136hubee-checkout-9842-fe8a-4c11-9b0d520400005303986540567.005802BR5913HUBEE EVENTOS6009SAO PAULO62070503***6304A1B2",
    displayKey: "00020126580014br.gov.bcb.pix0136hubee-checkout-9842 ...",
  },
  installments: [
    { value: "1x", label: "1x de R$ 67,00 sem juros" },
    { value: "2x", label: "2x de R$ 33,50 sem juros" },
    { value: "3x", label: "3x de R$ 22,33 sem juros" },
  ],
};
