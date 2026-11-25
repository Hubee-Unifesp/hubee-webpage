"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Building2,
  Calendar,
  CalendarDays,
  Settings2,
} from "lucide-react";
import { categoryConfig } from "@/components/home/events/categories.config";
import { EventCard } from "@/components/home/events/event-card";
import { CategoryPill } from "@/components/home/events/event-media";
import { ListMessage } from "@/components/home/events/list-states";
import { useFlyingBee } from "@/components/home/hero-section";
import { Button } from "@/components/ui/button";
import { Honeycomb, type HoneycombCell } from "@/components/ui/honeycomb";
import { useOrganizacaoAtiva } from "@/hooks/useMeusEventos";
import {
  getPublicEventsByOrganization,
  type EventCategory,
  type EventSummary,
} from "@/lib/api/events";
import { parseApiError } from "@/lib/api/errors";
import { getOrganizationById } from "@/lib/api/organizations";
import { displayFont as display } from "@/lib/fonts";
import {
  DEFAULT_ORGANIZATION_BRANDING,
  loadOrganizationBranding,
  subscribeOrganizationBranding,
} from "@/lib/organization-branding";
import { cn } from "@/lib/utils";
import type { Organizacao } from "@/types/organizacao";
import { MinhaOrganizacaoSkeleton } from "./minha-organizacao-skeleton";
import { OrganizacaoHeroCard } from "./organizacao-hero-card";

const hiveCells: readonly HoneycombCell[] = Array.from({ length: 30 * 8 }, (_, index) => {
  const col = index % 30;
  const row = Math.floor(index / 30);
  return [col, row] as const;
}).filter(([col, row]) => (col + row) % 2 === 0);

type PageFetchState =
  | { orgId: string; status: "ok"; organizacao: Organizacao; eventos: EventSummary[] }
  | { orgId: string; status: "not-found" }
  | { orgId: string; status: "error" };

const getServerBrandingSnapshot = () => DEFAULT_ORGANIZATION_BRANDING;

function splitHeroTitle(name: string): { firstLine: string; secondLine: string } {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) {
    return { firstLine: "ORGANIZAÇÃO", secondLine: name.trim() || "HUBEE" };
  }
  const splitAt = Math.ceil(words.length / 2);
  return {
    firstLine: words.slice(0, splitAt).join(" "),
    secondLine: words.slice(splitAt).join(" "),
  };
}

function formatCreatedDate(iso: string | null | undefined): string {
  if (!iso) return "Não informada";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Não informada";
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

/**
 * Página pública `/organizacoes/[id]`: apresenta a organização no mesmo design visual de
 * `/minha-organizacao` (Hero com colmeia, abelha interativa e cartão-ingresso), suas informações
 * cadastrais e todos os eventos publicados com filtro por categoria.
 */
export function OrganizacaoPublicaContent({ orgId }: { orgId: string }) {
  const router = useRouter();
  const { organizacoes, selecionarOrganizacao } = useOrganizacaoAtiva();
  const [fetchState, setFetchState] = useState<PageFetchState | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [categoriaSelecionada, setCategoriaSelecionada] = useState<EventCategory | "all">("all");

  const heroSectionRef = useRef<HTMLElement>(null);
  const beeRef = useRef<HTMLDivElement>(null);
  const perchRef = useRef<HTMLSpanElement | null>(null);
  const eventosSectionRef = useRef<HTMLElement>(null);

  useFlyingBee(heroSectionRef, beeRef, perchRef);

  const getBrandingSnapshot = useCallback(() => loadOrganizationBranding(orgId), [orgId]);
  const branding = useSyncExternalStore(
    subscribeOrganizationBranding,
    getBrandingSnapshot,
    getServerBrandingSnapshot,
  );

  useEffect(() => {
    let active = true;

    Promise.all([
      getOrganizationById(orgId),
      getPublicEventsByOrganization(orgId).catch(() => [] as EventSummary[]),
    ])
      .then(([organizacao, eventos]) => {
        if (active) setFetchState({ orgId, status: "ok", organizacao, eventos });
      })
      .catch((error: unknown) => {
        if (!active) return;
        const { status } = parseApiError(error);
        if (status === 404 || status === 400) {
          setFetchState({ orgId, status: "not-found" });
        } else {
          setFetchState({ orgId, status: "error" });
        }
      });

    return () => {
      active = false;
    };
  }, [orgId, attempt]);

  const estadoAtual = fetchState?.orgId === orgId ? fetchState : null;
  const eventos = useMemo(
    () => (estadoAtual?.status === "ok" ? estadoAtual.eventos : []),
    [estadoAtual],
  );

  const categoriasPresentes = useMemo(() => {
    const unique = new Set<EventCategory>();
    for (const evento of eventos) unique.add(evento.category);
    return Array.from(unique);
  }, [eventos]);

  const eventosFiltrados = useMemo(
    () =>
      categoriaSelecionada === "all"
        ? eventos
        : eventos.filter((evento) => evento.category === categoriaSelecionada),
    [eventos, categoriaSelecionada],
  );

  const pertenceAEstaOrg = useMemo(
    () => organizacoes.some((org) => org.orgId === orgId),
    [organizacoes, orgId],
  );

  if (estadoAtual === null) {
    return <MinhaOrganizacaoSkeleton />;
  }

  if (estadoAtual.status === "not-found") {
    return (
      <div className="mx-auto w-full max-w-3xl py-10">
        <ListMessage
          role="alert"
          variant="primary"
          title="Organização não encontrada"
          description="Não encontramos nenhuma organização com esse endereço. Ela pode ter sido removida ou o link está incorreto."
          actionLabel="Explorar eventos"
          onAction={() => router.push("/eventos")}
        />
      </div>
    );
  }

  if (estadoAtual.status === "error") {
    return (
      <div className="mx-auto w-full max-w-3xl py-10">
        <ListMessage
          role="alert"
          variant="primary"
          title="Não foi possível carregar esta organização"
          description="Verifique sua conexão e tente novamente."
          actionLabel="Tentar novamente"
          onAction={() => {
            setFetchState(null);
            setAttempt((value) => value + 1);
          }}
        />
      </div>
    );
  }

  const { organizacao } = estadoAtual;
  const { firstLine, secondLine } = splitHeroTitle(organizacao.name);
  const descricao = organizacao.description?.trim() ?? "";

  return (
    <>
      {/* Breadcrumb simples de navegação */}
      <nav aria-label="Navegação estrutural" className="mx-auto -mb-6 flex w-full max-w-6xl items-center gap-2 text-xs font-medium text-hubee-750 dark:text-hubee-200">
        <Link
          href="/eventos"
          className="inline-flex items-center gap-1 rounded-sm outline-none hover:text-hubee-900 hover:underline focus-visible:ring-2 focus-visible:ring-hubee-400 dark:hover:text-hubee-50"
        >
          <ArrowLeft aria-hidden="true" className="size-3.5" />
          Voltar para eventos
        </Link>
        <span aria-hidden="true" className="opacity-50">/</span>
        <span className="truncate font-semibold text-hubee-800 dark:text-hubee-50">
          {organizacao.name}
        </span>
      </nav>

      {/* SEÇÃO 1 — HERO PÚBLICA DA ORGANIZAÇÃO */}
      <section
        ref={heroSectionRef}
        aria-labelledby="org-publica-hero-titulo"
        className="relative isolate flex min-h-[400px] items-center overflow-hidden rounded-[32px] bg-hubee-900 px-6 py-12 text-hubee-50 sm:px-10 md:min-h-[450px] md:py-16 lg:px-16 lg:py-20"
      >
        {branding.coverImage && (
          <>
            <Image
              src={branding.coverImage}
              alt=""
              fill
              unoptimized
              sizes="100vw"
              className="absolute inset-0 -z-20 object-cover opacity-30"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-20 bg-gradient-to-r from-hubee-900 via-hubee-900/85 to-hubee-900/65"
            />
          </>
        )}

        <Honeycomb
          cells={hiveCells}
          orientation="pointy"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 -z-10 size-full fill-none stroke-hubee-400/10 stroke-[1.5]"
        />
        <Honeycomb
          cells={hiveCells}
          orientation="pointy"
          preserveAspectRatio="xMidYMid slice"
          className="hero-hive-glow absolute inset-0 -z-10 size-full fill-hubee-400/[0.06] stroke-hubee-400 stroke-2"
        />

        <div
          ref={beeRef}
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 z-50 -mt-7 -ml-7 size-14 will-change-transform md:-mt-9 md:-ml-9 md:size-[72px]"
        >
          <Image
            src="/logo/logo-icon/LogoMono_yellow.svg"
            alt=""
            width={72}
            height={72}
            className="hero-bee size-full object-contain"
            priority
          />
        </div>

        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
          <div className="flex min-w-0 flex-col items-start gap-6">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-hubee-400/40 bg-hubee-400/15 px-3.5 py-1 text-xs font-bold tracking-wider text-hubee-300 uppercase">
              <Building2 aria-hidden="true" className="size-3.5" />
              Organização na Hubee
            </span>

            <h1
              id="org-publica-hero-titulo"
              className={cn(
                display.className,
                "max-w-full text-[clamp(2.75rem,5.4vw,4.75rem)] leading-[0.94] tracking-tight break-words uppercase",
              )}
            >
              <span className="block text-hubee-50">{firstLine}</span>
              <span className="block text-hubee-400">{secondLine}</span>
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-hubee-100/85 md:text-lg">
              {descricao ||
                `Confira os próximos eventos e novidades organizados por ${organizacao.name} na Hubee.`}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="button"
                onClick={() =>
                  eventosSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
                className="inline-flex h-13 cursor-pointer items-center gap-2.5 rounded-full bg-hubee-400 px-7 text-base font-semibold text-hubee-900 transition-[background-color,transform] hover:bg-hubee-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-hubee-400/50 active:scale-[0.97]"
              >
                Ver eventos
                <ArrowDown aria-hidden="true" className="size-4" />
              </button>

              {pertenceAEstaOrg && (
                <Link
                  href="/minha-organizacao"
                  onClick={() => selecionarOrganizacao(orgId)}
                  className="inline-flex h-13 items-center gap-2 rounded-full border border-hubee-50/20 bg-hubee-850/70 px-5 text-sm font-semibold text-hubee-50 transition-colors hover:border-hubee-400/60 hover:text-hubee-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-hubee-400/50"
                >
                  <Settings2 aria-hidden="true" className="size-4" />
                  Gerenciar organização
                </Link>
              )}
            </div>
          </div>

          <OrganizacaoHeroCard
            nome={organizacao.name}
            badgeLabel="Organização"
            totalEventos={eventos.length}
            secondaryMetricLabel="Categorias"
            secondaryMetricValue={categoriasPresentes.length}
            criadaEm={organizacao.createdAt}
            branding={branding}
            perchRef={perchRef}
          />
        </div>
      </section>

      {/* SEÇÃO 2 — INFORMAÇÕES DA ORGANIZAÇÃO */}
      <section aria-labelledby="org-publica-sobre-titulo" className="mx-auto w-full max-w-6xl">
        <div className="rounded-[26px] border border-hubee-300/70 bg-hubee-100 p-6 text-hubee-800 shadow-sm md:p-8 dark:border-hubee-50/15 dark:bg-hubee-850 dark:text-hubee-50">
          <p className="text-xs font-bold tracking-[0.16em] text-hubee-700 uppercase dark:text-hubee-400">
            Quem faz acontecer
          </p>
          <h2
            id="org-publica-sobre-titulo"
            className={cn(
              display.className,
              "mt-1 text-2xl tracking-tight text-hubee-800 uppercase md:text-4xl dark:text-hubee-50",
            )}
          >
            Sobre a organização
          </h2>

          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-hubee-200 bg-hubee-50/80 p-4 md:col-span-2 dark:border-hubee-50/10 dark:bg-hubee-900/60">
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-lg font-bold text-hubee-800 dark:text-hubee-50">
                  {organizacao.name}
                </h3>
                {branding.logoImage && (
                  <span className="relative size-11 shrink-0 overflow-hidden rounded-xl border border-hubee-300 dark:border-hubee-50/15">
                    <Image
                      src={branding.logoImage}
                      alt={`Logo de ${organizacao.name}`}
                      fill
                      unoptimized
                      sizes="44px"
                      className="object-cover"
                    />
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-hubee-750 dark:text-hubee-200">
                {descricao ||
                  `${organizacao.name} é uma organização ativa na Hubee. Acompanhe abaixo os eventos disponíveis para garantir seus ingressos.`}
              </p>

              {categoriasPresentes.length > 0 && (
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-hubee-200 pt-3 dark:border-hubee-50/10">
                  <span className="text-xs font-semibold text-hubee-750 dark:text-hubee-200">
                    Categorias:
                  </span>
                  {categoriasPresentes.map((category) => (
                    <CategoryPill key={category} category={category} />
                  ))}
                </div>
              )}
            </div>

            <dl className="flex flex-col justify-between gap-4 rounded-2xl border border-hubee-200 bg-hubee-50/80 p-4 dark:border-hubee-50/10 dark:bg-hubee-900/60">
              <div>
                <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-hubee-700 uppercase dark:text-hubee-300">
                  <CalendarDays aria-hidden="true" className="size-3.5" />
                  Eventos disponíveis
                </dt>
                <dd className="mt-1 text-2xl font-extrabold tabular-nums text-hubee-800 dark:text-hubee-50">
                  {eventos.length}
                </dd>
                <p className="mt-0.5 text-xs text-hubee-750 dark:text-hubee-200">
                  {eventos.length === 1
                    ? "evento publicado na plataforma"
                    : "eventos publicados na plataforma"}
                </p>
              </div>

              <div className="border-t border-hubee-200 pt-3 dark:border-hubee-50/10">
                <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-hubee-700 uppercase dark:text-hubee-300">
                  <Calendar aria-hidden="true" className="size-3.5" />
                  Na Hubee desde
                </dt>
                <dd className="mt-1 text-sm font-semibold text-hubee-800 dark:text-hubee-50">
                  {formatCreatedDate(organizacao.createdAt)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* SEÇÃO 3 — EVENTOS PUBLICADOS DA ORGANIZAÇÃO */}
      <section
        ref={eventosSectionRef}
        id="eventos-organizacao"
        aria-labelledby="org-publica-eventos-titulo"
        className="mx-auto w-full max-w-6xl scroll-mt-24"
      >
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold tracking-[0.16em] text-hubee-700 uppercase dark:text-hubee-400">
              Programação
            </p>
            <h2
              id="org-publica-eventos-titulo"
              className={cn(
                display.className,
                "mt-1 text-3xl tracking-tight text-hubee-800 uppercase md:text-5xl dark:text-hubee-50",
              )}
            >
              Eventos de {organizacao.name}
            </h2>
          </div>

          {categoriasPresentes.length > 1 && (
            <div role="group" aria-label="Filtrar eventos por categoria" className="flex flex-wrap gap-2">
              <button
                type="button"
                aria-pressed={categoriaSelecionada === "all"}
                onClick={() => setCategoriaSelecionada("all")}
                className={cn(
                  "h-8 cursor-pointer rounded-full border px-3.5 text-xs font-semibold transition-colors",
                  categoriaSelecionada === "all"
                    ? "border-hubee-800 bg-hubee-800 text-hubee-50 dark:border-hubee-400 dark:bg-hubee-400 dark:text-hubee-900"
                    : "border-hubee-300 text-hubee-800 hover:bg-hubee-100 dark:border-hubee-50/20 dark:text-hubee-100 dark:hover:bg-hubee-50/10",
                )}
              >
                Todos ({eventos.length})
              </button>
              {categoriasPresentes.map((category) => (
                <button
                  key={category}
                  type="button"
                  aria-pressed={categoriaSelecionada === category}
                  onClick={() => setCategoriaSelecionada(category)}
                  className={cn(
                    "h-8 cursor-pointer rounded-full border px-3.5 text-xs font-semibold transition-colors",
                    categoriaSelecionada === category
                      ? "border-hubee-800 bg-hubee-800 text-hubee-50 dark:border-hubee-400 dark:bg-hubee-400 dark:text-hubee-900"
                      : "border-hubee-300 text-hubee-800 hover:bg-hubee-100 dark:border-hubee-50/20 dark:text-hubee-100 dark:hover:bg-hubee-50/10",
                  )}
                >
                  {categoryConfig[category].label}
                </button>
              ))}
            </div>
          )}
        </div>

        {eventosFiltrados.length === 0 ? (
          <div className="flex flex-col items-start justify-between gap-4 rounded-[26px] border border-hubee-300/70 bg-hubee-100 p-6 md:flex-row md:items-center md:p-8 dark:border-hubee-50/15 dark:bg-hubee-850">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-hubee-800 dark:text-hubee-50">
                Nenhum evento publicado no momento
              </h3>
              <p className="text-sm text-hubee-750 dark:text-hubee-200">
                {organizacao.name} ainda não possui eventos abertos nesta categoria. Explore outros eventos disponíveis na Hubee!
              </p>
            </div>
            <Button
              asChild
              className="h-10 shrink-0 rounded-full bg-hubee-400 px-5 text-sm font-semibold text-hubee-900 hover:bg-hubee-300"
            >
              <Link href="/eventos">
                Explorar todos os eventos
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {eventosFiltrados.map((evento) => (
              <EventCard key={evento.id} event={evento} showSalesProgress headingLevel="h3" />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
