"use client";

import { useState } from "react";
import { CalendarDays, Check, MapPin, Search, X } from "lucide-react";
import { ptBR } from "react-day-picker/locale";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogOverlay, DialogPortal, DialogTitle } from "@/components/ui/dialog";
import type { EventCategory } from "@/lib/api/events";
import { displayFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { categoryConfig } from "./categories.config";
import { HexPattern } from "./event-media";

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

type DatePresetId = "hoje" | "fim-de-semana" | "7-dias" | "mes";

const DATE_PRESETS: readonly { id: DatePresetId; label: string }[] = [
  { id: "hoje", label: "Hoje" },
  { id: "fim-de-semana", label: "Fim de semana" },
  { id: "7-dias", label: "Próximos 7 dias" },
  { id: "mes", label: "Este mês" },
];

const normalizeText = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

function presetRange(id: DatePresetId, now = new Date()): EventDateRange {
  const today = startOfDay(now);
  switch (id) {
    case "hoje":
      return { start: today, end: today };
    case "fim-de-semana": {
      const weekday = today.getDay();
      const saturday = weekday === 0 ? addDays(today, -1) : addDays(today, 6 - weekday);
      const start = saturday < today ? today : saturday;
      return { start, end: addDays(saturday, 1) };
    }
    case "7-dias":
      return { start: today, end: addDays(today, 6) };
    case "mes":
      return { start: today, end: new Date(today.getFullYear(), today.getMonth() + 1, 0) };
  }
}

function sameDay(a: Date | null, b: Date | null): boolean {
  return a !== null && b !== null && a.getTime() === b.getTime();
}

const sectionTitleClassName = "text-base font-semibold text-hubee-800 dark:text-hubee-50";

interface EventFiltersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: EventFiltersState;
  onFiltersChange: (filters: EventFiltersState) => void;
}

export function EventFiltersModal({ open, onOpenChange, filters, onFiltersChange }: EventFiltersModalProps) {
  const [cityQuery, setCityQuery] = useState("");
  const [showCalendar, setShowCalendar] = useState(false);

  const activeCount =
    filters.categories.length + (filters.city ? 1 : 0) + (filters.dateRange.start ? 1 : 0);

  const activePreset = DATE_PRESETS.find(({ id }) => {
    const range = presetRange(id);
    return sameDay(range.start, filters.dateRange.start) && sameDay(range.end, filters.dateRange.end);
  })?.id;
  const hasCustomDate = filters.dateRange.start !== null && !activePreset;

  const handleClearAll = () => {
    setCityQuery("");
    setShowCalendar(false);
    onFiltersChange({ categories: [], city: null, dateRange: { start: null, end: null } });
  };

  const toggleCategory = (category: EventCategory) => {
    const categories = filters.categories.includes(category)
      ? filters.categories.filter((item) => item !== category)
      : [...filters.categories, category];
    onFiltersChange({ ...filters, categories });
  };

  const toggleCity = (cityName: string) => {
    onFiltersChange({ ...filters, city: filters.city === cityName ? null : cityName });
  };

  const togglePreset = (id: DatePresetId) => {
    setShowCalendar(false);
    onFiltersChange({
      ...filters,
      dateRange: activePreset === id ? { start: null, end: null } : presetRange(id),
    });
  };

  const handleDayClick = (day: Date) => {
    const { start, end } = filters.dateRange;
    if (!start || end) {
      onFiltersChange({ ...filters, dateRange: { start: day, end: null } });
      return;
    }
    if (day.getTime() === start.getTime()) {
      onFiltersChange({ ...filters, dateRange: { start: null, end: null } });
      return;
    }
    onFiltersChange({
      ...filters,
      dateRange: day < start ? { start: day, end: start } : { start, end: day },
    });
  };

  const normalizedCitySearch = normalizeText(cityQuery);
  const matchingCities = AVAILABLE_CITIES.filter((city) =>
    normalizeText(city.name).includes(normalizedCitySearch),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col rounded-t-[28px] bg-hubee-50 text-hubee-800 outline-none data-open:animate-in data-open:slide-in-from-bottom data-closed:animate-out data-closed:slide-out-to-bottom md:inset-y-3 md:right-3 md:left-auto md:max-h-none md:w-[440px] md:rounded-[28px] md:data-open:slide-in-from-right md:data-open:slide-in-from-bottom-0 md:data-closed:slide-out-to-right md:data-closed:slide-out-to-bottom-0 motion-reduce:animate-none dark:bg-hubee-850 dark:text-hubee-50"
        >
          <div className="flex items-center justify-between gap-4 px-6 pt-6 pb-4">
            <div className="flex items-center gap-3">
              <DialogTitle className={cn(displayFont.className, "text-3xl leading-none uppercase")}>Filtros</DialogTitle>
              {activeCount > 0 && (
                <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-hubee-400 px-2 text-xs font-bold text-hubee-900">
                  {activeCount}
                </span>
              )}
            </div>
            <DialogPrimitive.Close
              type="button"
              aria-label="Fechar filtros"
              className="inline-flex size-10 cursor-pointer items-center justify-center rounded-full bg-hubee-100 text-hubee-800 transition-colors outline-none hover:bg-hubee-200 focus-visible:ring-3 focus-visible:ring-hubee-400 dark:bg-hubee-50/10 dark:text-hubee-50 dark:hover:bg-hubee-50/15"
            >
              <X aria-hidden="true" className="size-5" />
            </DialogPrimitive.Close>
          </div>

          <div className="flex-1 space-y-8 overflow-y-auto px-6 pt-2 pb-6">
            <section aria-labelledby="filtro-categoria">
              <h3 id="filtro-categoria" className={sectionTitleClassName}>
                Categoria
              </h3>
              <div role="group" aria-labelledby="filtro-categoria" className="mt-3 grid grid-cols-3 gap-2">
                {CATEGORY_LIST.map((category) => {
                  const { icon: Icon, label, mediaClassName, patternClassName } = categoryConfig[category];
                  const selected = filters.categories.includes(category);
                  return (
                    <button
                      key={category}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => toggleCategory(category)}
                      className={cn(
                        "relative isolate flex h-24 cursor-pointer flex-col justify-between overflow-hidden rounded-2xl p-3.5 text-left transition-[transform,box-shadow] duration-200 outline-none focus-visible:ring-3 focus-visible:ring-hubee-400 active:scale-95 motion-reduce:transition-none",
                        mediaClassName,
                        selected
                          ? "ring-3 ring-hubee-800 ring-offset-2 ring-offset-hubee-50 dark:ring-hubee-400 dark:ring-offset-hubee-850"
                          : "hover:-translate-y-0.5 dark:ring-1 dark:ring-hubee-50/10",
                      )}
                    >
                      <HexPattern className={cn("-z-10", patternClassName)} />
                      <Icon aria-hidden="true" strokeWidth={1.75} className="size-6" />
                      <span className="text-base font-semibold">{label}</span>
                      {selected && (
                        <span className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-hubee-900 text-hubee-50">
                          <Check aria-hidden="true" className="size-3" strokeWidth={3} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            <section aria-labelledby="filtro-data">
              <h3 id="filtro-data" className={sectionTitleClassName}>
                Quando
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {DATE_PRESETS.map(({ id, label }) => (
                  <Pill key={id} selected={activePreset === id} onClick={() => togglePreset(id)}>
                    {label}
                  </Pill>
                ))}
                <Pill
                  selected={hasCustomDate || showCalendar}
                  onClick={() => setShowCalendar((value) => !value)}
                  aria-expanded={showCalendar}
                >
                  <CalendarDays aria-hidden="true" className="size-4" />
                  Escolher datas
                </Pill>
              </div>
              {showCalendar && (
                <Calendar
                  mode="range"
                  locale={ptBR}
                  captionLayout="label"
                  startMonth={new Date(2025, 0)}
                  endMonth={new Date(2027, 11)}
                  defaultMonth={filters.dateRange.start ?? undefined}
                  selected={{ from: filters.dateRange.start ?? undefined, to: filters.dateRange.end ?? undefined }}
                  onSelect={(_, day) => handleDayClick(day)}
                  className="mt-3 w-full rounded-2xl bg-white p-3 text-hubee-800 [--cell-size:--spacing(9)] [--primary:var(--color-hubee-800)] [--primary-foreground:var(--color-hubee-50)] [--muted:var(--color-hubee-100)] [--muted-foreground:var(--color-hubee-neutral-300)] dark:bg-hubee-50/5 dark:text-hubee-50 dark:[--primary:var(--color-hubee-400)] dark:[--primary-foreground:var(--color-hubee-900)] dark:[--muted:rgb(255_251_237/0.1)] dark:[--muted-foreground:var(--color-hubee-200)]"
                  classNames={{ root: "w-full", today: "rounded-(--cell-radius) font-semibold underline underline-offset-4" }}
                />
              )}
            </section>

            <section aria-labelledby="filtro-cidade">
              <h3 id="filtro-cidade" className={sectionTitleClassName}>
                Cidade
              </h3>
              <div className="relative mt-3">
                <Search
                  aria-hidden="true"
                  className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-hubee-750 dark:text-hubee-400"
                />
                <input
                  type="search"
                  value={cityQuery}
                  onChange={(event) => setCityQuery(event.target.value)}
                  placeholder="Buscar cidade"
                  aria-label="Buscar cidade"
                  className="h-11 w-full rounded-full bg-white pr-4 pl-10 text-sm text-hubee-800 outline-none placeholder:text-hubee-neutral-300 focus-visible:ring-3 focus-visible:ring-hubee-400 dark:bg-hubee-50/5 dark:text-hubee-50 dark:placeholder:text-hubee-200/60"
                />
              </div>
              <div role="group" aria-labelledby="filtro-cidade" className="mt-3 flex flex-wrap gap-2">
                {matchingCities.map((city) => (
                  <Pill key={city.name} selected={filters.city === city.name} onClick={() => toggleCity(city.name)}>
                    <MapPin aria-hidden="true" className="size-4" />
                    {city.name}
                  </Pill>
                ))}
                {matchingCities.length === 0 && (
                  <p className="text-sm text-hubee-neutral-300 dark:text-hubee-200/70">
                    Nenhuma cidade encontrada.
                  </p>
                )}
              </div>
            </section>
          </div>

          <div className="flex items-center gap-3 bg-hubee-100 px-6 py-4 md:rounded-b-[28px] dark:bg-hubee-50/5">
            <button
              type="button"
              onClick={handleClearAll}
              disabled={activeCount === 0}
              className="h-12 cursor-pointer rounded-full px-5 text-sm font-semibold text-hubee-800 underline-offset-4 outline-none hover:underline focus-visible:ring-3 focus-visible:ring-hubee-400 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:no-underline dark:text-hubee-50"
            >
              Limpar tudo
            </button>
            <DialogPrimitive.Close
              type="button"
              className="ml-auto inline-flex h-12 flex-1 cursor-pointer items-center justify-center rounded-full bg-hubee-800 px-6 text-sm font-semibold text-hubee-50 transition-colors outline-none hover:bg-hubee-750 focus-visible:ring-3 focus-visible:ring-hubee-400 dark:bg-hubee-400 dark:text-hubee-900 dark:hover:bg-hubee-300"
            >
              Ver eventos
            </DialogPrimitive.Close>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

function Pill({
  selected,
  className,
  children,
  ...props
}: React.ComponentProps<"button"> & { selected: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      className={cn(
        "inline-flex h-10 cursor-pointer items-center gap-1.5 rounded-full px-4 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-hubee-400 active:scale-[0.97]",
        selected
          ? "bg-hubee-800 text-hubee-50 dark:bg-hubee-400 dark:text-hubee-900"
          : "bg-white text-hubee-800 hover:bg-hubee-200 dark:bg-hubee-50/5 dark:text-hubee-50 dark:hover:bg-hubee-50/10",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
