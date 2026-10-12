import type { Metadata } from "next";
import { PerfilContent } from "@/components/conta/perfil/perfil-content";
import { usuarioLogadoMock } from "@/mocks/usuario";

export const metadata: Metadata = { title: "Meu perfil | Hubee" };

export default function PerfilPage() {
  // TODO(profile-api): trocar o mock pelo usuário da sessão.
  return <PerfilContent usuario={usuarioLogadoMock.usuario} />;
}
