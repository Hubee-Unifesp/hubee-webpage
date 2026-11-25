"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Calendar,
  CalendarDays,
  ChevronDown,
  Globe,
  ImageUp,
  Lock,
  Palette,
  Pencil,
  Plus,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { OrganizacaoForm } from "@/components/conta/organizacao/organizacao-form";
import { ListMessage } from "@/components/home/events/list-states";
import { Button } from "@/components/ui/button";
import { Honeycomb, type HoneycombCell } from "@/components/ui/honeycomb";
import { useAuth } from "@/contexts/AuthContext";
import { useMeusEventos } from "@/hooks/useMeusEventos";
import { getOrganizationById } from "@/lib/api/organizations";
import { displayFont as display } from "@/lib/fonts";
import {
  DEFAULT_ORGANIZATION_BRANDING,
  loadOrganizationBranding,
  resetOrganizationBranding,
  saveOrganizationBranding,
  subscribeOrganizationBranding,
  type OrganizationBranding,
} from "@/lib/organization-branding";
import { cn } from "@/lib/utils";
import {
  canCreateOrEditEvent,
  formatOrganizerRoleLabel,
  type Organizacao,
  type PapelOrganizador,
} from "@/types/organizacao";
import { MinhaOrganizacaoSkeleton } from "./minha-organizacao-skeleton";
import { OrganizacaoAparenciaForm } from "./organizacao-aparencia-form";
import { OrganizacaoEventosSection } from "./organizacao-eventos-section";

const hiveCells: readonly HoneycombCell[] = Array.from({ length: 30 * 8 }, (_, index) => {
  const col = index % 30;
  const row = Math.floor(index / 30);
  return [col, row] as const;
}).filter(([col, row]) => (col + row) % 2 === 0);

const ROLE_DESCRIPTIONS: Record<PapelOrganizador, string> = {
  administrador:
    "Gerencia os dados cadastrais, personaliza capa e aparência, convida membros e gerencia eventos.",
  membro:
    "Cria, edita e personaliza eventos e lotes da organização. Dados da organização são editados apenas por administradores.",
  leitura:
    "Consulta eventos, vendas e informações da organização em modo somente leitura.",
};

type DetalhesFetchState =
  | { orgId: string; status: "ok"; data: Organizacao }
  | { orgId: string; status: "error"; data: null };

type ModoPainel = "visualizar" | "dados" | "aparencia";

function splitHeroTitle(name: string): { firstLine: string; secondLine: string } {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) {
    return { firstLine: "SUA COLMEIA", secondLine: name.trim() || "ORGANIZAÇÃO" };
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

const getServerBrandingSnapshot = () => DEFAULT_ORGANIZATION_BRANDING;

/**
 * Página full-width `/minha-organizacao`: hub visual do organizador no padrão da Hero da Home,
 * com customização de capa/aparência da organização, edição de dados cadastrais (`PATCH /organizations/:id`),
 * troca de organização ativa, edição rápida de capa/dados de eventos e atalhos para equipe e fornecedores.
 */
export function MinhaOrganizacaoContent() {
  const { user, isLoading: authLoading } = useAuth();
  const {
    organizacoes,
    organizacaoAtiva,
    selecionarOrganizacao,
    todosEventos: eventos,
    status: eventosStatus,
    retry: retryEventos,
    recarregar: recarregarEventos,
  } = useMeusEventos();

  const [detalhesState, setDetalhesState] = useState<DetalhesFetchState | null>(null);
  const [detalhesAttempt, setDetalhesAttempt] = useState(0);
  const [modoPainel, setModoPainel] = useState<ModoPainel>("visualizar");

  const dadosSectionRef = useRef<HTMLElement>(null);

  const activeOrgId = organizacaoAtiva?.orgId ?? null;

  const getBrandingSnapshot = useCallback(
    () => (activeOrgId ? loadOrganizationBranding(activeOrgId) : DEFAULT_ORGANIZATION_BRANDING),
    [activeOrgId],
  );

  const branding = useSyncExternalStore(
    subscribeOrganizationBranding,
    getBrandingSnapshot,
    getServerBrandingSnapshot,
  );

  useEffect(() => {
    if (authLoading || !activeOrgId) return;

    let active = true;
    getOrganizationById(activeOrgId)
      .then((data) => {
        if (active) setDetalhesState({ orgId: activeOrgId, status: "ok", data });
      })
      .catch(() => {
        if (active) setDetalhesState({ orgId: activeOrgId, status: "error", data: null });
      });

    return () => {
      active = false;
    };
  }, [authLoading, activeOrgId, detalhesAttempt]);

  const detalhesAtuais =
    activeOrgId && detalhesState?.orgId === activeOrgId ? detalhesState : null;
  const detalhes = detalhesAtuais?.status === "ok" ? detalhesAtuais.data : null;
  const detalhesCarregando = Boolean(activeOrgId) && detalhesAtuais === null;
  const detalhesErro = detalhesAtuais?.status === "error";

  const eventosPublicados = useMemo(
    () => eventos.filter((evento) => evento.status === "published").length,
    [eventos],
  );

  if (authLoading) {
    return <MinhaOrganizacaoSkeleton />;
  }

  // Usuário logado sem organização vinculada: convite visual para criar ou aceitar convite
  if (!organizacaoAtiva) {
    return (
      <section
        aria-labelledby="org-vazia-titulo"
        className="relative isolate flex min-h-[380px] items-center overflow-hidden rounded-[32px] bg-hubee-900 px-6 py-12 text-hubee-50 sm:px-10 md:py-16 lg:px-16 lg:py-20"
      >
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

        <div className="flex w-full max-w-3xl flex-col items-start gap-6">
          <span className="inline-flex items-center gap-2 rounded-full border border-hubee-400/40 bg-hubee-400/15 px-3.5 py-1 text-xs font-bold tracking-wider text-hubee-300 uppercase">
            <Building2 aria-hidden="true" className="size-3.5" />
            Espaço do organizador
          </span>
          <h1
            id="org-vazia-titulo"
            className={cn(
              display.className,
              "text-4xl leading-[0.95] tracking-tight uppercase sm:text-5xl md:text-6xl",
            )}
          >
            <span className="block text-hubee-50">SUA ORGANIZAÇÃO</span>
            <span className="block text-hubee-400">COMEÇA AQUI</span>
          </h1>
          <p className="max-w-xl text-base leading-relaxed text-hubee-100/85 md:text-lg">
            Você ainda não faz parte de nenhuma organização. Crie a sua agora para publicar eventos,
            gerenciar lotes e convidar sua equipe — ou confira seus convites pendentes no perfil.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/organizacoes/nova"
              className="inline-flex h-13 items-center gap-2.5 rounded-full bg-hubee-400 px-7 text-base font-semibold text-hubee-900 transition-[background-color,transform] hover:bg-hubee-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-hubee-400/50 active:scale-[0.97]"
            >
              <Plus aria-hidden="true" className="size-4" />
              Criar organização
            </Link>
            <Link
              href="/conta/perfil"
              className="inline-flex h-13 items-center gap-2 rounded-full px-4 text-base font-semibold text-hubee-50 transition-colors hover:text-hubee-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-hubee-400/50"
            >
              Ver convites no perfil
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </div>
      </section>
    );
  }

  const nomeAtual = detalhes?.name ?? organizacaoAtiva.nome;
  const descricaoAtual = detalhes?.description?.trim() ?? "";
  const podeEditarOrg = user?.role === "ADMIN" || organizacaoAtiva.level === "manage";
  const podeCriarEvento = canCreateOrEditEvent(organizacaoAtiva.papel);
  const { firstLine, secondLine } = splitHeroTitle(nomeAtual);

  function abrirPainel(modo: Exclude<ModoPainel, "visualizar">) {
    setModoPainel(modo);
    dadosSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleTrocarOrganizacao(novoOrgId: string) {
    setModoPainel("visualizar");
    selecionarOrganizacao(novoOrgId);
  }

  function handleSalvo(atualizada: Organizacao) {
    setDetalhesState({ orgId: atualizada.id, status: "ok", data: atualizada });
    setModoPainel("visualizar");
  }

  function handleBrandingChange(next: OrganizationBranding): boolean {
    if (!activeOrgId) return false;
    return saveOrganizationBranding(activeOrgId, next);
  }

  function handleBrandingReset(): void {
    if (!activeOrgId) return;
    resetOrganizationBranding(activeOrgId);
  }

  return (
    <>
      {/* SEÇÃO 1 — HERO DA ORGANIZAÇÃO (foco na capa personalizada) */}
      <section
        aria-labelledby="minha-org-hero-titulo"
        className="relative isolate flex min-h-[400px] items-end overflow-hidden rounded-[32px] bg-hubee-900 px-6 py-12 text-hubee-50 sm:px-10 md:min-h-[460px] md:items-center md:py-16 lg:px-16 lg:py-20"
      >
        {/* Capa personalizada no fundo da Hero ou grade de colmeia padrão */}
        {branding.coverImage ? (
          <>
            <Image
              src={branding.coverImage}
              alt={`Capa de ${nomeAtual}`}
              fill
              unoptimized
              sizes="100vw"
              className="absolute inset-0 -z-20 object-cover object-center"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-20 bg-gradient-to-r from-hubee-900/95 via-hubee-900/75 to-hubee-900/25"
            />
          </>
        ) : (
          <>
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
          </>
        )}

        <div className="flex w-full max-w-3xl flex-col items-start gap-6">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-hubee-400/40 bg-hubee-400/15 px-3.5 py-1 text-xs font-bold tracking-wider text-hubee-300 uppercase">
              <ShieldCheck aria-hidden="true" className="size-3.5" />
              {formatOrganizerRoleLabel(organizacaoAtiva.papel)}
            </span>

            {organizacoes.length > 1 && (
              <div className="relative inline-flex items-center">
                <label htmlFor="org-hero-selector" className="sr-only">
                  Selecionar organização ativa
                </label>
                <select
                  id="org-hero-selector"
                  value={organizacaoAtiva.orgId}
                  onChange={(event) => handleTrocarOrganizacao(event.target.value)}
                  className="h-8 cursor-pointer appearance-none rounded-full border border-hubee-50/20 bg-hubee-850 pr-8 pl-3.5 text-xs font-semibold text-hubee-50 transition-colors outline-none hover:border-hubee-400/60 focus-visible:ring-2 focus-visible:ring-hubee-400"
                >
                  {organizacoes.map((org) => (
                    <option key={org.orgId} value={org.orgId} className="bg-hubee-900 text-hubee-50">
                      {org.nome}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  aria-hidden="true"
                  className="pointer-events-none absolute right-2.5 size-3.5 text-hubee-300"
                />
              </div>
            )}
          </div>

          <h1
            id="minha-org-hero-titulo"
            style={branding.titleColor ? { color: branding.titleColor } : undefined}
            className={cn(
              display.className,
              "max-w-full text-[clamp(2.75rem,5.4vw,4.75rem)] leading-[0.94] tracking-tight break-words uppercase drop-shadow-sm",
            )}
          >
            <span className={cn("block", !branding.titleColor && "text-hubee-50")}>{firstLine}</span>
            <span className={cn("block", !branding.titleColor && "text-hubee-400")}>{secondLine}</span>
          </h1>

          <p
            style={branding.descriptionColor ? { color: branding.descriptionColor } : undefined}
            className={cn(
              "max-w-xl text-base leading-relaxed md:text-lg",
              !branding.descriptionColor && "text-hubee-100/85",
            )}
          >
            {detalhesCarregando
              ? "Carregando os detalhes da sua organização..."
              : descricaoAtual
                ? descricaoAtual
                : podeEditarOrg
                  ? "Adicione uma descrição e personalize a capa para apresentar sua organização, seus eventos e sua proposta."
                  : "Acompanhe os eventos, lotes, equipe e fornecedores desta organização em um só lugar."}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            {podeEditarOrg ? (
              <>
                <button
                  type="button"
                  onClick={() => abrirPainel("aparencia")}
                  className="inline-flex h-13 cursor-pointer items-center gap-2.5 rounded-full bg-hubee-400 px-7 text-base font-semibold text-hubee-900 transition-[background-color,transform] hover:bg-hubee-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-hubee-400/50 active:scale-[0.97]"
                >
                  <ImageUp aria-hidden="true" className="size-4" />
                  Personalizar capa
                </button>
                <button
                  type="button"
                  onClick={() => abrirPainel("dados")}
                  className="inline-flex h-13 cursor-pointer items-center gap-2 rounded-full border border-hubee-50/20 bg-hubee-850/70 px-5 text-sm font-semibold text-hubee-50 transition-colors hover:border-hubee-400/60 hover:text-hubee-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-hubee-400/50"
                >
                  <Pencil aria-hidden="true" className="size-4" />
                  Editar dados
                </button>
              </>
            ) : podeCriarEvento ? (
              <Link
                href="/meus-eventos/novo"
                className="inline-flex h-13 items-center gap-2.5 rounded-full bg-hubee-400 px-7 text-base font-semibold text-hubee-900 transition-[background-color,transform] hover:bg-hubee-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-hubee-400/50 active:scale-[0.97]"
              >
                <Sparkles aria-hidden="true" className="size-4" />
                Criar evento
              </Link>
            ) : (
              <Link
                href="/meus-eventos"
                className="inline-flex h-13 items-center gap-2.5 rounded-full bg-hubee-400 px-7 text-base font-semibold text-hubee-900 transition-[background-color,transform] hover:bg-hubee-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-hubee-400/50 active:scale-[0.97]"
              >
                Ver eventos
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            )}

            {podeCriarEvento && (
              <Link
                href="/meus-eventos/novo"
                className="inline-flex h-13 items-center gap-2 rounded-full px-3 text-base font-semibold text-hubee-50 transition-colors hover:text-hubee-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-hubee-400/50"
              >
                <Plus aria-hidden="true" className="size-4" />
                Novo evento
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* SEÇÃO 2 — INFORMAÇÕES, CAPA E CUSTOMIZAÇÃO DA ORGANIZAÇÃO */}
      <section
        ref={dadosSectionRef}
        id="dados-organizacao"
        aria-labelledby="org-dados-titulo"
        className="w-full scroll-mt-24"
      >
        <div className="rounded-[32px] border border-hubee-300/70 bg-hubee-100 px-6 py-6 text-hubee-800 shadow-sm sm:px-10 md:py-8 lg:px-16 dark:border-hubee-50/15 dark:bg-hubee-850 dark:text-hubee-50">
          <div className="flex flex-col justify-between gap-4 border-b border-hubee-200 pb-5 sm:flex-row sm:items-center dark:border-hubee-50/15">
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-hubee-700 uppercase dark:text-hubee-400">
                Identidade e personalização
              </p>
              <h2
                id="org-dados-titulo"
                className={cn(
                  display.className,
                  "mt-1 text-2xl tracking-tight text-hubee-800 uppercase md:text-4xl dark:text-hubee-50",
                )}
              >
                Informações da organização
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {podeEditarOrg ? (
                <div
                  role="tablist"
                  aria-label="Modos de visualização e personalização da organização"
                  className="inline-flex flex-wrap items-center gap-1 rounded-full border border-hubee-300/80 bg-hubee-50 p-1 dark:border-hubee-50/15 dark:bg-hubee-900"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={modoPainel === "visualizar"}
                    onClick={() => setModoPainel("visualizar")}
                    className={cn(
                      "h-8 cursor-pointer rounded-full px-3.5 text-xs font-semibold transition-colors",
                      modoPainel === "visualizar"
                        ? "bg-hubee-800 text-hubee-50 dark:bg-hubee-400 dark:text-hubee-900"
                        : "text-hubee-750 hover:text-hubee-900 dark:text-hubee-200 dark:hover:text-hubee-50",
                    )}
                  >
                    Visão geral
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={modoPainel === "dados"}
                    onClick={() => setModoPainel("dados")}
                    className={cn(
                      "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold transition-colors",
                      modoPainel === "dados"
                        ? "bg-hubee-800 text-hubee-50 dark:bg-hubee-400 dark:text-hubee-900"
                        : "text-hubee-750 hover:text-hubee-900 dark:text-hubee-200 dark:hover:text-hubee-50",
                    )}
                  >
                    <Pencil aria-hidden="true" className="size-3" />
                    Editar dados
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={modoPainel === "aparencia"}
                    onClick={() => setModoPainel("aparencia")}
                    className={cn(
                      "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-xs font-semibold transition-colors",
                      modoPainel === "aparencia"
                        ? "bg-hubee-800 text-hubee-50 dark:bg-hubee-400 dark:text-hubee-900"
                        : "text-hubee-750 hover:text-hubee-900 dark:text-hubee-200 dark:hover:text-hubee-50",
                    )}
                  >
                    <Palette aria-hidden="true" className="size-3" />
                    Capa e aparência
                  </button>
                </div>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-hubee-300/80 bg-hubee-50 px-3.5 py-1.5 text-xs font-semibold text-hubee-750 dark:border-hubee-50/15 dark:bg-hubee-900 dark:text-hubee-200">
                  <Lock aria-hidden="true" className="size-3.5" />
                  Edição restrita a administradores
                </span>
              )}

              <Button
                asChild
                variant="outline"
                className="h-10 rounded-full border-hubee-300 bg-transparent px-4 text-sm font-semibold text-hubee-800 hover:bg-hubee-200/50 dark:border-hubee-50/20 dark:text-hubee-50 dark:hover:bg-hubee-50/10"
              >
                <Link href="/organizacoes/nova">
                  <Plus aria-hidden="true" className="size-4" />
                  Nova organização
                </Link>
              </Button>
            </div>
          </div>

          <div className="pt-6">
            {modoPainel === "dados" && podeEditarOrg ? (
              <div className="w-full">
                <OrganizacaoForm
                  key={organizacaoAtiva.orgId}
                  mode={{
                    type: "edit",
                    orgId: organizacaoAtiva.orgId,
                    initialName: nomeAtual,
                  }}
                  onCancel={() => setModoPainel("visualizar")}
                  onSuccess={handleSalvo}
                />
              </div>
            ) : modoPainel === "aparencia" && podeEditarOrg ? (
              <OrganizacaoAparenciaForm
                branding={branding}
                onChange={handleBrandingChange}
                onReset={handleBrandingReset}
              />
            ) : detalhesErro ? (
              <ListMessage
                role="alert"
                variant="primary"
                title="Não foi possível carregar os dados cadastrais"
                description="Verifique sua conexão e tente novamente."
                actionLabel="Tentar novamente"
                onAction={() => {
                  setDetalhesState(null);
                  setDetalhesAttempt((value) => value + 1);
                }}
              />
            ) : (
              <div className="grid gap-6 md:grid-cols-3">
                <div className="rounded-2xl border border-hubee-200 bg-hubee-50/80 p-4 md:col-span-2 dark:border-hubee-50/10 dark:bg-hubee-900/60">
                  <div>
                    <span className="text-xs font-semibold tracking-wider text-hubee-700 uppercase dark:text-hubee-300">
                      Sobre a organização
                    </span>
                    <h3 className="mt-1 text-lg font-bold text-hubee-800 dark:text-hubee-50">
                      {nomeAtual}
                    </h3>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-hubee-750 dark:text-hubee-200">
                    {detalhesCarregando
                      ? "Carregando descrição..."
                      : descricaoAtual ||
                        "Nenhuma descrição cadastrada ainda. Use a aba \"Editar dados\" para contar quem organiza e quais eventos vocês realizam."}
                  </p>
                </div>

                <dl className="flex flex-col justify-between gap-4 rounded-2xl border border-hubee-200 bg-hubee-50/80 p-4 dark:border-hubee-50/10 dark:bg-hubee-900/60">
                  <div className="grid grid-cols-2 gap-4 border-b border-hubee-200 pb-3 dark:border-hubee-50/10">
                    <div>
                      <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-hubee-700 uppercase dark:text-hubee-300">
                        <CalendarDays aria-hidden="true" className="size-3.5" />
                        Eventos
                      </dt>
                      <dd className="mt-1 text-2xl font-extrabold tabular-nums text-hubee-800 dark:text-hubee-50">
                        {eventos.length}
                      </dd>
                    </div>
                    <div>
                      <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-hubee-700 uppercase dark:text-hubee-300">
                        <Globe aria-hidden="true" className="size-3.5" />
                        Publicados
                      </dt>
                      <dd className="mt-1 text-2xl font-extrabold tabular-nums text-hubee-800 dark:text-hubee-50">
                        {eventosPublicados}
                      </dd>
                    </div>
                  </div>

                  <div>
                    <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-hubee-700 uppercase dark:text-hubee-300">
                      <ShieldCheck aria-hidden="true" className="size-3.5" />
                      Seu nível de acesso
                    </dt>
                    <dd className="mt-1 text-sm font-bold text-hubee-800 dark:text-hubee-50">
                      {formatOrganizerRoleLabel(organizacaoAtiva.papel)}
                    </dd>
                    <p className="mt-1 text-xs leading-relaxed text-hubee-750 dark:text-hubee-200">
                      {ROLE_DESCRIPTIONS[organizacaoAtiva.papel]}
                    </p>
                  </div>

                  <div className="border-t border-hubee-200 pt-3 dark:border-hubee-50/10">
                    <dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-hubee-700 uppercase dark:text-hubee-300">
                      <Calendar aria-hidden="true" className="size-3.5" />
                      Criada em
                    </dt>
                    <dd className="mt-1 text-sm font-semibold text-hubee-800 dark:text-hubee-50">
                      {detalhesCarregando ? "Carregando..." : formatCreatedDate(detalhes?.createdAt)}
                    </dd>
                  </div>
                </dl>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SEÇÃO 3 — EVENTOS DA ORGANIZAÇÃO & ATALHOS */}
      <OrganizacaoEventosSection
        eventos={eventos}
        status={eventosStatus}
        papel={organizacaoAtiva.papel}
        onRetry={retryEventos}
        onEventoAlterado={recarregarEventos}
      />
    </>
  );
}
