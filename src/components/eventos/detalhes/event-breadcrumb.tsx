import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { allEventsHref } from "@/components/home/events/links";
import { cn } from "@/lib/utils";
import { containerClassName } from "./event-page-shell";

interface EventBreadcrumbProps {
  categoryLabel: string;
  title: string;
}

/** Trilha "Explorar Eventos / Categoria / Evento"; no mobile mostra apenas o link de voltar. */
export function EventBreadcrumb({ categoryLabel, title }: EventBreadcrumbProps) {
  return (
    <nav aria-label="Trilha de navegação" className="border-b border-hubee-200/70 dark:border-hubee-750">
      <ol className={cn(containerClassName, "flex items-center gap-2 py-3 text-xs text-hubee-750 dark:text-hubee-100")}>
        <li>
          <Link
            href={allEventsHref}
            className="inline-flex items-center gap-1.5 rounded-sm outline-none hover:underline focus-visible:ring-3 focus-visible:ring-hubee-400"
          >
            <ArrowLeft aria-hidden="true" className="size-3.5" />
            Explorar Eventos
          </Link>
        </li>
        <li aria-hidden="true" className="hidden md:block">
          /
        </li>
        <li className="hidden md:block">{categoryLabel}</li>
        <li aria-hidden="true" className="hidden md:block">
          /
        </li>
        <li aria-current="page" className="hidden truncate md:block">
          {title}
        </li>
      </ol>
    </nav>
  );
}
