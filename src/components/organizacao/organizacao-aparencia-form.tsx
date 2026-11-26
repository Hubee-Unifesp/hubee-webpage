"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import { Check, ImageUp, Loader2, RotateCcw, Trash2 } from "lucide-react";
import { useToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/lib/api/errors";
import { updateOrganization, uploadOrganizationPhoto } from "@/lib/api/organizations";
import {
  ORG_IMAGE_ACCEPTED_TYPES,
  compressOrganizationImage,
  validateOrganizationImageFile,
  type OrganizationBranding,
} from "@/lib/organization-branding";
import { cn } from "@/lib/utils";
import type { Organizacao } from "@/types/organizacao";

interface OrganizacaoAparenciaFormProps {
  orgId: string;
  branding: OrganizationBranding;
  onOrganizationUpdated: (organizacao: Organizacao) => void;
}

/**
 * Painel de customização visual da organização (capa da Hero e cores do título e da descrição).
 * Mantém as alterações em rascunho para conferência na prévia e persiste no backend
 * (`PATCH /organizations/:id/photo` e `PATCH /organizations/:id`) ao clicar em "Salvar alterações".
 */
export function OrganizacaoAparenciaForm({
  orgId,
  branding,
  onOrganizationUpdated,
}: OrganizacaoAparenciaFormProps) {
  const toast = useToast();
  const coverId = useId();
  const titleColorId = useId();
  const descriptionColorId = useId();
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [draftTitleColor, setDraftTitleColor] = useState<string | null>(branding.titleColor);
  const [draftDescriptionColor, setDraftDescriptionColor] = useState<string | null>(
    branding.descriptionColor,
  );
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreviewUrl, setPendingPreviewUrl] = useState<string | null>(null);
  const [removeCover, setRemoveCover] = useState(false);

  const [coverError, setCoverError] = useState<string | null>(null);
  const [processingCover, setProcessingCover] = useState(false);
  const [saving, setSaving] = useState(false);

  const displayedCover = removeCover ? null : (pendingPreviewUrl ?? branding.coverImage);

  const hasPendingChanges =
    pendingFile !== null ||
    removeCover ||
    draftTitleColor !== branding.titleColor ||
    draftDescriptionColor !== branding.descriptionColor;

  const hasCustomizations =
    displayedCover !== null || draftTitleColor !== null || draftDescriptionColor !== null;

  async function handleSelectCover(file: File | undefined) {
    if (!file) return;
    const error = validateOrganizationImageFile(file);
    if (error) {
      setCoverError(error);
      if (coverInputRef.current) coverInputRef.current.value = "";
      return;
    }

    setCoverError(null);
    setProcessingCover(true);
    try {
      const previewDataUrl = await compressOrganizationImage(file, 1280, 0.8);
      setPendingFile(file);
      setPendingPreviewUrl(previewDataUrl);
      setRemoveCover(false);
    } catch {
      setCoverError("Não foi possível ler a imagem. Tente outro arquivo.");
    } finally {
      setProcessingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  }

  function handleRemoveCover() {
    setCoverError(null);
    setPendingFile(null);
    setPendingPreviewUrl(null);
    setRemoveCover(branding.coverImage !== null);
  }

  function handleDiscardChanges() {
    setCoverError(null);
    setPendingFile(null);
    setPendingPreviewUrl(null);
    setRemoveCover(false);
    setDraftTitleColor(branding.titleColor);
    setDraftDescriptionColor(branding.descriptionColor);
  }

  function handleRestoreDefault() {
    setCoverError(null);
    setPendingFile(null);
    setPendingPreviewUrl(null);
    setRemoveCover(branding.coverImage !== null);
    setDraftTitleColor(null);
    setDraftDescriptionColor(null);
  }

  async function handleSave() {
    if (!hasPendingChanges || saving) return;

    setCoverError(null);
    setSaving(true);
    let latestOrg: Organizacao | null = null;

    try {
      if (pendingFile) {
        latestOrg = await uploadOrganizationPhoto(orgId, pendingFile);
        setPendingFile(null);
        setPendingPreviewUrl(null);
      }

      const needsMetadataUpdate =
        removeCover ||
        draftTitleColor !== branding.titleColor ||
        draftDescriptionColor !== branding.descriptionColor;

      if (needsMetadataUpdate) {
        latestOrg = await updateOrganization(orgId, {
          ...(removeCover ? { photoUrl: null } : {}),
          titleColor: draftTitleColor,
          descriptionColor: draftDescriptionColor,
        });
        setRemoveCover(false);
      }

      if (latestOrg) {
        onOrganizationUpdated(latestOrg);
      }

      toast.success("Aparência da organização salva com sucesso!");
    } catch (error) {
      if (latestOrg) {
        onOrganizationUpdated(latestOrg);
      }
      const message = getApiErrorMessage(
        error,
        "Não foi possível salvar a aparência da organização.",
      );
      setCoverError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Cores do texto na Hero em barra horizontal compacta */}
      <div className="flex flex-col gap-3 rounded-2xl border border-hubee-200 bg-hubee-50/80 p-4 sm:p-5 dark:border-hubee-50/10 dark:bg-hubee-900/60">
        <div>
          <h3 className="text-sm font-bold text-hubee-800 dark:text-hubee-50">
            Cores do texto na Hero
          </h3>
          <p className="text-xs text-hubee-750 dark:text-hubee-200">
            Ajuste as cores do título e da descrição para garantir bom contraste sobre a imagem de capa.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor={titleColorId}
                className="text-xs font-semibold text-hubee-800 dark:text-hubee-50"
              >
                Cor do título na Hero
              </label>
              {draftTitleColor && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setDraftTitleColor(null)}
                  className="cursor-pointer text-[11px] font-semibold text-hubee-700 hover:underline disabled:opacity-50 dark:text-hubee-300"
                >
                  Padrão
                </button>
              )}
            </div>
            <div className="flex items-center gap-2.5 rounded-xl border border-hubee-200 bg-white px-3 py-2 dark:border-hubee-50/15 dark:bg-hubee-850">
              <input
                id={titleColorId}
                type="color"
                disabled={saving}
                value={draftTitleColor ?? "#FFFDF5"}
                onChange={(event) => setDraftTitleColor(event.target.value.toUpperCase())}
                className="size-7 cursor-pointer rounded border-0 bg-transparent p-0 disabled:cursor-not-allowed"
              />
              <span className="font-mono text-xs text-hubee-750 dark:text-hubee-200">
                {draftTitleColor ?? "Padrão Hubee"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between gap-2">
              <label
                htmlFor={descriptionColorId}
                className="text-xs font-semibold text-hubee-800 dark:text-hubee-50"
              >
                Cor da descrição na Hero
              </label>
              {draftDescriptionColor && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setDraftDescriptionColor(null)}
                  className="cursor-pointer text-[11px] font-semibold text-hubee-700 hover:underline disabled:opacity-50 dark:text-hubee-300"
                >
                  Padrão
                </button>
              )}
            </div>
            <div className="flex items-center gap-2.5 rounded-xl border border-hubee-200 bg-white px-3 py-2 dark:border-hubee-50/15 dark:bg-hubee-850">
              <input
                id={descriptionColorId}
                type="color"
                disabled={saving}
                value={draftDescriptionColor ?? "#F5F0DC"}
                onChange={(event) => setDraftDescriptionColor(event.target.value.toUpperCase())}
                className="size-7 cursor-pointer rounded border-0 bg-transparent p-0 disabled:cursor-not-allowed"
              />
              <span className="font-mono text-xs text-hubee-750 dark:text-hubee-200">
                {draftDescriptionColor ?? "Padrão Hubee"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Upload e prévia ampla da capa da organização */}
      <div className="flex flex-col gap-4 rounded-2xl border border-hubee-200 bg-hubee-50/80 p-4 sm:p-5 dark:border-hubee-50/10 dark:bg-hubee-900/60">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-hubee-800 dark:text-hubee-50">
              Capa da organização
            </h3>
            <p className="text-xs text-hubee-750 dark:text-hubee-200">
              Aparece no fundo da Hero principal da organização.
            </p>
          </div>
          {displayedCover && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={saving}
              onClick={handleRemoveCover}
              className="h-8 cursor-pointer gap-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 hover:text-red-800 dark:text-red-300 dark:hover:bg-red-950/50"
            >
              <Trash2 aria-hidden="true" className="size-3.5" />
              Remover
            </Button>
          )}
        </div>

        <div className="relative flex h-56 w-full items-center justify-center overflow-hidden rounded-2xl border border-hubee-200 bg-hubee-900 text-xs font-medium text-hubee-200 sm:h-72 md:h-96 dark:border-hubee-50/15">
          {displayedCover ? (
            <Image
              src={displayedCover}
              alt="Prévia da capa da organização"
              fill
              unoptimized
              sizes="100vw"
              className="object-cover object-center"
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
            (processingCover || saving) && "cursor-wait opacity-60",
          )}
        >
          <ImageUp aria-hidden="true" className="size-4" />
          {processingCover
            ? "Processando capa..."
            : displayedCover
              ? "Trocar imagem de capa"
              : "Escolher imagem de capa"}
          <input
            ref={coverInputRef}
            id={coverId}
            type="file"
            accept={ORG_IMAGE_ACCEPTED_TYPES.join(",")}
            disabled={processingCover || saving}
            onChange={(event) => void handleSelectCover(event.target.files?.[0])}
            className="sr-only"
          />
        </label>
        <p className="text-[11px] text-hubee-neutral-300 dark:text-hubee-200">
          JPG ou PNG, até 2MB (recomendado 16:9).
        </p>
        {coverError && (
          <p role="alert" className="text-xs font-medium text-red-700 dark:text-red-300">
            {coverError}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hubee-200 pt-4 dark:border-hubee-50/15">
        <p className="text-xs text-hubee-750 dark:text-hubee-200">
          {hasPendingChanges
            ? "Você tem alterações não salvas. Clique em Salvar alterações para aplicar na Hero."
            : "Clique em Salvar alterações após ajustar a capa ou as cores da Hero."}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {hasCustomizations && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={saving}
              onClick={handleRestoreDefault}
              className="h-9 cursor-pointer rounded-full border-hubee-300 bg-transparent px-4 text-xs font-semibold text-hubee-800 hover:bg-hubee-200/50 dark:border-hubee-50/20 dark:text-hubee-50 dark:hover:bg-hubee-50/10"
            >
              <RotateCcw aria-hidden="true" className="size-3.5" />
              Restaurar padrão
            </Button>
          )}

          {hasPendingChanges && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={saving}
              onClick={handleDiscardChanges}
              className="h-9 cursor-pointer rounded-full border-hubee-300 bg-transparent px-4 text-xs font-semibold text-hubee-800 hover:bg-hubee-200/50 dark:border-hubee-50/20 dark:text-hubee-50 dark:hover:bg-hubee-50/10"
            >
              Descartar
            </Button>
          )}

          <Button
            type="button"
            size="sm"
            disabled={!hasPendingChanges || processingCover || saving}
            onClick={() => void handleSave()}
            className="h-9 cursor-pointer rounded-full bg-hubee-400 px-5 text-xs font-semibold text-hubee-900 hover:bg-hubee-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <Loader2 aria-hidden="true" className="size-3.5 animate-spin" />
            ) : (
              <Check aria-hidden="true" className="size-3.5" />
            )}
            {saving ? "Salvando..." : "Salvar alterações"}
          </Button>
        </div>
      </div>
    </div>
  );
}
