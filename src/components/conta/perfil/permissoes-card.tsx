"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Pencil, Plus } from "lucide-react";
import { ContaCard } from "@/components/conta/conta-card";
import { OrganizacaoForm } from "@/components/conta/organizacao/organizacao-form";
import { Button } from "@/components/ui/button";
import { canCreateEvents } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import type { OrganizationAccessLevel, Usuario, UsuarioOrganizacao } from "@/types/usuario";

const roleLabels: Record<Usuario["role"], string> = {
  USER: "Usuário",
  ADMIN: "Administrador da plataforma",
};

const intentLabels = {
  BUY: "Comprar ingressos",
  ORGANIZE: "Organizar eventos",
} as const;

const levelLabels: Record<OrganizationAccessLevel, string> = {
  read: "Somente consulta · Visualiza eventos e métricas",
  write: "Cria e edita eventos · Não altera dados da organização",
  manage: "Gerencia a organização · Pode criar, editar e cancelar eventos",
};

const badgeLabels: Record<OrganizationAccessLevel, string> = {
  manage: "Administrador",
  write: "Membro",
  read: "Leitura",
};

const badgeStyles: Record<OrganizationAccessLevel, string> = {
  manage:
    "border-hubee-400/70 bg-hubee-200 text-hubee-800 dark:border-hubee-400 dark:bg-hubee-400/20 dark:text-hubee-200",
  write:
    "border-stone-300 bg-stone-100 text-stone-800 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200",
  read:
    "border-hubee-300 bg-hubee-neutral-25 text-hubee-750 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300",
};

type FormMode =
  | { type: "closed" }
  | { type: "create" }
  | { type: "edit"; org: UsuarioOrganizacao };

/**
 * Cartão do Meu Perfil com o tipo da conta, o vínculo com organizações e o cadastro e a edição dos dados
 * cadastrais delas (GOL-200). A lista vem da sessão (`GET /auth/me`), que o formulário relê ao salvar.
 */
export function PermissoesCard({ usuario }: { usuario: Usuario }) {
  const router = useRouter();
  const [formMode, setFormMode] = useState<FormMode>({ type: "closed" });

  const organizations = usuario.organizations ?? [];

  const summary = [
    { label: "Tipo de conta", value: roleLabels[usuario.role] },
    {
      label: "Objetivo no cadastro",
      value: usuario.signupIntent ? intentLabels[usuario.signupIntent] : "Não informado",
    },
    {
      label: "Criação de eventos",
      value: canCreateEvents(usuario) ? "Permitida" : "Não permitida",
    },
  ];

  function closeForm() {
    setFormMode({ type: "closed" });
  }

  function canManageOrganization(org: UsuarioOrganizacao): boolean {
    return usuario.role === "ADMIN" || org.level === "manage";
  }

  return (
    <ContaCard title="Permissões e perfil" description="O que a sua conta pode fazer na plataforma.">
      <dl className="grid gap-4 sm:grid-cols-3">
        {summary.map(({ label, value }) => (
          <div key={label}>
            <dt className="text-xs text-hubee-neutral-300 dark:text-hubee-200">{label}</dt>
            <dd className="mt-0.5 text-sm font-semibold">{value}</dd>
          </div>
        ))}
      </dl>

      <hr className="my-5 border-t border-hubee-200 dark:border-hubee-50/10" />

      {formMode.type !== "closed" ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold">
              {formMode.type === "edit" ? "Editar organização" : "Criar organização"}
            </h3>
            <span className="text-xs text-hubee-neutral-300 dark:text-hubee-200">Acesso: Administrador</span>
          </div>

          <OrganizacaoForm
            key={formMode.type === "edit" ? formMode.org.orgId : "create"}
            mode={
              formMode.type === "edit"
                ? { type: "edit", orgId: formMode.org.orgId, initialName: formMode.org.organizationName }
                : { type: "create" }
            }
            onCancel={closeForm}
            onSuccess={() => {
              if (formMode.type === "create") {
                router.push("/meus-eventos");
              } else {
                closeForm();
              }
            }}
          />
        </div>
      ) : organizations.length === 0 ? (
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-bold">Organizações</h3>
            <p className="mt-1 text-xs text-hubee-neutral-300 dark:text-hubee-200">
              Você ainda não faz parte de nenhuma organização. Crie uma para liberar a criação de eventos
              ou peça a um administrador de uma organização existente que convide você.
            </p>
          </div>

          <Button
            type="button"
            onClick={() => setFormMode({ type: "create" })}
            className="h-8 rounded-md bg-hubee-800 px-3.5 text-xs font-semibold text-hubee-50 hover:bg-hubee-900 dark:bg-hubee-400 dark:text-hubee-800 dark:hover:bg-hubee-300"
          >
            <Plus aria-hidden="true" className="size-3.5" />
            Criar organização
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold">Organizações</h3>
            <Button
              type="button"
              variant="outline"
              onClick={() => setFormMode({ type: "create" })}
              className="h-7 rounded-md border-hubee-300 px-3 text-xs font-semibold text-hubee-800 hover:bg-hubee-100 dark:border-hubee-50/20 dark:bg-transparent dark:text-hubee-50 dark:hover:bg-hubee-750"
            >
              <Plus aria-hidden="true" className="size-3.5" />
              Nova organização
            </Button>
          </div>

          <ul className="flex flex-col gap-2.5">
            {organizations.map((org) => (
              <li
                key={org.orgId}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-hubee-200 bg-hubee-100/50 px-3.5 py-2.5 dark:border-hubee-50/15 dark:bg-hubee-50/5"
              >
                <div className="space-y-0.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold">{org.organizationName}</span>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold",
                        badgeStyles[org.level],
                      )}
                    >
                      {badgeLabels[org.level]}
                    </span>
                  </div>
                  <p className="text-xs text-hubee-neutral-300 dark:text-hubee-200">{levelLabels[org.level]}</p>
                </div>

                {canManageOrganization(org) ? (
                  <Button
                    type="button"
                    onClick={() => setFormMode({ type: "edit", org })}
                    className="h-8 rounded-md bg-hubee-400 px-3 text-xs font-semibold text-hubee-800 hover:bg-hubee-300 focus-visible:ring-hubee-600/40"
                  >
                    <Pencil aria-hidden="true" className="size-3.5" />
                    Editar organização
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    disabled
                    aria-disabled="true"
                    title="Apenas Administradores da organização podem editar seus dados cadastrais"
                    className="h-8 rounded-md border-stone-300 bg-stone-200/70 px-3 text-xs font-semibold text-stone-500 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400"
                  >
                    <Lock aria-hidden="true" className="size-3.5" />
                    Editar organização
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </ContaCard>
  );
}
