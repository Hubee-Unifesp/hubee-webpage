import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { isSoldOut, soldRatio, type EventSummary } from "@/lib/api/events";
import { displayFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { categoryConfig } from "./categories.config";
import { CategoryPill, DateBadge, HexPattern } from "./event-media";
import { formatEventDate, formatPrice } from "./format";
import { eventHref } from "./links";

interface EventArtProps {
  event: EventSummary;
  soldOut: boolean;
  className?: string;
  titleClassName?: string;
  children?: React.ReactNode;
}

function EventArt({ event, soldOut, className, titleClassName, children }: EventArtProps) {
  const { icon: Icon, mediaClassName, patternClassName } = categoryConfig[event.category];

  return (
    <div
      className={cn(
        "relative isolate overflow-hidden rounded-2xl transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none",
        mediaClassName,
        soldOut && "grayscale-[0.6]",
        className,
      )}
    >
      <HexPattern className={cn("-z-10", patternClassName)} />
      <Icon
        aria-hidden="true"
        strokeWidth={1.1}
        className="absolute -top-[6%] -right-[4%] -z-10 size-[46%] opacity-25 transition-transform duration-700 group-hover:scale-110 group-hover:-rotate-6 motion-reduce:transition-none"
      />
      <DateBadge date={event.startDate} />
      {soldOut && (
        <span className="absolute top-3 right-3 rounded-full bg-hubee-900 px-2.5 py-1 text-xs font-semibold text-hubee-50">
          Esgotado
        </span>
      )}
      <span
        className={cn(
          displayFont.className,
          "absolute inset-x-4 bottom-3 line-clamp-2 leading-[0.95] uppercase",
          titleClassName,
        )}
      >
        {event.title}
      </span>
      {children}
    </div>
  );
}

interface EventPosterProps {
  event: EventSummary;
  rank?: number;
  showSalesProgress?: boolean;
  headingLevel?: "h3" | "h4";
}

export function EventPoster({ event, rank, showSalesProgress = false, headingLevel: Heading = "h4" }: EventPosterProps) {
  const soldOut = isSoldOut(event);

  return (
    <article className="group relative flex h-full items-end">
      {rank !== undefined && (
        <span
          aria-hidden="true"
          className={cn(
            displayFont.className,
            "-mr-[7%] shrink-0 self-start pt-2 text-[clamp(6rem,10vw,9.5rem)] leading-none text-transparent [-webkit-text-stroke:3px_var(--color-hubee-750)] dark:[-webkit-text-stroke:3px_var(--color-hubee-400)]",
          )}
        >
          {rank}
        </span>
      )}

      <div className="flex h-full min-w-0 flex-1 flex-col">
        <EventArt
          event={event}
          soldOut={soldOut}
          className="aspect-[16/11] group-hover:-translate-y-1 group-hover:scale-[1.03]"
          titleClassName="text-[clamp(1.5rem,2.1vw,2rem)]"
        >
          <span className="absolute right-3 bottom-3 hidden size-10 translate-y-2 items-center justify-center rounded-full bg-hubee-900 text-hubee-50 opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-y-0 group-hover:opacity-100 md:flex motion-reduce:transition-none">
            <ArrowRight aria-hidden="true" className="size-5" />
          </span>
        </EventArt>

        <div className={cn("mt-3 flex flex-1 flex-col px-1", soldOut && "opacity-70")}>
          <Heading className="truncate text-sm font-semibold text-hubee-800 md:text-base dark:text-hubee-50">
            <Link
              href={eventHref(event.id)}
              className="rounded-sm outline-none after:absolute after:inset-0 after:rounded-2xl focus-visible:ring-3 focus-visible:ring-hubee-400"
            >
              {event.title}
            </Link>
          </Heading>
          <p className="mt-0.5 truncate text-xs text-hubee-neutral-300 md:text-sm dark:text-hubee-200/80">
            {formatEventDate(event.startDate, event.endDate)} · {event.venueName}
          </p>
          {showSalesProgress && !soldOut && <SalesBar event={event} />}
          <p className="mt-1.5 text-sm font-bold text-hubee-800 dark:text-hubee-400">
            {formatPrice(event.price)}
          </p>
        </div>
      </div>
    </article>
  );
}

function SalesBar({ event }: { event: EventSummary }) {
  if (event.capacity === null || event.ticketsSold === null) return null;
  const percentage = Math.min(99, Math.round(soldRatio(event) * 100));

  return (
    <div className="mt-2 flex items-center gap-2">
      <div
        role="progressbar"
        aria-label="Ingressos vendidos"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
        className="h-1.5 flex-1 overflow-hidden rounded-full bg-hubee-200 dark:bg-hubee-50/10"
      >
        <div className="h-full rounded-full bg-hubee-750 dark:bg-hubee-400" style={{ width: `${percentage}%` }} />
      </div>
      <span className="text-[11px] font-semibold text-hubee-700 tabular-nums dark:text-hubee-300">{percentage}%</span>
    </div>
  );
}

export function EventBillboard({ event }: { event: EventSummary }) {
  const soldOut = isSoldOut(event);
  const href = eventHref(event.id);
  const priceLabel =
    event.price === null
      ? "Ingressos"
      : event.price === 0
        ? "Inscrição"
        : [event.batchLabel, "a partir de"].filter(Boolean).join(" · ");

  return (
    <article className="group relative grid h-full overflow-hidden rounded-3xl bg-white md:grid-cols-[1.15fr_1fr] dark:bg-hubee-850">
      <EventArt
        event={event}
        soldOut={soldOut}
        className="aspect-[16/10] rounded-none md:aspect-auto md:min-h-72"
        titleClassName="text-[clamp(2rem,3.4vw,3.25rem)] inset-x-5 bottom-5"
      />

      <div className="flex flex-col p-5 md:p-7">
        <CategoryPill category={event.category} />
        <h3 className="mt-4 text-lg leading-snug font-semibold text-hubee-800 md:text-xl dark:text-hubee-50">
          <Link
            href={href}
            className="rounded-sm outline-none after:absolute after:inset-0 after:rounded-3xl focus-visible:ring-3 focus-visible:ring-hubee-400"
          >
            {event.title}
          </Link>
        </h3>
        {event.description && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-hubee-750 dark:text-hubee-100/85">
            {event.description}
          </p>
        )}
        <p className="mt-3 text-sm text-hubee-neutral-300 dark:text-hubee-200/80">
          {formatEventDate(event.startDate, event.endDate)}
          <br />
          {event.organizerName} · {event.venueName}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-6">
          <div>
            <p className="text-xs text-hubee-neutral-300 dark:text-hubee-200/70">{priceLabel}</p>
            <p className="text-xl font-bold text-hubee-800 dark:text-hubee-50">{formatPrice(event.price)}</p>
          </div>
          <span className="inline-flex h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-full bg-hubee-800 px-5 text-sm font-semibold text-hubee-50 transition-colors group-hover:bg-hubee-750 dark:bg-hubee-400 dark:text-hubee-900 dark:group-hover:bg-hubee-300">
            {soldOut ? "Ver detalhes" : "Garantir ingresso"}
            <ArrowRight aria-hidden="true" className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none" />
          </span>
        </div>
      </div>
    </article>
  );
}
