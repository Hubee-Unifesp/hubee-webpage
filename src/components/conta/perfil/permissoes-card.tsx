"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, Lock, Pencil, Plus } from "lucide-react";
import { AuthField, AuthInput, authInputClassName, fieldA11y } from "@/components/auth/auth-field";
import {
  CUSTOM_ORGANIZATIONS_STORAGE_KEY,
  type StoredOrganization,
} from "@/components/auth/create-organization-screen";
import { FormAlert } from "@/components/auth/form-alert";
import { ContaCard } from "@/components/conta/conta-card";
import { useToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { canCreateEvents } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import {
  organizationSchema,
  type OrganizationFormInputs,
} from "@/lib/validations/organization.schema";
import type { OrganizationAccessLevel, Usuario, UsuarioOrganizacao } from "@/types/usuario";
import { fieldInputClassName, fieldLabelClassName } from "./perfil-styles";

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

const DEFAULT_AVAILABLE_ORGANIZATIONS: readonly StoredOrganization[] = [
  {
    id: "org-atletica-unifesp",
    name: "Atlética Unifesp",
    description: "Eventos esportivos e universitários da Unifesp.",
  },
  {
    id: "org-coletivo-cultural",
    name: "Coletivo Cultural",
    description: "Mostras artísticas, saraus e festivais estudantis.",
  },
  {
    id: "org-hubee-producoes",
    name: "Hubee Produções",
    description: "Produtora oficial de eventos acadêmicos e formaturas.",
  },
  {
    id: "org-diretorio-academico",
    name: "Diretório Acadêmico",
    description: "Semanas acadêmicas, palestras e recepção de calouros.",
  },
];

function loadStoredOrganizations(): StoredOrganization[] {
  if (typeof window === "undefined") return [...DEFAULT_AVAILABLE_ORGANIZATIONS];
  try {
    const raw = window.localStorage.getItem(CUSTOM_ORGANIZATIONS_STORAGE_KEY);
    const custom: StoredOrganization[] = raw ? JSON.parse(raw) : [];
    const seen = new Set<string>();
    const merged: StoredOrganization[] = [];
    for (const item of [...custom, ...DEFAULT_AVAILABLE_ORGANIZATIONS]) {
      if (!item?.id || !item?.name) continue;
      const key = item.name.toLowerCase();
      if (seen.has(item.id) || seen.has(key)) continue;
      seen.add(item.id);
      seen.add(key);
      merged.push(item);
    }
    return merged;
  } catch {
    return [...DEFAULT_AVAILABLE_ORGANIZATIONS];
  }
}

function saveStoredOrganization(org: StoredOrganization) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(CUSTOM_ORGANIZATIONS_STORAGE_KEY);
    const current: StoredOrganization[] = raw ? JSON.parse(raw) : [];
    const filtered = current.filter(
      (item) => item.id !== org.id && item.name.toLowerCase() !== org.name.toLowerCase(),
    );
    window.localStorage.setItem(CUSTOM_ORGANIZATIONS_STORAGE_KEY, JSON.stringify([org, ...filtered]));
  } catch {
    // Ignora erros de armazenamento em ambientes restritos.
  }
}

function buildOrgId(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `org-${slug || "nova"}`;
}

type FormMode =
  | { type: "closed" }
  | { type: "create" }
  | { type: "edit"; orgId: string };

/** Cartão do Meu Perfil com o tipo da conta, vínculo e gestão cadastral de organizações (GOL-196 / GOL-199). */
export function PermissoesCard({ usuario }: { usuario: Usuario }) {
  const toast = useToast();
  const { updateUserState } = useAuth();

  const [organizations, setOrganizations] = useState<UsuarioOrganizacao[]>(
    () => usuario.organizations ?? [],
  );
  const [descriptionsById, setDescriptionsById] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const org of loadStoredOrganizations()) {
      if (org.description) initial[org.id] = org.description;
    }
    return initial;
  });
  const [availableOrgs, setAvailableOrgs] = useState<StoredOrganization[]>(() =>
    loadStoredOrganizations(),
  );
  const [selectedExistingOrgId, setSelectedExistingOrgId] = useState<string>("");
  const [linkError, setLinkError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [formMode, setFormMode] = useState<FormMode>(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("criarOrganizacao") === "1") {
        return { type: "create" };
      }
    }
    return { type: "closed" };
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OrganizationFormInputs>({
    resolver: zodResolver(organizationSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: true,
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const effectiveUser: Usuario = {
    ...usuario,
    signupIntent: organizations.length > 0 ? "ORGANIZE" : usuario.signupIntent,
    organizations,
  };

  const summary = [
    { label: "Tipo de conta", value: roleLabels[effectiveUser.role] },
    {
      label: "Objetivo no cadastro",
      value: effectiveUser.signupIntent ? intentLabels[effectiveUser.signupIntent] : "Não informado",
    },
    {
      label: "Criação de eventos",
      value: canCreateEvents(effectiveUser) ? "Permitida" : "Não permitida",
    },
  ];

  function syncUserOrganizations(nextOrganizations: UsuarioOrganizacao[]) {
    setOrganizations(nextOrganizations);
    updateUserState({
      ...usuario,
      signupIntent: nextOrganizations.length > 0 ? "ORGANIZE" : usuario.signupIntent,
      organizations: nextOrganizations,
    });
  }

  function openCreateForm() {
    setFeedbackMessage(null);
    setLinkError(null);
    reset({ name: "", description: "" });
    setFormMode({ type: "create" });
  }

  function openEditForm(org: UsuarioOrganizacao) {
    setFeedbackMessage(null);
    setLinkError(null);
    reset({
      name: org.organizationName,
      description: descriptionsById[org.orgId] ?? "",
    });
    setFormMode({ type: "edit", orgId: org.orgId });
  }

  function closeForm() {
    reset({ name: "", description: "" });
    setFormMode({ type: "closed" });
  }

  function handleLinkExistingOrganization() {
    setLinkError(null);
    setFeedbackMessage(null);

    if (!selectedExistingOrgId) {
      setLinkError("Selecione uma organização da lista para vincular à sua conta.");
      return;
    }

    const chosen = availableOrgs.find((org) => org.id === selectedExistingOrgId);
    if (!chosen) return;

    if (organizations.some((org) => org.orgId === chosen.id)) {
      setLinkError("Sua conta já está vinculada a esta organização.");
      return;
    }

    const newMembership: UsuarioOrganizacao = {
      orgId: chosen.id,
      organizationName: chosen.name,
      role: "admin",
      permission: "full",
      level: "manage",
    };

    const next = [...organizations, newMembership];
    syncUserOrganizations(next);
    setSelectedExistingOrgId("");
    setFeedbackMessage(`Organização "${chosen.name}" vinculada com sucesso!`);
    toast.success(`Organização "${chosen.name}" vinculada à sua conta.`);
  }

  async function onSubmitOrganization(data: OrganizationFormInputs) {
    setFeedbackMessage(null);
    setLinkError(null);

    await new Promise((resolve) => setTimeout(resolve, 250));

    const trimmedName = data.name.trim();
    const trimmedDescription = data.description?.trim() || "";

    if (formMode.type === "edit") {
      const targetOrgId = formMode.orgId;
      const next = organizations.map((org) =>
        org.orgId === targetOrgId ? { ...org, organizationName: trimmedName } : org,
      );
      setDescriptionsById((prev) => ({
        ...prev,
        [targetOrgId]: trimmedDescription,
      }));
      saveStoredOrganization({
        id: targetOrgId,
        name: trimmedName,
        description: trimmedDescription || undefined,
      });
      syncUserOrganizations(next);
      setFormMode({ type: "closed" });
      setFeedbackMessage("Dados da organização atualizados com sucesso.");
      toast.success("Dados da organização atualizados com sucesso.");
      return;
    }

    const newOrgId = buildOrgId(trimmedName);
    const createdStored: StoredOrganization = {
      id: newOrgId,
      name: trimmedName,
      description: trimmedDescription || undefined,
    };

    saveStoredOrganization(createdStored);
    setAvailableOrgs(loadStoredOrganizations());
    if (trimmedDescription) {
      setDescriptionsById((prev) => ({ ...prev, [newOrgId]: trimmedDescription }));
    }

    const newMembership: UsuarioOrganizacao = {
      orgId: newOrgId,
      organizationName: trimmedName,
      role: "admin",
      permission: "full",
      level: "manage",
    };

    const next = [
      ...organizations.filter((org) => org.orgId !== newOrgId),
      newMembership,
    ];
    syncUserOrganizations(next);
    setFormMode({ type: "closed" });
    setFeedbackMessage("Organização criada com sucesso!");
    toast.success("Organização criada com sucesso!");
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

      {feedbackMessage && <FormAlert variant="success">{feedbackMessage}</FormAlert>}

      {formMode.type !== "closed" ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold">
              {formMode.type === "edit" ? "Editar organização" : "Criar organização"}
            </h3>
            <span className="text-xs text-hubee-neutral-300 dark:text-hubee-200">
              Acesso: Administrador
            </span>
          </div>

          <form
            noValidate
            aria-busy={isSubmitting}
            onSubmit={handleSubmit(onSubmitOrganization)}
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <AuthField
                id="conta-org-name"
                label="Nome da organização"
                labelClassName={fieldLabelClassName}
                error={errors.name?.message}
              >
                <AuthInput
                  {...fieldA11y("conta-org-name", errors.name?.message)}
                  type="text"
                  placeholder="Ex.: Atlética Unifesp"
                  className={fieldInputClassName}
                  {...register("name")}
                />
              </AuthField>

              <AuthField
                id="conta-org-description"
                label="Descrição (opcional)"
                labelClassName={fieldLabelClassName}
                error={errors.description?.message}
              >
                <AuthInput
                  {...fieldA11y("conta-org-description", errors.description?.message)}
                  type="text"
                  placeholder="Descreva brevemente sua organização..."
                  className={fieldInputClassName}
                  {...register("description")}
                />
              </AuthField>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={closeForm}
                disabled={isSubmitting}
                className="h-9 rounded-md border-hubee-300 px-3.5 text-xs font-medium text-hubee-800 hover:bg-hubee-100 dark:border-hubee-50/20 dark:bg-transparent dark:text-hubee-50 dark:hover:bg-hubee-750"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-9 rounded-md bg-hubee-400 px-4 text-xs font-semibold text-hubee-800 hover:bg-hubee-300 focus-visible:ring-hubee-600/40"
              >
                {isSubmitting && <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />}
                {isSubmitting
                  ? formMode.type === "edit"
                    ? "Salvando..."
                    : "Criando organização..."
                  : formMode.type === "edit"
                    ? "Salvar alterações"
                    : "Criar organização"}
              </Button>
            </div>
          </form>
        </div>
      ) : organizations.length === 0 ? (
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-bold">Organizações</h3>
            <p className="mt-1 text-xs text-hubee-neutral-300 dark:text-hubee-200">
              Você ainda não faz parte de nenhuma organização. Selecione uma organização existente
              ou crie uma nova para liberar a criação de eventos.
            </p>
          </div>

          <div className="space-y-3 rounded-xl border border-hubee-200 bg-hubee-100/60 p-3.5 dark:border-hubee-50/15 dark:bg-hubee-50/5">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label
                  htmlFor="perfil-org-existente"
                  className="mb-1 block text-xs font-semibold text-hubee-800 dark:text-hubee-50"
                >
                  Organização existente
                </label>
                <select
                  id="perfil-org-existente"
                  value={selectedExistingOrgId}
                  onChange={(event) => {
                    setSelectedExistingOrgId(event.target.value);
                    setLinkError(null);
                  }}
                  aria-invalid={Boolean(linkError)}
                  aria-describedby={linkError ? "perfil-org-existente-error" : undefined}
                  className={cn(
                    "h-9 w-full rounded-md border px-3 text-xs outline-none focus-visible:ring-3",
                    authInputClassName,
                  )}
                >
                  <option value="" className="bg-hubee-50 text-hubee-800 dark:bg-hubee-800 dark:text-hubee-50">
                    Selecione uma organização da lista...
                  </option>
                  {availableOrgs.map((org) => (
                    <option
                      key={org.id}
                      value={org.id}
                      className="bg-hubee-50 text-hubee-800 dark:bg-hubee-800 dark:text-hubee-50"
                    >
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                type="button"
                onClick={handleLinkExistingOrganization}
                className="h-9 shrink-0 rounded-md bg-hubee-400 px-4 text-xs font-semibold text-hubee-800 hover:bg-hubee-300 focus-visible:ring-hubee-600/40"
              >
                Vincular à organização
              </Button>
            </div>

            {linkError && (
              <p
                id="perfil-org-existente-error"
                role="alert"
                className="text-xs font-medium text-red-600 dark:text-red-400"
              >
                {linkError}
              </p>
            )}

            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-hubee-200 pt-2.5 dark:border-hubee-50/10">
              <span className="text-xs text-hubee-neutral-300 dark:text-hubee-200">
                Não encontrou sua organização na lista?
              </span>
              <Button
                type="button"
                onClick={openCreateForm}
                className="h-8 rounded-md bg-hubee-800 px-3.5 text-xs font-semibold text-hubee-50 hover:bg-hubee-900 dark:bg-hubee-400 dark:text-hubee-800 dark:hover:bg-hubee-300"
              >
                <Plus aria-hidden="true" className="size-3.5" />
                Criar organização
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-bold">Organizações</h3>
            <Button
              type="button"
              variant="outline"
              onClick={openCreateForm}
              className="h-7 rounded-md border-hubee-300 px-3 text-xs font-semibold text-hubee-800 hover:bg-hubee-100 dark:border-hubee-50/20 dark:bg-transparent dark:text-hubee-50 dark:hover:bg-hubee-750"
            >
              <Plus aria-hidden="true" className="size-3.5" />
              Nova organização
            </Button>
          </div>

          <ul className="flex flex-col gap-2.5">
            {organizations.map((org) => {
              const canEdit = canManageOrganization(org);
              const description = descriptionsById[org.orgId];

              return (
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
                    <p className="text-xs text-hubee-neutral-300 dark:text-hubee-200">
                      {levelLabels[org.level]}
                    </p>
                    {description && (
                      <p className="text-xs text-hubee-750/80 dark:text-hubee-200/80">
                        {description}
                      </p>
                    )}
                  </div>

                  {canEdit ? (
                    <Button
                      type="button"
                      onClick={() => openEditForm(org)}
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
              );
            })}
          </ul>
        </div>
      )}
    </ContaCard>
  );
}
