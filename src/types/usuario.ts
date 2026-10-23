import type { UserOrganization } from "@/lib/api/auth";
import type { SignupIntent } from "@/lib/validations/auth.schema";

export interface Usuario {
  id: string;
  /** Mesmo nome do `fullName` do cadastro e da API. */
  fullName: string;
  email: string;
  /** Só dígitos, como a API devolve. `null` quando não informado. */
  phone?: string | null;
  /** URL da foto de perfil. Sem foto, a interface mostra as iniciais do nome. */
  avatarUrl?: string | null;
  profileComplete: boolean;
  signupIntent?: SignupIntent;
  /** Organizações com convite aceito às quais a usuária pertence. */
  organizations?: UserOrganization[];
}

/** Dados da usuária autenticada usados pelo layout da área logada. */
export interface UsuarioLogado {
  usuario: Usuario;
  itensNoCarrinho: number;
}
