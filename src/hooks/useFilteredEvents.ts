import { useCallback, useEffect, useState } from "react";
import type { EventFiltersState } from "@/components/home/events/event-filters-modal";
import { searchEvents, type EventSummary } from "@/lib/api/events";

type ResolvedFilterState =
  | { requestKey: string; status: "ok"; data: EventSummary[] }
  | { requestKey: string; status: "error"; data: null };

interface UseFilteredEventsOptions {
  enabled: boolean;
  query: string;
  filters: EventFiltersState;
  fallbackSummaries?: readonly EventSummary[];
}

const EMPTY_RESULTS: EventSummary[] = [];

export function useFilteredEvents({
  enabled,
  query,
  filters,
  fallbackSummaries = [],
}: UseFilteredEventsOptions) {
  const [resolved, setResolved] = useState<ResolvedFilterState | null>(null);
  const [attempt, setAttempt] = useState(0);

  const categoriesKey = filters.categories.join(",");
  const cityKey = filters.city ?? "";
  const startKey = filters.dateRange.start
    ? filters.dateRange.start.toISOString()
    : "";
  const endKey = filters.dateRange.end
    ? filters.dateRange.end.toISOString()
    : "";

  const requestKey = `${query}|${categoriesKey}|${cityKey}|${startKey}|${endKey}|${attempt}|${fallbackSummaries.length}`;

  useEffect(() => {
    if (!enabled) return;

    let active = true;

    searchEvents(
      {
        search: query,
        categories: filters.categories,
        city: filters.city,
        startDate: filters.dateRange.start,
        endDate: filters.dateRange.end,
      },
      fallbackSummaries,
    )
      .then((data) => {
        if (active) {
          setResolved({ requestKey, status: "ok", data });
        }
      })
      .catch(() => {
        if (active) {
          setResolved({ requestKey, status: "error", data: null });
        }
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, requestKey]);

  const retry = useCallback(() => {
    setAttempt((value) => value + 1);
  }, []);

  if (!enabled) {
    return { status: "idle" as const, data: EMPTY_RESULTS, retry };
  }

  if (!resolved || resolved.requestKey !== requestKey) {
    return { status: "loading" as const, data: null, retry };
  }

  return { ...resolved, retry };
}
