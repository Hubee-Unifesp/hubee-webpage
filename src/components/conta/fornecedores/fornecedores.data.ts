import type { Fornecedor } from "@/types/fornecedor";
import type { PapelOrganizador } from "@/types/organizacao";

/** Valor do filtro de categoria que mostra todos os fornecedores. */
export const TODAS_CATEGORIAS = "all";

/** Sugestões do campo Categoria. A API aceita texto livre, então outras categorias também podem existir. */
export const CATEGORIAS_SUGERIDAS = ["Buffet", "Som e iluminação", "Fotografia", "Decoração", "Segurança"] as const;

/** Administradores e Membros gerenciam fornecedores. O papel Leitura só visualiza. */
export function canManageSuppliers(papel: PapelOrganizador): boolean {
  return papel === "administrador" || papel === "membro";
}

/** Categorias já usadas pelos fornecedores, sem repetição e em ordem alfabética, para o filtro. */
export function getCategorias(fornecedores: readonly Fornecedor[]): string[] {
  const categorias = new Set<string>();
  for (const { category } of fornecedores) {
    if (category) categorias.add(category);
  }
  return [...categorias].sort((a, b) => a.localeCompare(b, "pt-BR"));
}

function normalize(value: string): string {
  return value.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
}

/** Filtra por nome (`companyName`, ignorando acentos e caixa) e por categoria. */
export function filterFornecedores(
  fornecedores: readonly Fornecedor[],
  busca: string,
  categoria: string,
): Fornecedor[] {
  const termo = normalize(busca);
  return fornecedores.filter((fornecedor) => {
    const bateBusca = termo === "" || normalize(fornecedor.companyName).includes(termo);
    const bateCategoria = categoria === TODAS_CATEGORIAS || fornecedor.category === categoria;
    return bateBusca && bateCategoria;
  });
}

const criadoEm = "2026-10-01T12:00:00.000Z";

/** Dados de exemplo enquanto a integração com `/suppliers` não existe (fora do escopo da GOL-203). */
export const fornecedoresMock: readonly Fornecedor[] = [
  {
    id: "mock-1",
    companyName: "Buffet Sabor & Arte Ltda.",
    cnpjCpf: "12345678000195",
    phone: "11987654321",
    email: "contato@saborarte.com.br",
    category: "Buffet",
    createdAt: criadoEm,
    updatedAt: criadoEm,
  },
  {
    id: "mock-2",
    companyName: "Luz & Cena Produções Ltda.",
    cnpjCpf: "23456789000112",
    phone: "11998765432",
    email: "equipe@luzecena.com.br",
    category: "Som e iluminação",
    createdAt: criadoEm,
    updatedAt: criadoEm,
  },
  {
    id: "mock-3",
    companyName: "Mariana Costa Fotografia",
    cnpjCpf: "12345678909",
    phone: "11976543210",
    email: "mariana@mcosta.com.br",
    category: "Fotografia",
    createdAt: criadoEm,
    updatedAt: criadoEm,
  },
  {
    id: "mock-4",
    companyName: "Flor de Lis Decoração e Ambientação de Eventos Corporativos Ltda.",
    cnpjCpf: "34567890000130",
    phone: null,
    email: "oi@flordelis.com.br",
    category: "Decoração",
    createdAt: criadoEm,
    updatedAt: criadoEm,
  },
  {
    id: "mock-5",
    companyName: "Carlos Eduardo Santos",
    cnpjCpf: "98765432100",
    phone: "11965432109",
    email: null,
    category: "Segurança",
    createdAt: criadoEm,
    updatedAt: criadoEm,
  },
  {
    id: "mock-6",
    companyName: "Pronto Apoio Serviços Ltda.",
    cnpjCpf: "45678901000149",
    phone: null,
    email: null,
    category: null,
    createdAt: criadoEm,
    updatedAt: criadoEm,
  },
];
