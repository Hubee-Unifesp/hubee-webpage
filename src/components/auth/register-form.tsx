"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Building2, Calendar, Plus, Ticket, type LucideIcon } from "lucide-react";
import {
  PASSWORD_MIN_LENGTH,
  registerSchema,
  type RegisterFormInputs,
  type SignupIntent,
} from "@/lib/validations/auth.schema";
import { AuthField, AuthInput, authInputClassName, fieldA11y } from "./auth-field";
import { AuthHeading, authLinkClassName } from "./auth-heading";
import { AuthSubmitButton } from "./auth-submit-button";
import {
  CUSTOM_ORGANIZATIONS_STORAGE_KEY,
  type StoredOrganization,
} from "./create-organization-screen";
import { FormAlert } from "./form-alert";
import { PasswordInput } from "./password-input";

const intentOptions: readonly { value: SignupIntent; label: string; icon: LucideIcon }[] = [
  { value: "BUY", label: "Quero comprar ingressos", icon: Ticket },
  { value: "ORGANIZE", label: "Quero organizar eventos", icon: Calendar },
];

interface PublicOrganization {
  id: string;
  name: string;
}

const DEFAULT_ORGANIZATIONS: readonly PublicOrganization[] = [
  { id: "org-atletica-unifesp", name: "Atlética Unifesp" },
  { id: "org-coletivo-cultural", name: "Coletivo Cultural" },
  { id: "org-hubee-producoes", name: "Hubee Produções" },
  { id: "org-diretorio-academico", name: "Diretório Acadêmico" },
];

interface RegisterFormProps {
  onSubmit: (data: RegisterFormInputs) => void | Promise<void>;
  onEdit?: () => void;
  isLoading: boolean;
  defaultIntent?: SignupIntent;
  defaultOrganizationId?: string;
  error?: string | null;
  emailError?: string | null;
  successMessage?: string | null;
}

function loadCustomOrganizations(): PublicOrganization[] {
  try {
    const raw = window.localStorage.getItem(CUSTOM_ORGANIZATIONS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredOrganization[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((org) => org && typeof org.id === "string" && typeof org.name === "string");
  } catch {
    return [];
  }
}

function mergeOrganizations(...lists: (readonly PublicOrganization[])[]): PublicOrganization[] {
  const seenNames = new Set<string>();
  const seenIds = new Set<string>();
  const result: PublicOrganization[] = [];
  for (const list of lists) {
    for (const org of list) {
      const lowerName = org.name.toLowerCase();
      if (seenIds.has(org.id) || seenNames.has(lowerName)) continue;
      seenIds.add(org.id);
      seenNames.add(lowerName);
      result.push(org);
    }
  }
  return result;
}

export function RegisterForm({
  onSubmit,
  onEdit,
  isLoading,
  defaultIntent = "BUY",
  defaultOrganizationId = "",
  error,
  emailError,
  successMessage,
}: RegisterFormProps) {
  const [organizations] = useState<readonly PublicOrganization[]>(() =>
    mergeOrganizations(loadCustomOrganizations(), DEFAULT_ORGANIZATIONS),
  );

  const {
    control,
    register,
    handleSubmit,
    setError,
    setFocus,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: true,
    defaultValues: {
      signupIntent: defaultIntent,
      organizationId: defaultOrganizationId,
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    setValue("signupIntent", defaultIntent);
  }, [defaultIntent, setValue]);

  useEffect(() => {
    if (defaultOrganizationId) {
      setValue("organizationId", defaultOrganizationId);
    }
  }, [defaultOrganizationId, setValue]);

  const signupIntent = useWatch({ control, name: "signupIntent" });
  const isOrganizer = signupIntent === "ORGANIZE";

  useEffect(() => {
    if (!emailError) return;
    setError("email", { type: "server", message: emailError });
    setFocus("email");
  }, [emailError, setError, setFocus]);

  return (
    <section className="w-full max-w-2xl">
      <AuthHeading title="Criar conta" description="Escolha seu perfil e preencha os dados abaixo." />

      {error && <FormAlert variant="error">{error}</FormAlert>}
      {successMessage && <FormAlert variant="success">{successMessage}</FormAlert>}

      <form noValidate className="space-y-4" onSubmit={handleSubmit(onSubmit)} onChange={onEdit}>
        <fieldset className="space-y-2">
          <legend className="mb-2 text-base font-medium text-hubee-800 dark:text-hubee-50">Qual é o seu objetivo?</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {intentOptions.map(({ value, label, icon: Icon }) => (
              <label
                key={value}
                className="flex cursor-pointer flex-col items-start gap-2 rounded-xl border border-hubee-neutral-50 bg-white p-4 text-sm font-semibold text-hubee-800 transition-colors hover:bg-hubee-100 has-checked:border-hubee-500 has-checked:bg-hubee-100 has-checked:ring-1 has-checked:ring-hubee-500 has-focus-visible:ring-3 has-focus-visible:ring-hubee-500/50 dark:border-hubee-700 dark:bg-hubee-900 dark:text-hubee-50 dark:hover:bg-hubee-800 dark:has-checked:bg-hubee-800"
              >
                <input type="radio" value={value} className="peer sr-only" {...register("signupIntent")} />
                <Icon aria-hidden="true" className="size-5 text-hubee-neutral-300 peer-checked:text-hubee-600 dark:peer-checked:text-hubee-400" />
                {label}
              </label>
            ))}
          </div>
        </fieldset>

        {isOrganizer && (
          <div className="space-y-3 rounded-xl border border-hubee-500/40 bg-hubee-100/60 p-4 dark:border-hubee-700 dark:bg-hubee-800/60">
            <AuthField
              id="register-organization"
              label="Organização existente"
              description="Selecione sua agremiação ou organização caso ela já esteja cadastrada."
              error={errors.organizationId?.message}
            >
              <select
                {...fieldA11y("register-organization", errors.organizationId?.message)}
                className={`w-full rounded-md border px-3 py-1 text-sm outline-none focus-visible:ring-3 ${authInputClassName}`}
                {...register("organizationId")}
              >
                <option value="">Selecione uma organização da lista...</option>
                {organizations.map((org) => (
                  <option key={org.id} value={org.id}>
                    {org.name}
                  </option>
                ))}
              </select>
            </AuthField>

            <div className="flex flex-col justify-between gap-3 border-t border-hubee-500/20 pt-3 sm:flex-row sm:items-center dark:border-hubee-700">
              <p className="flex items-center gap-2 text-xs text-hubee-750 dark:text-hubee-100">
                <Building2 aria-hidden="true" className="size-4 shrink-0 text-hubee-600 dark:text-hubee-400" />
                Não encontrou sua organização na lista?
              </p>
              <Link
                href="/organizacoes/nova"
                className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-md bg-hubee-750 px-4 text-xs font-semibold text-hubee-50 transition-colors hover:bg-hubee-800 focus-visible:ring-3 focus-visible:ring-hubee-500/50 dark:bg-hubee-500 dark:text-hubee-900 dark:hover:bg-hubee-400"
              >
                <Plus aria-hidden="true" className="size-4" />
                Criar organização
              </Link>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <AuthField id="register-name" label="Nome completo" error={errors.fullName?.message}>
            <AuthInput
              {...fieldA11y("register-name", errors.fullName?.message)}
              type="text"
              autoComplete="name"
              placeholder="Digite seu nome completo"
              {...register("fullName")}
            />
          </AuthField>

          <AuthField id="register-email" label="E-mail" error={errors.email?.message}>
            <AuthInput
              {...fieldA11y("register-email", errors.email?.message)}
              type="email"
              autoComplete="email"
              placeholder="exemplo@email.com"
              {...register("email")}
            />
          </AuthField>

          <AuthField
            id="register-password"
            label="Senha"
            error={errors.password?.message}
            description={`Mínimo de ${PASSWORD_MIN_LENGTH} caracteres`}
          >
            <PasswordInput
              {...fieldA11y("register-password", errors.password?.message)}
              autoComplete="new-password"
              {...register("password")}
            />
          </AuthField>

          <AuthField id="register-confirm-password" label="Confirmação de senha" error={errors.confirmPassword?.message}>
            <PasswordInput
              {...fieldA11y("register-confirm-password", errors.confirmPassword?.message)}
              autoComplete="new-password"
              {...register("confirmPassword")}
            />
          </AuthField>

          <AuthSubmitButton isLoading={isLoading} loadingLabel="Criando conta...">
            Criar conta
          </AuthSubmitButton>
        </div>
      </form>

      <p className="mt-6 text-sm text-hubee-750 dark:text-hubee-neutral-50">
        Já tem uma conta Hubee?
        <Link href="/login" className={`mt-2 block ${authLinkClassName}`}>
          Fazer login
        </Link>
      </p>
    </section>
  );
}
