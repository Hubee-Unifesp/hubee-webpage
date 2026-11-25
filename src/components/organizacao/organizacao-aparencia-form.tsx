"use client";

import { useId, useRef, useState } from "react";
import Image from "next/image";
import { ImageUp, RotateCcw, Trash2 } from "lucide-react";
import { useToast } from "@/components/toast";
import { Button } from "@/components/ui/button";
import {
  ORG_IMAGE_ACCEPTED_TYPES,
  compressOrganizationImage,
  validateOrganizationImageFile,
  type OrganizationBranding,
} from "@/lib/organization-branding";
import { cn } from "@/lib/utils";

interface OrganizacaoAparenciaFormProps {
  branding: OrganizationBranding;
  onChange: (next: OrganizationBranding) => boolean;
  onReset: () => void;
}

/**
 * Painel de customização visual da organização (capa da Hero e cores do título e da descrição).
 * Aplica as alterações em tempo real e salva localmente por organização até existir suporte dedicado na API.
 */
export function OrganizacaoAparenciaForm({
  branding,
  onChange,
  onReset,
}: OrganizacaoAparenciaFormProps) {
  const toast = useToast();
  const coverId = useId();
  const titleColorId = useId();
  const descriptionColorId = useId();
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [coverError, setCoverError] = useState<string | null>(null);
  const [processingCover, setProcessingCover] = useState(false);

  const hasCustomizations =
    branding.coverImage !== null ||
    branding.titleColor !== null ||
    branding.descriptionColor !== null;

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
      setProcessingCover(false);
      if (coverInputRef.current) coverInputRef.current.value = "";
    }
  }

  function handleRemoveCover() {
    setCoverError(null);
    onChange({ ...branding, coverImage: null });
    toast.success("Capa da organização removida.");
  }

  function handleResetAll() {
    setCoverError(null);
    onReset();
    toast.success("Aparência restaurada para o padrão Hubee.");
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
              {branding.titleColor && (
                <button
                  type="button"
                  onClick={() => onChange({ ...branding, titleColor: null })}
                  className="cursor-pointer text-[11px] font-semibold text-hubee-700 hover:underline dark:text-hubee-300"
                >
                  Padrão
                </button>
              )}
            </div>
            <div className="flex items-center gap-2.5 rounded-xl border border-hubee-200 bg-white px-3 py-2 dark:border-hubee-50/15 dark:bg-hubee-850">
              <input
                id={titleColorId}
                type="color"
                value={branding.titleColor ?? "#FFFDF5"}
                onChange={(event) =>
                  onChange({ ...branding, titleColor: event.target.value.toUpperCase() })
                }
                className="size-7 cursor-pointer rounded border-0 bg-transparent p-0"
              />
              <span className="font-mono text-xs text-hubee-750 dark:text-hubee-200">
                {branding.titleColor ?? "Padrão Hubee"}
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
              {branding.descriptionColor && (
                <button
                  type="button"
                  onClick={() => onChange({ ...branding, descriptionColor: null })}
                  className="cursor-pointer text-[11px] font-semibold text-hubee-700 hover:underline dark:text-hubee-300"
                >
                  Padrão
                </button>
              )}
            </div>
            <div className="flex items-center gap-2.5 rounded-xl border border-hubee-200 bg-white px-3 py-2 dark:border-hubee-50/15 dark:bg-hubee-850">
              <input
                id={descriptionColorId}
                type="color"
                value={branding.descriptionColor ?? "#F5F0DC"}
                onChange={(event) =>
                  onChange({ ...branding, descriptionColor: event.target.value.toUpperCase() })
                }
                className="size-7 cursor-pointer rounded border-0 bg-transparent p-0"
              />
              <span className="font-mono text-xs text-hubee-750 dark:text-hubee-200">
                {branding.descriptionColor ?? "Padrão Hubee"}
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

        <div className="relative flex h-56 w-full items-center justify-center overflow-hidden rounded-2xl border border-hubee-200 bg-hubee-900 text-xs font-medium text-hubee-200 sm:h-72 md:h-96 dark:border-hubee-50/15">
          {branding.coverImage ? (
            <Image
              src={branding.coverImage}
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
            processingCover && "cursor-wait opacity-60",
          )}
        >
          <ImageUp aria-hidden="true" className="size-4" />
          {processingCover
            ? "Processando capa..."
            : branding.coverImage
              ? "Trocar imagem de capa"
              : "Escolher imagem de capa"}
          <input
            ref={coverInputRef}
            id={coverId}
            type="file"
            accept={ORG_IMAGE_ACCEPTED_TYPES.join(",")}
            disabled={processingCover}
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
