"use client";

import { useDeferredValue, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useHomeEvents } from "@/hooks/useHomeEvents";
import type { EventCategory, EventSummary, HomeEvents } from "@/lib/api/events";
import { categoryConfig } from "./categories.config";
import { CategoryFilter } from "./category-filter";
import { EventCard } from "./event-card";
import { EventCarousel } from "./event-carousel";
import { FeaturedEventCard } from "./featured-event-card";
import { formatDateRange } from "./format";
import { listHref } from "./links";
import { EventListsSkeleton, ListMessage } from "./list-states";

const cardWidth =
  "w-[calc((100%-0.75rem)/2)] sm:w-[calc((100%-1.5rem)/3)] md:w-[calc((100%-2rem)/3)] lg:w-[calc((100%-3rem)/4)] xl:w-[calc((100%-4rem)/5)]";
const featuredCardWidth = "w-full md:w-[calc((100%-1rem)/2)]";

export function EventListingSection() {
  const { status, data, retry } = useHomeEvents();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<EventCategory | null>(null);
  const deferredQuery = useDeferredValue(query.trim());
  const filtering = deferredQuery !== "" || category !== null;

  const clearFilters = () => {
    setQuery("");
    setCategory(null);
  };

  return (
    <section id="eventos" aria-labelledby="eventos-titulo" className="flex scroll-mt-4 flex-col items-center gap-10 py-8 md:gap-12">
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
        <form role="search" onSubmit={(event) => event.preventDefault()} className="relative mt-6 w-full max-w-md">
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
        </form>
        {status === "ok" && (
          <CategoryFilter categories={data.categories} selected={category} onChange={setCategory} />
        )}
      </div>

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

      {status === "ok" &&
        (filtering ? (
          <FilteredResults query={deferredQuery} category={category} events={data.upcoming} onClear={clearFilters} />
        ) : (
          <EventLists data={data} />
        ))}
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

interface FilteredResultsProps {
  query: string;
  category: EventCategory | null;
  events: EventSummary[];
  onClear: () => void;
}

function FilteredResults({ query, category, events, onClear }: FilteredResultsProps) {
  const term = normalize(query);
  const results = events.filter(
    (event) =>
      (category === null || event.category === category) &&
      (normalize(event.title).includes(term) || normalize(event.organizerName).includes(term)),
  );

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

  return (
    <section aria-labelledby="resultados-titulo" className="w-full">
      <h3 id="resultados-titulo" className="font-sans text-lg font-bold text-hubee-800 md:text-xl dark:text-hubee-50">
        {category && !query ? categoryConfig[category].label : "Resultados da busca"}
      </h3>
      <p role="status" className="text-xs text-hubee-750 md:text-sm dark:text-hubee-100">
        {count}
        {query && <> para “{query}”</>}
        {category && query && <> em {categoryConfig[category].label}</>}
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
