import Image from "next/image";
import { CalendarDays } from "lucide-react";
import { categoryConfig } from "@/components/home/events/categories.config";
import { HexPattern } from "@/components/home/events/event-media";
import type { EventDetails } from "@/lib/api/events";
import { cn } from "@/lib/utils";
import { containerClassName } from "./event-page-shell";
import { formatAgeRating, formatEventDateTime } from "./format";
import { ShareButton } from "./share-button";

type EventHeroProps = Pick<
  EventDetails,
  "title" | "tagline" | "category" | "ageRating" | "startDate" | "photoUrl"
>;

/** Capa do evento com título, data/hora e badges de categoria e classificação indicativa. */
export function EventHero({ title, tagline, category, ageRating, startDate, photoUrl }: EventHeroProps) {
  const { label: categoryLabel, icon: CategoryIcon } = categoryConfig[category];

  return (
    <header className="relative isolate overflow-hidden bg-hubee-900 text-hubee-50">
      {photoUrl ? (
        <Image
          src={photoUrl}
          alt=""
          fill
          priority
          unoptimized
          sizes="100vw"
          className="-z-10 object-cover"
        />
      ) : (
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-hubee-900">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgb(252_178_1/0.35),transparent_55%)]" />
          <HexPattern className="text-hubee-750/70" />
        </div>
      )}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-t from-hubee-900/95 via-hubee-900/50 to-hubee-900/10 md:bg-linear-to-r md:from-hubee-900/90 md:via-hubee-900/40 md:to-transparent"
      />

      <div className={cn(containerClassName, "relative flex min-h-[26rem] flex-col justify-end pt-16 pb-6 md:min-h-[32rem] md:pb-7")}>
        <ShareButton title={title} className="absolute top-4 right-4 sm:right-8 md:right-6" />

        {tagline && (
          <p className="text-[10px] font-semibold tracking-[0.2em] text-hubee-400 uppercase md:text-xs">{tagline}</p>
        )}
        <h1
          id="evento-titulo"
          className="mt-2 max-w-xl font-display text-4xl leading-[1.05] text-white md:mt-3 md:text-6xl"
        >
          {title}
        </h1>

        <p className="mt-3 flex items-center gap-2 text-sm text-hubee-50 md:mt-4">
          <CalendarDays aria-hidden="true" className="size-4" />
          <time dateTime={startDate}>{formatEventDateTime(startDate)}</time>
        </p>

        <ul aria-label="Categoria e classificação" className="mt-3 flex flex-wrap gap-2">
          <li className="inline-flex items-center gap-1 rounded-md bg-hubee-400 px-2 py-1 text-xs font-semibold text-hubee-800">
            <CategoryIcon aria-hidden="true" className="size-3.5" />
            {categoryLabel}
          </li>
          {ageRating && <AgeRatingBadge rating={ageRating} />}
        </ul>
      </div>
    </header>
  );
}

function AgeRatingBadge({ rating }: { rating: NonNullable<EventDetails["ageRating"]> }) {
  const { short, label } = formatAgeRating(rating);
  const isFree = rating === "L";

  return (
    <li
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs",
        isFree ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700",
      )}
    >
      <span aria-hidden="true" className="font-bold">
        {short}
      </span>
      {!isFree && <span aria-hidden="true">Anos</span>}
      <span className="sr-only">{label}</span>
    </li>
  );
}
