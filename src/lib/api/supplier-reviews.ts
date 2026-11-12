/**
 * Avaliações de fornecedores (GOL-244).
 *
 * ⚠️ MOCK: a `hubee-api` ainda não expõe endpoints de avaliação. Este módulo simula
 * `GET /suppliers/:id/reviews` e `POST /suppliers/:id/reviews` em memória, com dados
 * determinísticos por fornecedor, para validar a interface. Quando o back-end existir,
 * troque o corpo das funções por chamadas ao `apiClient` mantendo as assinaturas.
 */
import { calcularNota } from "@/components/conta/fornecedores/avaliacoes/avaliacoes.data";
import { getOrganizerEvents } from "@/lib/api/events";
import type {
  AvaliacaoFornecedor,
  AvaliacaoFornecedorPayload,
  NotaEstrela,
  NotasPorCriterio,
} from "@/types/avaliacao-fornecedor";

/** Evento que pode ser vinculado a uma avaliação. */
export interface EventoAvaliavel {
  id: string;
  nome: string;
  data: string;
}

const LATENCIA_MS = 450;

const esperar = () => new Promise((resolve) => setTimeout(resolve, LATENCIA_MS));

const EVENTOS_MOCK: readonly EventoAvaliavel[] = [
  { id: "mock-evt-1", nome: "Semana de Computação UNIFESP 2026", data: "2026-10-12T19:00:00.000Z" },
  { id: "mock-evt-2", nome: "Festival Gastronômico de Outono", data: "2026-09-05T15:00:00.000Z" },
  { id: "mock-evt-3", nome: "Hackathon Hubee", data: "2026-08-22T12:00:00.000Z" },
  { id: "mock-evt-4", nome: "Show Beneficente Primavera", data: "2026-07-18T21:00:00.000Z" },
  { id: "mock-evt-5", nome: "Feira de Empreendedorismo", data: "2026-05-30T10:00:00.000Z" },
];

const AUTORES = ["Ana Souza", "Bruno Lima", "Carla Mendes", "Diego Rocha", "Fernanda Alves"];

const COMENTARIOS: readonly (string | null)[] = [
  "Equipe muito profissional, chegou antes do horário e entregou tudo como combinado.",
  "Bom serviço no geral, mas a montagem atrasou cerca de 40 minutos.",
  null,
  "Atendimento rápido pelo WhatsApp e preço dentro do orçamento. Contrataria de novo.",
  "Faltaram itens do pedido e tivemos dificuldade para falar com o responsável no dia.",
  "Superou as expectativas! Os participantes elogiaram bastante.",
];

/** Hash simples e estável do id, para que cada fornecedor tenha sempre as mesmas avaliações. */
function semente(texto: string): number {
  let hash = 0;
  for (const char of texto) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return hash;
}

function gerador(seed: number) {
  let estado = seed || 1;
  return () => {
    estado = (estado * 1103515245 + 12345) % 2147483648;
    return estado / 2147483648;
  };
}

function gerarAvaliacoes(supplierId: string): AvaliacaoFornecedor[] {
  const aleatorio = gerador(semente(supplierId));
  // ~1 em cada 5 fornecedores começa sem avaliações, para exibir o estado vazio.
  const quantidade = aleatorio() < 0.2 ? 0 : 2 + Math.floor(aleatorio() * 5);
  const base = 2 + aleatorio() * 3;

  return Array.from({ length: quantidade }, (_, index) => {
    const evento = EVENTOS_MOCK[index % EVENTOS_MOCK.length];
    const nota = (): NotaEstrela => Math.min(5, Math.max(1, Math.round(base + (aleatorio() - 0.4) * 2))) as NotaEstrela;
    const notas: NotasPorCriterio = {
      qualidade: nota(),
      pontualidade: nota(),
      comunicacao: nota(),
      custoBeneficio: nota(),
    };
    const media = calcularNota(notas);
    const criado = new Date(evento.data);
    criado.setDate(criado.getDate() + 2);

    return {
      id: `${supplierId}-review-${index}`,
      supplierId,
      eventId: evento.id,
      eventName: evento.nome,
      eventDate: evento.data,
      authorName: AUTORES[Math.floor(aleatorio() * AUTORES.length)],
      notas,
      nota: media,
      recomenda: media >= 3.5,
      comentario: COMENTARIOS[Math.floor(aleatorio() * COMENTARIOS.length)],
      createdAt: criado.toISOString(),
    };
  });
}

const store = new Map<string, AvaliacaoFornecedor[]>();

function avaliacoesDe(supplierId: string): AvaliacaoFornecedor[] {
  let lista = store.get(supplierId);
  if (!lista) {
    lista = gerarAvaliacoes(supplierId);
    store.set(supplierId, lista);
  }
  return lista;
}

export async function getSupplierReviews(supplierId: string): Promise<AvaliacaoFornecedor[]> {
  await esperar();
  return [...avaliacoesDe(supplierId)];
}

/** Média e total de vários fornecedores de uma vez, para a coluna "Avaliação" da listagem. */
export async function getSuppliersRating(
  supplierIds: readonly string[],
): Promise<Record<string, { media: number; total: number }>> {
  await esperar();
  return Object.fromEntries(
    supplierIds.map((id) => {
      const lista = avaliacoesDe(id);
      const soma = lista.reduce((acc, item) => acc + item.nota, 0);
      return [id, { total: lista.length, media: lista.length ? Math.round((soma / lista.length) * 10) / 10 : 0 }];
    }),
  );
}

export async function createSupplierReview(
  supplierId: string,
  payload: AvaliacaoFornecedorPayload,
  contexto: { authorName: string; evento: EventoAvaliavel },
): Promise<AvaliacaoFornecedor> {
  await esperar();
  const nova: AvaliacaoFornecedor = {
    id: `${supplierId}-review-${Date.now()}`,
    supplierId,
    eventId: payload.eventId,
    eventName: contexto.evento.nome,
    eventDate: contexto.evento.data,
    authorName: contexto.authorName,
    notas: payload.notas,
    nota: calcularNota(payload.notas),
    recomenda: payload.recomenda,
    comentario: payload.comentario ?? null,
    createdAt: new Date().toISOString(),
  };
  store.set(supplierId, [nova, ...avaliacoesDe(supplierId)]);
  return nova;
}

/**
 * Eventos da organização que podem ser avaliados (publicados ou encerrados).
 * Sem eventos reais disponíveis, devolve eventos de exemplo para a interface poder ser validada.
 */
export async function getReviewableEvents(organizerId: string): Promise<EventoAvaliavel[]> {
  try {
    const eventos = await getOrganizerEvents({ organizerId });
    const avaliaveis = eventos
      .filter((evento) => evento.status === "published" || evento.status === "finished")
      .map((evento) => ({ id: evento.id, nome: evento.nome, data: evento.dataInicio }));
    if (avaliaveis.length > 0) return avaliaveis;
  } catch {
    // Cai nos eventos de exemplo abaixo.
  }
  return [...EVENTOS_MOCK];
}
