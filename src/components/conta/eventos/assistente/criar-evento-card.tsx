"use client";

import { AlertTriangle, Building2, CalendarPlus, Loader2, MapPin, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { EventoCriado } from "@/hooks/useCriarEventoAssistente";
import { useCriarEventoAssistente } from "@/hooks/useCriarEventoAssistente";
import type { AssistantDraft } from "@/lib/api/event-ai-assistant.types";
import { separarLotes } from "@/lib/assistente-evento-criacao";
import { cn } from "@/lib/utils";
import { CadastrarLocalModal } from "../editor/cadastrar-local-modal";
import { canEditEvent } from "../editor/evento-editor.data";
import { botaoPrimarioClassName, cartaoClassName } from "../editor/estilos";

interface CriarEventoCardProps {
  draft: AssistantDraft | null;
  onCriado: (resultado: EventoCriado) => void;
}

function Linha({ icone: Icone, children }: { icone: typeof MapPin; children: React.ReactNode }) {
  return (
    <li className="flex gap-2.5 text-sm">
      <Icone aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-hubee-700 dark:text-hubee-400" />
      <span>{children}</span>
    </li>
  );
}

export function CriarEventoCard({ draft, onCriado }: CriarEventoCardProps) {
  const {
    organizacaoAtiva,
    pronto,
    carregandoLocais,
    localExistente,
    valoresLocal,
    criando,
    erro,
    modalLocalAberto,
    setModalLocalAberto,
    criar,
    cadastrarLocal,
  } = useCriarEventoAssistente(draft, onCriado);

  if (!draft) return null;

  const podeCriar = organizacaoAtiva !== null && canEditEvent(organizacaoAtiva.papel);
  const { completos, incompletos } = separarLotes(draft);
  const textoLotes =
    draft.ticketTypes.length === 0
      ? "Nenhum lote informado. Você cria os lotes no editor."
      : [
          completos.length > 0 &&
            `${completos.length} ${completos.length === 1 ? "lote será criado" : "lotes serão criados"}`,
          incompletos.length > 0 &&
            `${incompletos.length} ${incompletos.length === 1 ? "lote incompleto fica" : "lotes incompletos ficam"} como sugestão no editor`,
        ]
          .filter(Boolean)
          .join(" e ") + ".";

  return (
    <section
      aria-labelledby="criar-evento-titulo"
      className={cn(cartaoClassName, "flex flex-col gap-4 border-hubee-400 dark:border-hubee-400/40")}
    >
      <div className="flex flex-col gap-1">
        <h2 id="criar-evento-titulo" className="text-base font-bold">
          Criar o rascunho do evento
        </h2>
        <p className="text-xs text-hubee-neutral-300 dark:text-hubee-200">
          O evento é salvo como rascunho e nada é publicado. Depois você revisa tudo no editor e adiciona a capa.
        </p>
      </div>

      <ul className="flex flex-col gap-2.5">
        <Linha icone={Building2}>
          Organização: <strong>{organizacaoAtiva?.nome ?? "nenhuma organização ativa"}</strong>
        </Linha>
        <Linha icone={MapPin}>
          {carregandoLocais
            ? "Procurando o local entre os já cadastrados..."
            : localExistente
              ? (
                  <>
                    Local já cadastrado: <strong>{localExistente.nome}</strong>
                  </>
                )
              : "O local ainda não está cadastrado. Ao criar, você completa o endereço e a capacidade."}
        </Linha>
        <Linha icone={Ticket}>{textoLotes}</Linha>
      </ul>

      {!podeCriar && organizacaoAtiva && (
        <p className="flex items-start gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-xs text-amber-900 dark:bg-amber-950/60 dark:text-amber-100">
          <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          Seu papel em {organizacaoAtiva.nome} é de leitura. Troque a organização ativa em Meus eventos para criar o
          evento.
        </p>
      )}

      {erro && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-600/50 bg-red-50 px-3 py-2.5 text-xs text-red-800 dark:border-red-400/50 dark:bg-red-950/50 dark:text-red-200"
        >
          <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {erro}
        </p>
      )}

      <Button
        type="button"
        disabled={!pronto || !podeCriar || carregandoLocais || criando}
        onClick={criar}
        className={cn(botaoPrimarioClassName, "self-start")}
      >
        {criando ? (
          <Loader2 aria-hidden="true" className="size-4 animate-spin motion-reduce:animate-none" />
        ) : (
          <CalendarPlus aria-hidden="true" className="size-4" />
        )}
        {criando ? "Criando rascunho..." : "Criar rascunho do evento"}
      </Button>

      <CadastrarLocalModal
        open={modalLocalAberto}
        onOpenChange={setModalLocalAberto}
        onSubmit={cadastrarLocal}
        valoresIniciais={valoresLocal}
        descricao="Complete o endereço e a capacidade do local. Em seguida, o rascunho do evento é criado."
      />
    </section>
  );
}
