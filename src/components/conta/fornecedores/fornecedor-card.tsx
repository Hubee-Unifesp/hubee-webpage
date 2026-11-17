"use client";

import { FileText, Mail, Phone } from "lucide-react";
import { formatCpfCnpj, formatPhone } from "@/lib/masks";
import { AvaliacaoBadge } from "./avaliacao-badge";
import { CategoriaBadge } from "./categoria-badge";
import { FornecedorAcoes, type FornecedorAcoesProps } from "./fornecedor-acoes";
import { Vazio } from "./fornecedores-tabela";

/** Card de fornecedor da listagem em telas menores que 1280px. */
export function FornecedorCard({ fornecedor, ...acoes }: Omit<FornecedorAcoesProps, "className">) {
  return (
    <article className="flex flex-col gap-3 rounded-xl border border-hubee-200 bg-hubee-neutral-25 p-4 shadow-sm hover:border-hubee-400 dark:border-hubee-750 dark:bg-hubee-neutral-500 dark:hover:border-hubee-600">
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 min-w-0 font-semibold break-words">{fornecedor.companyName}</h3>
          <AvaliacaoBadge fornecedor={fornecedor} className="shrink-0" />
        </div>
        <CategoriaBadge category={fornecedor.category} className="self-start" />
      </div>

      <dl className="flex flex-col gap-1.5 text-sm">
        <div className="flex items-center gap-2">
          <dt>
            <FileText aria-hidden="true" className="size-4 shrink-0" />
            <span className="sr-only">CNPJ/CPF</span>
          </dt>
          <dd className="tabular-nums">{formatCpfCnpj(fornecedor.cnpjCpf)}</dd>
        </div>
        <div className="flex items-center gap-2">
          <dt>
            <Phone aria-hidden="true" className="size-4 shrink-0" />
            <span className="sr-only">Telefone</span>
          </dt>
          <dd className="tabular-nums">
            {fornecedor.phone ? formatPhone(fornecedor.phone) : <Vazio label="Não informado" />}
          </dd>
        </div>
        <div className="flex min-w-0 items-center gap-2">
          <dt>
            <Mail aria-hidden="true" className="size-4 shrink-0" />
            <span className="sr-only">E-mail</span>
          </dt>
          <dd className="min-w-0 truncate">{fornecedor.email ?? <Vazio label="Não informado" />}</dd>
        </div>
      </dl>

      <div className="flex justify-end border-t border-hubee-200 pt-2 dark:border-hubee-750">
        <FornecedorAcoes fornecedor={fornecedor} {...acoes} />
      </div>
    </article>
  );
}
