"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Info, Plus, SearchX, Truck } from "lucide-react";
import { ContaPageTitle } from "@/components/conta/conta-card";
import { EmptyState } from "@/components/empty-state";
import { useToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { FornecedorDuplicadoError, useFornecedores } from "@/hooks/useFornecedores";
import type { Fornecedor, FornecedorPayload } from "@/types/fornecedor";
import { ExcluirFornecedorModal } from "./excluir-fornecedor-modal";
import { FornecedorCard } from "./fornecedor-card";
import { FornecedorFormModal, type ResultadoEnvio } from "./fornecedor-form-modal";
import { canManageSuppliers } from "./fornecedores.data";
import { FornecedoresFiltros } from "./fornecedores-filtros";
import { FornecedoresSkeleton } from "./fornecedores-skeleton";
import { FornecedoresTabela } from "./fornecedores-tabela";

function Titulo() {
  return <ContaPageTitle>Fornecedores</ContaPageTitle>;
}

/** Página "Fornecedores" da conta: listagem, busca, filtro por categoria e estados vazios. */
export function FornecedoresContent() {
  const router = useRouter();
  const toast = useToast();
  const [formAberto, setFormAberto] = useState(false);
  // Só muda ao abrir o modal, para o título não trocar durante a animação de saída.
  const [editando, setEditando] = useState<Fornecedor | null>(null);
  const [excluindo, setExcluindo] = useState<Fornecedor | null>(null);
  const {
    status,
    organizacaoAtiva,
    todos,
    filtrados,
    categorias,
    busca,
    setBusca,
    categoria,
    setCategoria,
    limparFiltros,
    temFiltroAtivo,
    criar,
    atualizar,
    excluir,
  } = useFornecedores();

  if (status === "loading") {
    return (
      <div className="flex flex-col gap-5">
        <Titulo />
        <FornecedoresSkeleton />
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
          description="Você ainda não faz parte de nenhuma organização com convite aceito. Solicite um convite ao administrador da sua organização para gerenciar fornecedores."
          action={{ label: "Ver eventos públicos", onClick: () => router.push("/#eventos") }}
        />
      </div>
    );
  }

  const podeGerenciar = canManageSuppliers(organizacaoAtiva.papel);

  const abrirCadastro = () => {
    setEditando(null);
    setFormAberto(true);
  };
  const abrirEdicao = (fornecedor: Fornecedor) => {
    setEditando(fornecedor);
    setFormAberto(true);
  };
  const abrirExclusao = (fornecedor: Fornecedor) => setExcluindo(fornecedor);

  async function salvar(payload: FornecedorPayload): Promise<ResultadoEnvio> {
    try {
      if (editando) {
        await atualizar(editando.id, payload);
        toast.success("Fornecedor atualizado com sucesso.");
      } else {
        await criar(payload);
        toast.success("Fornecedor cadastrado com sucesso.");
      }
      setFormAberto(false);
      return "ok";
    } catch (error) {
      if (error instanceof FornecedorDuplicadoError) return "duplicado";
      toast.error("Não foi possível concluir a ação. Tente novamente.");
      return "erro";
    }
  }

  async function confirmarExclusao(fornecedor: Fornecedor) {
    try {
      await excluir(fornecedor.id);
      setExcluindo(null);
      toast.success("Fornecedor excluído com sucesso.");
    } catch {
      toast.error("Não foi possível concluir a ação. Tente novamente.");
    }
  }

  const acoes = { podeGerenciar, onEditar: abrirEdicao, onExcluir: abrirExclusao };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <Titulo />
        <Button
          type="button"
          variant="hubee_750"
          onClick={abrirCadastro}
          disabled={!podeGerenciar}
          title={podeGerenciar ? undefined : "Apenas Administradores e Membros podem gerenciar fornecedores"}
          className="h-10 cursor-pointer self-start rounded-lg px-4 font-semibold sm:self-auto dark:bg-hubee-400 dark:text-hubee-800 dark:hover:bg-hubee-300"
        >
          <Plus aria-hidden="true" className="size-4" />
          Novo fornecedor
        </Button>
      </div>

      {!podeGerenciar && (
        <div
          role="note"
          className="flex items-center gap-2.5 rounded-xl border border-hubee-400/60 bg-hubee-100 px-4 py-3 text-xs font-medium text-hubee-800 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-200"
        >
          <Info aria-hidden="true" className="size-4 shrink-0" />
          <span>Apenas Administradores e Membros podem gerenciar fornecedores</span>
        </div>
      )}

      {todos.length === 0 ? (
        <EmptyState
          icon={Truck}
          title="Nenhum fornecedor cadastrado"
          description={
            podeGerenciar
              ? "Cadastre os fornecedores que prestam serviços para os eventos da sua organização."
              : "Quando um Administrador ou Membro cadastrar um fornecedor, ele aparecerá aqui."
          }
          action={podeGerenciar ? { label: "Cadastrar primeiro fornecedor", onClick: abrirCadastro } : undefined}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <FornecedoresFiltros
            busca={busca}
            onBuscaChange={setBusca}
            categoria={categoria}
            onCategoriaChange={setCategoria}
            categorias={categorias}
          />

          {filtrados.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="Nenhum fornecedor encontrado"
              description="Não encontramos fornecedores com os filtros selecionados."
              action={temFiltroAtivo ? { label: "Limpar filtros", onClick: limparFiltros } : undefined}
            />
          ) : (
            <>
              <FornecedoresTabela fornecedores={filtrados} {...acoes} />
              <ul className="grid gap-3 sm:grid-cols-2 xl:hidden">
                {filtrados.map((fornecedor) => (
                  <li key={fornecedor.id}>
                    <FornecedorCard fornecedor={fornecedor} {...acoes} />
                  </li>
                ))}
              </ul>
            </>
          )}

          <p role="status" className="text-xs text-hubee-750/75 dark:text-hubee-200">
            Mostrando {filtrados.length} de {todos.length} {todos.length === 1 ? "fornecedor" : "fornecedores"}
          </p>
        </div>
      )}

      {podeGerenciar && (
        <>
          <FornecedorFormModal
            open={formAberto}
            onOpenChange={setFormAberto}
            fornecedor={editando}
            categorias={categorias}
            onSubmit={salvar}
          />
          <ExcluirFornecedorModal
            fornecedor={excluindo}
            onClose={() => setExcluindo(null)}
            onConfirm={confirmarExclusao}
          />
        </>
      )}
    </div>
  );
}
