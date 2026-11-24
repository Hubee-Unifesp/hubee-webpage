"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Calendar,
  ChevronDown,
  Lock,
  Pencil,
  Plus,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { OrganizacaoForm } from "@/components/conta/organizacao/organizacao-form";
import { ListMessage } from "@/components/home/events/list-states";
import { useFlyingBee } from "@/components/home/hero-section";
import { Button } from "@/components/ui/button";
import { Honeycomb, type HoneycombCell } from "@/components/ui/honeycomb";
import { useAuth } from "@/contexts/AuthContext";
import { useMeusEventos } from "@/hooks/useMeusEventos";
import { getOrganizationById } from "@/lib/api/organizations";
import { displayFont as display } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import {
  canCreateOrEditEvent,
  formatOrganizerRoleLabel,
  type Organizacao,
  type PapelOrganizador,
} from "@/types/organizacao";
import { MinhaOrganizacaoSkeleton } from "./minha-organizacao-skeleton";
import { OrganizacaoEventosSection } from "./organizacao-eventos-section";
import { OrganizacaoHeroCard } from "./organizacao-hero-card";

const hiveCells: readonly HoneycombCell[] = Array.from({ length: 30 * 8 }, (_, index) => {
  const col = index % 30;
  const row = Math.floor(index / 30);
  return [col, row] as const;
}).filter(([col, row]) => (col + row) % 2 === 0);

const ROLE_DESCRIPTIONS: Record<PapelOrganizador, string> = {
  administrador:
    "Gerencia os dados cadastrais, convida e altera membros, e pode criar, editar, publicar e cancelar eventos.",
  membro:
    "Cria, edita e publica eventos e lotes da organização. Dados cadastrais são editados apenas por administradores.",
  leitura:
    "Consulta eventos, vendas e informações da organização em modo somente leitura.",
};

type DetalhesFetchState =
  | { orgId: string; status: "ok"; data: Organizacao }
  | { orgId: string; status: "error"; data: null };

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

/**
 * Página full-width `/minha-organizacao`: hub visual do organizador no padrão da Hero da Home,
 * com edição dos dados cadastrais da organização (`PATCH /organizations/:id`), troca de organização
 * ativa, prévia/customização de eventos e atalhos para equipe e fornecedores.
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
  const [editando, setEditando] = useState(false);

  const heroSectionRef = useRef<HTMLElement>(null);
  const beeRef = useRef<HTMLDivElement>(null);
  const perchRef = useRef<HTMLSpanElement>(null);
  const dadosSectionRef = useRef<HTMLElement>(null);

  useFlyingBee(heroSectionRef, beeRef, perchRef);

  const activeOrgId = organizacaoAtiva?.orgId ?? null;

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
        ref={heroSectionRef}
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

        <div className="mx-auto flex w-full max-w-3xl flex-col items-start gap-6">
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

  function handleAbrirEdicao() {
    setEditando(true);
    dadosSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleTrocarOrganizacao(novoOrgId: string) {
    setEditando(false);
    selecionarOrganizacao(novoOrgId);
  }

  function handleSalvo(atualizada: Organizacao) {
    setDetalhesState({ orgId: atualizada.id, status: "ok", data: atualizada });
    setEditando(false);
  }

  return (
    <>
      {/* SEÇÃO 1 — HERO DA ORGANIZAÇÃO (padrão visual da Hero da Home) */}
      <section
        ref={heroSectionRef}
        aria-labelledby="minha-org-hero-titulo"
        className="relative isolate flex min-h-[420px] items-center overflow-hidden rounded-[32px] bg-hubee-900 px-6 py-12 text-hubee-50 sm:px-10 md:min-h-[470px] md:py-16 lg:px-16 lg:py-20"
      >
        {/* Grade de colmeia + brilho interativo */}
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

        {/* Abelha flutuante que pousa no cartão e segue o ponteiro */}
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
          {/* Coluna esquerda: identidade, seletor de organização, descrição e CTAs */}
          <div className="flex min-w-0 flex-col items-start gap-6">
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
              className={cn(
                display.className,
                "max-w-full text-[clamp(2.75rem,5.4vw,4.75rem)] leading-[0.94] tracking-tight break-words uppercase",
              )}
            >
              <span className="block text-hubee-50">{firstLine}</span>
              <span className="block text-hubee-400">{secondLine}</span>
            </h1>

            <p className="max-w-xl text-base leading-relaxed text-hubee-100/85 md:text-lg">
              {detalhesCarregando
                ? "Carregando os detalhes da sua organização..."
                : descricaoAtual
                  ? descricaoAtual
                  : podeEditarOrg
                    ? "Adicione uma descrição para apresentar sua organização, seus eventos e sua proposta para o público."
                    : "Acompanhe os eventos, lotes, equipe e fornecedores desta organização em um só lugar."}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              {podeEditarOrg ? (
                <button
                  type="button"
                  onClick={handleAbrirEdicao}
                  className="inline-flex h-13 cursor-pointer items-center gap-2.5 rounded-full bg-hubee-400 px-7 text-base font-semibold text-hubee-900 transition-[background-color,transform] hover:bg-hubee-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-hubee-400/50 active:scale-[0.97]"
                >
                  <Pencil aria-hidden="true" className="size-4" />
                  Editar organização
                </button>
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
                  className="inline-flex h-13 items-center gap-2 rounded-full px-4 text-base font-semibold text-hubee-50 transition-colors hover:text-hubee-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-hubee-400/50"
                >
                  <Plus aria-hidden="true" className="size-4" />
                  Novo evento
                </Link>
              )}
            </div>
          </div>

          {/* Coluna direita: Cartão-ingresso da organização */}
          <OrganizacaoHeroCard
            nome={nomeAtual}
            papel={organizacaoAtiva.papel}
            totalEventos={eventos.length}
            eventosPublicados={eventosPublicados}
            criadaEm={detalhes?.createdAt ?? null}
            perchRef={perchRef}
          />
        </div>
      </section>

      {/* SEÇÃO 2 — INFORMAÇÕES E EDIÇÃO DA ORGANIZAÇÃO */}
      <section
        ref={dadosSectionRef}
        id="dados-organizacao"
        aria-labelledby="org-dados-titulo"
        className="mx-auto w-full max-w-6xl scroll-mt-24"
      >
        <div className="rounded-[26px] border border-hubee-300/70 bg-hubee-100 p-6 text-hubee-800 shadow-sm md:p-8 dark:border-hubee-50/15 dark:bg-hubee-850 dark:text-hubee-50">
          <div className="flex flex-col justify-between gap-4 border-b border-hubee-200 pb-5 sm:flex-row sm:items-center dark:border-hubee-50/15">
            <div>
              <p className="text-xs font-bold tracking-[0.16em] text-hubee-700 uppercase dark:text-hubee-400">
                Identidade e cadastro
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

            <div className="flex flex-wrap items-center gap-2.5">
              {podeEditarOrg && !editando && (
                <Button
                  type="button"
                  onClick={() => setEditando(true)}
                  className="h-10 rounded-full bg-hubee-400 px-5 text-sm font-semibold text-hubee-900 hover:bg-hubee-300"
                >
                  <Pencil aria-hidden="true" className="size-4" />
                  Editar informações
                </Button>
              )}

              {!podeEditarOrg && (
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
            {editando && podeEditarOrg ? (
              <div className="max-w-2xl">
                <OrganizacaoForm
                  key={organizacaoAtiva.orgId}
                  mode={{
                    type: "edit",
                    orgId: organizacaoAtiva.orgId,
                    initialName: nomeAtual,
                  }}
                  onCancel={() => setEditando(false)}
                  onSuccess={handleSalvo}
                />
              </div>
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
                  <span className="text-xs font-semibold tracking-wider text-hubee-700 uppercase dark:text-hubee-300">
                    Sobre a organização
                  </span>
                  <h3 className="mt-1 text-lg font-bold text-hubee-800 dark:text-hubee-50">
                    {nomeAtual}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-hubee-750 dark:text-hubee-200">
                    {detalhesCarregando
                      ? "Carregando descrição..."
                      : descricaoAtual ||
                        "Nenhuma descrição cadastrada ainda. Use o botão \"Editar informações\" para contar quem organiza e quais eventos vocês realizam."}
                  </p>
                </div>

                <dl className="flex flex-col justify-between gap-4 rounded-2xl border border-hubee-200 bg-hubee-50/80 p-4 dark:border-hubee-50/10 dark:bg-hubee-900/60">
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
