"use client";

import { useDeferredValue, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFilteredEvents } from "@/hooks/useFilteredEvents";
import { useHomeEvents } from "@/hooks/useHomeEvents";
import type { EventSummary, HomeEvents } from "@/lib/api/events";
import { categoryConfig } from "./categories.config";
import { EventCard } from "./event-card";
import { EventCarousel } from "./event-carousel";
import type { EventFiltersState } from "./event-filters-modal";
import {
  EventSearchBar,
  hasActiveModalFilters,
  INITIAL_FILTERS,
} from "./event-search-bar";
import { FeaturedEventCard } from "./featured-event-card";
import { formatDateRange } from "./format";
import { allEventsHref, listHref } from "./links";
import {
  EventCardSkeleton,
  EventListsSkeleton,
  ListMessage,
} from "./list-states";

const cardWidth =
  "w-[calc((100%-0.75rem)/2)] sm:w-[calc((100%-1.5rem)/3)] md:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-3rem)/4)] xl:w-[calc((100%-4rem)/5)]";
const featuredCardWidth = "w-full md:w-[calc((100%-1rem)/2)]";
const EMPTY_SUMMARIES: readonly EventSummary[] = [];

export function EventListingSection() {
  const { status, data, retry } = useHomeEvents();
  const [query, setQuery] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<EventFiltersState>(INITIAL_FILTERS);
  const deferredQuery = useDeferredValue(query.trim());

  const filtering = deferredQuery !== "" || hasActiveModalFilters(filters);

  const filteredState = useFilteredEvents({
    enabled: filtering,
    query: deferredQuery,
    filters,
    fallbackSummaries: data?.upcoming ?? EMPTY_SUMMARIES,
  });

  const clearFilters = () => {
    setQuery("");
    setFilters(INITIAL_FILTERS);
  };

  return (
    <section
      id="eventos"
      aria-labelledby="eventos-titulo"
      className="flex scroll-mt-4 flex-col items-center gap-10 py-8 md:gap-12"
    >
      <div className="flex w-full flex-col items-center text-center">
        <h2
          id="eventos-titulo"
          className="font-heading text-2xl font-bold tracking-tight text-hubee-800 md:text-3xl dark:text-hubee-50"
        >
          Próximos eventos
        </h2>
        <p className="mt-2 max-w-md text-sm text-hubee-750 dark:text-hubee-50">
          Festas, shows, palestras e campeonatos das agremiações perto de você.
        </p>

        <EventSearchBar
          query={query}
          onQueryChange={setQuery}
          filters={filters}
          onFiltersChange={setFilters}
          isFiltersOpen={isFiltersOpen}
          onFiltersOpenChange={setIsFiltersOpen}
          onClearAll={clearFilters}
        />
      </div>

      {filtering ? (
        <>
          {filteredState.status === "loading" && (
            <div role="status" aria-live="polite" className="w-full">
              <span className="sr-only">Buscando eventos…</span>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
                {Array.from({ length: 5 }, (_, idx) => (
                  <EventCardSkeleton key={idx} />
                ))}
              </div>
            </div>
          )}

          {filteredState.status === "error" && (
            <ListMessage
              role="alert"
              title="Não foi possível buscar os eventos"
              description="Verifique sua conexão e tente aplicar os filtros novamente."
              actionLabel="Tentar novamente"
              onAction={filteredState.retry}
              variant="outline"
            />
          )}

          {filteredState.status === "ok" && (
            <FilteredResults
              query={deferredQuery}
              filters={filters}
              events={filteredState.data}
              onClear={clearFilters}
            />
          )}
        </>
      ) : (
        <>
          {status === "loading" && <EventListsSkeleton />}

          {status === "error" && (
            <ListMessage
              role="alert"
              title="Não foi possível carregar os eventos"
              description="Verifique sua conexão e tente de novo."
              actionLabel="Tentar novamente"
              onAction={retry}
              variant="outline"
            />
          )}

          {status === "ok" && <EventLists data={data} />}
        </>
      )}
    </section>
  );
}

function EventLists({ data }: { data: HomeEvents }) {
  const { featured, thisWeek, sellingOut, free } = data;

  return (
    <>
      {featured.length > 0 && (
        <EventCarousel
          id="destaque"
          title="Em destaque"
          subtitle="Escolhidos pelo Hubee para as próximas semanas"
          itemClassName={featuredCardWidth}
        >
          {featured.map((event) => (
            <FeaturedEventCard key={event.id} event={event} />
          ))}
        </EventCarousel>
      )}
      {thisWeek.events.length > 0 && (
        <EventCarousel
          id="essa-semana"
          title="Essa semana"
          subtitle={formatDateRange(thisWeek.startDate, thisWeek.endDate)}
          viewAllHref={listHref("essa-semana")}
          itemClassName={cardWidth}
        >
          {thisWeek.events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </EventCarousel>
      )}
      {sellingOut.length > 0 && (
        <EventCarousel
          id="esgotando"
          title="Esgotando"
          subtitle="Garanta antes que acabe"
          viewAllHref={listHref("esgotando")}
          itemClassName={cardWidth}
        >
          {sellingOut.map((event) => (
            <EventCard key={event.id} event={event} showSalesProgress />
          ))}
        </EventCarousel>
      )}
      {free.length > 0 && (
        <EventCarousel
          id="gratuitos"
          title="Gratuitos"
          subtitle="Sem gastar nada"
          viewAllHref={listHref("gratuitos")}
          itemClassName={cardWidth}
        >
          {free.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </EventCarousel>
      )}

      <div className="pt-2">
        <Button
          variant="outline"
          className="h-11 gap-2 rounded-full border-hubee-400 bg-hubee-50 px-6 text-sm font-semibold text-hubee-800 hover:border-hubee-750 hover:bg-hubee-750 hover:text-hubee-50 focus-visible:ring-hubee-400 dark:border-hubee-500 dark:bg-hubee-750 dark:text-hubee-50 dark:hover:border-hubee-400 dark:hover:bg-hubee-400 dark:hover:text-hubee-800"
          asChild
        >
          <Link href={allEventsHref}>
            Ver todos os eventos
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </Button>
      </div>
    </>
  );
}

interface FilteredResultsProps {
  query: string;
  filters: EventFiltersState;
  events: EventSummary[];
  onClear: () => void;
}

function FilteredResults({
  query,
  filters,
  events,
  onClear,
}: FilteredResultsProps) {
  if (events.length === 0) {
    return (
      <ListMessage
        title="Nenhum evento encontrado"
        description="Tente outra palavra-chave ou explore as listas."
        actionLabel="Voltar às listas"
        onAction={onClear}
        variant="primary"
      />
    );
  }

  const count = `${events.length} ${events.length === 1 ? "evento encontrado" : "eventos encontrados"}`;
  const singleCategory =
    filters.categories.length === 1 ? filters.categories[0] : null;

  return (
    <section aria-labelledby="resultados-titulo" className="w-full">
      <h3
        id="resultados-titulo"
        className="font-sans text-lg font-bold text-hubee-800 md:text-xl dark:text-hubee-50"
      >
        {singleCategory && !query && !filters.city && !filters.dateRange.start
          ? categoryConfig[singleCategory].label
          : "Resultados da busca"}
      </h3>
      <p
        role="status"
        className="text-xs text-hubee-750 md:text-sm dark:text-hubee-100"
      >
        {count}
        {query && <> para “{query}”</>}
        {filters.categories.length > 0 && (
          <>
            {" "}
            em{" "}
            {filters.categories
              .map((cat) => categoryConfig[cat].label)
              .join(", ")}
          </>
        )}
        {filters.city && <> · {filters.city}</>}
      </p>
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
        {events.map((event) => (
          <li key={event.id}>
            <EventCard event={event} />
          </li>
        ))}
      </ul>
    </section>
  );
}
