"use client";

import { useDeferredValue, useState } from "react";
import { ListFilter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { EventCategory, EventSummary, HomeEvents } from "@/lib/api/events";
import { cn } from "@/lib/utils";
import { categoryConfig } from "./categories.config";
import { CategoryFilter } from "./category-filter";
import { EventCard } from "./event-card";
import { EventCarousel } from "./event-carousel";
import {
  EventFiltersModal,
  type EventFiltersState,
} from "./event-filters-modal";
import { FeaturedEventCard } from "./featured-event-card";
import { formatDateRange } from "./format";
import { listHref } from "./links";
import { ListMessage } from "./list-states";
import { MOCK_HOME_EVENTS } from "./mock-events";

const cardWidth =
  "w-[calc((100%-0.75rem)/2)] sm:w-[calc((100%-1.5rem)/3)] md:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-3rem)/4)] xl:w-[calc((100%-4rem)/5)]";
const featuredCardWidth = "w-full md:w-[calc((100%-1rem)/2)]";

const INITIAL_FILTERS: EventFiltersState = {
  categories: [],
  city: null,
  dateRange: { start: null, end: null },
};

export function EventListingSection() {
  const [query, setQuery] = useState("");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<EventFiltersState>(INITIAL_FILTERS);
  const deferredQuery = useDeferredValue(query.trim());
  const resolvedData = MOCK_HOME_EVENTS;

  const hasActiveModalFilters =
    filters.categories.length > 0 ||
    filters.city !== null ||
    filters.dateRange.start !== null;

  const filtering = deferredQuery !== "" || hasActiveModalFilters;

  const selectedQuickCategory =
    filters.categories.length === 1 ? filters.categories[0] : null;

  const handleQuickCategoryChange = (category: EventCategory | null) => {
    setFilters((prev) => ({
      ...prev,
      categories: category ? [category] : [],
    }));
  };

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
        <form
          role="search"
          onSubmit={(event) => event.preventDefault()}
          className="mt-6 flex w-full max-w-lg items-center gap-2.5"
        >
          <div className="relative flex-1">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-hubee-750 dark:text-hubee-400"
            />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Buscar por evento ou agremiação"
              placeholder="Buscar por evento ou agremiação"
              className="h-10 border-hubee-400 bg-hubee-50 pl-9 text-hubee-800 placeholder:text-hubee-neutral-300 focus-visible:border-hubee-500 focus-visible:ring-hubee-400/50 dark:border-hubee-500 dark:bg-hubee-750 dark:text-hubee-50 dark:placeholder:text-hubee-neutral-200"
            />
          </div>
          <button
            type="button"
            aria-haspopup="dialog"
            aria-expanded={isFiltersOpen}
            onClick={() => setIsFiltersOpen((prev) => !prev)}
            className={cn(
              "inline-flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-4 text-xs font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-hubee-400",
              isFiltersOpen || hasActiveModalFilters
                ? "border-hubee-750 bg-hubee-750 text-hubee-50 dark:border-hubee-400 dark:bg-hubee-400 dark:text-hubee-800"
                : "border-hubee-400 bg-hubee-50 text-hubee-800 hover:border-hubee-750 hover:bg-hubee-750 hover:text-hubee-50 dark:border-hubee-500 dark:bg-hubee-750 dark:text-hubee-50 dark:hover:bg-hubee-400 dark:hover:text-hubee-800",
            )}
          >
            <ListFilter aria-hidden="true" strokeWidth={2} className="size-4" />
            Filtros
          </button>
        </form>
        <CategoryFilter
          categories={resolvedData.categories}
          selected={selectedQuickCategory}
          onChange={handleQuickCategoryChange}
        />
      </div>

      <EventFiltersModal
        open={isFiltersOpen}
        onOpenChange={setIsFiltersOpen}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {filtering ? (
        <FilteredResults
          query={deferredQuery}
          filters={filters}
          events={resolvedData.upcoming}
          onClear={clearFilters}
        />
      ) : (
        <EventLists data={resolvedData} />
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
    </>
  );
}

const normalize = (text: string) =>
  text.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

function matchesDateRange(
  eventStartIso: string,
  start: Date | null,
  end: Date | null,
): boolean {
  if (!start) return true;
  const eventDate = new Date(eventStartIso);
  const eventDay = new Date(
    eventDate.getFullYear(),
    eventDate.getMonth(),
    eventDate.getDate(),
  ).getTime();
  const startDay = new Date(
    start.getFullYear(),
    start.getMonth(),
    start.getDate(),
  ).getTime();

  if (!end) {
    return eventDay === startDay;
  }

  const endDay = new Date(
    end.getFullYear(),
    end.getMonth(),
    end.getDate(),
  ).getTime();
  return eventDay >= startDay && eventDay <= endDay;
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
  const term = normalize(query);
  const cityTerm = filters.city ? normalize(filters.city) : null;

  const results = events.filter((event) => {
    const matchesCategory =
      filters.categories.length === 0 ||
      filters.categories.includes(event.category);
    const matchesQuery =
      term === "" ||
      normalize(event.title).includes(term) ||
      normalize(event.organizerName).includes(term);
    const matchesCity =
      cityTerm === null || normalize(event.venueName).includes(cityTerm);
    const matchesDate = matchesDateRange(
      event.startDate,
      filters.dateRange.start,
      filters.dateRange.end,
    );

    return matchesCategory && matchesQuery && matchesCity && matchesDate;
  });

  if (results.length === 0) {
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

  const count = `${results.length} ${results.length === 1 ? "evento encontrado" : "eventos encontrados"}`;
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
        {results.map((event) => (
          <li key={event.id}>
            <EventCard event={event} />
          </li>
        ))}
      </ul>
    </section>
  );
}
