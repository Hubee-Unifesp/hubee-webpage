"use client";

import { useDeferredValue, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Sparkles, X } from "lucide-react";
import {
  EventPageShell,
  containerClassName,
} from "@/components/eventos/detalhes/event-page-shell";
import { categoryConfig } from "@/components/home/events/categories.config";
import { EventCard } from "@/components/home/events/event-card";
import type { EventFiltersState } from "@/components/home/events/event-filters-modal";
import {
  EventSearchBar,
  hasActiveModalFilters,
  INITIAL_FILTERS,
} from "@/components/home/events/event-search-bar";
import {
  EventCardSkeleton,
  ListMessage,
} from "@/components/home/events/list-states";
import { useFilteredEvents } from "@/hooks/useFilteredEvents";
import { useHomeEvents } from "@/hooks/useHomeEvents";
import type { EventSummary, HomeEvents } from "@/lib/api/events";
import { cn } from "@/lib/utils";

type EventListSlug = "essa-semana" | "esgotando" | "gratuitos";
const EMPTY_SUMMARIES: readonly EventSummary[] = [];

const LIST_LABELS: Record<EventListSlug, { title: string; subtitle: string }> = {
  "essa-semana": {
    title: "Eventos desta semana",
    subtitle: "Confira o que vai rolar nos próximos dias.",
  },
  esgotando: {
    title: "Ingressos esgotando",
    subtitle: "Últimos lotes disponíveis — garanta antes que acabe.",
  },
  gratuitos: {
    title: "Eventos gratuitos",
    subtitle: "Experiências abertas sem gastar nada.",
  },
};

function isValidListSlug(value: string | null): value is EventListSlug {
  return (
    value === "essa-semana" || value === "esgotando" || value === "gratuitos"
  );
}

function getBaseEventsForList(
  data: HomeEvents,
  listSlug: EventListSlug | null,
): EventSummary[] {
  if (listSlug === "essa-semana") return data.thisWeek.events;
  if (listSlug === "esgotando") return data.sellingOut;
  if (listSlug === "gratuitos") return data.free;
  return data.upcoming;
}

export function AllEventsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") ?? "";
  const rawLista = searchParams.get("lista");
  const activeListSlug = isValidListSlug(rawLista) ? rawLista : null;

  const { status, data, retry } = useHomeEvents();
  const [query, setQuery] = useState(initialQuery);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<EventFiltersState>(INITIAL_FILTERS);
  const deferredQuery = useDeferredValue(query.trim());

  const filtering = deferredQuery !== "" || hasActiveModalFilters(filters);
  const baseEvents =
    status === "ok"
      ? getBaseEventsForList(data, activeListSlug)
      : EMPTY_SUMMARIES;

  const filteredState = useFilteredEvents({
    enabled: filtering,
    query: deferredQuery,
    filters,
    fallbackSummaries: data?.upcoming ?? EMPTY_SUMMARIES,
  });

  const clearListSlug = () => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("lista");
    const qs = nextParams.toString();
    router.replace(qs ? `/eventos?${qs}` : "/eventos", { scroll: false });
  };

  const clearAllFilters = () => {
    setQuery("");
    setFilters(INITIAL_FILTERS);
    if (activeListSlug || searchParams.has("q")) {
      router.replace("/eventos", { scroll: false });
    }
  };

  const headerInfo = activeListSlug
    ? LIST_LABELS[activeListSlug]
    : {
        title: "Todos os eventos",
        subtitle:
          "Festas, shows, palestras e campeonatos das agremiações perto de você.",
      };

  const hasFiltersOrQuery = filtering || activeListSlug !== null;

  const isLoading = filtering
    ? filteredState.status === "loading"
    : status === "loading";
  const isError = filtering
    ? filteredState.status === "error"
    : status === "error";
  const handleRetry = filtering ? filteredState.retry : retry;

  const allowedIds = activeListSlug
    ? new Set(baseEvents.map((event) => event.id))
    : null;
  const results = filtering
    ? (filteredState.data ?? []).filter(
        (event) => !allowedIds || allowedIds.has(event.id),
      )
    : baseEvents;

  return (
    <EventPageShell label="Todos os eventos">
      <nav
        aria-label="Trilha de navegação"
        className="border-b border-hubee-200/70 dark:border-hubee-750"
      >
        <ol
          className={cn(
            containerClassName,
            "flex items-center gap-2 py-3 text-xs text-hubee-750 dark:text-hubee-100",
          )}
        >
          <li>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-sm outline-none hover:underline focus-visible:ring-3 focus-visible:ring-hubee-400"
            >
              <ArrowLeft aria-hidden="true" className="size-3.5" />
              Início
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="truncate font-medium">
            {headerInfo.title}
          </li>
        </ol>
      </nav>

      <div
        className={cn(
          containerClassName,
          "flex flex-col items-center gap-8 py-8 md:gap-10 md:py-10",
        )}
      >
        <div className="flex w-full flex-col items-center text-center">
          <h1 className="font-heading text-2xl font-bold tracking-tight text-hubee-800 md:text-3xl dark:text-hubee-50">
            {headerInfo.title}
          </h1>
          <p className="mt-2 max-w-md text-sm text-hubee-750 dark:text-hubee-50">
            {headerInfo.subtitle}
          </p>

          <EventSearchBar
            query={query}
            onQueryChange={setQuery}
            filters={filters}
            onFiltersChange={setFilters}
            isFiltersOpen={isFiltersOpen}
            onFiltersOpenChange={setIsFiltersOpen}
            onClearAll={clearAllFilters}
          />

          {activeListSlug && (
            <div className="mt-2 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={clearListSlug}
                aria-label={`Remover filtro de lista ${LIST_LABELS[activeListSlug].title}`}
                className="inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-full border border-hubee-400 bg-hubee-100 px-3 text-xs font-medium text-hubee-800 outline-none transition-colors hover:bg-hubee-200 focus-visible:ring-3 focus-visible:ring-hubee-400 dark:border-hubee-500 dark:bg-hubee-750 dark:text-hubee-50 dark:hover:bg-hubee-700"
              >
                <Sparkles aria-hidden="true" className="size-3.5" />
                <span>{LIST_LABELS[activeListSlug].title}</span>
                <X aria-hidden="true" className="size-3.5 opacity-80" />
              </button>
            </div>
          )}
        </div>

        {isLoading && (
          <div role="status" aria-live="polite" className="w-full">
            <span className="sr-only">Carregando eventos…</span>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
              {Array.from({ length: 10 }, (_, idx) => (
                <EventCardSkeleton key={idx} />
              ))}
            </div>
          </div>
        )}

        {isError && (
          <ListMessage
            role="alert"
            title="Não foi possível carregar os eventos"
            description="Verifique sua conexão e tente de novo."
            actionLabel="Tentar novamente"
            onAction={handleRetry}
            variant="outline"
          />
        )}

        {!isLoading &&
          !isError &&
          (results.length === 0 ? (
            <ListMessage
              title="Nenhum evento encontrado"
              description={
                hasFiltersOrQuery
                  ? "Tente outra palavra-chave ou limpe os filtros selecionados."
                  : "Ainda não há eventos publicados no momento."
              }
              actionLabel={
                hasFiltersOrQuery ? "Limpar filtros" : "Voltar ao início"
              }
              onAction={
                hasFiltersOrQuery ? clearAllFilters : () => router.push("/")
              }
              variant="primary"
            />
          ) : (
            <section aria-label="Lista de eventos" className="w-full">
              <p
                role="status"
                className="text-xs text-hubee-750 md:text-sm dark:text-hubee-100"
              >
                {results.length}{" "}
                {results.length === 1
                  ? "evento encontrado"
                  : "eventos encontrados"}
                {deferredQuery && <> para “{deferredQuery}”</>}
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
                    <EventCard
                      event={event}
                      showSalesProgress={activeListSlug === "esgotando"}
                    />
                  </li>
                ))}
              </ul>
            </section>
          ))}
      </div>
    </EventPageShell>
  );
}
