import { beforeEach, describe, expect, it, vi } from "vitest";

const { patchMock, deleteMock } = vi.hoisted(() => ({
  patchMock: vi.fn(),
  deleteMock: vi.fn(),
}));

vi.mock("./apiClient", () => ({
  apiClient: {
    patch: patchMock,
    delete: deleteMock,
  },
}));

import { updateMe, uploadAvatar } from "./users";

const mockUser = {
  id: "u-1",
  fullName: "Maria Silva",
  email: "maria@example.com",
  phone: "11999999999",
  avatarUrl: "data:image/png;base64,abc123",
  profileComplete: true,
  role: "USER" as const,
  signupIntent: "BUY" as const,
  organizations: [],
};

describe("users API", () => {
  beforeEach(() => {
    patchMock.mockReset();
    deleteMock.mockReset();
  });

  it("updateMe envia os dados pessoais para PATCH /users/me", async () => {
    patchMock.mockResolvedValue({ data: mockUser });

    const result = await updateMe({
      fullName: "Maria Silva",
      email: "maria@example.com",
      phone: "11999999999",
    });

    expect(patchMock).toHaveBeenCalledWith("/users/me", {
      fullName: "Maria Silva",
      email: "maria@example.com",
      phone: "11999999999",
    });
    expect(result).toEqual(mockUser);
  });

  it("uploadAvatar anexa o File em um FormData e envia para PATCH /users/me/avatar com multipart/form-data", async () => {
    patchMock.mockResolvedValue({ data: mockUser });
    const file = new File(["conteudo-imagem"], "avatar.png", { type: "image/png" });

    const result = await uploadAvatar(file);

    expect(patchMock).toHaveBeenCalledTimes(1);
    const [url, body, config] = patchMock.mock.calls[0] as [
      string,
      FormData,
      { headers: Record<string, string> },
    ];
    expect(url).toBe("/users/me/avatar");
    expect(body).toBeInstanceOf(FormData);
    expect(body.get("file")).toBe(file);
    expect(config).toEqual({
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    expect(result).toEqual(mockUser);
  });
});

