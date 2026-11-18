"use client";

import { useDeferredValue, useState } from "react";
import { useFilteredEvents } from "@/hooks/useFilteredEvents";
import { useHomeEvents } from "@/hooks/useHomeEvents";
import type { EventSummary, HomeEvents } from "@/lib/api/events";
import { displayFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import type { EventCategory } from "@/lib/api/events";
import { categoryConfig } from "./categories.config";
import { HexPattern } from "./event-media";
import { EventCarousel } from "./event-carousel";
import type { EventFiltersState } from "./event-filters-modal";
import {
  EventSearchBar,
  hasActiveModalFilters,
  INITIAL_FILTERS,
} from "./event-search-bar";
import { EventBillboard, EventPoster } from "./event-poster";
import { formatDateRange } from "./format";
import { listHref } from "./links";
import {
  EventCardSkeleton,
  EventListsSkeleton,
  ListMessage,
} from "./list-states";

const posterWidth = "w-[72%] sm:w-[44%] md:w-[31%] lg:w-[23.5%] xl:w-[19%]";
const rankedWidth = "w-[84%] sm:w-[54%] md:w-[39%] lg:w-[30%] xl:w-[24.5%]";
const billboardWidth = "w-[90%] lg:w-[calc((100%-1.25rem)/2)]";
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
      className="flex flex-col gap-14 py-12 md:gap-16 md:py-20"
    >
      <div className="flex w-full flex-col items-center gap-6 text-center">
        <div>
          <h2
            id="eventos-titulo"
            className={cn(displayFont.className, "text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.9] uppercase text-hubee-800 dark:text-hubee-50")}
          >
            Próximos eventos
          </h2>
        </div>

        <div className="flex w-full flex-col items-center [&_input]:h-14 [&_input]:text-base [&>form]:mt-0 [&>form]:max-w-2xl [&>form>button]:h-14">

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

          {status === "ok" && (
            <EventLists
              data={data}
              onPickCategory={(category) => setFilters({ ...INITIAL_FILTERS, categories: [category] })}
            />
          )}
        </>
      )}
    </section>
  );
}

function EventLists({ data, onPickCategory }: { data: HomeEvents; onPickCategory: (category: EventCategory) => void }) {
  const { featured, thisWeek, sellingOut, free, categories } = data;

  return (
    <>
      {featured.length > 0 && (
        <EventCarousel
          id="destaque"
          title="Em destaque"
          subtitle="Escolhidos pelo Hubee para as próximas semanas"
          itemClassName={billboardWidth}
        >
          {featured.map((event) => (
            <EventBillboard key={event.id} event={event} />
          ))}
        </EventCarousel>
      )}
      {thisWeek.events.length > 0 && (
        <EventCarousel
          id="essa-semana"
          title="Essa semana"
          subtitle={formatDateRange(thisWeek.startDate, thisWeek.endDate)}
          viewAllHref={listHref("essa-semana")}
          itemClassName={posterWidth}
        >
          {thisWeek.events.map((event) => (
            <EventPoster key={event.id} event={event} />
          ))}
        </EventCarousel>
      )}
      {sellingOut.length > 0 && (
        <EventCarousel
          id="esgotando"
          title="Esgotando"
          subtitle="Os mais disputados agora. Garanta antes que acabe"
          viewAllHref={listHref("esgotando")}
          itemClassName={rankedWidth}
        >
          {sellingOut.map((event, index) => (
            <EventPoster key={event.id} event={event} rank={index + 1} showSalesProgress />
          ))}
        </EventCarousel>
      )}
      <CategoryShelf categories={categories} onPick={onPickCategory} />
      {free.length > 0 && (
        <EventCarousel
          id="gratuitos"
          title="Gratuitos"
          subtitle="Rolês sem gastar nada"
          viewAllHref={listHref("gratuitos")}
          itemClassName={posterWidth}
        >
          {free.map((event) => (
            <EventPoster key={event.id} event={event} />
          ))}
        </EventCarousel>
      )}

    </>
  );
}

function CategoryShelf({
  categories,
  onPick,
}: {
  categories: HomeEvents["categories"];
  onPick: (category: EventCategory) => void;
}) {
  return (
    <section aria-labelledby="categorias-titulo" className="w-full">
      <h3
        id="categorias-titulo"
        className={cn(displayFont.className, "text-2xl leading-none uppercase text-hubee-800 md:text-[2rem] dark:text-hubee-50")}
      >
        Explore por categoria
      </h3>
      <p className="mt-1.5 text-sm text-hubee-750 dark:text-hubee-200/80">Escolha o tipo de rolê e veja tudo o que tem</p>
      <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-6">
        {categories.map(({ category, count }) => {
          const { icon: Icon, label, mediaClassName, patternClassName } = categoryConfig[category];
          return (
            <li key={category}>
              <button
                type="button"
                onClick={() => onPick(category)}
                className={cn(
                  "group relative isolate flex h-32 w-full cursor-pointer flex-col justify-between overflow-hidden rounded-2xl p-4 md:h-36 text-left transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-hubee-400 active:scale-[0.98] motion-reduce:transition-none",
                  mediaClassName,
                )}
              >
                <HexPattern className={cn("-z-10", patternClassName)} />
                <Icon
                  aria-hidden="true"
                  strokeWidth={1.25}
                  className="absolute -right-3 -bottom-3 -z-10 size-24 opacity-30 transition-transform duration-500 group-hover:scale-110 group-hover:-rotate-12 motion-reduce:transition-none"
                />
                <span className={cn(displayFont.className, "text-[1.75rem] leading-none uppercase")}>{label}</span>
                <span className="text-xs font-semibold opacity-80">
                  {count === 0 ? "Em breve" : `${count} ${count === 1 ? "evento" : "eventos"}`}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
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
        className={cn(displayFont.className, "text-2xl leading-none uppercase text-hubee-800 md:text-[2rem] dark:text-hubee-50")}
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
      <ul className="mt-5 grid grid-cols-1 gap-x-5 gap-y-8 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {events.map((event) => (
          <li key={event.id}>
            <EventPoster event={event} />
          </li>
        ))}
      </ul>
    </section>
  );
}
