import { useCallback } from "react";
import { useToast } from "@/components/toast";
import { useAuth } from "@/contexts/AuthContext";
import { useConvites } from "@/contexts/ConvitesContext";
import { useOrganizacaoAtiva } from "@/hooks/useMeusEventos";
import { parseApiError } from "@/lib/api/errors";
import {
  getOrganizationMemberErrorMessage,
  respondOrganizationInvite,
  type InviteResponse,
} from "@/lib/api/organization-members";
import type { ConviteOrganizacaoPendente } from "@/types/membro-organizacao";

export function useConvitesPendentes() {
  const { syncUser } = useAuth();
  const { selecionarOrganizacao } = useOrganizacaoAtiva();
  const toast = useToast();
  const { convites, status, recarregar, tentarNovamente, removerConvite } = useConvites();

  const responder = useCallback(
    async (convite: ConviteOrganizacaoPendente, resposta: InviteResponse) => {
      try {
        await respondOrganizationInvite(convite.orgId, resposta);
      } catch (error) {
        toast.error(getOrganizationMemberErrorMessage(error, "respond"));
        if (parseApiError(error).status === 404) removerConvite(convite.orgId);
        return;
      }

      removerConvite(convite.orgId);

      if (resposta === "DECLINED") {
        toast.success(`Convite de ${convite.organizationName} recusado.`);
        return;
      }

      try {
        await syncUser();
        selecionarOrganizacao(convite.orgId);
        toast.success(`Agora você faz parte de ${convite.organizationName}.`);
      } catch {
        toast.success(
          `Convite de ${convite.organizationName} aceito. Recarregue a página se o painel da organização não aparecer.`,
        );
      }
    },
    [removerConvite, selecionarOrganizacao, syncUser, toast],
  );

  return {
    convites,
    status,
    retry: tentarNovamente,
    recarregar,
    responder,
  };
}
