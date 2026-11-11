"use client";

import { useEffect } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { Building2, Calendar, Ticket, type LucideIcon } from "lucide-react";
import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  registerSchema,
  type RegisterFormInputs,
  type SignupIntent,
} from "@/lib/validations/auth.schema";
import { AuthField, AuthInput, fieldA11y } from "./auth-field";
import { AuthHeading, authLinkClassName } from "./auth-heading";
import { AuthSubmitButton } from "./auth-submit-button";
import { FormAlert } from "./form-alert";
import { PasswordInput } from "./password-input";

const intentOptions: readonly { value: SignupIntent; label: string; icon: LucideIcon }[] = [
  { value: "BUY", label: "Quero comprar ingressos", icon: Ticket },
  { value: "ORGANIZE", label: "Quero organizar eventos", icon: Calendar },
];

interface RegisterFormProps {
  onSubmit: (data: RegisterFormInputs) => void | Promise<void>;
  onEdit?: () => void;
  isLoading: boolean;
  defaultIntent?: SignupIntent;
  error?: string | null;
  emailError?: string | null;
  successMessage?: string | null;
}

export function RegisterForm({
  onSubmit,
  onEdit,
  isLoading,
  defaultIntent = "BUY",
  error,
  emailError,
  successMessage,
}: RegisterFormProps) {
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
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    setValue("signupIntent", defaultIntent);
  }, [defaultIntent, setValue]);

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
          <p className="flex items-start gap-2 rounded-xl border border-hubee-500/40 bg-hubee-100/60 p-4 text-xs text-hubee-750 dark:border-hubee-700 dark:bg-hubee-800/60 dark:text-hubee-100">
            <Building2 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-hubee-600 dark:text-hubee-400" />
            Depois de criar a conta, você cadastra a sua organização e já passa a gerenciar os eventos dela.
          </p>
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
            description={`De ${PASSWORD_MIN_LENGTH} a ${PASSWORD_MAX_LENGTH} caracteres`}
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
