import {
  ASSISTANT_FIELDS,
  type AssistantDraft,
  type AssistantField,
  type AssistantQuestion,
  type AssistantTicketType,
  type AssistantTurnRequest,
  type AssistantTurnResponse,
} from "@/lib/api/event-ai-assistant.types";

export const ASSISTENTE_STORAGE_KEY = "hubee:assistente-evento";

export const CAMPOS_OBRIGATORIOS: readonly AssistantField[] = ["name", "start", "end", "venue"];

export const MENSAGEM_INICIAL =
  "Oi! Me conta sobre o evento que você quer criar: o que é, quando e onde vai ser, e como serão os ingressos. Eu vou perguntando o que faltar.";

export const MENSAGEM_FINAL =
  "Tudo pronto! O rascunho do evento está completo. Confira o resumo e, se quiser mudar algo, é só escrever.";

export type AutorMensagem = "assistente" | "organizador";

export interface MensagemAssistente {
  id: string;
  autor: AutorMensagem;
  texto: string;
}

export interface ConversaAssistente {
  draft: AssistantDraft | null;
  pergunta: AssistantQuestion | null;
  done: boolean;
  obrigatoriosFaltando: AssistantField[];
  mensagens: MensagemAssistente[];
}

export type EnvioAssistente = { tipo: "resposta"; texto: string } | { tipo: "pular" };

function mensagem(conversa: ConversaAssistente, autor: AutorMensagem, texto: string, deslocamento = 0) {
  return { id: String(conversa.mensagens.length + 1 + deslocamento), autor, texto };
}

export function conversaInicial(): ConversaAssistente {
  return {
    draft: null,
    pergunta: null,
    done: false,
    obrigatoriosFaltando: [...CAMPOS_OBRIGATORIOS],
    mensagens: [{ id: "1", autor: "assistente", texto: MENSAGEM_INICIAL }],
  };
}

export function registrarEnvio(conversa: ConversaAssistente, envio: EnvioAssistente): ConversaAssistente {
  const texto = envio.tipo === "pular" ? "Pular esta pergunta" : envio.texto.trim();
  return { ...conversa, mensagens: [...conversa.mensagens, mensagem(conversa, "organizador", texto)] };
}

export function montarRequisicao(conversa: ConversaAssistente, envio: EnvioAssistente): AssistantTurnRequest {
  const request: AssistantTurnRequest = {};
  if (conversa.draft) request.draft = conversa.draft;
  if (conversa.pergunta) request.field = conversa.pergunta.field;
  if (envio.tipo === "pular") request.skip = true;
  else request.answer = envio.texto.trim();
  return request;
}

export function aplicarRodada(conversa: ConversaAssistente, resposta: AssistantTurnResponse): ConversaAssistente {
  const novas: MensagemAssistente[] = [];
  if (resposta.reply) novas.push(mensagem(conversa, "assistente", resposta.reply));
  const proxima = resposta.question?.text ?? MENSAGEM_FINAL;
  novas.push(mensagem(conversa, "assistente", proxima, novas.length));

  return {
    draft: resposta.draft,
    pergunta: resposta.question,
    done: resposta.done,
    obrigatoriosFaltando: resposta.missingRequired,
    mensagens: [...conversa.mensagens, ...novas],
  };
}

export function podePular(conversa: ConversaAssistente): boolean {
  return Boolean(conversa.pergunta?.skippable);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isMensagem(value: unknown): value is MensagemAssistente {
  return (
    isRecord(value) &&
    typeof value.id === "string" &&
    (value.autor === "assistente" || value.autor === "organizador") &&
    typeof value.texto === "string"
  );
}

function isCampo(value: unknown): value is AssistantField {
  return (ASSISTANT_FIELDS as readonly unknown[]).includes(value);
}

function isPergunta(value: unknown): value is AssistantQuestion {
  return (
    isRecord(value) &&
    isCampo(value.field) &&
    typeof value.text === "string" &&
    typeof value.skippable === "boolean"
  );
}

function isDraft(value: unknown): value is AssistantDraft {
  return isRecord(value) && Array.isArray(value.ticketTypes) && Array.isArray(value.skipped);
}

export function lerConversaSalva(raw: string | null): ConversaAssistente | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return null;
    const { draft, pergunta, done, obrigatoriosFaltando, mensagens } = parsed;
    if (!Array.isArray(mensagens) || mensagens.length === 0 || !mensagens.every(isMensagem)) return null;
    if (draft !== null && !isDraft(draft)) return null;
    if (pergunta !== null && !isPergunta(pergunta)) return null;
    if (typeof done !== "boolean") return null;
    if (!Array.isArray(obrigatoriosFaltando) || !obrigatoriosFaltando.every(isCampo)) return null;
    return { draft, pergunta, done, obrigatoriosFaltando, mensagens };
  } catch {
    return null;
  }
}

export function formatarData(data: string): string {
  const [ano, mes, dia] = data.split("-");
  return `${dia}/${mes}/${ano}`;
}

function formatarMomento(data: string | null, hora: string | null): string | null {
  if (!data && !hora) return null;
  if (data && hora) return `${formatarData(data)} às ${hora}`;
  if (data) return `${formatarData(data)}, horário a definir`;
  return `às ${hora}, dia a definir`;
}

const MODALIDADE: Record<string, string> = {
  inteira: "inteira",
  meia: "meia",
  estudante: "estudante",
  vip: "VIP",
  cortesia: "cortesia",
};

export function formatarLote(lote: AssistantTicketType): string {
  const partes = [lote.batch];
  if (lote.modality) partes.push(MODALIDADE[lote.modality] ?? lote.modality);
  partes.push(
    lote.price === null
      ? "preço a definir"
      : lote.price === 0
        ? "gratuito"
        : lote.price.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
  );
  partes.push(
    lote.quantity === null ? "quantidade a definir" : `${lote.quantity} ${lote.quantity === 1 ? "ingresso" : "ingressos"}`,
  );
  return partes.join(" · ");
}

function formatarLocal(draft: AssistantDraft): string | null {
  const venue = draft.venue;
  if (!venue) return null;
  const cidade = [venue.city, venue.state].filter(Boolean).join("/");
  const partes = [venue.name, venue.address, cidade].filter((parte): parte is string => Boolean(parte));
  return partes.length > 0 ? partes.join(" · ") : null;
}

export interface ItemResumo {
  campo: AssistantField;
  rotulo: string;
  valores: string[];
  completo: boolean;
  pulado: boolean;
}

export function campoCompleto(draft: AssistantDraft | null, campo: AssistantField): boolean {
  if (!draft) return false;
  switch (campo) {
    case "name":
      return draft.name !== null;
    case "start":
      return draft.startDate !== null && draft.startTime !== null;
    case "end":
      return draft.endDate !== null && draft.endTime !== null;
    case "salesStart":
      return draft.salesStartDate !== null && draft.salesStartTime !== null;
    case "venue":
      return Boolean(draft.venue?.city && (draft.venue.name || draft.venue.address));
    case "ticketTypes":
      return (
        draft.ticketTypes.length > 0 &&
        draft.ticketTypes.every((lote) => lote.price !== null && lote.quantity !== null)
      );
    case "category":
      return draft.category !== null;
    case "ageRating":
      return draft.ageRating !== null;
    case "description":
      return draft.description !== null;
  }
}

const ROTULOS: Record<AssistantField, string> = {
  name: "Nome",
  start: "Início",
  end: "Término",
  venue: "Local",
  ticketTypes: "Ingressos",
  salesStart: "Início das vendas",
  category: "Categoria",
  ageRating: "Classificação",
  description: "Descrição",
};

export function resumoDoRascunho(
  draft: AssistantDraft | null,
  rotuloCategoria: (categoria: NonNullable<AssistantDraft["category"]>) => string,
): ItemResumo[] {
  const pulados = new Set(draft?.skipped ?? []);
  const valoresDe = (campo: AssistantField): (string | null)[] => {
    if (!draft) return [];
    switch (campo) {
      case "name":
        return [draft.name && draft.edition ? `${draft.name} · ${draft.edition}` : draft.name];
      case "start":
        return [formatarMomento(draft.startDate, draft.startTime)];
      case "end":
        return [formatarMomento(draft.endDate, draft.endTime)];
      case "venue":
        return [formatarLocal(draft)];
      case "ticketTypes":
        return draft.ticketTypes.map(formatarLote);
      case "salesStart":
        return [formatarMomento(draft.salesStartDate, draft.salesStartTime)];
      case "category":
        return [draft.category ? rotuloCategoria(draft.category) : null];
      case "ageRating":
        return [draft.ageRating === null ? null : draft.ageRating === "L" ? "Livre" : `${draft.ageRating} anos`];
      case "description":
        return [draft.description];
    }
  };

  return ASSISTANT_FIELDS.map((campo) => ({
    campo,
    rotulo: ROTULOS[campo],
    valores: valoresDe(campo).filter((valor): valor is string => Boolean(valor)),
    completo: campoCompleto(draft, campo),
    pulado: pulados.has(campo),
  }));
}
