"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Lock, Plus, SearchX, Users } from "lucide-react";
import { ContaPageTitle } from "@/components/conta/conta-card";
import { EmptyState } from "@/components/empty-state";
import { ListMessage } from "@/components/home/events/list-states";
import { useToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toMemberRolePermission } from "@/lib/validations/organization-member.schema";
import type { ConvidarMembroPayload, MembroOrganizacao } from "@/types/membro-organizacao";
import type { OrganizationAccessLevel } from "@/types/usuario";
import { ConvidarMembroModal, type ResultadoConvite } from "./convidar-membro-modal";
import { MembroCard } from "./membro-card";
import {
  canManageMembers,
  filterMembers,
  TODOS_PAPEIS,
  TODOS_STATUS,
  type FiltroPapelMembro,
  type FiltroStatusConvite,
} from "./membros.data";
import { MembrosFiltros } from "./membros-filtros";
import { MembrosSkeleton } from "./membros-skeleton";
import { MembrosTabela } from "./membros-tabela";
import { RemoverMembroModal } from "./remover-membro-modal";

export type MembrosStatus = "loading" | "error" | "ok";

export interface MembrosContentProps {
  /** Lista controlada de membros (injetada na integração HTTP da GOL-278). */
  membros?: readonly MembroOrganizacao[];
  status?: MembrosStatus;
  onRetry?: () => void;
  /** Callbacks de integração HTTP (conectados na GOL-278). */
  onConvidar?: (payload: ConvidarMembroPayload) => Promise<ResultadoConvite>;
  onAlterarPapel?: (membro: MembroOrganizacao, novoNivel: OrganizationAccessLevel) => Promise<void>;
  onRemover?: (membro: MembroOrganizacao) => Promise<void>;
}

const AVISO_INTEGRACAO_PENDENTE =
  "A integração HTTP de membros ainda não está conectada ao servidor (GOL-278).";

function Titulo({ organizationName }: { organizationName?: string }) {
  return (
    <div>
      <ContaPageTitle>Membros</ContaPageTitle>
      {organizationName && (
        <p className="mt-1 text-xs text-hubee-neutral-300 dark:text-hubee-200">
          Gerencie a equipe, convites e permissões da organização {organizationName}.
        </p>
      )}
    </div>
  );
}

/** Página `/conta/membros`: listagem, filtros, convite por e-mail, alteração de papel e remoção (GOL-274 / GOL-277). */
export function MembrosContent({
  membros: membrosProp,
  status: statusProp,
  onRetry,
  onConvidar,
  onAlterarPapel,
  onRemover,
}: MembrosContentProps) {
  const router = useRouter();
  const toast = useToast();
  const { user, isLoading: authLoading } = useAuth();

  const [busca, setBusca] = useState("");
  const [papel, setPapel] = useState<FiltroPapelMembro>(TODOS_PAPEIS);
  const [statusFiltro, setStatusFiltro] = useState<FiltroStatusConvite>(TODOS_STATUS);
  const [convidarAberto, setConvidarAberto] = useState(false);
  const [removendo, setRemovendo] = useState<MembroOrganizacao | null>(null);
  const [alterandoId, setAlterandoId] = useState<string | null>(null);

  const organizacaoAtiva = user?.organizations?.[0] ?? null;

  const membrosDaSessao = useMemo<MembroOrganizacao[]>(() => {
    if (!user || !organizacaoAtiva) return [];
    const { role, permission } = toMemberRolePermission(organizacaoAtiva.level);
    return [
      {
        id: `${organizacaoAtiva.orgId}-${user.id}`,
        userId: user.id,
        orgId: organizacaoAtiva.orgId,
        fullName: user.fullName,
        email: user.email,
        avatarUrl: user.avatarUrl,
        role,
        permission,
        level: organizacaoAtiva.level,
        inviteStatus: "ACCEPTED",
        isOwner: organizacaoAtiva.level === "manage",
      },
    ];
  }, [user, organizacaoAtiva]);

  const statusAtual: MembrosStatus = statusProp ?? (authLoading ? "loading" : "ok");
  const todos = membrosProp ?? membrosDaSessao;

  const filtrados = useMemo(
    () => filterMembers(todos, busca, papel, statusFiltro),
    [todos, busca, papel, statusFiltro],
  );

  const temFiltroAtivo =
    busca.trim() !== "" || papel !== TODOS_PAPEIS || statusFiltro !== TODOS_STATUS;

  function limparFiltros() {
    setBusca("");
    setPapel(TODOS_PAPEIS);
    setStatusFiltro(TODOS_STATUS);
  }

  if (statusAtual === "loading") {
    return (
      <div className="flex flex-col gap-5">
        <Titulo />
        <MembrosSkeleton />
      </div>
    );
  }

  if (!organizacaoAtiva) {
    return (
      <div className="flex flex-col gap-5">
        <Titulo />
        <EmptyState
          icon={Building2}
          title="Acesso restrito a membros de organizações"
          description="Você ainda não faz parte de nenhuma organização com convite aceito. Aceite um convite no seu perfil ou crie uma organização para gerenciar membros."
          action={{ label: "Ir para Meu Perfil", onClick: () => router.push("/conta/perfil") }}
        />
      </div>
    );
  }

  if (statusAtual === "error") {
    return (
      <div className="flex flex-col gap-5">
        <Titulo organizationName={organizacaoAtiva.organizationName} />
        <ListMessage
          role="alert"
          variant="primary"
          title="Não foi possível carregar os membros"
          description="Verifique sua conexão e tente novamente."
          actionLabel="Tentar novamente"
          onAction={onRetry ?? (() => router.refresh())}
        />
      </div>
    );
  }

  const podeGerenciar = canManageMembers(organizacaoAtiva.level);

  async function handleConvidar(payload: ConvidarMembroPayload): Promise<ResultadoConvite> {
    if (!onConvidar) {
      toast.error(AVISO_INTEGRACAO_PENDENTE);
      return "erro";
    }
    try {
      const resultado = await onConvidar(payload);
      if (resultado === "ok") {
        toast.success(`Convite enviado para ${payload.email}.`);
      }
      return resultado;
    } catch {
      toast.error("Não foi possível enviar o convite. Tente novamente.");
      return "erro";
    }
  }

  async function handleAlterarPapel(membro: MembroOrganizacao, novoNivel: OrganizationAccessLevel) {
    if (novoNivel === membro.level) return;
    if (!onAlterarPapel) {
      toast.error(AVISO_INTEGRACAO_PENDENTE);
      return;
    }
    setAlterandoId(membro.id);
    try {
      await onAlterarPapel(membro, novoNivel);
      toast.success(`Papel de ${membro.fullName} atualizado.`);
    } catch {
      toast.error("Não foi possível atualizar o papel do membro.");
    } finally {
      setAlterandoId(null);
    }
  }

  async function handleConfirmarRemocao(membro: MembroOrganizacao) {
    if (!onRemover) {
      toast.error(AVISO_INTEGRACAO_PENDENTE);
      setRemovendo(null);
      return;
    }
    try {
      await onRemover(membro);
      setRemovendo(null);
      toast.success(
        membro.inviteStatus === "PENDING"
          ? "Convite cancelado com sucesso."
          : `${membro.fullName} foi removido da organização.`,
      );
    } catch {
      toast.error("Não foi possível concluir a ação. Tente novamente.");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <Titulo organizationName={organizacaoAtiva.organizationName} />
        <Button
          type="button"
          variant="hubee_750"
          onClick={() => setConvidarAberto(true)}
          disabled={!podeGerenciar}
          title={podeGerenciar ? undefined : "Apenas Administradores podem convidar novos membros"}
          className="h-10 w-full cursor-pointer rounded-lg px-4 font-semibold sm:w-auto dark:bg-hubee-400 dark:text-hubee-800 dark:hover:bg-hubee-300"
        >
          {podeGerenciar ? (
            <Plus aria-hidden="true" className="size-4" />
          ) : (
            <Lock aria-hidden="true" className="size-4" />
          )}
          Convidar membro
        </Button>
      </div>

      {!podeGerenciar && (
        <div
          role="note"
          className="flex items-center gap-2.5 rounded-xl border border-hubee-400/60 bg-hubee-200/80 px-4 py-3 text-xs font-medium text-hubee-800 dark:border-amber-700 dark:bg-hubee-850 dark:text-amber-200"
        >
          <Lock aria-hidden="true" className="size-4 shrink-0" />
          <span>
            Apenas Administradores da organização podem convidar, alterar papéis ou remover membros.
          </span>
        </div>
      )}

      {todos.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Nenhum membro vinculado"
          description={
            podeGerenciar
              ? "Convide integrantes por e-mail para colaborar na gestão dos eventos da organização."
              : "Quando novos integrantes entrarem na organização, eles aparecerão aqui."
          }
          action={podeGerenciar ? { label: "Convidar primeiro membro", onClick: () => setConvidarAberto(true) } : undefined}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <MembrosFiltros
            busca={busca}
            onBuscaChange={setBusca}
            papel={papel}
            onPapelChange={setPapel}
            status={statusFiltro}
            onStatusChange={setStatusFiltro}
          />

          {filtrados.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="Nenhum membro encontrado"
              description="Não encontramos integrantes com os filtros selecionados."
              action={temFiltroAtivo ? { label: "Limpar filtros", onClick: limparFiltros } : undefined}
            />
          ) : (
            <>
              <MembrosTabela
                membros={filtrados}
                usuarioAtualId={user?.id}
                podeGerenciar={podeGerenciar}
                alterandoId={alterandoId}
                onAlterarPapel={(membro, novoNivel) => void handleAlterarPapel(membro, novoNivel)}
                onRemover={setRemovendo}
              />

              <ul className="flex flex-col gap-3 xl:hidden">
                {filtrados.map((membro) => (
                  <li key={membro.id}>
                    <MembroCard
                      membro={membro}
                      usuarioAtualId={user?.id}
                      podeGerenciar={podeGerenciar}
                      atualizando={alterandoId === membro.id}
                      onAlterarPapel={(item, novoNivel) => void handleAlterarPapel(item, novoNivel)}
                      onRemover={setRemovendo}
                    />
                  </li>
                ))}
              </ul>

              <p className="text-xs text-hubee-neutral-300 dark:text-hubee-200">
                Mostrando {filtrados.length} de {todos.length}{" "}
                {todos.length === 1 ? "membro vinculado" : "membros vinculados"}
              </p>
            </>
          )}
        </div>
      )}

      <ConvidarMembroModal
        open={convidarAberto}
        onOpenChange={setConvidarAberto}
        organizationName={organizacaoAtiva.organizationName}
        onSubmit={handleConvidar}
      />

      <RemoverMembroModal
        membro={removendo}
        organizationName={organizacaoAtiva.organizationName}
        onClose={() => setRemovendo(null)}
        onConfirm={handleConfirmarRemocao}
      />
    </div>
  );
}
