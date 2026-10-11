import type { UsuarioLogado } from "@/types/usuario";

/**
 * MOCK TEMPORÁRIO: substituir pelos dados da sessão real ao integrar com o `hubee-api`.
 * TODO(auth-api): remover junto com o mock de `/login`.
 */
export const usuarioLogadoMock: UsuarioLogado = {
  usuario: {
    id: "usuario-mock-1",
    fullName: "Maria Silva",
    email: "maria.silva@email.com",
    avatarUrl: null,
    profileComplete: false,
  },
  itensNoCarrinho: 2,
};
