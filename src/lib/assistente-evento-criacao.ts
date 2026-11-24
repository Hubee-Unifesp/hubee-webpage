import type { AssistantDraft, AssistantTicketType, AssistantVenue } from "@/lib/api/event-ai-assistant.types";
import type { LocalComEndereco } from "@/lib/api/venues";
import { UFS, type VenueFormInputs } from "@/lib/validations/venue.schema";
import type { EventoPayload } from "@/types/evento-editor";
import type { LotePayload } from "@/types/lote-ingresso";

const FUSO_BRASILIA = "-03:00";

export function paraIso(data: string, hora: string): string {
  return `${data}T${hora}:00${FUSO_BRASILIA}`;
}

export function rascunhoProntoParaCriar(draft: AssistantDraft | null): draft is AssistantDraft & {
  name: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  venue: AssistantVenue;
} {
  return Boolean(
    draft?.name &&
      draft.startDate &&
      draft.startTime &&
      draft.endDate &&
      draft.endTime &&
      draft.venue?.city &&
      (draft.venue.name || draft.venue.address),
  );
}

export function montarPayloadEvento(
  draft: AssistantDraft,
  organizerId: string,
  venueId: string,
): EventoPayload {
  if (!rascunhoProntoParaCriar(draft)) throw new Error("Rascunho incompleto.");
  const payload: EventoPayload = {
    name: draft.name,
    organizerId,
    venueId,
    startDate: paraIso(draft.startDate, draft.startTime),
    endDate: paraIso(draft.endDate, draft.endTime),
  };
  if (draft.salesStartDate && draft.salesStartTime) {
    payload.salesStartDate = paraIso(draft.salesStartDate, draft.salesStartTime);
  }
  if (draft.description) payload.description = draft.description;
  if (draft.category) payload.category = draft.category;
  if (draft.edition) payload.edition = draft.edition;
  if (draft.ageRating) payload.ageRating = draft.ageRating;
  return payload;
}

export function separarLotes(draft: AssistantDraft): {
  completos: LotePayload[];
  incompletos: AssistantTicketType[];
} {
  const completos: LotePayload[] = [];
  const incompletos: AssistantTicketType[] = [];
  for (const lote of draft.ticketTypes) {
    if (lote.price === null || lote.quantity === null) {
      incompletos.push(lote);
      continue;
    }
    completos.push({
      batch: lote.batch,
      modality: lote.modality ?? "inteira",
      price: lote.price,
      quantity: lote.quantity,
      salesStartDate: null,
      salesEndDate: null,
    });
  }
  return { completos, incompletos };
}

const ABREVIACOES: [RegExp, string][] = [
  [/\bav\b\.?/g, "avenida"],
  [/\br\b\.?/g, "rua"],
  [/\bal\b\.?/g, "alameda"],
  [/\bpca\b\.?/g, "praca"],
  [/\bestr\b\.?/g, "estrada"],
  [/\brod\b\.?/g, "rodovia"],
];

export function normalizarTexto(texto: string): string {
  const base = texto
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ");
  return ABREVIACOES.reduce((atual, [padrao, troca]) => atual.replace(padrao, troca), base)
    .replace(/\s+/g, " ")
    .trim();
}

export interface EnderecoSeparado {
  rua: string;
  numero: string;
  bairro: string;
}

export function separarEndereco(endereco: string | null): EnderecoSeparado {
  if (!endereco) return { rua: "", numero: "", bairro: "" };
  const partes = endereco
    .split(/,|\s-\s/)
    .map((parte) => parte.trim())
    .filter(Boolean);
  const [primeira = "", ...resto] = partes;

  let rua = primeira;
  let numero = "";
  const numeroNaRua = /^(.*\D)\s+(\d+[A-Za-z]?)$/.exec(primeira);
  if (numeroNaRua) {
    rua = numeroNaRua[1].trim();
    numero = numeroNaRua[2];
  }

  const bairros: string[] = [];
  for (const parte of resto) {
    const somenteNumero = /^(?:n[ºo°.]?\s*)?(\d+[A-Za-z]?)$/i.exec(parte);
    if (somenteNumero && !numero) numero = somenteNumero[1];
    else bairros.push(parte);
  }
  return { rua, numero, bairro: bairros[0] ?? "" };
}

export function encontrarLocal(
  venue: AssistantVenue | null,
  locais: readonly LocalComEndereco[],
): LocalComEndereco | null {
  if (!venue?.city) return null;
  const cidade = normalizarTexto(venue.city);
  const daCidade = locais.filter((local) => local.cidade && normalizarTexto(local.cidade) === cidade);

  if (venue.name) {
    const nome = normalizarTexto(venue.name);
    const porNome = daCidade.find((local) => normalizarTexto(local.nome) === nome);
    if (porNome) return porNome;
  }

  if (venue.address) {
    const { rua, numero } = separarEndereco(venue.address);
    const ruaNormalizada = normalizarTexto(rua);
    if (!ruaNormalizada) return null;
    return (
      daCidade.find(
        (local) =>
          local.rua !== null &&
          normalizarTexto(local.rua) === ruaNormalizada &&
          (!numero || !local.numero || normalizarTexto(local.numero) === normalizarTexto(numero)),
      ) ?? null
    );
  }

  return null;
}

export function valoresIniciaisDoLocal(venue: AssistantVenue | null): Partial<VenueFormInputs> {
  if (!venue) return {};
  const { rua, numero, bairro } = separarEndereco(venue.address);
  const uf = venue.state?.toUpperCase() ?? "";
  const ufValida = UFS.find((sigla) => sigla === uf) ?? "";
  return {
    name: venue.name ?? rua,
    street: rua,
    number: numero,
    neighborhood: bairro,
    city: venue.city ?? "",
    state: ufValida,
  };
}
