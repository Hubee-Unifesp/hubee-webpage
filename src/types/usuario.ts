export interface Usuario {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  /** URL da foto de perfil. Sem foto, a interface mostra as iniciais do nome. */
  avatarUrl?: string | null;
  perfilCompleto: boolean;
}

/** Dados da usuária autenticada usados pelo layout da área logada. */
export interface UsuarioLogado {
  usuario: Usuario;
  itensNoCarrinho: number;
}
