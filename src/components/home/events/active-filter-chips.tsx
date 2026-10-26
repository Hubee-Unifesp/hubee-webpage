"use client";

import { Calendar, MapPin, X } from "lucide-react";
import type { EventCategory } from "@/lib/api/events";
import { categoryConfig } from "./categories.config";
import type { EventFiltersState } from "./event-filters-modal";

const shortDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
});

export function formatFilterDateRange(start: Date, end: Date | null): string {
  const formatDay = (date: Date) =>
    shortDateFormatter.format(date).replace(".", "");
  if (!end || start.toDateString() === end.toDateString()) {
    return formatDay(start);
  }
  return `${formatDay(start)} – ${formatDay(end)}`;
}

interface ActiveFilterChipsProps {
  filters: EventFiltersState;
  onRemoveCategory: (category: EventCategory) => void;
  onRemoveCity: () => void;
  onRemoveDateRange: () => void;
}

const chipClassName =
  "inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-full border border-hubee-750 bg-hubee-750 px-3 text-xs font-medium text-hubee-50 outline-none transition-colors hover:border-hubee-600 hover:bg-hubee-600 focus-visible:ring-3 focus-visible:ring-hubee-400 dark:border-hubee-400 dark:bg-hubee-400 dark:text-hubee-800 dark:hover:border-hubee-300 dark:hover:bg-hubee-300";

export function ActiveFilterChips({
  filters,
  onRemoveCategory,
  onRemoveCity,
  onRemoveDateRange,
}: ActiveFilterChipsProps) {
  const hasAny =
    filters.categories.length > 0 ||
    filters.city !== null ||
    filters.dateRange.start !== null;

  if (!hasAny) return null;

  const dateLabel = filters.dateRange.start
    ? formatFilterDateRange(filters.dateRange.start, filters.dateRange.end)
    : null;

  return (
    <div
      role="group"
      aria-label="Filtros ativos"
      className="mt-3 flex flex-wrap justify-center gap-2"
    >
      {filters.categories.map((category) => {
        const { label, icon: Icon } = categoryConfig[category];
        return (
          <button
            key={category}
            type="button"
            onClick={() => onRemoveCategory(category)}
            aria-label={`Remover filtro de categoria ${label}`}
            className={chipClassName}
          >
            <Icon aria-hidden="true" strokeWidth={1.75} className="size-3.5" />
            <span>{label}</span>
            <X aria-hidden="true" className="size-3.5 opacity-80" />
          </button>
        );
      })}

      {filters.city && (
        <button
          type="button"
          onClick={onRemoveCity}
          aria-label={`Remover filtro de cidade ${filters.city}`}
          className={chipClassName}
        >
          <MapPin aria-hidden="true" strokeWidth={1.75} className="size-3.5" />
          <span>{filters.city}</span>
          <X aria-hidden="true" className="size-3.5 opacity-80" />
        </button>
      )}

      {dateLabel && (
        <button
          type="button"
          onClick={onRemoveDateRange}
          aria-label={`Remover filtro de data ${dateLabel}`}
          className={chipClassName}
        >
          <Calendar
            aria-hidden="true"
            strokeWidth={1.75}
            className="size-3.5"
          />
          <span>{dateLabel}</span>
          <X aria-hidden="true" className="size-3.5 opacity-80" />
        </button>
      )}
    </div>
  );
}
