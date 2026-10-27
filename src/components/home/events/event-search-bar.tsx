"use client";

import { ListFilter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { EventCategory, EventSummary } from "@/lib/api/events";
import { cn } from "@/lib/utils";
import { ActiveFilterChips } from "./active-filter-chips";
import {
  EventFiltersModal,
  type EventFiltersState,
} from "./event-filters-modal";

export const INITIAL_FILTERS: EventFiltersState = {
  categories: [],
  city: null,
  dateRange: { start: null, end: null },
};

export function hasActiveModalFilters(filters: EventFiltersState): boolean {
  return (
    filters.categories.length > 0 ||
    filters.city !== null ||
    filters.dateRange.start !== null
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

export function filterEvents(
  events: EventSummary[],
  query: string,
  filters: EventFiltersState,
): EventSummary[] {
  const term = normalize(query);
  const cityTerm = filters.city ? normalize(filters.city) : null;

  return events.filter((event) => {
    const matchesCategory =
      filters.categories.length === 0 ||
      filters.categories.includes(event.category);
    const matchesQuery =
      term === "" ||
      normalize(event.title).includes(term) ||
      normalize(event.organizerName).includes(term) ||
      normalize(event.venueName).includes(term);
    const matchesCity =
      cityTerm === null || normalize(event.venueName).includes(cityTerm);
    const matchesDate = matchesDateRange(
      event.startDate,
      filters.dateRange.start,
      filters.dateRange.end,
    );

    return matchesCategory && matchesQuery && matchesCity && matchesDate;
  });
}

interface EventSearchBarProps {
  query: string;
  onQueryChange: (query: string) => void;
  filters: EventFiltersState;
  onFiltersChange: (filters: EventFiltersState) => void;
  isFiltersOpen: boolean;
  onFiltersOpenChange: (open: boolean) => void;
  onClearAll: () => void;
}

export function EventSearchBar({
  query,
  onQueryChange,
  filters,
  onFiltersChange,
  isFiltersOpen,
  onFiltersOpenChange,
  onClearAll,
}: EventSearchBarProps) {
  const activeModalFilters = hasActiveModalFilters(filters);

  const handleRemoveCategory = (category: EventCategory) => {
    onFiltersChange({
      ...filters,
      categories: filters.categories.filter((item) => item !== category),
    });
  };

  const handleRemoveCity = () => {
    onFiltersChange({
      ...filters,
      city: null,
    });
  };

  const handleRemoveDateRange = () => {
    onFiltersChange({
      ...filters,
      dateRange: { start: null, end: null },
    });
  };

  return (
    <>
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
            onChange={(event) => onQueryChange(event.target.value)}
            aria-label="Buscar por evento ou agremiação"
            placeholder="Buscar por evento ou agremiação"
            className="h-10 border-hubee-400 bg-hubee-50 pl-9 text-hubee-800 placeholder:text-hubee-neutral-300 focus-visible:border-hubee-500 focus-visible:ring-hubee-400/50 dark:border-hubee-500 dark:bg-hubee-750 dark:text-hubee-50 dark:placeholder:text-hubee-neutral-200"
          />
        </div>
        <button
          type="button"
          aria-haspopup="dialog"
          aria-expanded={isFiltersOpen}
          onClick={() => onFiltersOpenChange(!isFiltersOpen)}
          className={cn(
            "inline-flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-4 text-xs font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-hubee-400",
            isFiltersOpen || activeModalFilters
              ? "border-hubee-750 bg-hubee-750 text-hubee-50 dark:border-hubee-400 dark:bg-hubee-400 dark:text-hubee-800"
              : "border-hubee-400 bg-hubee-50 text-hubee-800 hover:border-hubee-750 hover:bg-hubee-750 hover:text-hubee-50 dark:border-hubee-500 dark:bg-hubee-750 dark:text-hubee-50 dark:hover:bg-hubee-400 dark:hover:text-hubee-800",
          )}
        >
          <ListFilter aria-hidden="true" strokeWidth={2} className="size-4" />
          Filtros
        </button>
        {activeModalFilters && (
          <button
            type="button"
            onClick={onClearAll}
            className="inline-flex h-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-hubee-400 bg-transparent px-3 text-xs font-medium text-hubee-750 transition-colors outline-none hover:bg-hubee-200 focus-visible:ring-3 focus-visible:ring-hubee-400 dark:border-hubee-500 dark:text-hubee-50 dark:hover:bg-hubee-750"
          >
            Limpar filtros
          </button>
        )}
      </form>

      <ActiveFilterChips
        filters={filters}
        onRemoveCategory={handleRemoveCategory}
        onRemoveCity={handleRemoveCity}
        onRemoveDateRange={handleRemoveDateRange}
      />

      <EventFiltersModal
        open={isFiltersOpen}
        onOpenChange={onFiltersOpenChange}
        filters={filters}
        onFiltersChange={onFiltersChange}
      />
    </>
  );
}
