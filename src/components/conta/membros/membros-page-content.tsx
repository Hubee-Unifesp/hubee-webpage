"use client";

import { useMembrosOrganizacao } from "@/hooks/useMembrosOrganizacao";
import { MembrosContent } from "./membros-content";

/** `/conta/membros` conectada aos endpoints de membros e convites da `hubee-api` (GOL-278). */
export function MembrosPageContent() {
  const { membros, status, retry, convidar, alterarPapel, remover } = useMembrosOrganizacao();

  return (
    <MembrosContent
      membros={membros}
      status={status}
      onRetry={retry}
      onConvidar={convidar}
      onAlterarPapel={alterarPapel}
      onRemover={remover}
    />
  );
}
