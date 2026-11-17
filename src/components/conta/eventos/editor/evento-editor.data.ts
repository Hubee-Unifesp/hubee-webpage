import type { EventoEditavel, LocalEvento, LoteEvento } from "@/types/evento-editor";
import type { PapelOrganizador, StatusEvento } from "@/types/organizacao";

export type EtapaEvento = "dados" | "lotes" | "revisao";

export function isEtapaEvento(valor: unknown): valor is EtapaEvento {
  return valor === "dados" || valor === "lotes" || valor === "revisao";
}

export const etapasEvento: readonly { id: EtapaEvento; label: string }[] = [
  { id: "dados", label: "Dados do evento" },
  { id: "lotes", label: "Ingressos" },
  { id: "revisao", label: "Revisão" },
];

export const CAPA_MAX_BYTES = 2 * 1024 * 1024;
export const CAPA_TIPOS_ACEITOS = ["image/jpeg", "image/png"] as const;

export function canEditEvent(papel: PapelOrganizador, status?: StatusEvento): boolean {
  return (papel === "administrador" || papel === "membro") && status !== "cancelled";
}

export function validarCapa(arquivo: { type: string; size: number }): string | null {
  if (!(CAPA_TIPOS_ACEITOS as readonly string[]).includes(arquivo.type)) {
    return "Formato inválido. Use uma imagem .jpg, .png ou .jpeg.";
  }
  if (arquivo.size > CAPA_MAX_BYTES) return "A imagem deve ter no máximo 2MB.";
  return null;
}

export const CAPA_PROPORCAO = 16 / 9;
export const CAPA_TOLERANCIA_PROPORCAO = 0.02;

export function validarProporcaoCapa(largura: number, altura: number): string | null {
  if (largura <= 0 || altura <= 0) return "Não foi possível ler a imagem. Tente outro arquivo.";
  const desvio = Math.abs(largura / altura - CAPA_PROPORCAO) / CAPA_PROPORCAO;
  return desvio > CAPA_TOLERANCIA_PROPORCAO ? "A imagem deve ter proporção 16:9 (ex.: 1600 × 900 px)." : null;
}

export interface ResumoCapacidade {
  total: number;
  capacidade: number;
  livres: number;
  excedente: number;
  percentual: number;
}

export function getResumoCapacidade(lotes: readonly LoteEvento[], capacidade: number): ResumoCapacidade {
  const total = lotes.reduce((soma, lote) => soma + lote.quantity, 0);
  return {
    total,
    capacidade,
    livres: Math.max(0, capacidade - total),
    excedente: Math.max(0, total - capacidade),
    percentual: capacidade > 0 ? Math.min(100, Math.round((total / capacidade) * 100)) : 0,
  };
}

export type EstadoPendencia = "ok" | "pendente" | "recomendado";

export interface PendenciaPublicacao {
  id: "dados" | "lotes" | "capacidade" | "capa";
  titulo: string;
  descricao: string;
  estado: EstadoPendencia;
}

export function getPendenciasPublicacao(evento: EventoEditavel, local: LocalEvento | null): PendenciaPublicacao[] {
  const quantidadeLotes = evento.lotes.length;
  const excedido = local !== null && getResumoCapacidade(evento.lotes, local.capacidade).excedente > 0;

  return [
    {
      id: "dados",
      titulo: "Dados do evento",
      descricao: "Nome, datas e local preenchidos.",
      estado: "ok",
    },
    {
      id: "lotes",
      titulo: "Ingressos",
      descricao:
        quantidadeLotes === 0
          ? "Crie pelo menos um lote para publicar."
          : `${quantidadeLotes} ${quantidadeLotes === 1 ? "lote criado" : "lotes criados"}.`,
      estado: quantidadeLotes === 0 ? "pendente" : "ok",
    },
    {
      id: "capacidade",
      titulo: "Capacidade",
      descricao: excedido
        ? "Os lotes passam da capacidade do local. Reduza a quantidade de ingressos para publicar."
        : "Os lotes cabem na capacidade do local.",
      estado: excedido ? "pendente" : "ok",
    },
    {
      id: "capa",
      titulo: "Capa",
      descricao: evento.photoUrl ? "Imagem enviada." : "Recomendada, mas não obrigatória.",
      estado: evento.photoUrl ? "ok" : "recomendado",
    },
  ];
}

export function podePublicar(pendencias: readonly PendenciaPublicacao[]): boolean {
  return pendencias.every((item) => item.estado !== "pendente");
}
