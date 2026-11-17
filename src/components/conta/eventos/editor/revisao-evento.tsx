"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, CircleAlert, CircleMinus } from "lucide-react";
import { EventMedia } from "@/components/home/events/event-media";
import { formatEventDate, formatPrice } from "@/components/home/events/format";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { EventoEditavel, LocalEvento } from "@/types/evento-editor";
import {
  acoesEtapaClassName,
  botaoPrimarioClassName,
  botaoSecundarioClassName,
  botaoTextoClassName,
  cartaoClassName,
} from "./estilos";
import { getPendenciasPublicacao, podePublicar, type EstadoPendencia } from "./evento-editor.data";

interface RevisaoEventoProps {
  evento: EventoEditavel;
  local: LocalEvento | null;
  somenteLeitura: boolean;
  acabouDePublicar: boolean;
  onVoltar: () => void;
  onPublicar: () => void;
}

const vendasFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeStyle: "short" });

const iconePendencia: Record<EstadoPendencia, { icon: typeof Check; label: string; className: string }> = {
  ok: { icon: Check, label: "Concluído", className: "text-emerald-700 dark:text-emerald-300" },
  pendente: { icon: CircleAlert, label: "Pendente", className: "text-red-700 dark:text-red-300" },
  recomendado: { icon: CircleMinus, label: "Recomendado", className: "text-amber-700 dark:text-amber-300" },
};

function getMensagemVendas(salesStartDate: string | null): string {
  if (salesStartDate && new Date(salesStartDate).getTime() > Date.now()) {
    return `Ele já aparece na busca e as vendas abrem em ${vendasFormatter.format(new Date(salesStartDate))}.`;
  }
  return "Ele já aparece na busca e os ingressos já podem ser comprados.";
}

export function RevisaoEvento({
  evento,
  local,
  somenteLeitura,
  acabouDePublicar,
  onVoltar,
  onPublicar,
}: RevisaoEventoProps) {
  const pendencias = getPendenciasPublicacao(evento, local);
  const liberado = podePublicar(pendencias);
  const motivoBloqueio = pendencias.find((item) => item.estado === "pendente")?.descricao;
  const rascunho = evento.status === "draft";

  return (
    <div className="flex flex-col gap-4">
      {acabouDePublicar && evento.status === "published" && (
        <p
          role="status"
          className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-200"
        >
          <Check aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          <span>
            <strong>Evento publicado.</strong> {getMensagemVendas(evento.salesStartDate)}
          </span>
        </p>
      )}

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <section aria-labelledby="revisao-titulo" className={cartaoClassName}>
          <h2 id="revisao-titulo" className="text-base font-semibold">
            Antes de publicar
          </h2>
          <ul className="mt-3">
            {pendencias.map((item) => {
              const { icon: Icon, label, className } = iconePendencia[item.estado];
              return (
                <li
                  key={item.id}
                  className="flex items-start gap-2.5 border-t border-hubee-200 py-2.5 first:border-t-0 first:pt-0 dark:border-hubee-50/10"
                >
                  <Icon role="img" aria-label={label} className={cn("mt-0.5 size-4.5 shrink-0", className)} />
                  <span className="text-sm">
                    <span className="block font-semibold">{item.titulo}</span>
                    {item.descricao}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="previa-titulo" className={cartaoClassName}>
          <div className="relative aspect-video overflow-hidden rounded-lg">
            {evento.photoUrl ? (
              <Image src={evento.photoUrl} alt="" fill unoptimized sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
            ) : (
              <EventMedia category={evento.category ?? "outros"} startDate={evento.startDate} className="size-full" />
            )}
          </div>
          <h2 id="previa-titulo" className="mt-3 text-base font-semibold break-words">
            {evento.name}
          </h2>
          <p className="text-xs">{formatEventDate(evento.startDate, evento.endDate)}</p>
          {local && <p className="text-xs">{local.nome}</p>}
          {evento.lotes.length > 0 && (
            <ul className="mt-3 text-sm">
              {evento.lotes.map((lote) => (
                <li
                  key={lote.id}
                  className="flex justify-between gap-3 border-t border-hubee-200 py-2 dark:border-hubee-50/10"
                >
                  <span className="min-w-0 break-words">{lote.batch}</span>
                  <span className="shrink-0 font-semibold">{formatPrice(lote.price)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className={acoesEtapaClassName}>
        <Button type="button" onClick={onVoltar} className={cn(botaoTextoClassName, "bg-transparent sm:mr-auto")}>
          Voltar
        </Button>
        {rascunho && !somenteLeitura ? (
          <>
            <Button asChild className={botaoSecundarioClassName}>
              <Link href="/meus-eventos">Salvar e sair</Link>
            </Button>
            <Button
              type="button"
              onClick={onPublicar}
              disabled={!liberado}
              title={motivoBloqueio}
              className={botaoPrimarioClassName}
            >
              Publicar evento
            </Button>
          </>
        ) : (
          <Button asChild className={botaoPrimarioClassName}>
            <Link href="/meus-eventos">Voltar para Meus Eventos</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
