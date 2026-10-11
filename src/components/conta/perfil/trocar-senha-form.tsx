"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AuthField, fieldA11y } from "@/components/auth/auth-field";
import { PasswordInput } from "@/components/auth/password-input";
import { ContaCard } from "@/components/conta/conta-card";
import { useToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { PASSWORD_MIN_LENGTH } from "@/lib/validations/auth.schema";
import { changePasswordSchema, type ChangePasswordInputs } from "@/lib/validations/profile.schema";
import { fieldInputClassName, fieldLabelClassName, submitButtonClassName } from "./perfil-styles";

export function TrocarSenhaForm() {
  const toast = useToast();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInputs>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: true,
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  function aoSalvar() {
    // TODO(profile-api): enviar a troca de senha para a API.
    reset();
    toast.success("Senha alterada com sucesso.");
  }

  return (
    <ContaCard title="Trocar Senha" description="Para sua segurança, use uma senha forte">
      <form onSubmit={handleSubmit(aoSalvar)} noValidate className="flex flex-col gap-5">
        <AuthField
          id="senha-atual"
          label="Senha Atual"
          labelClassName={fieldLabelClassName}
          error={errors.currentPassword?.message}
        >
          <PasswordInput
            {...fieldA11y("senha-atual", errors.currentPassword?.message)}
            autoComplete="current-password"
            className={fieldInputClassName}
            {...register("currentPassword")}
          />
        </AuthField>

        <AuthField
          id="senha-nova"
          label="Nova Senha"
          labelClassName={fieldLabelClassName}
          error={errors.newPassword?.message}
          description={`Mínimo de ${PASSWORD_MIN_LENGTH} caracteres`}
        >
          <PasswordInput
            {...fieldA11y("senha-nova", errors.newPassword?.message)}
            autoComplete="new-password"
            className={fieldInputClassName}
            {...register("newPassword")}
          />
        </AuthField>

        <AuthField
          id="senha-confirmar"
          label="Confirmar Nova Senha"
          labelClassName={fieldLabelClassName}
          error={errors.confirmPassword?.message}
        >
          <PasswordInput
            {...fieldA11y("senha-confirmar", errors.confirmPassword?.message)}
            autoComplete="new-password"
            className={fieldInputClassName}
            {...register("confirmPassword")}
          />
        </AuthField>

        <Button type="submit" className={submitButtonClassName}>
          Salvar Senha
        </Button>
      </form>
    </ContaCard>
  );
}
