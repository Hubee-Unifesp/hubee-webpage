import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { organizerProfileHref } from "@/components/home/events/links";
import type { EventOrganizer as EventOrganizerData } from "@/lib/api/events";
import { organizerInitial } from "./format";

/** Bloco "Quem faz acontecer": organização realizadora com link direto para o perfil público `/organizacoes/[id]`. */
export function EventOrganizer({ organizer }: { organizer: EventOrganizerData }) {
  const profileHref = organizerProfileHref(organizer.id);

  return (
    <Link
      href={profileHref}
      className="group flex items-center justify-between gap-4 rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-hubee-400"
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          aria-hidden="true"
          className="flex size-11 shrink-0 items-center justify-center rounded-full bg-hubee-400 font-heading text-xl font-bold text-hubee-800 transition-transform group-hover:scale-105 md:size-12"
        >
          {organizerInitial(organizer.name)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-hubee-800 group-hover:underline dark:text-hubee-50">
            {organizer.name}
          </p>
          {organizer.description && (
            <p className="truncate text-xs text-hubee-neutral-300 dark:text-hubee-100">{organizer.description}</p>
          )}
        </div>
      </div>

      <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-hubee-800 group-hover:underline dark:text-hubee-50">
        Ver perfil
        <ArrowUpRight aria-hidden="true" className="hidden size-3.5 md:block" />
        <span className="sr-only"> de {organizer.name}</span>
      </span>
    </Link>
  );
}
