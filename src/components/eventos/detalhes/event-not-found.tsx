import Link from "next/link";
import { ArrowLeft, CalendarX2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventPageShell } from "./event-page-shell";

/** Estado 404: evento inexistente ou ainda não publicado. */
export function EventNotFound() {
  return (
    <EventPageShell label="Evento não encontrado" className="flex items-center justify-center px-4 py-16 md:py-24">
      <div className="flex max-w-md flex-col items-center text-center">
        <span className="flex size-20 items-center justify-center rounded-full bg-hubee-400 text-hubee-800 md:size-24">
          <CalendarX2 aria-hidden="true" strokeWidth={1.5} className="size-9 md:size-10" />
        </span>
        <h1 className="mt-6 font-display text-4xl leading-tight text-hubee-800 md:text-5xl dark:text-hubee-50">
          Evento não encontrado
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-hubee-neutral-300 md:text-base dark:text-hubee-100">
          Este evento pode ter sido removido ou ainda não foi publicado.
        </p>
        <Button
          asChild
          className="mt-6 h-11 gap-2 bg-hubee-400 px-5 text-sm font-semibold text-hubee-800 hover:bg-hubee-300 focus-visible:ring-hubee-400"
        >
          <Link href="/">
            <ArrowLeft aria-hidden="true" />
            Voltar para a Home
          </Link>
        </Button>
      </div>
    </EventPageShell>
  );
}
