import { useCallback, useEffect, useState } from "react";
import type { ResultadoConvite } from "@/components/conta/membros/convidar-membro-modal";
import { canManageMembers } from "@/components/conta/membros/membros.data";
import { useOrganizacaoAtiva } from "@/hooks/useMeusEventos";
import { parseApiError } from "@/lib/api/errors";
import {
  getOrganizationMembers,
  inviteOrganizationMember,
  removeOrganizationMember,
  updateOrganizationMember,
} from "@/lib/api/organization-members";
import { getOrganizationById } from "@/lib/api/organizations";
import { toMemberRolePermission } from "@/lib/validations/organization-member.schema";
import type { ConvidarMembroPayload, MembroOrganizacao } from "@/types/membro-organizacao";
import type { OrganizationAccessLevel } from "@/types/usuario";

type MembrosState =
  | { status: "loading"; data: null }
  | { status: "ok"; data: MembroOrganizacao[] }
  | { status: "error"; data: null };

const loadingState: MembrosState = { status: "loading", data: null };

/** Marca o representante da organização, que não pode ter o papel alterado nem ser removido. */
function markOwner(membros: MembroOrganizacao[], representativeId: string | null | undefined) {
  if (!representativeId) return membros;
  return membros.map((membro) =>
    membro.userId === representativeId ? { ...membro, isOwner: true } : membro,
  );
}

/**
 * Membros e convites da organização ativa integrados a `/organizations/:orgId/users` (GOL-278).
 * A listagem exige nível `manage`: para os demais níveis o hook não busca nada e a tela mostra só a sessão.
 */
export function useMembrosOrganizacao() {
  const { authLoading, organizacaoAtiva } = useOrganizacaoAtiva();
  const [state, setState] = useState<MembrosState>(loadingState);
  const [attempt, setAttempt] = useState(0);

  const orgId = organizacaoAtiva?.orgId ?? null;
  const podeGerenciar = canManageMembers(organizacaoAtiva?.level);

  useEffect(() => {
    if (authLoading || !orgId || !podeGerenciar) return;

    let active = true;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- volta ao carregando ao trocar de organização
    setState(loadingState);

    Promise.all([
      getOrganizationMembers(orgId),
      // O representante só serve para proteger a linha dele; se falhar, a lista aparece mesmo assim.
      getOrganizationById(orgId).catch(() => null),
    ])
      .then(([membros, organizacao]) => {
        if (active) setState({ status: "ok", data: markOwner(membros, organizacao?.representativeId) });
      })
      .catch(() => {
        if (active) setState({ status: "error", data: null });
      });

    return () => {
      active = false;
    };
  }, [authLoading, orgId, podeGerenciar, attempt]);

  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  const updateList = useCallback((update: (membros: MembroOrganizacao[]) => MembroOrganizacao[]) => {
    setState((current) => (current.status === "ok" ? { status: "ok", data: update(current.data) } : current));
  }, []);

  /** `404` e `409` voltam como resultado para o modal mostrar o erro no formulário; o resto é lançado. */
  const convidar = useCallback(
    async (payload: ConvidarMembroPayload): Promise<ResultadoConvite> => {
      if (!orgId) return "erro";
      try {
        const novo = await inviteOrganizationMember(orgId, payload);
        updateList((membros) => [...membros.filter((membro) => membro.userId !== novo.userId), novo]);
        return "ok";
      } catch (error) {
        const { status } = parseApiError(error);
        if (status === 404) return "nao-encontrado";
        if (status === 409) return "ja-vinculado";
        throw error;
      }
    },
    [orgId, updateList],
  );

  const alterarPapel = useCallback(
    async (membro: MembroOrganizacao, novoNivel: OrganizationAccessLevel) => {
      const atualizado = await updateOrganizationMember(membro.orgId, membro.userId, toMemberRolePermission(novoNivel));
      updateList((membros) =>
        membros.map((item) => (item.userId === membro.userId ? { ...atualizado, isOwner: item.isOwner } : item)),
      );
    },
    [updateList],
  );

  const remover = useCallback(
    async (membro: MembroOrganizacao) => {
      await removeOrganizationMember(membro.orgId, membro.userId);
      updateList((membros) => membros.filter((item) => item.userId !== membro.userId));
    },
    [updateList],
  );

  return {
    /** `undefined` quando a pessoa não administra a organização: a tela usa os dados da sessão. */
    membros: podeGerenciar ? (state.data ?? undefined) : undefined,
    status: podeGerenciar ? state.status : undefined,
    retry,
    convidar,
    alterarPapel,
    remover,
  };
}
