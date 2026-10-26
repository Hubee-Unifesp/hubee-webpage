import type { Usuario } from "@/types/usuario";

type PermissionSubject = Pick<Usuario, "role" | "organizations"> | null | undefined;

/** Organizador é quem pertence a alguma organização (convite aceito). Só marcar "organizar" no cadastro não basta. */
export function isOrganizer(user: PermissionSubject): boolean {
  return (user?.organizations?.length ?? 0) > 0;
}

/** A API libera criar eventos para `ADMIN` e para quem tem nível `write` ou `manage` em alguma organização. */
export function canCreateEvents(user: PermissionSubject): boolean {
  if (!user) return false;
  if (user.role === "ADMIN") return true;
  return (user.organizations ?? []).some(({ level }) => level === "write" || level === "manage");
}
