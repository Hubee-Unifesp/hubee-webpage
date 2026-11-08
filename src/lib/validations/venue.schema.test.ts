import { describe, expect, it } from "vitest";
import {
  ADDRESS_NUMBER_MAX_LENGTH,
  VENUE_NAME_MAX_LENGTH,
  emptyVenueForm,
  toVenuePayload,
  venueSchema,
  type VenueFormInputs,
} from "./venue.schema";

const valid: VenueFormInputs = {
  ...emptyVenueForm,
  name: "Auditório da Unifesp",
  maxCapacity: "350",
  zipCode: "12247-014",
  street: "Avenida Cesare Mansueto Giulio Lattes",
  number: "1201",
  neighborhood: "Eugênio de Melo",
  city: "São José dos Campos",
  state: "SP",
};

function errors(overrides: Partial<VenueFormInputs>) {
  const result = venueSchema.safeParse({ ...valid, ...overrides });
  return result.success ? {} : Object.fromEntries(result.error.issues.map((issue) => [issue.path[0], issue.message]));
}

describe("venueSchema", () => {
  it("aceita um local válido, com o complemento vazio", () => {
    expect(errors({})).toEqual({});
  });

  it("exige os campos obrigatórios", () => {
    expect(errors({ ...emptyVenueForm })).toEqual({
      name: "O nome do local é obrigatório.",
      maxCapacity: "Informe a capacidade máxima.",
      zipCode: "CEP inválido.",
      street: "O logradouro é obrigatório.",
      number: "O número é obrigatório.",
      neighborhood: "O bairro é obrigatório.",
      city: "A cidade é obrigatória.",
      state: "Selecione o estado.",
    });
  });

  it("recusa capacidade que não é inteira e positiva", () => {
    for (const maxCapacity of ["0", "-5", "1,5", "abc"]) {
      expect(errors({ maxCapacity }).maxCapacity).toBe("A capacidade deve ser um número inteiro maior que zero.");
    }
  });

  it("aceita CEP com ou sem hífen e recusa outros formatos", () => {
    expect(errors({ zipCode: "12247014" })).toEqual({});
    expect(errors({ zipCode: "1224-7014" }).zipCode).toBe("CEP inválido.");
  });

  it("respeita os limites de tamanho", () => {
    expect(errors({ name: "a".repeat(VENUE_NAME_MAX_LENGTH + 1) }).name).toBe(
      "O nome do local deve ter no máximo 255 caracteres.",
    );
    expect(errors({ number: "1".repeat(ADDRESS_NUMBER_MAX_LENGTH + 1) }).number).toBe(
      "O número deve ter no máximo 20 caracteres.",
    );
  });

  it("recusa UF fora da lista", () => {
    expect(errors({ state: "XX" as VenueFormInputs["state"] })).toHaveProperty("state");
  });
});

describe("toVenuePayload", () => {
  it("converte a capacidade em número e omite o complemento vazio", () => {
    const payload = toVenuePayload(venueSchema.parse({ ...valid, name: "  Auditório da Unifesp  " }));
    expect(payload).toEqual({
      name: "Auditório da Unifesp",
      maxCapacity: 350,
      address: {
        zipCode: "12247-014",
        street: "Avenida Cesare Mansueto Giulio Lattes",
        number: "1201",
        neighborhood: "Eugênio de Melo",
        city: "São José dos Campos",
        state: "SP",
      },
    });
  });

  it("envia o complemento preenchido", () => {
    const payload = toVenuePayload(venueSchema.parse({ ...valid, complement: "Bloco B" }));
    expect(payload.address.complement).toBe("Bloco B");
  });
});
