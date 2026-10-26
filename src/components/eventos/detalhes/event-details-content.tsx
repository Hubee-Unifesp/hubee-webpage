import type { ReactNode } from "react";
import { categoryConfig } from "@/components/home/events/categories.config";
import type { EventDetails } from "@/lib/api/events";
import { cn } from "@/lib/utils";
import { EventBreadcrumb } from "./event-breadcrumb";
import { EventDescription } from "./event-description";
import { EventHero } from "./event-hero";
import { EventOrganizer } from "./event-organizer";
import { EventPageShell, containerClassName } from "./event-page-shell";
import { EventVenue } from "./event-venue";
import { sectionTitleClassName } from "./section-card";
import { TicketTypeList } from "./ticket-type-list";

/** Página de detalhes do evento (GOL-140 / GOL-141). */
export function EventDetailsContent({ event }: { event: EventDetails }) {
  const categoryLabel = categoryConfig[event.category].label;
  const highlightedTicketId =
    event.ticketTypes.length > 1
      ? [...event.ticketTypes].reverse().find((ticket) => !ticket.soldOut)?.id
      : undefined;

  return (
    <EventPageShell label={`Detalhes do evento ${event.title}`}>
      <EventBreadcrumb categoryLabel={categoryLabel} title={event.title} />

      <article aria-labelledby="evento-titulo">
        <EventHero
          title={event.title}
          tagline={event.tagline}
          category={event.category}
          ageRating={event.ageRating}
          startDate={event.startDate}
          photoUrl={event.photoUrl}
        />

        <div className={cn(containerClassName, "space-y-10 py-8 md:space-y-12 md:py-10")}>
          {event.description && (
            <Section id="sobre" title="Um encontro para sentir.">
              <EventDescription description={event.description} />
            </Section>
          )}

          {event.venue && (
            <Section id="local" title="Onde a gente se encontra">
              <EventVenue venue={event.venue} />
            </Section>
          )}

          {event.organizer && (
            <Section id="organizacao" title="Quem faz acontecer">
              <EventOrganizer organizer={event.organizer} />
            </Section>
          )}

          <Section
            id="ingressos"
            title="Ingressos"
            description="Escolha seu lugar nessa noite. O resto é com a música."
          >
            <TicketTypeList ticketTypes={event.ticketTypes} highlightedId={highlightedTicketId} />
          </Section>
        </div>
      </article>
    </EventPageShell>
  );
}

interface SectionProps {
  id: string;
  title: string;
  description?: string;
  children: ReactNode;
}

function Section({ id, title, description, children }: SectionProps) {
  const headingId = `${id}-titulo`;

  return (
    <section id={id} aria-labelledby={headingId} className="scroll-mt-24">
      <h2 id={headingId} className={sectionTitleClassName}>
        {title}
      </h2>
      {description && <p className="mt-1 text-xs text-hubee-750 md:text-sm dark:text-hubee-100">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}
