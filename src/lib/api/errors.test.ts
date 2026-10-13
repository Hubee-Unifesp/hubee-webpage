import { AxiosError, type AxiosResponse } from "axios";
import { describe, expect, it } from "vitest";
import { mapMessagesToFields, parseApiError } from "./errors";

function apiError(status: number, data: unknown) {
  return new AxiosError("falhou", "ERR_BAD_REQUEST", undefined, undefined, { status, data } as AxiosResponse);
}

describe("parseApiError", () => {
  it("le o status e a mensagem em texto", () => {
    expect(parseApiError(apiError(409, { message: "E-mail ou CPF já cadastrados." }))).toEqual({
      status: 409,
      messages: ["E-mail ou CPF já cadastrados."],
    });
  });

  it("le a lista de mensagens da validacao", () => {
    expect(parseApiError(apiError(400, { message: ["a", "b"] })).messages).toEqual(["a", "b"]);
  });

  it("devolve lista vazia quando a resposta nao tem mensagem", () => {
    expect(parseApiError(apiError(500, {}))).toEqual({ status: 500, messages: [] });
  });

  it("nao tem status quando a API nem respondeu", () => {
    expect(parseApiError(new AxiosError("Network Error"))).toEqual({ status: undefined, messages: [] });
  });

  it("ignora erros que nao vem do axios", () => {
    expect(parseApiError(new Error("x"))).toEqual({ messages: [] });
  });
});

describe("mapMessagesToFields", () => {
  const matchers = { email: /e-?mail/i, phone: /telefone/i };

  it("associa cada mensagem ao campo cujo padrao ela casa", () => {
    const result = mapMessagesToFields(["Forneça um e-mail válido", "O telefone deve conter apenas números"], matchers);

    expect(result.fields).toEqual({
      email: "Forneça um e-mail válido",
      phone: "O telefone deve conter apenas números",
    });
    expect(result.rest).toEqual([]);
  });

  it("devolve o que nao casou com nenhum campo", () => {
    expect(mapMessagesToFields(["property x should not exist"], matchers)).toEqual({
      fields: {},
      rest: ["property x should not exist"],
    });
  });

  it("guarda so a primeira mensagem de cada campo", () => {
    const result = mapMessagesToFields(["e-mail inválido", "e-mail obrigatório"], matchers);

    expect(result.fields.email).toBe("e-mail inválido");
    expect(result.rest).toEqual(["e-mail obrigatório"]);
  });

  it("usa a ordem dos padroes para desempatar", () => {
    const ordered = { currentPassword: /atual/i, newPassword: /senha/i };

    expect(mapMessagesToFields(["A senha atual é obrigatória"], ordered).fields).toEqual({
      currentPassword: "A senha atual é obrigatória",
    });
  });
});
