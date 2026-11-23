import { useCallback, useEffect, useState } from "react";
import { useToast } from "@/components/toast";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganizacaoAtiva } from "@/hooks/useMeusEventos";
import { parseApiError } from "@/lib/api/errors";
import {
  getMyInvites,
  getOrganizationMemberErrorMessage,
  respondOrganizationInvite,
  type InviteResponse,
} from "@/lib/api/organization-members";
import type { ConviteOrganizacaoPendente } from "@/types/membro-organizacao";

type ConvitesState =
  | { status: "loading"; data: ConviteOrganizacaoPendente[] }
  | { status: "ok"; data: ConviteOrganizacaoPendente[] }
  | { status: "error"; data: ConviteOrganizacaoPendente[] };

/**
 * Convites pendentes de organização da pessoa logada (`GET /users/me/invites`) e a resposta a eles (GOL-278).
 * Ao aceitar, relê a sessão para liberar na hora o painel da organização (Meus Eventos, Fornecedores),
 * sem precisar entrar de novo, e deixa a organização aceita como ativa.
 */
export function useConvitesPendentes() {
  const { user, syncUser } = useAuth();
  const { selecionarOrganizacao } = useOrganizacaoAtiva();
  const toast = useToast();
  const [state, setState] = useState<ConvitesState>({ status: "loading", data: [] });
  const [attempt, setAttempt] = useState(0);

  const userId = user?.id ?? null;

  useEffect(() => {
    if (!userId) return;

    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- volta ao carregando ao tentar de novo
    setState((current) => ({ status: "loading", data: current.data }));

    getMyInvites()
      .then((data) => {
        if (active) setState({ status: "ok", data });
      })
      .catch(() => {
        if (active) setState({ status: "error", data: [] });
      });

    return () => {
      active = false;
    };
  }, [userId, attempt]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  const removeConvite = useCallback((orgId: string) => {
    setState((current) => ({ ...current, data: current.data.filter((convite) => convite.orgId !== orgId) }));
  }, []);

  const responder = useCallback(
    async (convite: ConviteOrganizacaoPendente, resposta: InviteResponse) => {
      try {
        await respondOrganizationInvite(convite.orgId, resposta);
      } catch (error) {
        toast.error(getOrganizationMemberErrorMessage(error, "respond"));
        // Convite que já não está pendente (cancelado ou respondido em outra aba) sai da lista.
        if (parseApiError(error).status === 404) removeConvite(convite.orgId);
        return;
      }

      removeConvite(convite.orgId);

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
    [removeConvite, selecionarOrganizacao, syncUser, toast],
  );

  return {
    convites: state.data,
    status: state.status,
    retry,
    responder,
  };
}
