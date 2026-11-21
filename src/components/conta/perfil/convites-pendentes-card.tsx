"use client";

import { useState } from "react";
import { Check, CircleAlert, Loader2, Mail } from "lucide-react";
import { PapelMembroBadge } from "@/components/conta/membros/membro-badges";
import { Button } from "@/components/ui/button";
import type { ConviteOrganizacaoPendente } from "@/types/membro-organizacao";
import type { OrganizationAccessLevel } from "@/types/usuario";

export type ConvitesPendentesStatus = "loading" | "error" | "ok";

const LEVEL_PERMISSIONS_SUMMARY: Record<OrganizationAccessLevel, string> = {
  manage: "Gerencia a organização · Cria, edita e cancela eventos",
  write: "Cria e edita eventos · Não altera membros nem organização",
  read: "Somente consulta · Visualiza eventos e métricas",
};

interface ConvitesPendentesCardProps {
  convites?: readonly ConviteOrganizacaoPendente[];
  status?: ConvitesPendentesStatus;
  onRetry?: () => void;
  onResponder?: (convite: ConviteOrganizacaoPendente, resposta: "ACCEPTED" | "DECLINED") => Promise<void>;
}

/**
 * Bloco de convites pendentes de organização exibido no topo de `/conta/perfil` (GOL-274 / GOL-277).
 * Segue o mesmo padrão visual do banner "Complete seu perfil" e só ocupa espaço quando carregando,
 * com erro ou havendo convites pendentes.
 */
export function ConvitesPendentesCard({
  convites = [],
  status = "ok",
  onRetry,
  onResponder,
}: ConvitesPendentesCardProps) {
  const [respondendo, setRespondendo] = useState<{ id: string; acao: "ACCEPTED" | "DECLINED" } | null>(null);

  if (status === "loading") {
    return (
      <section
        role="status"
        aria-live="polite"
        className="flex flex-col gap-3 rounded-xl border border-hubee-400/70 bg-hubee-200/70 p-4 dark:border-amber-700/70 dark:bg-hubee-850"
      >
        <span className="sr-only">Carregando convites pendentes...</span>
        <div className="h-4 w-48 animate-pulse rounded bg-hubee-300/80 motion-reduce:animate-none dark:bg-hubee-50/15" />
        <div className="h-16 w-full animate-pulse rounded-lg bg-hubee-50/80 motion-reduce:animate-none dark:bg-hubee-900/70" />
      </section>
    );
  }

  if (status === "error") {
    return (
      <section
        role="alert"
        className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-xs text-red-800 dark:border-red-800 dark:bg-red-950/70 dark:text-red-200"
      >
        <div className="flex items-center gap-2.5">
          <CircleAlert aria-hidden="true" className="size-4 shrink-0" />
          <span>Não foi possível verificar seus convites pendentes de organização.</span>
        </div>
        {onRetry && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={onRetry}
            className="h-8 cursor-pointer border-red-300 bg-transparent text-xs font-semibold text-red-800 hover:bg-red-100 dark:border-red-700 dark:text-red-200 dark:hover:bg-red-900/50"
          >
            Tentar novamente
          </Button>
        )}
      </section>
    );
  }

  if (convites.length === 0) return null;

  async function responder(convite: ConviteOrganizacaoPendente, acao: "ACCEPTED" | "DECLINED") {
    if (!onResponder) return;
    setRespondendo({ id: convite.id, acao });
    try {
      await onResponder(convite, acao);
    } finally {
      setRespondendo(null);
    }
  }

  return (
    <section
      aria-labelledby="convites-pendentes-titulo"
      className="flex flex-col gap-3 rounded-xl border border-hubee-400 bg-hubee-200 p-4 text-hubee-750 dark:border-amber-700 dark:bg-hubee-850 dark:text-hubee-100"
    >
      <div className="flex items-start gap-3">
        <Mail aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-hubee-600 dark:text-hubee-400" />
        <div className="flex flex-col gap-0.5">
          <h2 id="convites-pendentes-titulo" className="text-sm font-semibold text-hubee-800 dark:text-hubee-50">
            Convites pendentes de organização
          </h2>
          <p className="text-xs">
            Você foi convidado para fazer parte de uma equipe. Aceite para liberar o painel da organização.
          </p>
        </div>
      </div>

      <ul className="flex flex-col gap-2.5">
        {convites.map((convite) => {
          const processandoEste = respondendo?.id === convite.id;
          const aceitando = processandoEste && respondendo?.acao === "ACCEPTED";
          const recusando = processandoEste && respondendo?.acao === "DECLINED";

          return (
            <li
              key={convite.id}
              className="flex flex-col justify-between gap-3 rounded-lg border border-hubee-300/80 bg-hubee-50 p-3.5 sm:flex-row sm:items-center dark:border-hubee-50/15 dark:bg-hubee-900"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-sm font-bold text-hubee-800 dark:text-hubee-50">
                    {convite.organizationName}
                  </span>
                  <PapelMembroBadge level={convite.level} prefix="Papel" />
                </div>
                <p className="mt-1 text-xs text-hubee-neutral-300 dark:text-hubee-200">
                  {LEVEL_PERMISSIONS_SUMMARY[convite.level]}
                  {convite.invitedByEmail && ` · Convidado por ${convite.invitedByEmail}`}
                </p>
              </div>

              <div className="grid shrink-0 grid-cols-2 gap-2 sm:flex sm:items-center">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={processandoEste || !onResponder}
                  aria-busy={recusando}
                  onClick={() => void responder(convite, "DECLINED")}
                  className="h-8 cursor-pointer rounded-lg border-hubee-300 bg-white px-3 text-xs font-semibold text-hubee-800 hover:bg-hubee-100 dark:border-hubee-50/20 dark:bg-transparent dark:text-hubee-50 dark:hover:bg-hubee-50/10"
                >
                  {recusando && <Loader2 aria-hidden="true" className="size-3.5 animate-spin motion-reduce:animate-none" />}
                  Recusar
                </Button>
                <Button
                  type="button"
                  size="sm"
                  disabled={processandoEste || !onResponder}
                  aria-busy={aceitando}
                  onClick={() => void responder(convite, "ACCEPTED")}
                  className="h-8 cursor-pointer rounded-lg bg-hubee-800 px-3 text-xs font-semibold text-hubee-50 hover:bg-hubee-900 dark:bg-hubee-400 dark:text-hubee-900 dark:hover:bg-hubee-300"
                >
                  {aceitando ? (
                    <Loader2 aria-hidden="true" className="size-3.5 animate-spin motion-reduce:animate-none" />
                  ) : (
                    <Check aria-hidden="true" className="size-3.5" />
                  )}
                  Aceitar
                </Button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
