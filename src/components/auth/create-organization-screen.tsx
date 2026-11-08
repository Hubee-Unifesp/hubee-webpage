"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ArrowLeft } from "lucide-react";
import {
  organizationSchema,
  type OrganizationFormInputs,
} from "@/lib/validations/organization.schema";
import { AuthField, AuthInput, authInputClassName, fieldA11y } from "./auth-field";
import { AuthHeading, authLinkClassName } from "./auth-heading";
import { AuthSubmitButton } from "./auth-submit-button";
import { FormAlert } from "./form-alert";

export const CUSTOM_ORGANIZATIONS_STORAGE_KEY = "hubee_custom_organizations";

export interface StoredOrganization {
  id: string;
  name: string;
  description?: string;
}

function buildOrganizationSlugId(name: string): string {
  const slug = name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `org-${slug || "nova"}`;
}

function saveCustomOrganization(org: StoredOrganization) {
  try {
    const raw = window.localStorage.getItem(CUSTOM_ORGANIZATIONS_STORAGE_KEY);
    const current: StoredOrganization[] = raw ? JSON.parse(raw) : [];
    const filtered = current.filter((item) => item.name.toLowerCase() !== org.name.toLowerCase());
    window.localStorage.setItem(CUSTOM_ORGANIZATIONS_STORAGE_KEY, JSON.stringify([org, ...filtered]));
  } catch {
    // Ignora falhas de localStorage em ambientes restritos.
  }
}

export function CreateOrganizationScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
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

  function clearMessages() {
    setError(null);
    setSuccessMessage(null);
  }

  async function onSubmit(data: OrganizationFormInputs) {
    setIsLoading(true);
    clearMessages();

    const trimmedName = data.name.trim();
    const trimmedDescription = data.description?.trim() || undefined;

    const createdOrg: StoredOrganization = {
      id: buildOrganizationSlugId(trimmedName),
      name: trimmedName,
      description: trimmedDescription,
    };

    saveCustomOrganization(createdOrg);
    setSuccessMessage("Organização criada com sucesso! Redirecionando para o cadastro...");

    setTimeout(() => {
      router.push(`/cadastro?intent=ORGANIZE&orgId=${encodeURIComponent(createdOrg.id)}`);
    }, 600);
  }

  return (
    <section className="w-full max-w-2xl">
      <AuthHeading
        title="Criar organização"
        description="Cadastre sua atlética, coletivo, centro acadêmico ou produtora para organizar eventos no Hubee."
      />

      {error && <FormAlert variant="error">{error}</FormAlert>}
      {successMessage && <FormAlert variant="success">{successMessage}</FormAlert>}

      <form noValidate className="space-y-4" onSubmit={handleSubmit(onSubmit)} onChange={clearMessages}>
        <AuthField
          id="organization-name"
          label="Nome da organização"
          error={errors.name?.message}
          description="Ex.: Atlética Unifesp, Diretório Acadêmico, Coletivo Cultural"
        >
          <AuthInput
            {...fieldA11y("organization-name", errors.name?.message)}
            type="text"
            placeholder="Digite o nome da sua organização"
            {...register("name")}
          />
        </AuthField>

        <AuthField
          id="organization-description"
          label="Descrição (opcional)"
          error={errors.description?.message}
          description="Conte brevemente sobre sua organização e os tipos de eventos que realiza."
        >
          <textarea
            {...fieldA11y("organization-description", errors.description?.message)}
            rows={4}
            placeholder="Descreva sua organização..."
            className={`w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-3 ${authInputClassName} h-auto min-h-24`}
            {...register("description")}
          />
        </AuthField>

        <AuthSubmitButton isLoading={isLoading} loadingLabel="Criando organização...">
          Criar organização
        </AuthSubmitButton>
      </form>

      <p className="mt-6 text-sm text-hubee-750 dark:text-hubee-neutral-50">
        Já cadastrou ou quer selecionar uma organização existente?
        <Link
          href="/cadastro?intent=ORGANIZE"
          className={`mt-2 inline-flex items-center gap-1.5 ${authLinkClassName}`}
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Voltar para o cadastro de organizador
        </Link>
      </p>
    </section>
  );
}

