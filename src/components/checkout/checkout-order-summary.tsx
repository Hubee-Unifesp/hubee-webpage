"use client";

import { Calendar, Loader2, Lock, MapPin, Music, ShieldCheck } from "lucide-react";
import { ContaCard } from "@/components/conta/conta-card";
import { formatPrice } from "@/components/home/events/format";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import type { CheckoutOrderData } from "./checkout.data";

interface CheckoutOrderSummaryProps {
  order: CheckoutOrderData;
  acceptTerms: boolean;
  onToggleTerms: (checked: boolean) => void;
  termsError?: string;
  isProcessing?: boolean;
}

/** Card lateral "Resumo do Pedido" com itens, taxas, aceite de termos e botão de pagamento (GOL-180). */
export function CheckoutOrderSummary({
  order,
  acceptTerms,
  onToggleTerms,
  termsError,
  isProcessing = false,
}: CheckoutOrderSummaryProps) {
  return (
    <aside aria-label="Resumo do pedido" className="lg:sticky lg:top-6">
      <ContaCard title="Resumo do Pedido">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div
              aria-hidden="true"
              className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-hubee-300 text-hubee-800"
            >
              <Music className="size-5" />
            </div>

            <div className="min-w-0 flex-1">
              <h3 className="text-xs leading-snug font-bold text-hubee-800 dark:text-hubee-50">
                {order.event.title}
              </h3>
              <p className="mt-1 flex items-center gap-1.5 text-[11px] text-hubee-neutral-300 dark:text-hubee-200">
                <Calendar aria-hidden="true" className="size-3 shrink-0" />
                <span>{order.event.summaryDate}</span>
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-hubee-neutral-300 dark:text-hubee-200">
                <MapPin aria-hidden="true" className="size-3 shrink-0" />
                <span>{order.event.summaryVenue}</span>
              </p>
            </div>
          </div>

          <hr className="border-hubee-200 dark:border-hubee-50/15" />

          <ul className="flex flex-col gap-2 text-xs">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-2 text-hubee-800 dark:text-hubee-50"
              >
                <span className="font-medium">
                  {item.title} × {item.quantity}
                </span>
                <span className="shrink-0 font-semibold">
                  {formatPrice(item.unitPrice * item.quantity)}
                </span>
              </li>
            ))}
            <li className="flex items-center justify-between gap-2 text-hubee-neutral-300 dark:text-hubee-200">
              <span>{order.serviceFeeLabel}</span>
              <span className="shrink-0">{formatPrice(order.serviceFeeAmount)}</span>
            </li>
          </ul>

          <hr className="border-hubee-200 dark:border-hubee-50/15" />

          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-bold text-hubee-800 dark:text-hubee-50">
              Total a pagar
            </span>
            <span className="text-lg font-extrabold text-hubee-600 dark:text-hubee-400">
              {formatPrice(order.totalAmount)}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-start gap-2.5">
              <Checkbox
                id="checkout-termos"
                checked={acceptTerms}
                disabled={isProcessing}
                onCheckedChange={(checked) => onToggleTerms(checked === true)}
                aria-invalid={termsError ? true : undefined}
                aria-describedby={termsError ? "checkout-termos-error" : undefined}
                className="mt-0.5 border-hubee-300 data-checked:border-hubee-800 data-checked:bg-hubee-800 data-checked:text-hubee-50 dark:border-hubee-700 dark:data-checked:border-hubee-400 dark:data-checked:bg-hubee-400 dark:data-checked:text-hubee-800"
              />
              <Label
                htmlFor="checkout-termos"
                className="cursor-pointer text-[11px] leading-snug font-normal text-hubee-750 dark:text-hubee-200"
              >
                Li e concordo com os Termos de Uso e a Política de Cancelamento.
              </Label>
            </div>
            {termsError && (
              <p
                id="checkout-termos-error"
                role="alert"
                className="text-xs text-red-700 dark:text-red-300"
              >
                {termsError}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isProcessing}
            className="h-10 w-full cursor-pointer bg-hubee-400 text-xs font-bold text-hubee-800 hover:bg-hubee-300 focus-visible:ring-hubee-400 disabled:opacity-60"
          >
            {isProcessing ? (
              <>
                <Loader2 aria-hidden="true" className="size-4 animate-spin" />
                <span>Processando...</span>
              </>
            ) : (
              <>
                <Lock aria-hidden="true" className="size-3.5" />
                <span>Confirmar e Pagar {formatPrice(order.totalAmount)}</span>
              </>
            )}
          </Button>

          <p className="flex items-start gap-1.5 text-[11px] leading-snug text-hubee-neutral-300 dark:text-hubee-200">
            <ShieldCheck
              aria-hidden="true"
              className="mt-0.5 size-3.5 shrink-0 text-hubee-600 dark:text-hubee-400"
            />
            <span>
              Pagamento 100% seguro via Hubee. Ingresso enviado imediatamente após confirmação.
            </span>
          </p>
        </div>
      </ContaCard>
    </aside>
  );
}

