"use client";

import { formatCpfCnpj, formatPhone } from "@/lib/masks";
import type { Fornecedor } from "@/types/fornecedor";
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

const thClassName = "px-4 py-3 text-left text-xs font-semibold whitespace-nowrap";
const tdClassName = "px-4 py-4 align-middle";

/** Tabela de fornecedores (a partir de 1024px). Abaixo disso a página usa os cards. */
export function FornecedoresTabela({ fornecedores, ...acoes }: FornecedoresTabelaProps) {
  return (
    <div className="hidden overflow-x-auto rounded-xl border border-hubee-200 bg-hubee-neutral-25 lg:block dark:border-hubee-50/10 dark:bg-hubee-50/7">
      <table className="w-full table-fixed text-sm">
        <caption className="sr-only">Fornecedores cadastrados</caption>
        <colgroup>
          <col className="w-[26%]" />
          <col className="w-[17%]" />
          <col className="w-[14%]" />
          <col className="w-[14%]" />
          <col className="w-[19%]" />
          <col className="w-[10%]" />
        </colgroup>
        <thead className="border-b border-hubee-200 dark:border-hubee-50/10">
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
              Telefone
            </th>
            <th scope="col" className={thClassName}>
              E-mail
            </th>
            <th scope="col" className={thClassName}>
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-hubee-200 dark:divide-hubee-50/10">
          {fornecedores.map((fornecedor) => (
            <tr key={fornecedor.id} className="hover:bg-hubee-100 dark:hover:bg-hubee-750/60">
              <th scope="row" className={`${tdClassName} text-left font-semibold`}>
                <span className="block truncate" title={fornecedor.companyName}>
                  {fornecedor.companyName}
                </span>
              </th>
              <td className={`${tdClassName} whitespace-nowrap tabular-nums`}>{formatCpfCnpj(fornecedor.cnpjCpf)}</td>
              <td className={tdClassName}>
                <CategoriaBadge category={fornecedor.category} />
              </td>
              <td className={`${tdClassName} whitespace-nowrap tabular-nums`}>
                {fornecedor.phone ? formatPhone(fornecedor.phone) : <Vazio label="Sem telefone" />}
              </td>
              <td className={tdClassName}>
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
