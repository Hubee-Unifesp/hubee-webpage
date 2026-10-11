"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { loginSchema, PASSWORD_MIN_LENGTH, type LoginFormInputs } from "@/lib/validations/auth.schema";
import { AuthField, AuthInput, fieldA11y } from "./auth-field";
import { AuthHeading, authLinkClassName } from "./auth-heading";
import { AuthSubmitButton } from "./auth-submit-button";
import { FormAlert } from "./form-alert";
import { PasswordInput } from "./password-input";

interface LoginFormProps {
  onSubmit: (data: LoginFormInputs) => void | Promise<void>;
  onEdit?: () => void;
  isLoading: boolean;
  error?: string | null;
  successMessage?: string | null;
}

export function LoginForm({ onSubmit, onEdit, isLoading, error, successMessage }: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: true,
    defaultValues: { email: "", password: "" },
  });

  return (
    <section className="w-full max-w-2xl">
      <AuthHeading title="Login" description="Acesse sua conta agora mesmo!" />

      {error && <FormAlert variant="error">{error}</FormAlert>}
      {successMessage && <FormAlert variant="success">{successMessage}</FormAlert>}

      <form noValidate className="space-y-4" onSubmit={handleSubmit(onSubmit)} onChange={onEdit}>
        <AuthField id="login-email" label="E-mail" error={errors.email?.message}>
          <AuthInput
            {...fieldA11y("login-email", errors.email?.message)}
            type="email"
            autoComplete="email"
            {...register("email")}
          />
        </AuthField>

        <AuthField
          id="login-password"
          label="Senha"
          error={errors.password?.message}
          description={`Mínimo de ${PASSWORD_MIN_LENGTH} caracteres`}
        >
          <PasswordInput
            {...fieldA11y("login-password", errors.password?.message)}
            autoComplete="current-password"
            {...register("password")}
          />
        </AuthField>

        <div className="flex items-center justify-between gap-4 pt-1">
          <Label
            htmlFor="login-remember-me"
            className="flex items-center gap-2 text-sm font-normal text-hubee-800 dark:text-hubee-50"
          >
            <Checkbox id="login-remember-me" name="remember-me" />
            Lembre-me
          </Label>
          <span
            aria-disabled="true"
            className="cursor-not-allowed text-sm text-hubee-750 underline underline-offset-2 dark:text-hubee-neutral-50"
          >
            Esqueci minha senha
          </span>
        </div>

        <AuthSubmitButton isLoading={isLoading} loadingLabel="Entrando...">
          Entrar
        </AuthSubmitButton>
      </form>

      <p className="mt-6 text-sm text-hubee-750 dark:text-hubee-neutral-50">
        Ainda não tem uma conta Hubee?
        <Link href="/cadastro" className={`mt-2 block ${authLinkClassName}`}>
          Criar conta
        </Link>
      </p>
    </section>
  );
}
