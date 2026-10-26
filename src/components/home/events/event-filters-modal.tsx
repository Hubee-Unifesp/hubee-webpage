"use client";

import { useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, MapPin, Search, X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Dialog, DialogOverlay, DialogPortal, DialogTitle } from "@/components/ui/dialog";
import type { EventCategory } from "@/lib/api/events";
import { cn } from "@/lib/utils";
import { categoryConfig } from "./categories.config";

export type FilterTab = "todos" | "categoria" | "cidade" | "data";

export interface EventDateRange {
  start: Date | null;
  end: Date | null;
}

export interface EventFiltersState {
  categories: EventCategory[];
  city: string | null;
  dateRange: EventDateRange;
}

interface CityOption {
  name: string;
  state: string;
}

export const AVAILABLE_CITIES: readonly CityOption[] = [
  { name: "São Paulo", state: "SP" },
  { name: "São José dos Campos", state: "SP" },
  { name: "São Francisco Xavier", state: "SP" },
  { name: "Santos", state: "SP" },
  { name: "Campinas", state: "SP" },
  { name: "Guarulhos", state: "SP" },
];

const CATEGORY_LIST: readonly EventCategory[] = [
  "festas",
  "shows",
  "palestras",
  "esportes",
  "academicos",
  "outros",
];

const MONTHS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
] as const;

const YEARS = [2025, 2026, 2027] as const;

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();

interface EventFiltersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: EventFiltersState;
  onFiltersChange: (filters: EventFiltersState) => void;
}

export function EventFiltersModal({
  open,
  onOpenChange,
  filters,
  onFiltersChange,
}: EventFiltersModalProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>("todos");
  const [cityQuery, setCityQuery] = useState(filters.city ?? "");
  const [viewMonth, setViewMonth] = useState(
    () => filters.dateRange.start?.getMonth() ?? new Date().getMonth(),
  );
  const [viewYear, setViewYear] = useState(
    () => filters.dateRange.start?.getFullYear() ?? new Date().getFullYear(),
  );

  const hasActiveFilters =
    filters.categories.length > 0 ||
    filters.city !== null ||
    filters.dateRange.start !== null;

  const handleClearAllFilters = () => {
    setCityQuery("");
    onFiltersChange({
      categories: [],
      city: null,
      dateRange: { start: null, end: null },
    });
  };

  const toggleCategory = (category: EventCategory) => {
    const exists = filters.categories.includes(category);
    const nextCategories = exists
      ? filters.categories.filter((item) => item !== category)
      : [...filters.categories, category];
    onFiltersChange({ ...filters, categories: nextCategories });
  };

  const handleCitySelect = (cityName: string) => {
    const nextCity = filters.city === cityName ? null : cityName;
    setCityQuery(nextCity ?? "");
    onFiltersChange({ ...filters, city: nextCity });
  };

  const handleClearCity = () => {
    setCityQuery("");
    onFiltersChange({ ...filters, city: null });
  };

  const handleDayClick = (dayDate: Date) => {
    const { start, end } = filters.dateRange;
    if (!start || (start && end)) {
      onFiltersChange({
        ...filters,
        dateRange: { start: dayDate, end: null },
      });
      return;
    }

    if (dayDate.getTime() === start.getTime()) {
      onFiltersChange({
        ...filters,
        dateRange: { start: null, end: null },
      });
      return;
    }

    if (dayDate < start) {
      onFiltersChange({
        ...filters,
        dateRange: { start: dayDate, end: start },
      });
    } else {
      onFiltersChange({
        ...filters,
        dateRange: { start, end: dayDate },
      });
    }
  };

  const goToPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((prev) => Math.max(YEARS[0], prev - 1));
    } else {
      setViewMonth((prev) => prev - 1);
    }
  };

  const goToNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((prev) => Math.min(YEARS[YEARS.length - 1], prev + 1));
    } else {
      setViewMonth((prev) => prev + 1);
    }
  };

  const normalizedCitySearch = normalizeText(cityQuery);
  const matchingCities = AVAILABLE_CITIES.filter((city) =>
    normalizeText(city.name).includes(normalizedCitySearch),
  );

  const showCategory = activeTab === "todos" || activeTab === "categoria";
  const showCity = activeTab === "todos" || activeTab === "cidade";
  const showDate = activeTab === "todos" || activeTab === "data";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[375px] -translate-x-1/2 -translate-y-1/2 flex-col overflow-y-auto rounded-3xl border border-hubee-200 bg-hubee-50 p-6 text-hubee-800 shadow-xl outline-none duration-150 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 md:max-w-2xl md:p-8 dark:border-hubee-750 dark:bg-hubee-800 dark:text-hubee-50"
        >
          {/* Cabeçalho */}
          <div className="relative flex items-center justify-between border-b border-hubee-800/40 pb-4 md:justify-center dark:border-hubee-50/40">
            <DialogTitle className="font-sans text-2xl font-normal tracking-tight text-hubee-800 md:text-xl dark:text-hubee-50">
              Filtros
            </DialogTitle>
            <DialogPrimitive.Close
              type="button"
              aria-label="Fechar filtros"
              className="inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-hubee-neutral-200 transition-colors outline-none hover:text-hubee-800 focus-visible:ring-2 focus-visible:ring-hubee-400 md:absolute md:right-0 dark:text-hubee-750 dark:hover:text-hubee-50"
            >
              <X aria-hidden="true" className="size-5" />
            </DialogPrimitive.Close>
          </div>

          <div className="border-b border-hubee-800/40 py-5 dark:border-hubee-50/40">
            <h3 className="font-sans text-lg font-normal text-hubee-800 dark:text-hubee-50">
              Tipos de filtros
            </h3>
            <div
              role="tablist"
              aria-label="Tipos de filtros"
              className="mt-3 flex flex-wrap gap-2 md:grid md:grid-cols-4 md:gap-1.5"
            >
              {(
                [
                  { id: "todos", label: "Todos" },
                  { id: "categoria", label: "Categoria" },
                  { id: "cidade", label: "Cidade" },
                  { id: "data", label: "Data" },
                ] as const
              ).map(({ id, label }, index) => {
                const active = activeTab === id;
                const desktopRadius =
                  index === 0
                    ? "md:rounded-l-full md:rounded-r-sm"
                    : index === 3
                      ? "md:rounded-r-full md:rounded-l-sm"
                      : "md:rounded-sm";

                return (
                  <button
                    key={id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveTab(id)}
                    className={cn(
                      "inline-flex h-8 min-w-[96px] cursor-pointer items-center justify-center rounded-full px-4 text-xs transition-colors outline-none focus-visible:ring-2 focus-visible:ring-hubee-400",
                      desktopRadius,
                      active
                        ? "border-2 border-hubee-750 bg-hubee-200 font-bold text-hubee-800 dark:border-hubee-400 dark:bg-hubee-400 dark:text-hubee-800"
                        : "border border-hubee-750/70 bg-transparent font-normal text-hubee-800 hover:bg-hubee-100 dark:border-hubee-600 dark:text-hubee-50 dark:hover:bg-hubee-750",
                    )}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Categoria */}
          {showCategory && (
            <div className="border-b border-hubee-800/40 py-5 dark:border-hubee-50/40">
              <h3 className="font-sans text-lg font-normal text-hubee-800 dark:text-hubee-50">
                Categoria
              </h3>
              <div
                role="group"
                aria-label="Selecionar categorias"
                className="mt-3 flex flex-wrap gap-2.5"
              >
                {CATEGORY_LIST.map((categoryKey) => {
                  const { label } = categoryConfig[categoryKey];
                  const selected = filters.categories.includes(categoryKey);
                  return (
                    <button
                      key={categoryKey}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleCategory(categoryKey)}
                      className={cn(
                        "inline-flex h-8 min-w-[104px] cursor-pointer items-center justify-center gap-2 rounded-full border px-4 text-xs transition-colors outline-none focus-visible:ring-2 focus-visible:ring-hubee-400",
                        selected
                          ? "border-hubee-750 bg-hubee-200 font-medium text-hubee-800 dark:border-hubee-400 dark:bg-hubee-400 dark:text-hubee-800"
                          : "border-hubee-750/70 bg-transparent text-hubee-800 hover:bg-hubee-100 dark:border-hubee-700 dark:bg-hubee-750/60 dark:text-hubee-50 dark:hover:bg-hubee-700",
                      )}
                    >
                      <span>{label}</span>
                      {selected && <X aria-hidden="true" className="size-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Cidade */}
          {showCity && (
            <div className="border-b border-hubee-800/40 py-5 dark:border-hubee-50/40">
              <h3 className="font-sans text-lg font-normal text-hubee-800 dark:text-hubee-50">
                Cidade
              </h3>
              <div className="mt-3 w-full">
                <div className="relative">
                  <input
                    type="text"
                    value={cityQuery}
                    onChange={(event) => setCityQuery(event.target.value)}
                    placeholder="Busque por cidade"
                    aria-label="Busque por cidade"
                    className="h-10 w-full rounded-lg border border-hubee-750/70 bg-white pr-9 pl-3 text-xs text-hubee-800 placeholder:text-hubee-neutral-200 outline-none focus-visible:ring-2 focus-visible:ring-hubee-400 dark:border-hubee-700 dark:bg-hubee-750 dark:text-hubee-50 dark:placeholder:text-hubee-neutral-200"
                  />
                  <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-hubee-900 dark:text-hubee-50"
                  />
                </div>

                {/* Lista de sugestões de cidade conforme o Figma */}
                <div className="mt-3 overflow-hidden rounded-t-2xl border border-hubee-750/70 bg-hubee-200 text-hubee-800 dark:border-hubee-600 dark:bg-hubee-400 dark:text-hubee-800">
                  <div className="flex h-10 items-center justify-between px-3">
                    <button
                      type="button"
                      onClick={handleClearCity}
                      aria-label="Voltar busca de cidade"
                      className="inline-flex size-6 cursor-pointer items-center justify-center rounded-full hover:bg-hubee-300/60 focus-visible:ring-2 focus-visible:ring-hubee-800 outline-none"
                    >
                      <ArrowLeft aria-hidden="true" className="size-4" />
                    </button>
                    <span className="flex-1 truncate px-2 text-xs font-medium">
                      {cityQuery || filters.city || "São"}
                    </span>
                    <button
                      type="button"
                      onClick={handleClearCity}
                      aria-label="Limpar cidade"
                      className="inline-flex size-6 cursor-pointer items-center justify-center rounded-full hover:bg-hubee-300/60 focus-visible:ring-2 focus-visible:ring-hubee-800 outline-none"
                    >
                      <X aria-hidden="true" className="size-4" />
                    </button>
                  </div>

                  <ul role="listbox" aria-label="Cidades disponíveis">
                    {matchingCities.map((city) => {
                      const isSelected = filters.city === city.name;
                      return (
                        <li
                          key={city.name}
                          role="option"
                          aria-selected={isSelected}
                          className="border-t border-hubee-750/60"
                        >
                          <button
                            type="button"
                            onClick={() => handleCitySelect(city.name)}
                            className={cn(
                              "flex w-full cursor-pointer items-center gap-2.5 px-3 py-2 text-left transition-colors outline-none hover:bg-hubee-300/70 focus-visible:bg-hubee-300/70",
                              isSelected && "bg-hubee-300 font-semibold dark:bg-hubee-500",
                            )}
                          >
                            <MapPin aria-hidden="true" className="size-4 shrink-0" />
                            <div className="flex flex-col leading-tight">
                              <span className="text-[11px] font-medium">{city.name}</span>
                              <span className="text-[10px] opacity-80">{city.state}</span>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {showDate && (
            <div className="pt-5">
              <h3 className="font-sans text-lg font-normal text-hubee-800 dark:text-hubee-50">
                Data
              </h3>
              <CalendarPicker
                month={viewMonth}
                year={viewYear}
                dateRange={filters.dateRange}
                onMonthChange={setViewMonth}
                onYearChange={setViewYear}
                onPrevMonth={goToPrevMonth}
                onNextMonth={goToNextMonth}
                onDayClick={handleDayClick}
              />
            </div>
          )}

          {hasActiveFilters && (
            <div className="mt-5 flex justify-end border-t border-hubee-800/40 pt-4 dark:border-hubee-50/40">
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="inline-flex h-9 cursor-pointer items-center justify-center rounded-full border border-hubee-750 px-4 text-xs font-medium text-hubee-800 transition-colors outline-none hover:bg-hubee-200 focus-visible:ring-2 focus-visible:ring-hubee-400 dark:border-hubee-400 dark:text-hubee-50 dark:hover:bg-hubee-750"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

interface CalendarPickerProps {
  month: number;
  year: number;
  dateRange: EventDateRange;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onDayClick: (date: Date) => void;
}

function CalendarPicker({
  month,
  year,
  dateRange,
  onMonthChange,
  onYearChange,
  onPrevMonth,
  onNextMonth,
  onDayClick,
}: CalendarPickerProps) {
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const cells: { day: number; currentMonth: boolean; date: Date }[] = [];

  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = daysInPrevMonth - i;
    cells.push({
      day,
      currentMonth: false,
      date: new Date(year, month - 1, day),
    });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({
      day,
      currentMonth: true,
      date: new Date(year, month, day),
    });
  }

  const remaining = (7 - (cells.length % 7)) % 7;
  for (let day = 1; day <= remaining; day++) {
    cells.push({
      day,
      currentMonth: false,
      date: new Date(year, month + 1, day),
    });
  }

  const isSameDay = (a: Date | null, b: Date) =>
    a !== null &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  const isInRange = (target: Date) => {
    const { start, end } = dateRange;
    if (!start || !end) return false;
    const time = target.getTime();
    return time > start.getTime() && time < end.getTime();
  };

  return (
    <div className="mx-auto mt-3 w-full rounded-2xl bg-hubee-200 p-4 text-hubee-800 dark:bg-hubee-400 dark:text-hubee-800">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={onPrevMonth}
          aria-label="Mês anterior"
          className="inline-flex size-7 cursor-pointer items-center justify-center rounded-md hover:bg-hubee-300/60 focus-visible:ring-2 focus-visible:ring-hubee-800 outline-none"
        >
          <ChevronLeft aria-hidden="true" className="size-4" />
        </button>

        <div className="flex items-center gap-1.5">
          <select
            aria-label="Selecionar mês"
            value={month}
            onChange={(event) => onMonthChange(Number(event.target.value))}
            className="h-7 cursor-pointer rounded-md border border-hubee-300 bg-hubee-50 px-2 text-xs font-medium text-hubee-800 outline-none focus-visible:ring-2 focus-visible:ring-hubee-800"
          >
            {MONTHS.map((label, idx) => (
              <option key={label} value={idx}>
                {label}
              </option>
            ))}
          </select>

          <select
            aria-label="Selecionar ano"
            value={year}
            onChange={(event) => onYearChange(Number(event.target.value))}
            className="h-7 cursor-pointer rounded-md border border-hubee-300 bg-hubee-50 px-2 text-xs font-medium text-hubee-800 outline-none focus-visible:ring-2 focus-visible:ring-hubee-800"
          >
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={onNextMonth}
          aria-label="Próximo mês"
          className="inline-flex size-7 cursor-pointer items-center justify-center rounded-md hover:bg-hubee-300/60 focus-visible:ring-2 focus-visible:ring-hubee-800 outline-none"
        >
          <ChevronRight aria-hidden="true" className="size-4" />
        </button>
      </div>

      <div className="mt-3 grid grid-cols-7 text-center text-[11px] text-hubee-neutral-300 dark:text-hubee-750">
        {WEEKDAYS.map((weekday) => (
          <span key={weekday} className="py-1">
            {weekday}
          </span>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-y-1 text-center text-xs">
        {cells.map(({ day, currentMonth, date }) => {
          const isEndpoint = isSameDay(dateRange.start, date) || isSameDay(dateRange.end, date);
          const inBetween = isInRange(date);

          return (
            <button
              key={date.toISOString()}
              type="button"
              onClick={() => onDayClick(date)}
              aria-pressed={isEndpoint || inBetween}
              className={cn(
                "mx-auto inline-flex size-8 cursor-pointer items-center justify-center rounded-lg text-xs transition-colors outline-none focus-visible:ring-2 focus-visible:ring-hubee-800",
                !currentMonth && !isEndpoint && !inBetween && "text-hubee-neutral-200 dark:text-hubee-700/60",
                currentMonth && !isEndpoint && !inBetween && "text-hubee-800 hover:bg-hubee-300/60",
                inBetween && "bg-white font-medium text-hubee-900",
                isEndpoint && "bg-hubee-900 font-semibold text-hubee-50",
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
