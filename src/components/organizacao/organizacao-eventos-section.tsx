"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  Plus,
  Sparkles,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";
import { EventoOrganizadorCard } from "@/components/conta/eventos/evento-organizador-card";
import { HexPattern } from "@/components/home/events/event-media";
import { ListMessage } from "@/components/home/events/list-states";
import { Skeleton } from "@/components/skeleton";
import { Button } from "@/components/ui/button";
import { displayFont as display } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import {
  canCreateOrEditEvent,
  type EventoOrganizador,
  type PapelOrganizador,
} from "@/types/organizacao";

const BARCODE = [3, 1, 2, 1, 4, 1, 1, 3, 2, 1, 1, 2, 4, 1, 2, 1, 3, 1, 1, 2];

interface QuickShortcut {
  href: string;
  badge: string;
  title: string;
  description: string;
  cta: string;
  icon: LucideIcon;
  headerClassName: string;
  patternClassName: string;
}

const SHORTCUTS: readonly QuickShortcut[] = [
  {
    href: "/meus-eventos",
    badge: "Eventos",
    title: "Eventos e lotes",
    description:
      "Crie eventos com ajuda da IA, personalize capas, gerencie lotes de ingressos e acompanhe as vendas.",
    cta: "Abrir eventos",
    icon: CalendarDays,
    headerClassName: "bg-hubee-400 text-hubee-900",
    patternClassName: "text-hubee-800/15",
  },
  {
    href: "/conta/membros",
    badge: "Equipe",
    title: "Membros e convites",
    description:
      "Convide pessoas da organização por e-mail e defina quem administra, edita ou apenas consulta.",
    cta: "Gerenciar equipe",
    icon: Users,
    headerClassName: "bg-hubee-900 text-hubee-50",
    patternClassName: "text-hubee-400/20",
  },
  {
    href: "/conta/fornecedores",
    badge: "Parceiros",
    title: "Fornecedores",
    description:
      "Consulte, cadastre e avalie fornecedores compartilhados com a comunidade de organizadores.",
    cta: "Ver fornecedores",
    icon: Truck,
    headerClassName: "bg-hubee-750 text-hubee-50",
    patternClassName: "text-hubee-400/20",
  },
];

interface OrganizacaoEventosSectionProps {
  eventos: readonly EventoOrganizador[];
  status: "loading" | "ok" | "error";
  papel: PapelOrganizador;
  onRetry: () => void;
  onEventoAlterado: () => void;
}

/**
 * Seção de eventos da organização (com acesso rápido para editar/customizar eventos e lotes)
 * + atalhos de gestão no estilo ingresso com picote.
 */
export function OrganizacaoEventosSection({
  eventos,
  status,
  papel,
  onRetry,
  onEventoAlterado,
}: OrganizacaoEventosSectionProps) {
  const podeCriar = canCreateOrEditEvent(papel);
  const eventosDestaque = eventos.slice(0, 4);

  return (
    <>
      {/* Bloco de eventos da organização */}
      <section aria-labelledby="org-eventos-titulo" className="mx-auto w-full max-w-6xl">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-hubee-700 uppercase dark:text-hubee-400">
              Customizar e gerenciar
            </p>
            <h2
              id="org-eventos-titulo"
              className={cn(
                display.className,
                "mt-1 text-3xl tracking-tight text-hubee-800 uppercase md:text-5xl dark:text-hubee-50",
              )}
            >
              Eventos da organização
            </h2>
            <p className="mt-1.5 text-sm text-hubee-750 dark:text-hubee-200">
              Personalize informações, capas e lotes dos seus eventos ou crie um novo com o assistente de IA.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {podeCriar && (
              <Button
                asChild
                className="h-10 rounded-full bg-hubee-400 px-5 text-sm font-semibold text-hubee-900 hover:bg-hubee-300 focus-visible:ring-hubee-400"
              >
                <Link href="/meus-eventos/novo">
                  <Plus aria-hidden="true" className="size-4" />
                  Criar evento
                </Link>
              </Button>
            )}
            <Button
              asChild
              variant="outline"
              className="h-10 rounded-full border-hubee-300 bg-transparent px-4 text-sm font-semibold text-hubee-800 hover:bg-hubee-100 dark:border-hubee-50/20 dark:text-hubee-50 dark:hover:bg-hubee-50/10"
            >
              <Link href="/meus-eventos">
                Ver todos
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </Button>
          </div>
        </div>

        {status === "loading" && (
          <div className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 2 }, (_, index) => (
              <Skeleton key={index} className="h-44 w-full rounded-xl" />
            ))}
          </div>
        )}

        {status === "error" && (
          <ListMessage
            role="alert"
            variant="primary"
            title="Não foi possível carregar os eventos da organização"
            description="Verifique sua conexão e tente novamente."
            actionLabel="Tentar novamente"
            onAction={onRetry}
          />
        )}

        {status === "ok" && eventosDestaque.length === 0 && (
          <div className="flex flex-col items-start justify-between gap-5 rounded-[26px] border border-hubee-300/70 bg-hubee-100 p-6 md:flex-row md:items-center md:p-8 dark:border-hubee-50/15 dark:bg-hubee-850">
            <div className="max-w-xl space-y-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-hubee-400/60 bg-hubee-200/70 px-3 py-0.5 text-xs font-semibold text-hubee-800 dark:border-hubee-400/35 dark:bg-hubee-400/15 dark:text-hubee-200">
                <Sparkles aria-hidden="true" className="size-3.5" />
                Pronto para começar
              </span>
              <h3 className="text-lg font-bold text-hubee-800 dark:text-hubee-50">
                Nenhum evento cadastrado nesta organização ainda
              </h3>
              <p className="text-sm text-hubee-750 dark:text-hubee-200">
                {podeCriar
                  ? "Crie o primeiro evento da sua organização manualmente ou descreva em linguagem natural para a IA montar o rascunho."
                  : "Assim que um administrador ou membro criar eventos, eles aparecerão aqui para consulta."}
              </p>
            </div>

            {podeCriar && (
              <Button
                asChild
                className="h-11 shrink-0 rounded-full bg-hubee-800 px-6 text-sm font-semibold text-hubee-50 hover:bg-hubee-900 dark:bg-hubee-400 dark:text-hubee-900 dark:hover:bg-hubee-300"
              >
                <Link href="/meus-eventos/novo">
                  <Sparkles aria-hidden="true" className="size-4" />
                  Criar primeiro evento
                </Link>
              </Button>
            )}
          </div>
        )}

        {status === "ok" && eventosDestaque.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {eventosDestaque.map((evento) => (
              <EventoOrganizadorCard
                key={evento.id}
                evento={evento}
                papel={papel}
                onAlterado={onEventoAlterado}
              />
            ))}
          </div>
        )}
      </section>

      {/* Bloco de atalhos da organização em formato ingresso com picote */}
      <section aria-labelledby="org-atalhos-titulo" className="mx-auto w-full max-w-6xl">
        <div className="mb-8 text-center">
          <h2
            id="org-atalhos-titulo"
            className={cn(
              display.className,
              "text-3xl tracking-tight text-hubee-800 uppercase md:text-5xl dark:text-hubee-50",
            )}
          >
            Gestão da colmeia
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-hubee-750 md:text-base dark:text-hubee-200">
            Acesse rapidamente todas as áreas operacionais da sua organização.
          </p>
        </div>

        <ul className="grid gap-6 md:grid-cols-3">
          {SHORTCUTS.map(({ href, badge, title, description, cta, icon: Icon, headerClassName, patternClassName }) => (
            <li key={href} className="flex">
              <Link
                href={href}
                className="group relative flex w-full flex-col rounded-[26px] outline-none focus-visible:ring-4 focus-visible:ring-hubee-400"
              >
                {/* Topo colorido do ingresso */}
                <div
                  className={cn(
                    "relative flex min-h-36 items-end justify-between overflow-hidden rounded-t-[26px] px-6 py-5 transition-all duration-300 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:-translate-y-1 group-hover:-rotate-[0.6deg] motion-reduce:transition-none",
                    headerClassName,
                  )}
                >
                  <HexPattern className={patternClassName} />
                  <div className="relative z-10 flex flex-col gap-1.5">
                    <span className="w-fit rounded-full bg-black/15 px-2.5 py-0.5 text-[11px] font-bold tracking-wider uppercase">
                      {badge}
                    </span>
                    <h3
                      className={cn(
                        display.className,
                        "text-2xl leading-none uppercase transition-transform duration-300 group-hover:translate-x-1",
                      )}
                    >
                      {title}
                    </h3>
                  </div>
                  <div className="relative z-10 flex size-13 shrink-0 items-center justify-center rounded-2xl bg-black/10 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-6">
                    <Icon aria-hidden="true" strokeWidth={1.75} className="size-7" />
                  </div>
                </div>

                {/* Picote lateral vazado (alinhado com o fundo da página bg-hubee-50 / dark:bg-hubee-900) */}
                <div
                  aria-hidden="true"
                  className="relative z-10 flex h-7 items-center bg-hubee-100 transition-colors duration-300 dark:bg-hubee-850"
                >
                  <span className="absolute -left-3.5 size-7 rounded-full bg-hubee-50 transition-transform duration-300 group-hover:scale-110 dark:bg-hubee-900" />
                  <span className="mx-6 h-0 w-full border-t-2 border-dashed border-hubee-300 transition-colors duration-300 group-hover:border-hubee-500 dark:border-hubee-700 dark:group-hover:border-hubee-400" />
                  <span className="absolute -right-3.5 size-7 rounded-full bg-hubee-50 transition-transform duration-300 group-hover:scale-110 dark:bg-hubee-900" />
                </div>

                {/* Canhoto inferior */}
                <div className="relative flex flex-1 flex-col justify-between gap-5 rounded-b-[26px] border border-t-0 border-hubee-300/70 bg-hubee-100 px-6 pt-2 pb-6 text-hubee-800 shadow-sm transition-all duration-300 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:translate-y-1 group-hover:border-hubee-400 motion-reduce:transition-none dark:border-hubee-50/15 dark:bg-hubee-850 dark:text-hubee-50">
                  <p className="text-sm leading-relaxed text-hubee-750 dark:text-hubee-200">
                    {description}
                  </p>

                  <div className="flex items-end justify-between gap-3">
                    <span
                      aria-hidden="true"
                      className="flex h-6 items-stretch gap-[2px] opacity-80"
                    >
                      {BARCODE.map((width, index) => (
                        <span
                          key={index}
                          className="bg-hubee-800 dark:bg-hubee-400"
                          style={{ width }}
                        />
                      ))}
                    </span>

                    <span className="inline-flex items-center gap-1 text-xs font-bold text-hubee-800 group-hover:text-hubee-700 dark:text-hubee-400 dark:group-hover:text-hubee-300">
                      {cta}
                      <ArrowRight
                        aria-hidden="true"
                        className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                      />
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
