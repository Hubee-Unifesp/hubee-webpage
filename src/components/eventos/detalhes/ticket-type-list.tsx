import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/components/home/events/format";
import type { EventTicketType } from "@/lib/api/events";
import { cn } from "@/lib/utils";
import { sectionCardClassName } from "./section-card";

interface TicketTypeListProps {
  ticketTypes: EventTicketType[];
  /** Lote destacado com borda amarela (no protótipo, o último/VIP). */
  highlightedId?: string;
}

/** Cards de lotes com preço, status (disponível/esgotado) e botão de compra. */
export function TicketTypeList({ ticketTypes, highlightedId }: TicketTypeListProps) {
  if (ticketTypes.length === 0) {
    return (
      <p className="text-sm text-hubee-neutral-300 dark:text-hubee-100">
        Os ingressos deste evento ainda não estão à venda.
      </p>
    );
  }

  return (
    <div>
      <ul className="grid gap-3 md:grid-cols-3 md:gap-4">
        {ticketTypes.map((ticket) => (
          <li key={ticket.id}>
            <TicketTypeCard ticket={ticket} highlighted={ticket.id === highlightedId} />
          </li>
        ))}
      </ul>

      <p className="mt-4 flex items-center gap-1.5 text-[11px] text-hubee-neutral-300 dark:text-hubee-100">
        <ShieldCheck aria-hidden="true" className="size-3.5 shrink-0" />
        Compra segura pela Hubee. Ingresso digital enviado por e-mail.
      </p>
    </div>
  );
}

function TicketTypeCard({ ticket, highlighted }: { ticket: EventTicketType; highlighted: boolean }) {
  const { soldOut } = ticket;
  const headingId = `lote-${ticket.id}`;

  return (
    <article
      aria-labelledby={headingId}
      className={cn(
        sectionCardClassName,
        "flex h-full flex-col p-4 md:p-5",
        highlighted && !soldOut && "border-hubee-400 dark:border-hubee-500",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 id={headingId} className="font-sans text-sm font-semibold text-hubee-800 dark:text-hubee-50">
          {ticket.batch}
        </h3>
        <TicketStatus soldOut={soldOut} />
      </div>

      <p className="mt-4 text-2xl font-bold text-hubee-800 dark:text-hubee-50">
        {soldOut ? (
          <>
            <span className="sr-only">Preço: </span>
            <s className="text-hubee-neutral-200 decoration-2 dark:text-hubee-neutral-200">{formatPrice(ticket.price)}</s>
          </>
        ) : (
          formatPrice(ticket.price)
        )}
      </p>
      <p className="mt-1 text-[11px] text-hubee-neutral-300 dark:text-hubee-100">+ taxa de serviço</p>

      {soldOut ? (
        <Button
          type="button"
          disabled
          className="mt-5 h-10 w-full bg-cinzaclaro text-sm font-semibold text-hubee-neutral-300 focus-visible:ring-hubee-400 disabled:opacity-100 dark:bg-hubee-neutral-50 dark:text-hubee-neutral-300"
        >
          Comprar
          <span className="sr-only"> {ticket.batch} (esgotado)</span>
        </Button>
      ) : (
        <Button
          asChild
          className="mt-5 h-10 w-full bg-hubee-400 text-sm font-semibold text-hubee-800 hover:bg-hubee-300 focus-visible:ring-hubee-400"
        >
          <Link href="/checkout">
            Comprar
            <span className="sr-only"> {ticket.batch}</span>
          </Link>
        </Button>
      )}
    </article>
  );
}

function TicketStatus({ soldOut }: { soldOut: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-medium",
        soldOut
          ? "bg-hubee-neutral-50 text-hubee-neutral-300 dark:bg-hubee-750 dark:text-hubee-neutral-200"
          : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300",
      )}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {soldOut ? "Esgotado" : "Disponível"}
    </span>
  );
}
