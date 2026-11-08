import { describe, expect, it } from "vitest";
import {
  buildTicketTypeSchema,
  emptyTicketTypeForm,
  parsePrecoBRL,
  TICKET_TYPE_BATCH_MAX_LENGTH,
  TICKET_TYPE_QUANTITY_MAX,
  ticketTypeSchema,
  toLotePayload,
  toPrecoInput,
  type TicketTypeFormInputs,
} from "./ticket-type.schema";

const valid: TicketTypeFormInputs = {
  ...emptyTicketTypeForm,
  batch: "1º Lote Inteira",
  price: "80,00",
  quantity: "200",
};

function errors(overrides: Partial<TicketTypeFormInputs>, vendidos = 0) {
  const result = buildTicketTypeSchema(vendidos).safeParse({ ...valid, ...overrides });
  return result.success ? {} : Object.fromEntries(result.error.issues.map((issue) => [issue.path[0], issue.message]));
}

describe("parsePrecoBRL", () => {
  it("lê valores em pt-BR com ou sem separadores", () => {
    expect(parsePrecoBRL("50")).toBe(50);
    expect(parsePrecoBRL("50,5")).toBe(50.5);
    expect(parsePrecoBRL("1.250,50")).toBe(1250.5);
    expect(parsePrecoBRL("R$ 80,00")).toBe(80);
    expect(parsePrecoBRL("0")).toBe(0);
  });

  it("recusa texto, negativos e mais de 2 casas decimais", () => {
    for (const texto of ["", "abc", "-10", "10,999", "1,2,3"]) {
      expect(parsePrecoBRL(texto)).toBeNull();
    }
  });
});

describe("toPrecoInput", () => {
  it("formata com vírgula e duas casas", () => {
    expect(toPrecoInput(1250.5)).toBe("1250,50");
    expect(toPrecoInput(0)).toBe("0,00");
  });
});

describe("ticketTypeSchema", () => {
  it("aceita só os campos obrigatórios, com a janela de vendas vazia", () => {
    expect(errors({})).toEqual({});
  });

  it("aceita cortesia gratuita", () => {
    expect(errors({ modality: "cortesia", price: "0" })).toEqual({});
  });

  describe("batch", () => {
    it("recusa nome vazio ou só com espaços", () => {
      expect(errors({ batch: "   " }).batch).toBe("O nome do lote é obrigatório.");
    });

    it("aceita 100 caracteres e recusa 101", () => {
      expect(errors({ batch: "a".repeat(TICKET_TYPE_BATCH_MAX_LENGTH) })).toEqual({});
      expect(errors({ batch: "a".repeat(TICKET_TYPE_BATCH_MAX_LENGTH + 1) }).batch).toBe(
        "O nome deve ter no máximo 100 caracteres.",
      );
    });
  });

  describe("modality", () => {
    it("aceita todas as modalidades", () => {
      for (const modality of ["inteira", "meia", "estudante", "vip", "cortesia"] as const) {
        expect(errors({ modality })).toEqual({});
      }
    });

    it("recusa modalidade desconhecida", () => {
      expect(errors({ modality: "camarote" as never }).modality).toBe("Selecione a modalidade do ingresso.");
    });
  });

  describe("price", () => {
    it("recusa vazio, texto, negativo e mais de 2 casas", () => {
      expect(errors({ price: "" }).price).toBe("O preço é obrigatório. Use 0 para ingressos gratuitos.");
      for (const price of ["abc", "-5", "10,999"]) {
        expect(errors({ price }).price).toBe("Informe um valor válido, com até 2 casas decimais.");
      }
    });

    it("recusa valor acima do limite da API", () => {
      expect(errors({ price: "99999999999" }).price).toBe("O preço informado é alto demais.");
    });
  });

  describe("quantity", () => {
    it("recusa vazio, decimal, negativo e texto", () => {
      expect(errors({ quantity: "" }).quantity).toBe("A quantidade é obrigatória.");
      for (const quantity of ["1,5", "-3", "dez"]) {
        expect(errors({ quantity }).quantity).toBe("A quantidade deve ser um número inteiro, sem negativos.");
      }
    });

    it("aceita zero e recusa acima do limite de inteiro", () => {
      expect(errors({ quantity: "0" })).toEqual({});
      expect(errors({ quantity: String(TICKET_TYPE_QUANTITY_MAX + 1) }).quantity).toBe(
        "A quantidade informada é alta demais.",
      );
    });

    it("não deixa o total ficar abaixo do já vendido", () => {
      expect(errors({ quantity: "49" }, 50).quantity).toBe(
        "A quantidade não pode ser menor que os 50 ingressos já vendidos.",
      );
      expect(errors({ quantity: "50" }, 50)).toEqual({});
    });
  });

  describe("janela de vendas", () => {
    it("aceita fim posterior ao início", () => {
      expect(errors({ salesStartDate: "2026-11-10T09:00", salesEndDate: "2026-11-20T18:00" })).toEqual({});
    });

    it("aceita só o início ou só o fim", () => {
      expect(errors({ salesStartDate: "2026-11-10T09:00" })).toEqual({});
      expect(errors({ salesEndDate: "2026-11-20T18:00" })).toEqual({});
    });

    it("recusa fim igual ou anterior ao início", () => {
      const mensagem = "O fim das vendas deve ser posterior ao início.";
      expect(errors({ salesStartDate: "2026-11-10T09:00", salesEndDate: "2026-11-10T09:00" }).salesEndDate).toBe(
        mensagem,
      );
      expect(errors({ salesStartDate: "2026-11-10T09:00", salesEndDate: "2026-11-09T09:00" }).salesEndDate).toBe(
        mensagem,
      );
    });

    it("recusa data inválida", () => {
      expect(errors({ salesStartDate: "ontem" }).salesStartDate).toBe("Data inválida.");
    });
  });
});

describe("toLotePayload", () => {
  it("converte texto em números, apara o nome e devolve as datas em ISO", () => {
    const values = ticketTypeSchema.parse({
      batch: "  VIP Pista  ",
      modality: "vip",
      price: "1.250,50",
      quantity: "30",
      salesStartDate: "2026-11-10T09:00",
      salesEndDate: "",
    });

    expect(toLotePayload(values)).toEqual({
      batch: "VIP Pista",
      modality: "vip",
      price: 1250.5,
      quantity: 30,
      salesStartDate: new Date("2026-11-10T09:00").toISOString(),
      salesEndDate: null,
    });
  });
});
