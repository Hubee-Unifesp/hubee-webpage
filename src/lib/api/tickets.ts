import { apiClient } from "./apiClient";
import { apiClient as publicClient } from "./client";
import { toCategory, type ApiEvent } from "./events";
import { ticketTypeLabel } from "./orders";
import type { ApiMyTicket, ApiTicketEvent } from "./orders.types";
import type { MeuIngresso, MeusIngressos } from "@/types/ingresso";
import type { EventoPedido } from "@/types/pedido";

/** Categoria e descrição do evento, os dois campos que o ingresso não traz aninhados. */
interface ComplementoEvento {
  categoria: EventoPedido["categoria"];
  descricao: string;
}

/**
 * `GET /users/me/tickets` devolve o ingresso com evento, local e lote aninhados, então a lista
 * sai de uma requisição só. Faltam apenas a categoria e a descrição do evento, buscadas à parte
 * (uma vez por evento) e opcionais: se não vierem, o ingresso aparece sem a categoria, não quebra.
 */
export async function getMeusIngressos(now = new Date()): Promise<MeusIngressos> {
  const { data: tickets } = await apiClient.get<ApiMyTicket[]>("/users/me/tickets");
  const complementos = await carregarComplementos(tickets.map((ticket) => ticket.eventId));

  const ingressos = tickets.map<MeuIngresso>((ticket) => ({
    id: ticket.id,
    codigo: ticket.qrCode,
    status: ticket.status,
    tipo: ticketTypeLabel(ticket.ticketType),
    valor: ticket.ticketType ? Number(ticket.ticketType.price) : null,
    pedidoId: ticket.orderId,
    pedidoNumero: ticket.orderId.slice(0, 8).toUpperCase(),
    evento: toEvento(ticket.event, complementos.get(ticket.eventId)),
  }));

  return agruparIngressos(ingressos, now);
}

function toEvento(
  event: ApiTicketEvent | null | undefined,
  complemento: ComplementoEvento | undefined,
): EventoPedido | null {
  if (!event) return null;

  return {
    id: event.id,
    nome: event.name,
    descricao: complemento?.descricao ?? "",
    categoria: complemento?.categoria ?? toCategory(null),
    local: toLocal(event),
    dataInicio: event.startDate,
    dataFim: event.endDate,
  };
}

/** "Local · Cidade" quando a cidade vem; só o nome do local caso contrário. */
function toLocal({ venue }: ApiTicketEvent): string {
  if (!venue) return "";
  const city = venue.address?.city;
  return city ? `${venue.name} · ${city}` : venue.name;
}

async function carregarComplementos(
  eventIds: readonly string[],
): Promise<Map<string, ComplementoEvento>> {
  const unicos = [...new Set(eventIds)];
  const encontrados = await Promise.all(
    unicos.map(async (eventId) => {
      try {
        const { data } = await publicClient.get<ApiEvent>(`/events/${eventId}`);
        return [eventId, { categoria: toCategory(data.category), descricao: data.description ?? "" }] as const;
      } catch {
        return null;
      }
    }),
  );

  return new Map(encontrados.filter((item) => item !== null));
}

/**
 * Próximos: ingressos válidos de eventos que ainda não terminaram, do mais perto ao mais longe.
 * Anteriores: usados, cancelados ou de eventos encerrados, do mais recente ao mais antigo.
 * Sem o evento não dá para saber a data, então o ingresso válido fica no fim dos próximos.
 */
export function agruparIngressos(ingressos: readonly MeuIngresso[], now: Date): MeusIngressos {
  const encerrado = ({ evento }: MeuIngresso) => evento !== null && new Date(evento.dataFim) <= now;
  const inicio = ({ evento }: MeuIngresso) => evento?.dataInicio ?? "\uffff";

  return {
    proximos: ingressos
      .filter((ingresso) => ingresso.status === "emitido" && !encerrado(ingresso))
      .toSorted((a, b) => inicio(a).localeCompare(inicio(b))),
    anteriores: ingressos
      .filter((ingresso) => ingresso.status !== "emitido" || encerrado(ingresso))
      .toSorted((a, b) => inicio(b).localeCompare(inicio(a))),
  };
}
