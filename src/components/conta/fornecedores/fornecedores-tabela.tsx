"use client";

import { formatCpfCnpj, formatPhone } from "@/lib/masks";
import type { Fornecedor } from "@/types/fornecedor";
import { AvaliacaoBadge } from "./avaliacao-badge";
import { CategoriaBadge } from "./categoria-badge";
import { FornecedorAcoes, type FornecedorAcoesProps } from "./fornecedor-acoes";

type FornecedoresTabelaProps = Omit<FornecedorAcoesProps, "fornecedor" | "className"> & {
  fornecedores: readonly Fornecedor[];
};

/** Campo opcional vazio: traço visível e texto para leitores de tela. */
export function Vazio({ label }: { label: string }) {
  return (
    <span className="text-hubee-neutral-300 dark:text-hubee-200">
      <span aria-hidden="true">—</span>
      <span className="sr-only">{label}</span>
    </span>
  );
}

const thClassName = "px-3 py-3 text-left font-semibold whitespace-nowrap";
const tdClassName = "px-3 py-4 align-middle";

/**
 * Tabela de fornecedores (a partir de 1280px). Abaixo disso a página usa os cards.
 * Layout automático: documento, telefone, avaliação e categoria nunca quebram; nome e e-mail longos são truncados.
 */
export function FornecedoresTabela({ fornecedores, ...acoes }: FornecedoresTabelaProps) {
  return (
    <div className="hidden overflow-hidden rounded-xl border border-hubee-200 bg-hubee-neutral-25 xl:block dark:border-hubee-750 dark:bg-hubee-neutral-500">
      <table className="w-full text-xs">
        <caption className="sr-only">Fornecedores cadastrados</caption>
        <thead className="border-b border-hubee-200 bg-hubee-100/70 dark:border-hubee-750 dark:bg-hubee-800/50">
          <tr>
            <th scope="col" className={thClassName}>
              Razão Social / Nome
            </th>
            <th scope="col" className={thClassName}>
              CNPJ/CPF
            </th>
            <th scope="col" className={thClassName}>
              Categoria
            </th>
            <th scope="col" className={thClassName}>
              Avaliação
            </th>
            <th scope="col" className={thClassName}>
              Telefone
            </th>
            <th scope="col" className={thClassName}>
              E-mail
            </th>
            <th scope="col" className={`${thClassName} w-0`}>
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-hubee-200 dark:divide-hubee-750">
          {fornecedores.map((fornecedor) => (
            <tr key={fornecedor.id} className="hover:bg-hubee-100 dark:hover:bg-hubee-750">
              {/* `max-w-0` + largura em %: a célula encolhe para caber e o texto é truncado, sem rolagem lateral. */}
              <th scope="row" className={`${tdClassName} w-[24%] max-w-0 text-left font-semibold`}>
                <span className="block truncate" title={fornecedor.companyName}>
                  {fornecedor.companyName}
                </span>
              </th>
              <td className={`${tdClassName} whitespace-nowrap tabular-nums`}>{formatCpfCnpj(fornecedor.cnpjCpf)}</td>
              <td className={`${tdClassName} whitespace-nowrap`}>
                <CategoriaBadge category={fornecedor.category} />
              </td>
              <td className={`${tdClassName} whitespace-nowrap tabular-nums`}>
                <AvaliacaoBadge fornecedor={fornecedor} />
              </td>
              <td className={`${tdClassName} whitespace-nowrap tabular-nums`}>
                {fornecedor.phone ? formatPhone(fornecedor.phone) : <Vazio label="Sem telefone" />}
              </td>
              <td className={`${tdClassName} w-[20%] max-w-0`}>
                {fornecedor.email ? (
                  <span className="block truncate" title={fornecedor.email}>
                    {fornecedor.email}
                  </span>
                ) : (
                  <Vazio label="Sem e-mail" />
                )}
              </td>
              <td className={tdClassName}>
                <FornecedorAcoes fornecedor={fornecedor} {...acoes} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
