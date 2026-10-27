import { ArrowUpRight, MapPin } from "lucide-react";
import type { EventVenue as EventVenueData } from "@/lib/api/events";
import { cn } from "@/lib/utils";
import { formatAddressLines, mapsHref } from "./format";
import { sectionCardClassName } from "./section-card";

/** Card "Onde a gente se encontra": nome do local, endereço completo e link para o mapa. */
export function EventVenue({ venue }: { venue: EventVenueData }) {
  const lines = venue.address ? formatAddressLines(venue.address) : null;

  return (
    <div className={cn(sectionCardClassName, "flex gap-3 p-4 md:gap-4 md:p-5")}>
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-hubee-100 text-hubee-750 md:size-10 dark:bg-hubee-750 dark:text-hubee-400">
        <MapPin aria-hidden="true" className="size-4 md:size-5" />
      </span>

      <div className="min-w-0">
        <p className="text-sm font-semibold text-hubee-800 dark:text-hubee-50">{venue.name}</p>
        {lines && venue.address && (
          <>
            <address className="mt-1 text-xs leading-relaxed text-hubee-neutral-300 not-italic dark:text-hubee-100">
              {lines[0]}
              <br />
              {lines[1]}
            </address>
            <a
              href={mapsHref(venue.name, venue.address)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 rounded-sm text-xs font-semibold text-hubee-800 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-hubee-400 dark:text-hubee-50"
            >
              Ver no mapa
              <ArrowUpRight aria-hidden="true" className="size-3.5" />
              <span className="sr-only">(abre em nova aba)</span>
            </a>
          </>
        )}
      </div>
    </div>
  );
}
