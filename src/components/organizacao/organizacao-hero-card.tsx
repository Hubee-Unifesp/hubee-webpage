"use client";

import type { RefObject } from "react";
import { Building2, CalendarDays, ShieldCheck } from "lucide-react";
import { HexPattern } from "@/components/home/events/event-media";
import { displayFont as display } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { formatOrganizerRoleLabel, type PapelOrganizador } from "@/types/organizacao";

const BARCODE = [3, 1, 2, 1, 4, 1, 1, 3, 2, 1, 1, 2, 4, 1, 2, 1, 3, 1, 1, 2, 1, 3];

interface OrganizacaoHeroCardProps {
  nome: string;
  papel: PapelOrganizador;
  totalEventos: number;
  eventosPublicados: number;
  criadaEm: string | null;
  perchRef: RefObject<HTMLSpanElement | null>;
}

function getInitials(nome: string): string {
  const parts = nome
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "HB";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function formatCreatedYear(iso: string | null): string {
  if (!iso) return "HB-2026";
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) return "HB-2026";
  return `HB-${parsed.getFullYear()}`;
}

/**
 * Cartão-ingresso da organização exibido na Hero de `/minha-organizacao`,
 * seguindo a linguagem visual dos ingressos da Hero da Home (picote, código de barras e selo).
 */
export function OrganizacaoHeroCard({
  nome,
  papel,
  totalEventos,
  eventosPublicados,
  criadaEm,
  perchRef,
}: OrganizacaoHeroCardProps) {
  const sigla = getInitials(nome);
  const codigo = formatCreatedYear(criadaEm);

  return (
    <div className="relative mx-auto w-full max-w-[330px] select-none md:max-w-[350px]">
      {/* Carta de fundo decorativa (dá profundidade igual ao leque de ingressos da Home) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -translate-x-5 translate-y-2 -rotate-[7deg] rounded-[26px] border border-hubee-400/20 bg-hubee-850/90 shadow-2xl"
      />

      {/* Ponto de pouso da abelha interativa na quina superior esquerda do ingresso */}
      <span
        ref={perchRef}
        aria-hidden="true"
        className="pointer-events-none absolute top-2 left-3 z-20 size-1"
      />

      {/* Cartão-ingresso principal */}
      <div className="relative z-10 flex flex-col overflow-hidden rounded-[26px] bg-hubee-50 text-hubee-800 shadow-[0_24px_54px_-16px_rgba(0,0,0,0.65)] transition-transform duration-300 ease-[cubic-bezier(.2,.8,.2,1)] hover:-translate-y-1 hover:rotate-[0.7deg] motion-reduce:transition-none motion-reduce:hover:transform-none">
        {/* Topo amarelo com padrão hexagonal */}
        <div className="relative flex aspect-[4/2.7] flex-col justify-between overflow-hidden bg-hubee-400 p-5 text-hubee-900">
          <HexPattern className="text-hubee-800/15" />

          <div className="relative z-10 flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-hubee-900/15 px-2.5 py-0.5 text-[11px] font-bold tracking-wider uppercase">
              <ShieldCheck aria-hidden="true" className="size-3.5" />
              {formatOrganizerRoleLabel(papel)}
            </span>
            <span className="flex size-9 items-center justify-center rounded-xl bg-hubee-900/15 text-xs font-extrabold tracking-wider">
              {sigla}
            </span>
          </div>

          <div className="relative z-10 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <span className="block text-[10px] font-bold tracking-[0.16em] uppercase opacity-75">
                Colmeia ativa
              </span>
              <p
                className={cn(
                  display.className,
                  "mt-0.5 line-clamp-2 text-3xl leading-[0.95] tracking-tight uppercase",
                )}
              >
                {nome}
              </p>
            </div>
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-black/10">
              <Building2 aria-hidden="true" strokeWidth={1.6} className="size-7" />
            </div>
          </div>
        </div>

        {/* Picote lateral vazado com a cor exata do fundo da Hero (bg-hubee-900) */}
        <div aria-hidden="true" className="relative flex h-7 items-center bg-hubee-50">
          <span className="absolute -left-3.5 size-7 rounded-full bg-hubee-900" />
          <span className="mx-6 h-0 w-full border-t-2 border-dashed border-hubee-200" />
          <span className="absolute -right-3.5 size-7 rounded-full bg-hubee-900" />
        </div>

        {/* Canhoto inferior com resumo de eventos + código de barras */}
        <div className="flex flex-col gap-4 px-5 pt-1 pb-5 text-hubee-800">
          <div className="grid grid-cols-2 gap-3 rounded-xl bg-hubee-100/80 p-3">
            <div>
              <span className="flex items-center gap-1 text-[11px] font-medium text-hubee-750">
                <CalendarDays aria-hidden="true" className="size-3.5" />
                Eventos
              </span>
              <p className="mt-0.5 text-xl font-extrabold tabular-nums text-hubee-900">
                {totalEventos}
              </p>
            </div>
            <div>
              <span className="block text-[11px] font-medium text-hubee-750">Publicados</span>
              <p className="mt-0.5 text-xl font-extrabold tabular-nums text-hubee-900">
                {eventosPublicados}
              </p>
            </div>
          </div>

          <div className="flex items-end justify-between gap-3">
            <span aria-hidden="true" className="flex h-8 items-stretch gap-[2px]">
              {BARCODE.map((width, index) => (
                <span key={index} className="bg-hubee-800" style={{ width }} />
              ))}
            </span>
            <span className="text-xs font-semibold tabular-nums text-hubee-700">{codigo}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
