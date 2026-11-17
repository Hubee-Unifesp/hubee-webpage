import { beforeEach, describe, expect, it } from "vitest";
import {
  AWAKE_WINDOW_MS,
  COLD_START_TIMEOUT_MS,
  DEFAULT_TIMEOUT_MS,
  isApiAwake,
  markApiAwake,
  resetApiStatus,
  resolveTimeout,
} from "./api-status";

describe("api-status (GOL-256)", () => {
  beforeEach(() => resetApiStatus());

  it("considera a API dormindo antes de qualquer resposta", () => {
    expect(isApiAwake(0)).toBe(false);
    expect(resolveTimeout(DEFAULT_TIMEOUT_MS, 0)).toBe(COLD_START_TIMEOUT_MS);
  });

  it("volta ao timeout padrão depois de uma resposta recente", () => {
    markApiAwake(1_000);

    expect(isApiAwake(1_000 + AWAKE_WINDOW_MS - 1)).toBe(true);
    expect(resolveTimeout(DEFAULT_TIMEOUT_MS, 1_000 + AWAKE_WINDOW_MS - 1)).toBe(DEFAULT_TIMEOUT_MS);
  });

  it("volta a esperar o cold start quando a última resposta é antiga", () => {
    markApiAwake(1_000);

    expect(isApiAwake(1_000 + AWAKE_WINDOW_MS)).toBe(false);
    expect(resolveTimeout(DEFAULT_TIMEOUT_MS, 1_000 + AWAKE_WINDOW_MS)).toBe(COLD_START_TIMEOUT_MS);
  });

  it("preserva timeout definido explicitamente pela chamada", () => {
    expect(resolveTimeout(5_000, 0)).toBe(5_000);
    expect(resolveTimeout(0, 0)).toBe(0);
  });
});
