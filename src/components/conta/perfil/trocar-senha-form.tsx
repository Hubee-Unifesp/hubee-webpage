"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AuthField, fieldA11y } from "@/components/auth/auth-field";
import { PasswordInput } from "@/components/auth/password-input";
import { ContaCard } from "@/components/conta/conta-card";
import { useToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { mapMessagesToFields, parseApiError } from "@/lib/api/errors";
import { changePassword } from "@/lib/api/users";
import {
  changePasswordSchema,
  NEW_PASSWORD_MAX_LENGTH,
  NEW_PASSWORD_MIN_LENGTH,
  type ChangePasswordInputs,
} from "@/lib/validations/profile.schema";
import { fieldInputClassName, fieldLabelClassName, submitButtonClassName } from "./perfil-styles";

/** Campos da API que podem falhar na validação; "atual" vem antes porque as duas mensagens citam "senha". */
const CAMPOS_DA_API = {
  currentPassword: /atual/i,
  newPassword: /senha/i,
} satisfies Partial<Record<keyof ChangePasswordInputs, RegExp>>;

export function TrocarSenhaForm() {
  const toast = useToast();
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordInputs>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onSubmit",
    reValidateMode: "onChange",
    shouldFocusError: true,
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  async function aoSalvar({ currentPassword, newPassword }: ChangePasswordInputs) {
    try {
      await changePassword({ currentPassword, newPassword });
      reset();
      toast.success("Senha alterada com sucesso.");
    } catch (error) {
      // Em qualquer erro o formulário não é resetado: o que a pessoa digitou continua nos campos.
      const { status, messages } = parseApiError(error);

      if (status === 401) {
        setError("currentPassword", { type: "server", message: "Senha atual incorreta." }, { shouldFocus: true });
        return;
      }

      if (status === 400) {
        const { fields, rest } = mapMessagesToFields(messages, CAMPOS_DA_API);
        const campos = Object.entries(fields) as [keyof typeof CAMPOS_DA_API, string][];
        campos.forEach(([campo, message], index) =>
          setError(campo, { type: "server", message }, { shouldFocus: index === 0 }),
        );
        if (campos.length > 0 && rest.length === 0) return;
      }

      toast.error("Não foi possível alterar a senha. Tente novamente.");
    }
  }

  return (
    <ContaCard title="Trocar Senha" description="Para sua segurança, use uma senha forte">
      <form onSubmit={handleSubmit(aoSalvar)} noValidate aria-busy={isSubmitting} className="flex flex-col gap-5">
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
          description={`De ${NEW_PASSWORD_MIN_LENGTH} a ${NEW_PASSWORD_MAX_LENGTH} caracteres`}
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

        <Button type="submit" disabled={isSubmitting} className={submitButtonClassName}>
          {isSubmitting ? "Salvando..." : "Salvar Senha"}
        </Button>
      </form>
    </ContaCard>
  );
}
