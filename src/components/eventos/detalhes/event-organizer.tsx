import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { organizerHref } from "@/components/home/events/links";
import type { EventOrganizer as EventOrganizerData } from "@/lib/api/events";
import { organizerInitial } from "./format";

/** Bloco "Quem faz acontecer": organização realizadora e link para o perfil. */
export function EventOrganizer({ organizer }: { organizer: EventOrganizerData }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-hubee-400 font-display text-xl text-hubee-800 md:size-12"
        >
          {organizerInitial(organizer.name)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-hubee-800 dark:text-hubee-50">{organizer.name}</p>
          {organizer.description && (
            <p className="truncate text-xs text-hubee-neutral-300 dark:text-hubee-100">{organizer.description}</p>
          )}
        </div>
      </div>

      <Link
        href={organizerHref(organizer.id)}
        className="inline-flex shrink-0 items-center gap-1 rounded-sm text-xs font-semibold text-hubee-800 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-hubee-400 dark:text-hubee-50"
      >
        Ver perfil
        <ArrowUpRight aria-hidden="true" className="hidden size-3.5 md:block" />
        <span className="sr-only"> de {organizer.name}</span>
      </Link>
    </div>
  );
}
