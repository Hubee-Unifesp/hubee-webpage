import { Suspense } from "react";
import type { Metadata } from "next";
import { AllEventsContent } from "@/components/eventos/all-events-content";
import {
  EventPageShell,
  containerClassName,
} from "@/components/eventos/detalhes/event-page-shell";
import { EventCardSkeleton } from "@/components/home/events/list-states";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Todos os eventos | Hubee",
  description:
    "Explore festas, shows, palestras e campeonatos das agremiações perto de você.",
};

function AllEventsFallback() {
  return (
    <EventPageShell label="Carregando eventos">
      <div className={cn(containerClassName, "py-10")}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }, (_, idx) => (
            <EventCardSkeleton key={idx} />
          ))}
        </div>
      </div>
    </EventPageShell>
  );
}

export default function AllEventsPage() {
  return (
    <Suspense fallback={<AllEventsFallback />}>
      <AllEventsContent />
    </Suspense>
  );
}
