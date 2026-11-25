"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import { Check, ImageUp, Palette, RotateCcw, Trash2 } from "lucide-react";
import { AuthField, AuthInput, authInputClassName } from "@/components/auth/auth-field";
import { fieldInputClassName, fieldLabelClassName } from "@/components/conta/perfil/perfil-styles";
import { useToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import {
  DEFAULT_ORGANIZATION_BRANDING,
  ORG_IMAGE_ACCEPTED_TYPES,
  ORG_TAGLINE_MAX_LENGTH,
  ORGANIZATION_ACCENTS,
  compressOrganizationImage,
  validateOrganizationImageFile,
  type OrganizationAccent,
  type OrganizationBranding,
} from "@/lib/organization-branding";
import { cn } from "@/lib/utils";

interface OrganizacaoAparenciaFormProps {
  branding: OrganizationBranding;
  onChange: (next: OrganizationBranding) => boolean;
  onReset: () => void;
}

/**
 * Painel de customização visual da organização (capa da Hero/cartão, logo/avatar, slogan e cor de destaque).
 * Aplica as alterações em tempo real e salva localmente por organização até existir suporte dedicado na API.
 */
export function OrganizacaoAparenciaForm({
  branding,
  onChange,
  onReset,
}: OrganizacaoAparenciaFormProps) {
  const toast = useToast();
  const coverId = useId();
  const logoId = useId();
  const taglineId = useId();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [coverError, setCoverError] = useState<string | null>(null);
  const [logoError, setLogoError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<"cover" | "logo" | null>(null);

  const hasCustomizations =
    branding.coverImage !== null ||
    branding.logoImage !== null ||
    branding.tagline.trim() !== "" ||
    branding.accent !== DEFAULT_ORGANIZATION_BRANDING.accent;

  async function handleSelectCover(file: File | undefined) {
    if (!file) return;
    const error = validateOrganizationImageFile(file);
    if (error) {
      setCoverError(error);
      if (coverInputRef.current) coverInputRef.current.value = "";
      return;
    }

    setCoverError(null);
    setProcessing("cover");
    try {
      const dataUrl = await compressOrganizationImage(file, 1280, 0.8);
      const saved = onChange({ ...branding, coverImage: dataUrl });
      if (saved) {
        toast.success("Capa da organização atualizada!");
      } else {
        setCoverError("Imagem muito grande para salvar localmente. Tente um arquivo menor.");
      }
    } catch {
      setCoverError("Não foi possível ler a imagem. Tente outro arquivo.");
    } finally {
      setProcessing(null);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  }

  async function handleSelectLogo(file: File | undefined) {
    if (!file) return;
    const error = validateOrganizationImageFile(file);
    if (error) {
      setLogoError(error);
      if (logoInputRef.current) logoInputRef.current.value = "";
      return;
    }

    setLogoError(null);
    setProcessing("logo");
    try {
      const dataUrl = await compressOrganizationImage(file, 320, 0.85);
      const saved = onChange({ ...branding, logoImage: dataUrl });
      if (saved) {
        toast.success("Logo da organização atualizado!");
      } else {
        setLogoError("Imagem muito grande para salvar localmente. Tente um arquivo menor.");
      }
    } catch {
      setLogoError("Não foi possível ler a imagem. Tente outro arquivo.");
    } finally {
      setProcessing(null);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  }

  function handleRemoveCover() {
    setCoverError(null);
    onChange({ ...branding, coverImage: null });
    toast.success("Capa da organização removida.");
  }

  function handleRemoveLogo() {
    setLogoError(null);
    onChange({ ...branding, logoImage: null });
    toast.success("Logo da organização removido.");
  }

  function handleSelectAccent(accent: OrganizationAccent) {
    onChange({ ...branding, accent });
  }

  function handleTaglineChange(value: string) {
    onChange({ ...branding, tagline: value.slice(0, ORG_TAGLINE_MAX_LENGTH) });
  }

  function handleResetAll() {
    setCoverError(null);
    setLogoError(null);
    onReset();
    toast.success("Aparência restaurada para o padrão Hubee.");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload de capa da organização */}
        <div className="flex flex-col gap-3 rounded-2xl border border-hubee-200 bg-hubee-50/80 p-4 dark:border-hubee-50/10 dark:bg-hubee-900/60">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-bold text-hubee-800 dark:text-hubee-50">
                Capa da organização
              </h3>
              <p className="text-xs text-hubee-750 dark:text-hubee-200">
                Aparece no fundo da Hero e no topo do cartão-ingresso.
              </p>
            </div>
            {branding.coverImage && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemoveCover}
                className="h-8 cursor-pointer gap-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 hover:text-red-800 dark:text-red-300 dark:hover:bg-red-950/50"
              >
                <Trash2 aria-hidden="true" className="size-3.5" />
                Remover
              </Button>
            )}
          </div>

          <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-hubee-200 bg-hubee-900 text-xs font-medium text-hubee-200 dark:border-hubee-50/15">
            {branding.coverImage ? (
              <Image
                src={branding.coverImage}
                alt="Prévia da capa da organização"
                fill
                unoptimized
                sizes="(min-width: 1024px) 45vw, 100vw"
                className="object-cover"
              />
            ) : (
              <span>Usando padrão de colmeia Hubee</span>
            )}
          </div>

          <label
            htmlFor={coverId}
            className={cn(
              "flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-3 text-sm font-semibold transition-colors has-focus-visible:ring-3 has-focus-visible:ring-hubee-400",
              coverError
                ? "border-red-600 text-red-700 dark:border-red-400 dark:text-red-300"
                : "border-hubee-400 text-hubee-800 hover:bg-hubee-100 dark:border-hubee-50/20 dark:text-hubee-50 dark:hover:bg-hubee-50/10",
              processing === "cover" && "cursor-wait opacity-60",
            )}
          >
            <ImageUp aria-hidden="true" className="size-4" />
            {processing === "cover"
              ? "Processando capa..."
              : branding.coverImage
                ? "Trocar imagem de capa"
                : "Escolher imagem de capa"}
            <input
              ref={coverInputRef}
              id={coverId}
              type="file"
              accept={ORG_IMAGE_ACCEPTED_TYPES.join(",")}
              disabled={processing !== null}
              onChange={(event) => void handleSelectCover(event.target.files?.[0])}
              className="sr-only"
            />
          </label>
          <p className="text-[11px] text-hubee-neutral-300 dark:text-hubee-200">
            JPG, PNG ou WebP, até 2MB (recomendado 16:9).
          </p>
          {coverError && (
            <p role="alert" className="text-xs font-medium text-red-700 dark:text-red-300">
              {coverError}
            </p>
          )}
        </div>

        {/* Logo/Avatar + Cor de destaque + Slogan */}
        <div className="flex flex-col gap-5 rounded-2xl border border-hubee-200 bg-hubee-50/80 p-4 dark:border-hubee-50/10 dark:bg-hubee-900/60">
          {/* Logo/Avatar */}
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-hubee-800 dark:text-hubee-50">
                  Logo / Avatar
                </h3>
                <p className="text-xs text-hubee-750 dark:text-hubee-200">
                  Exibido no cartão da Hero no lugar das iniciais.
                </p>
              </div>
              {branding.logoImage && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveLogo}
                  className="h-8 cursor-pointer gap-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 hover:text-red-800 dark:text-red-300 dark:hover:bg-red-950/50"
                >
                  <Trash2 aria-hidden="true" className="size-3.5" />
                  Remover
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3.5">
              <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-hubee-300 bg-hubee-400 text-xs font-extrabold text-hubee-900 dark:border-hubee-50/15">
                {branding.logoImage ? (
                  <Image
                    src={branding.logoImage}
                    alt="Prévia do logo da organização"
                    fill
                    unoptimized
                    sizes="56px"
                    className="object-cover"
                  />
                ) : (
                  <span>LOGO</span>
                )}
              </div>

              <label
                htmlFor={logoId}
                className={cn(
                  "inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-hubee-300 bg-white px-4 text-xs font-semibold text-hubee-800 transition-colors hover:bg-hubee-100 has-focus-visible:ring-3 has-focus-visible:ring-hubee-400 dark:border-hubee-50/20 dark:bg-hubee-850 dark:text-hubee-50 dark:hover:bg-hubee-50/10",
                  processing === "logo" && "cursor-wait opacity-60",
                )}
              >
                <ImageUp aria-hidden="true" className="size-4" />
                {processing === "logo"
                  ? "Processando..."
                  : branding.logoImage
                    ? "Trocar logo"
                    : "Enviar logo"}
                <input
                  ref={logoInputRef}
                  id={logoId}
                  type="file"
                  accept={ORG_IMAGE_ACCEPTED_TYPES.join(",")}
                  disabled={processing !== null}
                  onChange={(event) => void handleSelectLogo(event.target.files?.[0])}
                  className="sr-only"
                />
              </label>
            </div>
            {logoError && (
              <p role="alert" className="text-xs font-medium text-red-700 dark:text-red-300">
                {logoError}
              </p>
            )}
          </div>

          {/* Slogan curto */}
          <AuthField
            id={taglineId}
            label="Slogan do cartão (opcional)"
            labelClassName={fieldLabelClassName}
            description={`${branding.tagline.length} / ${ORG_TAGLINE_MAX_LENGTH} caracteres · Padrão: "Colmeia ativa"`}
          >
            <AuthInput
              id={taglineId}
              value={branding.tagline}
              maxLength={ORG_TAGLINE_MAX_LENGTH}
              placeholder="Ex.: Atlética Oficial · Unifesp SJC"
              onChange={(event) => handleTaglineChange(event.target.value)}
              className={cn(authInputClassName, fieldInputClassName)}
            />
          </AuthField>

          {/* Cor de destaque */}
          <div className="flex flex-col gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-hubee-800 dark:text-hubee-50">
              <Palette aria-hidden="true" className="size-3.5" />
              Cor de destaque do cartão
            </span>
            <div className="grid grid-cols-2 gap-2">
              {ORGANIZATION_ACCENTS.map((option) => {
                const selected = branding.accent === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => handleSelectAccent(option.id)}
                    className={cn(
                      "flex cursor-pointer items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left text-xs font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-hubee-400",
                      selected
                        ? "border-2 border-hubee-500 bg-hubee-100 text-hubee-900 dark:border-hubee-400 dark:bg-hubee-400/15 dark:text-hubee-50"
                        : "border-hubee-200 bg-white text-hubee-800 hover:border-hubee-300 dark:border-hubee-50/15 dark:bg-hubee-850 dark:text-hubee-100 dark:hover:border-hubee-50/30",
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span
                        aria-hidden="true"
                        className={cn("size-4 shrink-0 rounded-full border", option.swatchClassName)}
                      />
                      <span className="truncate">{option.label}</span>
                    </span>
                    {selected && (
                      <Check aria-hidden="true" className="size-3.5 shrink-0 text-hubee-700 dark:text-hubee-400" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hubee-200 pt-4 dark:border-hubee-50/15">
        <p className="text-xs text-hubee-750 dark:text-hubee-200">
          As alterações visuais são aplicadas imediatamente e ficam salvas localmente neste navegador.
        </p>

        {hasCustomizations && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleResetAll}
            className="h-9 cursor-pointer rounded-full border-hubee-300 bg-transparent px-4 text-xs font-semibold text-hubee-800 hover:bg-hubee-200/50 dark:border-hubee-50/20 dark:text-hubee-50 dark:hover:bg-hubee-50/10"
          >
            <RotateCcw aria-hidden="true" className="size-3.5" />
            Restaurar padrão
          </Button>
        )}
      </div>
    </div>
  );
}
