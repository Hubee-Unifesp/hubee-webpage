"use client";

import { useConvitesPendentes } from "@/hooks/useConvitesPendentes";
import { PerfilContent } from "./perfil-content";

/** `/conta/perfil` com os convites pendentes de organização carregados da `hubee-api` (GOL-278). */
export function PerfilPageContent() {
  const { convites, status, retry, responder } = useConvitesPendentes();

  return (
    <PerfilContent
      convitesPendentes={convites}
      convitesStatus={status}
      onRetryConvites={retry}
      onResponderConvite={responder}
    />
  );
}
