"use client";

import { FileText, Mail, Phone } from "lucide-react";
import { formatCpfCnpj, formatPhone } from "@/lib/masks";
import { CategoriaBadge } from "./categoria-badge";
import { FornecedorAcoes, type FornecedorAcoesProps } from "./fornecedor-acoes";
import { Vazio } from "./fornecedores-tabela";

/** Card de fornecedor da listagem em telas menores que 1024px. */
export function FornecedorCard({ fornecedor, ...acoes }: Omit<FornecedorAcoesProps, "className">) {
  return (
    <article className="flex flex-col gap-3 rounded-xl border border-hubee-200 bg-hubee-neutral-25 p-4 shadow-sm hover:border-hubee-400 dark:border-hubee-50/10 dark:bg-hubee-50/7 dark:hover:border-hubee-500">
      <div className="flex min-w-0 flex-col gap-1.5">
        <h3 className="line-clamp-2 font-semibold break-words">{fornecedor.companyName}</h3>
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

      <div className="flex justify-end border-t border-hubee-200 pt-2 dark:border-hubee-50/10">
        <FornecedorAcoes fornecedor={fornecedor} {...acoes} />
      </div>
    </article>
  );
}
