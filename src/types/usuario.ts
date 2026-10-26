import type { SignupIntent } from "@/lib/validations/auth.schema";

/** Papel global da conta na API. `ADMIN` administra a plataforma inteira. */
export type UserRole = "USER" | "ADMIN";

/** Nível efetivo na organização: `read` só consulta, `write` cria e altera eventos, `manage` também administra. */
export type OrganizationAccessLevel = "read" | "write" | "manage";

/** Organização em que a pessoa é membro (convite aceito), como a API devolve em `organizations`. */
export interface UsuarioOrganizacao {
  orgId: string;
  organizationName: string;
  /** Papel na organização (`admin` ou `member`). */
  role: string;
  /** Permissão na organização (`full` ou `read_only`). */
  permission: string;
  level: OrganizationAccessLevel;
}

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
  role: UserRole;
  /** O que a pessoa marcou no cadastro. É só intenção: quem dá acesso de organizador é o vínculo em `organizations`. */
  signupIntent: SignupIntent | null;
  /** Ausente nas respostas de login e cadastro; vem em `GET /auth/me` e `PATCH /users/me`. */
  organizations?: UsuarioOrganizacao[];
}

/** Dados da usuária autenticada usados pelo layout da área logada. */
export interface UsuarioLogado {
  usuario: Usuario;
  itensNoCarrinho: number;
}