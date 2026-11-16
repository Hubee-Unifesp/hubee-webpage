import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AvaliacaoFornecedor } from "@/types/avaliacao-fornecedor";

const { getMock, postMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
}));

vi.mock("./apiClient", () => ({
  apiClient: {
    get: getMock,
    post: postMock,
  },
}));

import { createSupplierReview, getSupplierReviews } from "./supplier-reviews";

const mockReview: AvaliacaoFornecedor = {
  id: "rev-1",
  supplierId: "sup-1",
  userId: "user-1",
  userName: "Ana Souza",
  rating: 5,
  comment: "Ótimo atendimento.",
  createdAt: "2026-10-01T12:00:00.000Z",
  updatedAt: "2026-10-01T12:00:00.000Z",
};

describe("supplier-reviews API", () => {
  beforeEach(() => {
    getMock.mockReset();
    postMock.mockReset();
  });

  describe("getSupplierReviews", () => {
    it("lista as avaliações em GET /suppliers/:id/reviews", async () => {
      getMock.mockResolvedValueOnce({ data: [mockReview] });

      const result = await getSupplierReviews("sup-1");

      expect(getMock).toHaveBeenCalledWith("/suppliers/sup-1/reviews");
      expect(result).toEqual([mockReview]);
    });
  });

  describe("createSupplierReview", () => {
    it("envia nota e comentário em POST /suppliers/:id/reviews", async () => {
      postMock.mockResolvedValueOnce({ data: mockReview });

      const result = await createSupplierReview("sup-1", { rating: 5, comment: "Ótimo atendimento." });

      expect(postMock).toHaveBeenCalledWith("/suppliers/sup-1/reviews", {
        rating: 5,
        comment: "Ótimo atendimento.",
      });
      expect(result).toEqual(mockReview);
    });

    it("omite comentário vazio no corpo da requisição", async () => {
      postMock.mockResolvedValueOnce({ data: { ...mockReview, comment: null } });

      await createSupplierReview("sup-1", { rating: 4, comment: "" });

      expect(postMock).toHaveBeenCalledWith("/suppliers/sup-1/reviews", { rating: 4 });
    });

    it("omite comentário ausente no corpo da requisição", async () => {
      postMock.mockResolvedValueOnce({ data: { ...mockReview, comment: null } });

      await createSupplierReview("sup-1", { rating: 3 });

      expect(postMock).toHaveBeenCalledWith("/suppliers/sup-1/reviews", { rating: 3 });
    });
  });
});
