import { AxiosError, type InternalAxiosRequestConfig } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  canManageSuppliers,
  filterFornecedores,
  formatarNotaMedia,
  getCategorias,
  temAvaliacao,
  TODAS_AVALIACOES,
  TODAS_CATEGORIAS,
} from "@/components/conta/fornecedores/fornecedores.data";
import type { Fornecedor, FornecedorPayload } from "@/types/fornecedor";

const { getMock, postMock, patchMock, deleteMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
  patchMock: vi.fn(),
  deleteMock: vi.fn(),
}));

vi.mock("./apiClient", () => ({
  apiClient: {
    get: getMock,
    post: postMock,
    patch: patchMock,
    delete: deleteMock,
  },
}));

import {
  createSupplier,
  deleteSupplier,
  FornecedorDuplicadoError,
  getSupplierById,
  getSuppliers,
  updateSupplier,
} from "./suppliers";

const mockSupplier: Fornecedor = {
  id: "sup-1",
  companyName: "Buffet Sabor & Arte Ltda.",
  cnpjCpf: "12345678000195",
  phone: "11987654321",
  email: "contato@saborarte.com.br",
  category: "Buffet",
  createdAt: "2026-10-01T12:00:00.000Z",
  updatedAt: "2026-10-01T12:00:00.000Z",
};

const mockPayload: FornecedorPayload = {
  companyName: "Buffet Sabor & Arte Ltda.",
  cnpjCpf: "12345678000195",
  phone: "11987654321",
  email: "contato@saborarte.com.br",
  category: "Buffet",
};

function makeAxiosError(status: number, message?: string | string[]) {
  const config = { headers: {} } as InternalAxiosRequestConfig;
  return new AxiosError("Request failed", String(status), config, undefined, {
    status,
    statusText: String(status),
    headers: {},
    config,
    data: message !== undefined ? { message } : {},
  });
}

describe("suppliers API", () => {
  beforeEach(() => {
    getMock.mockReset();
    postMock.mockReset();
    patchMock.mockReset();
    deleteMock.mockReset();
  });

  describe("getSuppliers", () => {
    it("lista todos os fornecedores ativos em GET /suppliers sem query params", async () => {
      getMock.mockResolvedValueOnce({ data: [mockSupplier] });

      const result = await getSuppliers();

      expect(getMock).toHaveBeenCalledWith("/suppliers");
      expect(result).toEqual([mockSupplier]);
    });

    it("envia search e category com trim quando preenchidos", async () => {
      getMock.mockResolvedValueOnce({ data: [mockSupplier] });

      const result = await getSuppliers({ search: "  Buffet  ", category: "  Buffet " });

      expect(getMock).toHaveBeenCalledWith("/suppliers", {
        params: { search: "Buffet", category: "Buffet" },
      });
      expect(result).toEqual([mockSupplier]);
    });

    it("omite search e category quando vazios ou apenas com espaços", async () => {
      getMock.mockResolvedValueOnce({ data: [mockSupplier] });

      await getSuppliers({ search: "   ", category: "" });

      expect(getMock).toHaveBeenCalledWith("/suppliers");
    });
  });

  describe("getSupplierById", () => {
    it("busca fornecedor por id em GET /suppliers/:id", async () => {
      getMock.mockResolvedValueOnce({ data: mockSupplier });

      const result = await getSupplierById("sup-1");

      expect(getMock).toHaveBeenCalledWith("/suppliers/sup-1");
      expect(result).toEqual(mockSupplier);
    });
  });

  describe("createSupplier", () => {
    it("cria fornecedor em POST /suppliers e retorna o registro criado", async () => {
      postMock.mockResolvedValueOnce({ data: mockSupplier });

      const result = await createSupplier(mockPayload);

      expect(postMock).toHaveBeenCalledWith("/suppliers", mockPayload);
      expect(result).toEqual(mockSupplier);
    });

    it("converte 409 Conflict em FornecedorDuplicadoError preservando a mensagem da API", async () => {
      postMock.mockRejectedValueOnce(
        makeAxiosError(409, "Já existe um fornecedor com este CNPJ/CPF ou E-mail."),
      );

      await expect(createSupplier(mockPayload)).rejects.toThrow(FornecedorDuplicadoError);
    });

    it("usa mensagem padrão em FornecedorDuplicadoError quando 409 vem sem texto", async () => {
      postMock.mockRejectedValueOnce(makeAxiosError(409));

      await expect(createSupplier(mockPayload)).rejects.toThrow(
        "Já existe um fornecedor com este CNPJ/CPF ou E-mail.",
      );
    });

    it("propaga erros diferentes de 409 sem converter", async () => {
      const serverError = makeAxiosError(500, "Erro interno");
      postMock.mockRejectedValueOnce(serverError);

      await expect(createSupplier(mockPayload)).rejects.toBe(serverError);
    });
  });

  describe("updateSupplier", () => {
    it("atualiza fornecedor em PATCH /suppliers/:id e retorna o registro atualizado", async () => {
      const updated = { ...mockSupplier, companyName: "Buffet Sabor Premium", phone: null };
      patchMock.mockResolvedValueOnce({ data: updated });

      const result = await updateSupplier("sup-1", {
        companyName: "Buffet Sabor Premium",
        phone: null,
      });

      expect(patchMock).toHaveBeenCalledWith("/suppliers/sup-1", {
        companyName: "Buffet Sabor Premium",
        phone: null,
      });
      expect(result).toEqual(updated);
    });

    it("converte 409 Conflict em FornecedorDuplicadoError ao editar com CNPJ/CPF ou e-mail existente", async () => {
      patchMock.mockRejectedValueOnce(
        makeAxiosError(409, "Já existe um fornecedor com este CNPJ/CPF ou E-mail."),
      );

      await expect(updateSupplier("sup-1", { cnpjCpf: "23456789000112" })).rejects.toThrow(
        FornecedorDuplicadoError,
      );
    });

    it("propaga erros diferentes de 409 na edição", async () => {
      const notFoundError = makeAxiosError(404, "Fornecedor não encontrado.");
      patchMock.mockRejectedValueOnce(notFoundError);

      await expect(updateSupplier("sup-inexistente", { companyName: "X" })).rejects.toBe(
        notFoundError,
      );
    });
  });

  describe("deleteSupplier", () => {
    it("remove fornecedor em DELETE /suppliers/:id", async () => {
      deleteMock.mockResolvedValueOnce({ data: undefined });

      await deleteSupplier("sup-1");

      expect(deleteMock).toHaveBeenCalledWith("/suppliers/sup-1");
    });
  });
});

describe("fornecedores.data helpers", () => {
  const lista: Fornecedor[] = [
    mockSupplier,
    {
      ...mockSupplier,
      id: "sup-2",
      companyName: "Luz & Cena Produções Ltda.",
      category: "Som e iluminação",
    },
    {
      ...mockSupplier,
      id: "sup-3",
      companyName: "Pronto Apoio Serviços",
      category: null,
    },
  ];

  it("permite gerenciar fornecedores apenas para administrador e membro", () => {
    expect(canManageSuppliers("administrador")).toBe(true);
    expect(canManageSuppliers("membro")).toBe(true);
    expect(canManageSuppliers("leitura")).toBe(false);
  });

  it("extrai categorias únicas ordenadas alfabeticamente ignorando nulos", () => {
    expect(getCategorias(lista)).toEqual(["Buffet", "Som e iluminação"]);
  });

  it("filtra por nome (ignorando acentos e caixa) e por categoria", () => {
    expect(filterFornecedores(lista, "producoes", TODAS_CATEGORIAS)).toEqual([lista[1]]);
    expect(filterFornecedores(lista, "", "Buffet")).toEqual([lista[0]]);
    expect(filterFornecedores(lista, "sabor", "Som e iluminação")).toEqual([]);
  });

  it("identifica corretamente fornecedores avaliados e formata nota com vírgula", () => {
    expect(temAvaliacao({ ratingAverage: 4.8, ratingCount: 12 })).toBe(true);
    expect(temAvaliacao({ ratingAverage: 4.8, ratingCount: 0 })).toBe(false);
    expect(temAvaliacao({ ratingAverage: null, ratingCount: 5 })).toBe(false);
    expect(temAvaliacao({})).toBe(false);
    expect(formatarNotaMedia(4.8)).toBe("4,8");
    expect(formatarNotaMedia(5)).toBe("5,0");
  });

  it("filtra por avaliação mínima (4+ e 3+ estrelas) e ordena por reputação ou ordem alfabética", () => {
    const catalogoAvaliado: Fornecedor[] = [
      {
        ...mockSupplier,
        id: "sup-sem-nota",
        companyName: "Decora Festas & Flores",
        category: "Decoração",
        ratingAverage: null,
        ratingCount: 0,
      },
      {
        ...mockSupplier,
        id: "sup-38",
        companyName: "Segurança Total Eventos",
        category: "Segurança",
        ratingAverage: 3.8,
        ratingCount: 5,
      },
      {
        ...mockSupplier,
        id: "sup-48-menor-volume",
        companyName: "Estúdio Clique Certo",
        category: "Fotografia",
        ratingAverage: 4.8,
        ratingCount: 8,
      },
      {
        ...mockSupplier,
        id: "sup-49",
        companyName: "Buffet Sabor Real Ltda",
        category: "Buffet",
        ratingAverage: 4.9,
        ratingCount: 24,
      },
      {
        ...mockSupplier,
        id: "sup-48-maior-volume",
        companyName: "Luz & Som Produções",
        category: "Som e iluminação",
        ratingAverage: 4.8,
        ratingCount: 12,
      },
    ];

    // Ordenação padrão: Mais bem avaliados (maior média -> maior contagem -> nome A-Z; sem avaliação ao final)
    const ordenadosPorNota = filterFornecedores(
      catalogoAvaliado,
      "",
      TODAS_CATEGORIAS,
      TODAS_AVALIACOES,
      "rating",
    );
    expect(ordenadosPorNota.map((f) => f.id)).toEqual([
      "sup-49",
      "sup-48-maior-volume",
      "sup-48-menor-volume",
      "sup-38",
      "sup-sem-nota",
    ]);

    // Filtro 4+ estrelas exclui 3.8 e sem avaliação
    const quatroMais = filterFornecedores(
      catalogoAvaliado,
      "",
      TODAS_CATEGORIAS,
      "4",
      "rating",
    );
    expect(quatroMais.map((f) => f.id)).toEqual([
      "sup-49",
      "sup-48-maior-volume",
      "sup-48-menor-volume",
    ]);

    // Filtro 3+ estrelas inclui 3.8 e exclui sem avaliação
    const tresMais = filterFornecedores(
      catalogoAvaliado,
      "",
      TODAS_CATEGORIAS,
      "3",
      "rating",
    );
    expect(tresMais.map((f) => f.id)).toEqual([
      "sup-49",
      "sup-48-maior-volume",
      "sup-48-menor-volume",
      "sup-38",
    ]);

    // Ordenação alfabética (A–Z)
    const ordenadosPorNome = filterFornecedores(
      catalogoAvaliado,
      "",
      TODAS_CATEGORIAS,
      TODAS_AVALIACOES,
      "name",
    );
    expect(ordenadosPorNome.map((f) => f.companyName)).toEqual([
      "Buffet Sabor Real Ltda",
      "Decora Festas & Flores",
      "Estúdio Clique Certo",
      "Luz & Som Produções",
      "Segurança Total Eventos",
    ]);
  });
});
