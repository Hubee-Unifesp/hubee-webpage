import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { EventSummary } from "@/lib/api/events";
import { eventCardClassName } from "./event-card";
import { CategoryPill, EventMedia } from "./event-media";
import { formatEventDate, formatPrice } from "./format";
import { eventHref } from "./links";
import { cn } from "@/lib/utils";

export function FeaturedEventCard({ event }: { event: EventSummary }) {
  const href = eventHref(event.id);
  const priceLabel =
    event.price === null
      ? "Ingressos"
      : event.price === 0
        ? "Inscrição"
        : [event.batchLabel, "a partir de"].filter(Boolean).join(" · ");

  return (
    <article className={cn(eventCardClassName, "lg:flex-row")}>
      <EventMedia
        category={event.category}
        startDate={event.startDate}
        className="h-28 md:h-32 lg:h-auto lg:w-2/5 lg:shrink-0"
      />

      <div className="flex flex-1 flex-col p-4 md:p-5">
        <CategoryPill category={event.category} className="hidden md:inline-flex" />
        <h3 className="font-sans text-base leading-snug font-semibold md:mt-3 md:text-xl">
          <Link
            href={href}
            className="rounded-sm outline-none hover:underline focus-visible:ring-3 focus-visible:ring-hubee-400"
          >
            {event.title}
          </Link>
        </h3>
        {event.description && (
          <p className="mt-2 line-clamp-2 text-sm text-hubee-750/90 dark:text-hubee-100">
            {event.description}
          </p>
        )}
        <p className="mt-3 text-xs text-hubee-neutral-300 dark:text-hubee-100">
          <span className="hidden md:inline">{event.organizerName} · </span>
          {formatEventDate(event.startDate, event.endDate)}
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-4">
          <div>
            <p className="hidden text-[11px] text-hubee-neutral-300 md:block dark:text-hubee-100">
              {priceLabel}
            </p>
            <p className="text-base font-bold text-hubee-800 md:text-lg dark:text-hubee-50">
              {formatPrice(event.price)}
            </p>
          </div>
          <Button
            variant="hubee_750"
            size="sm"
            className="hover:text-hubee-400 focus-visible:ring-hubee-400 dark:bg-hubee-400 dark:text-hubee-800 dark:hover:bg-hubee-300 dark:hover:text-hubee-800"
            asChild
          >
            <Link href={href} aria-label={`Garantir ingresso para ${event.title}`}>
              Garantir ingresso
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
