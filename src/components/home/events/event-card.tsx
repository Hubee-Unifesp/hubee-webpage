import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isSoldOut, soldRatio, type EventSummary } from "@/lib/api/events";
import { eventHref } from "./links";
import { formatEventDate, formatPrice } from "./format";
import { CategoryPill, EventMedia } from "./event-media";

export const eventCardClassName =
  "flex h-full flex-col overflow-hidden rounded-xl border border-hubee-400 bg-hubee-100 text-hubee-750 dark:border-hubee-500 dark:bg-hubee-750 dark:text-hubee-50";

interface EventCardProps {
  event: EventSummary;
  showSalesProgress?: boolean;
  headingLevel?: "h3" | "h4";
}

export function EventCard({ event, showSalesProgress = false, headingLevel: Heading = "h4" }: EventCardProps) {
  const soldOut = isSoldOut(event);
  const href = eventHref(event.id);

  return (
    <article className={eventCardClassName}>
      <EventMedia
        category={event.category}
        startDate={event.startDate}
        soldOut={soldOut}
        className="h-24 md:h-32"
      />

      <div className={cn("flex flex-1 flex-col p-3 md:p-4", soldOut && "opacity-70")}>
        <CategoryPill category={event.category} className="hidden md:inline-flex" />
        <Heading className="font-sans text-sm leading-snug font-semibold md:mt-3 md:text-base">
          <Link
            href={href}
            className="rounded-sm outline-none hover:underline focus-visible:ring-3 focus-visible:ring-hubee-400"
          >
            {event.title}
          </Link>
        </Heading>
        <p className="mt-2 truncate text-xs text-hubee-neutral-300 dark:text-hubee-100 md:mt-3">
          {event.organizerName}
        </p>
        <p className="mt-0.5 truncate text-xs text-hubee-neutral-300 dark:text-hubee-100">
          {formatEventDate(event.startDate, event.endDate)}
          <span className="hidden md:inline"> · {event.venueName}</span>
        </p>

        {showSalesProgress && !soldOut && <SalesProgress event={event} />}

        <div className="mt-auto flex items-center justify-between gap-2 pt-3 md:mt-auto md:border-t md:border-hubee-400/60 md:pt-3 dark:md:border-hubee-500/60">
          <span className="text-sm font-bold text-hubee-800 md:text-base dark:text-hubee-50">
            {formatPrice(event.price)}
          </span>
          {soldOut ? (
            <Button
              size="sm"
              className="hidden bg-cinzaclaro text-hubee-neutral-500 hover:bg-hubee-neutral-50/80 md:inline-flex"
              asChild
            >
              <Link href={href} aria-label={`Detalhes de ${event.title}`}>
                Detalhes
              </Link>
            </Button>
          ) : (
            <Button
              variant="hubee_750"
              size="sm"
              className="hidden hover:text-hubee-400 focus-visible:ring-hubee-400 md:inline-flex dark:bg-hubee-400 dark:text-hubee-800 dark:hover:bg-hubee-300 dark:hover:text-hubee-800"
              asChild
            >
              <Link href={href} aria-label={`Ingressos para ${event.title}`}>
                Ingressos
              </Link>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

function SalesProgress({ event }: { event: EventSummary }) {
  if (event.capacity === null || event.ticketsSold === null) return null;

  const percentage = Math.min(99, Math.round(soldRatio(event) * 100));
  const remaining = event.capacity - event.ticketsSold;

  return (
    <div className="mt-3">
      <div className="flex justify-between text-[11px] font-semibold text-hubee-700 dark:text-hubee-300">
        <span>Restam {remaining}</span>
        <span>
          {percentage}%<span className="hidden md:inline"> vendido</span>
        </span>
      </div>
      <div
        role="progressbar"
        aria-label="Ingressos vendidos"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
        className="mt-1 h-1.5 overflow-hidden rounded-full bg-hubee-200 dark:bg-hubee-800"
      >
        <div
          className="h-full rounded-full bg-hubee-750 dark:bg-hubee-400"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
