"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2 } from "lucide-react";
import { AuthField, AuthInput, authInputClassName, fieldA11y } from "@/components/auth/auth-field";
import { FormAlert } from "@/components/auth/form-alert";
import { fieldInputClassName, fieldLabelClassName } from "@/components/conta/perfil/perfil-styles";
import { useToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganizacaoAtiva } from "@/hooks/useMeusEventos";
import {
  createOrganization,
  getOrganizationById,
  getOrganizationErrorMessage,
  updateOrganization,
} from "@/lib/api/organizations";
import { cn } from "@/lib/utils";
import {
  ORGANIZATION_DESCRIPTION_MAX_LENGTH,
  organizationSchema,
  type OrganizationFormInputs,
} from "@/lib/validations/organization.schema";
import type { Organizacao } from "@/types/organizacao";

export type OrganizacaoFormMode =
  | { type: "create" }
  /** `initialName` preenche o nome na hora; a descrição não vem em `/auth/me`, então é buscada na API. */
  | { type: "edit"; orgId: string; initialName: string };

interface OrganizacaoFormProps {
  mode: OrganizacaoFormMode;
  /** Chamado depois de salvar e de a sessão já refletir a mudança. */
  onSuccess: (organizacao: Organizacao) => void;
  onCancel?: () => void;
}

type DescricaoState = "loading" | "ok" | "error";

/**
 * Cadastro e edição de organização integrados à `hubee-api` (`POST` e `PATCH /organizations`).
 * Ao criar, o usuário vira administrador da organização; a sessão é relida (`syncUser`) para o vínculo
 * valer na hora, sem relogar, e a organização nova vira a ativa do painel.
 */
export function OrganizacaoForm({ mode, onSuccess, onCancel }: OrganizacaoFormProps) {
  const toast = useToast();
  const { syncUser } = useAuth();
  const { selecionarOrganizacao } = useOrganizacaoAtiva();

  const isEdit = mode.type === "edit";
  const orgId = mode.type === "edit" ? mode.orgId : null;
  const initialName = mode.type === "edit" ? mode.initialName : "";

  const [formError, setFormError] = useState<string | null>(null);
  const [descricaoState, setDescricaoState] = useState<DescricaoState>(isEdit ? "loading" : "ok");
  const [attempt, setAttempt] = useState(0);

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
    defaultValues: { name: initialName, description: "" },
  });

  useEffect(() => {
    if (!orgId) return;

    let active = true;
    getOrganizationById(orgId)
      .then((organizacao) => {
        if (!active) return;
        reset({ name: organizacao.name, description: organizacao.description ?? "" });
        setDescricaoState("ok");
      })
      .catch((error: unknown) => {
        if (!active) return;
        const message = getOrganizationErrorMessage(error, "load");
        setFormError(message);
        toast.error(message);
        setDescricaoState("error");
      });

    return () => {
      active = false;
    };
  }, [orgId, attempt, reset, toast]);

  function retryLoad() {
    setFormError(null);
    setDescricaoState("loading");
    setAttempt((value) => value + 1);
  }

  async function onSubmit(data: OrganizationFormInputs) {
    setFormError(null);
    const action = isEdit ? "update" : "create";

    let organizacao: Organizacao;
    try {
      organizacao =
        mode.type === "edit"
          ? await updateOrganization(mode.orgId, {
              name: data.name,
              description: data.description ?? "",
            })
          : await createOrganization(data);
    } catch (error) {
      const message = getOrganizationErrorMessage(error, action);
      setFormError(message);
      toast.error(message);
      return;
    }

    try {
      await syncUser();
    } catch {
      toast.error(
        "Os dados foram salvos, mas não foi possível atualizar sua sessão. Recarregue a página.",
      );
    }

    if (mode.type === "create") selecionarOrganizacao(organizacao.id);
    toast.success(
      isEdit ? "Dados da organização atualizados com sucesso." : "Organização criada com sucesso!",
    );
    onSuccess(organizacao);
  }

  const carregando = descricaoState === "loading";
  const bloqueado = isSubmitting || carregando || descricaoState === "error";

  return (
    <form noValidate aria-busy={isSubmitting || carregando} onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {formError && <FormAlert variant="error">{formError}</FormAlert>}

      <AuthField
        id="organizacao-nome"
        label="Nome da organização"
        labelClassName={fieldLabelClassName}
        error={errors.name?.message}
        description="Ex.: Atlética Unifesp, Diretório Acadêmico, Coletivo Cultural"
      >
        <AuthInput
          {...fieldA11y("organizacao-nome", errors.name?.message)}
          type="text"
          placeholder="Digite o nome da sua organização"
          disabled={bloqueado}
          className={fieldInputClassName}
          {...register("name")}
        />
      </AuthField>

      <AuthField
        id="organizacao-descricao"
        label="Descrição (opcional)"
        labelClassName={fieldLabelClassName}
        error={errors.description?.message}
        description={`Conte brevemente sobre a organização e os eventos que ela realiza (até ${ORGANIZATION_DESCRIPTION_MAX_LENGTH} caracteres).`}
      >
        <Textarea
          {...fieldA11y("organizacao-descricao", errors.description?.message)}
          rows={4}
          placeholder="Descreva sua organização..."
          disabled={bloqueado}
          className={cn("min-h-24 text-sm md:text-sm", authInputClassName, "h-auto")}
          {...register("description")}
        />
      </AuthField>

      <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
        {descricaoState === "error" && (
          <Button type="button" variant="outline" onClick={retryLoad} className="h-9 px-3.5 text-xs font-medium">
            Tentar novamente
          </Button>
        )}
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-9 rounded-md border-hubee-300 px-3.5 text-xs font-medium text-hubee-800 hover:bg-hubee-100 dark:border-hubee-50/20 dark:bg-transparent dark:text-hubee-50 dark:hover:bg-hubee-750"
          >
            Cancelar
          </Button>
        )}
        <Button
          type="submit"
          disabled={bloqueado}
          className="h-9 rounded-md bg-hubee-400 px-4 text-xs font-semibold text-hubee-800 hover:bg-hubee-300 focus-visible:ring-hubee-600/40"
        >
          {(isSubmitting || carregando) && <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />}
          {carregando
            ? "Carregando..."
            : isSubmitting
              ? isEdit
                ? "Salvando..."
                : "Criando organização..."
              : isEdit
                ? "Salvar alterações"
                : "Criar organização"}
        </Button>
      </div>
    </form>
  );
}
