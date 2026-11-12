"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, FileText, Info, Mail, MessageSquareText, Phone, SearchX, Star } from "lucide-react";
import { ContaPageTitle } from "@/components/conta/conta-card";
import { EmptyState } from "@/components/empty-state";
import { ListMessage } from "@/components/home/events/list-states";
import { useToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAvaliacoesFornecedor } from "@/hooks/useAvaliacoesFornecedor";
import { formatCpfCnpj, formatPhone } from "@/lib/masks";
import type { AvaliacaoFornecedorPayload } from "@/types/avaliacao-fornecedor";
import { CategoriaBadge } from "../categoria-badge";
import { canManageSuppliers } from "../fornecedores.data";
import { AvaliacaoCard } from "./avaliacao-card";
import { NOTAS, ORDENS, TODAS_NOTAS, type OrdemAvaliacoes } from "./avaliacoes.data";
import { AvaliacoesSkeleton } from "./avaliacoes-skeleton";
import { AvaliarFornecedorModal } from "./avaliar-fornecedor-modal";
import { ResumoAvaliacoes } from "./resumo-avaliacoes";

const semPermissao = "Apenas Administradores e Membros podem avaliar fornecedores";
const labelClassName = "text-xs font-semibold";
const controlClassName =
  "h-10 w-full rounded-lg border-hubee-300 bg-hubee-neutral-25 text-hubee-800 dark:border-hubee-50/20 dark:bg-hubee-800 dark:text-hubee-50";

function Voltar() {
  return (
    <Link
      href="/conta/fornecedores"
      className="inline-flex items-center gap-1.5 self-start rounded-md text-sm font-semibold text-hubee-750 hover:text-hubee-800 hover:underline focus-visible:ring-2 focus-visible:ring-hubee-600 focus-visible:outline-none dark:text-hubee-200 dark:hover:text-hubee-50"
    >
      <ArrowLeft aria-hidden="true" className="size-4" />
      Voltar para fornecedores
    </Link>
  );
}

/** Página de avaliações de um fornecedor: resumo, filtros, lista e formulário de nova avaliação (GOL-244). */
export function AvaliacoesContent({ supplierId }: { supplierId: string }) {
  const router = useRouter();
  const toast = useToast();
  const notaId = useId();
  const ordemId = useId();
  const [formAberto, setFormAberto] = useState(false);
  const {
    status,
    organizacaoAtiva,
    fornecedor,
    eventos,
    avaliacoes,
    filtradas,
    resumo,
    nota,
    setNota,
    ordem,
    setOrdem,
    limparFiltros,
    temFiltroAtivo,
    retry,
    avaliar,
  } = useAvaliacoesFornecedor(supplierId);

  if (status === "loading") return <AvaliacoesSkeleton />;

  if (!organizacaoAtiva) {
    return (
      <div className="flex flex-col gap-5">
        <ContaPageTitle>Avaliações</ContaPageTitle>
        <EmptyState
          icon={Building2}
          title="Acesso restrito a membros de organizações"
          description="Você ainda não faz parte de nenhuma organização com convite aceito. Solicite um convite ao administrador da sua organização para avaliar fornecedores."
          action={{ label: "Ver eventos públicos", onClick: () => router.push("/#eventos") }}
        />
      </div>
    );
  }

  if (status === "not-found" || (status === "ok" && !fornecedor)) {
    return (
      <div className="flex flex-col gap-5">
        <Voltar />
        <EmptyState
          icon={SearchX}
          title="Fornecedor não encontrado"
          description="Ele pode ter sido excluído ou o link está incorreto."
          action={{ label: "Ver fornecedores", onClick: () => router.push("/conta/fornecedores") }}
        />
      </div>
    );
  }

  if (status === "error" || !fornecedor) {
    return (
      <div className="flex flex-col gap-5">
        <Voltar />
        <ListMessage
          role="alert"
          variant="primary"
          title="Não foi possível carregar as avaliações"
          description="Verifique sua conexão e tente novamente."
          actionLabel="Tentar novamente"
          onAction={retry}
        />
      </div>
    );
  }

  const podeAvaliar = canManageSuppliers(organizacaoAtiva.papel);

  async function enviar(payload: AvaliacaoFornecedorPayload): Promise<boolean> {
    try {
      await avaliar(payload);
      setFormAberto(false);
      toast.success("Avaliação enviada com sucesso.");
      return true;
    } catch {
      toast.error("Não foi possível enviar a avaliação. Tente novamente.");
      return false;
    }
  }

  const botaoAvaliar = (
    <Button
      type="button"
      variant="hubee_750"
      onClick={() => setFormAberto(true)}
      disabled={!podeAvaliar}
      title={podeAvaliar ? undefined : semPermissao}
      className="h-10 cursor-pointer self-start rounded-lg px-4 font-semibold sm:self-auto dark:bg-hubee-400 dark:text-hubee-800 dark:hover:bg-hubee-300"
    >
      <Star aria-hidden="true" className="size-4" />
      Avaliar fornecedor
    </Button>
  );

  return (
    <div className="flex flex-col gap-5">
      <Voltar />

      <header className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <ContaPageTitle>{fornecedor.companyName}</ContaPageTitle>
            <CategoriaBadge category={fornecedor.category} />
          </div>
          <dl className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-hubee-750 dark:text-hubee-200">
            <div className="flex items-center gap-1.5">
              <dt>
                <FileText aria-hidden="true" className="size-3.5" />
                <span className="sr-only">CNPJ/CPF</span>
              </dt>
              <dd className="tabular-nums">{formatCpfCnpj(fornecedor.cnpjCpf)}</dd>
            </div>
            {fornecedor.phone && (
              <div className="flex items-center gap-1.5">
                <dt>
                  <Phone aria-hidden="true" className="size-3.5" />
                  <span className="sr-only">Telefone</span>
                </dt>
                <dd className="tabular-nums">{formatPhone(fornecedor.phone)}</dd>
              </div>
            )}
            {fornecedor.email && (
              <div className="flex min-w-0 items-center gap-1.5">
                <dt>
                  <Mail aria-hidden="true" className="size-3.5" />
                  <span className="sr-only">E-mail</span>
                </dt>
                <dd className="truncate">{fornecedor.email}</dd>
              </div>
            )}
          </dl>
        </div>
        {avaliacoes.length > 0 && botaoAvaliar}
      </header>

      {!podeAvaliar && (
        <div
          role="note"
          className="flex items-center gap-2.5 rounded-xl border border-hubee-400/60 bg-hubee-100 px-4 py-3 text-xs font-medium text-hubee-800 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-200"
        >
          <Info aria-hidden="true" className="size-4 shrink-0" />
          <span>{semPermissao}</span>
        </div>
      )}

      {avaliacoes.length === 0 ? (
        <EmptyState
          icon={MessageSquareText}
          title="Este fornecedor ainda não foi avaliado"
          description={
            podeAvaliar
              ? "Depois de um evento, registre como foi o serviço. As avaliações ajudam a organização a escolher melhor os próximos fornecedores."
              : "Quando um Administrador ou Membro avaliar este fornecedor, as avaliações aparecerão aqui."
          }
          action={podeAvaliar ? { label: "Fazer a primeira avaliação", onClick: () => setFormAberto(true) } : undefined}
        />
      ) : (
        <>
          <ResumoAvaliacoes resumo={resumo} />

          <section aria-labelledby={`${ordemId}-titulo`} className="flex flex-col gap-4">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <h2 id={`${ordemId}-titulo`} className="text-lg font-semibold">
                Avaliações
              </h2>
              <div role="search" className="grid grid-cols-2 gap-3 sm:w-96">
                <div className="flex flex-col gap-1.5">
                  <span id={notaId} className={labelClassName}>
                    Nota
                  </span>
                  <Select value={nota} onValueChange={setNota}>
                    <SelectTrigger aria-labelledby={notaId} className={controlClassName}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value={TODAS_NOTAS}>Todas</SelectItem>
                      {NOTAS.map((item) => (
                        <SelectItem key={item} value={String(item)}>
                          {item} {item === 1 ? "estrela" : "estrelas"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span id={ordemId} className={labelClassName}>
                    Ordenar por
                  </span>
                  <Select value={ordem} onValueChange={(value) => setOrdem(value as OrdemAvaliacoes)}>
                    <SelectTrigger aria-labelledby={ordemId} className={controlClassName}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {ORDENS.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {filtradas.length === 0 ? (
              <EmptyState
                icon={SearchX}
                title="Nenhuma avaliação encontrada"
                description="Não há avaliações com a nota selecionada."
                action={temFiltroAtivo ? { label: "Limpar filtro", onClick: limparFiltros } : undefined}
              />
            ) : (
              <ul className="flex flex-col gap-3">
                {filtradas.map((avaliacao) => (
                  <li key={avaliacao.id}>
                    <AvaliacaoCard avaliacao={avaliacao} />
                  </li>
                ))}
              </ul>
            )}

            <p role="status" className="text-xs text-hubee-750/75 dark:text-hubee-200">
              Mostrando {filtradas.length} de {avaliacoes.length}{" "}
              {avaliacoes.length === 1 ? "avaliação" : "avaliações"}
            </p>
          </section>
        </>
      )}

      {podeAvaliar && (
        <AvaliarFornecedorModal
          open={formAberto}
          onOpenChange={setFormAberto}
          fornecedorNome={fornecedor.companyName}
          eventos={eventos}
          onSubmit={enviar}
        />
      )}
    </div>
  );
}
