"use client";

import Link from "next/link";
import { ArrowLeft, Check, CheckCircle2, Ticket } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { ContaCard } from "@/components/conta/conta-card";
import { formatPrice } from "@/components/home/events/format";
import { Button } from "@/components/ui/button";
import { maskCpfForDisplay } from "@/lib/validations/checkout.schema";
import type { CheckoutBuyerSummary, CompraConcluida, IngressoDaCompra } from "./checkout.data";

interface CheckoutSuccessViewProps {
  compra: CompraConcluida;
  buyer: CheckoutBuyerSummary;
}

/** Tela de confirmação da compra, com os ingressos que a API emitiu. */
export function CheckoutSuccessView({ compra, buyer }: CheckoutSuccessViewProps) {
  const paymentMethodLabel =
    buyer.paymentMethod === "pix" ? "PIX (Aprovado)" : "Cartão de Crédito (Aprovado)";

  return (
    <section
      aria-labelledby="checkout-sucesso-titulo"
      aria-live="polite"
      className="mx-auto flex w-full max-w-4xl flex-col gap-6"
    >
      <header className="flex flex-col gap-2">
        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <div
            aria-hidden="true"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-800"
          >
            <CheckCircle2 className="size-6" />
          </div>

          <h1
            id="checkout-sucesso-titulo"
            className="font-heading text-2xl leading-tight font-bold tracking-tight text-hubee-800 sm:text-3xl dark:text-hubee-50"
          >
            Compra realizada com sucesso!
          </h1>
        </div>

        <div className="mt-1 flex flex-wrap items-center gap-2.5">
          <p className="text-base font-bold text-hubee-800 dark:text-hubee-50">
            Pedido #{compra.numero}
          </p>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
            <Check aria-hidden="true" className="size-3" />
            Pago
          </span>
        </div>

        <p className="text-xs text-hubee-neutral-300 dark:text-hubee-200">
          Uma cópia foi enviada para {buyer.email}
        </p>
      </header>

      <ContaCard title="Detalhes da Compra">
        <div className="grid grid-cols-1 gap-2 text-xs text-hubee-750 sm:grid-cols-2 dark:text-hubee-200">
          <p>
            Comprador: {buyer.fullName} (CPF {maskCpfForDisplay(buyer.cpf)})
          </p>
          <p>Forma de pagamento: {paymentMethodLabel}</p>
        </div>

        <hr className="my-4 border-hubee-200 dark:border-hubee-50/15" />

        <ul className="flex flex-col gap-3 text-xs">
          {compra.items.map((item) => (
            <li key={item.ticketTypeId} className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-medium text-hubee-800 dark:text-hubee-50">
                  {item.title} × {item.quantity}
                </p>
                <p className="mt-0.5 text-hubee-neutral-300 dark:text-hubee-200">
                  {item.eventName}
                </p>
              </div>
              <p className="shrink-0 font-semibold text-hubee-800 dark:text-hubee-50">
                {formatPrice(item.unitPrice * item.quantity)}
              </p>
            </li>
          ))}
        </ul>

        <hr className="my-4 border-hubee-200 dark:border-hubee-50/15" />

        <div className="flex items-center justify-between gap-4">
          <p className="text-xs font-bold text-hubee-800 dark:text-hubee-50">Total Pago</p>
          <p className="text-base font-extrabold text-hubee-600 dark:text-hubee-400">
            {formatPrice(compra.total)}
          </p>
        </div>
      </ContaCard>

      <ContaCard title="Seus Ingressos">
        {compra.ingressos.length === 0 ? (
          <p className="text-xs text-hubee-750 dark:text-hubee-200">
            Seus ingressos foram emitidos e já estão disponíveis em Meus Ingressos.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {compra.ingressos.map((ingresso) => (
              <li key={ingresso.id}>
                <IngressoCard ingresso={ingresso} titular={buyer.fullName} />
              </li>
            ))}
          </ul>
        )}
      </ContaCard>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button
          asChild
          className="h-10 w-full bg-hubee-800 px-5 text-xs font-semibold text-hubee-50 hover:bg-hubee-900 sm:w-auto dark:bg-hubee-400 dark:text-hubee-800 dark:hover:bg-hubee-300"
        >
          <Link href="/meus-ingressos">
            <Ticket aria-hidden="true" className="size-4" />
            Ir para Meus Ingressos
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          className="h-10 w-full border-hubee-200 bg-white px-5 text-xs font-semibold text-hubee-800 hover:bg-hubee-100 sm:w-auto dark:border-hubee-750 dark:bg-transparent dark:text-hubee-50 dark:hover:bg-hubee-750/60"
        >
          <Link href="/eventos">
            <ArrowLeft aria-hidden="true" className="size-4" />
            Explorar mais eventos
          </Link>
        </Button>
      </div>
    </section>
  );
}

function IngressoCard({ ingresso, titular }: { ingresso: IngressoDaCompra; titular: string }) {
  return (
    <article className="flex flex-col gap-5 rounded-xl border border-hubee-300 bg-hubee-100 p-5 text-hubee-750 md:flex-row md:items-center md:justify-between">
      <div className="flex min-w-0 flex-col gap-1">
        <h3 className="font-heading text-xl leading-tight font-bold text-hubee-800 sm:text-2xl">
          {ingresso.eventName}
        </h3>
        <p className="font-heading text-base font-semibold text-hubee-600 sm:text-lg">{titular}</p>
        <p className="text-sm font-medium text-hubee-750">{ingresso.tipo}</p>
        <p className="mt-3 text-xs font-bold text-hubee-600">
          Código: <span className="font-mono break-all">{ingresso.codigo}</span>
        </p>
        <p className="text-[11px] text-hubee-750">Apresente este código na entrada do evento.</p>
      </div>

      {/* Fundo branco e traço preto fixos: QR invertido não é lido na portaria. */}
      <div
        role="img"
        aria-label={`QR code do ingresso ${ingresso.codigo}`}
        className="flex aspect-square w-full shrink-0 items-center justify-center rounded-xl border border-dashed border-hubee-600/60 bg-white p-3 md:w-44"
      >
        <QRCodeSVG
          value={ingresso.codigo}
          level="M"
          marginSize={0}
          bgColor="#ffffff"
          fgColor="#000000"
          className="size-full"
        />
      </div>
    </article>
  );
}
