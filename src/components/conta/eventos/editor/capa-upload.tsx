"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import { ImageUp, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { botaoTextoClassName, hintClassName } from "./estilos";
import { CAPA_TIPOS_ACEITOS, validarCapa, validarProporcaoCapa } from "./evento-editor.data";

interface CapaUploadProps {
  photoUrl: string | null;
  arquivo: File | null;
  onChange: (arquivo: File | null) => void;
  disabled?: boolean;
}

async function lerDimensoes(url: string): Promise<{ largura: number; altura: number }> {
  const imagem = new window.Image();
  imagem.src = url;
  try {
    await imagem.decode();
  } catch {
    return { largura: 0, altura: 0 };
  }
  return { largura: imagem.naturalWidth, altura: imagem.naturalHeight };
}

export function CapaUpload({ photoUrl, arquivo, onChange, disabled }: CapaUploadProps) {
  const inputId = useId();
  const erroId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const previaRef = useRef<string | null>(null);
  const [previa, setPrevia] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [verificando, setVerificando] = useState(false);

  useEffect(
    () => () => {
      if (previaRef.current) URL.revokeObjectURL(previaRef.current);
    },
    [],
  );

  function trocarPrevia(url: string | null) {
    if (previaRef.current) URL.revokeObjectURL(previaRef.current);
    previaRef.current = url;
    setPrevia(url);
  }

  function limparInput() {
    if (inputRef.current) inputRef.current.value = "";
  }

  async function escolher(escolhido: File | undefined) {
    if (!escolhido) return;
    const mensagem = validarCapa(escolhido);
    if (mensagem) {
      setErro(mensagem);
      limparInput();
      return;
    }

    const url = URL.createObjectURL(escolhido);
    setVerificando(true);
    const { largura, altura } = await lerDimensoes(url);
    setVerificando(false);

    const erroProporcao = validarProporcaoCapa(largura, altura);
    if (erroProporcao) {
      URL.revokeObjectURL(url);
      setErro(erroProporcao);
      limparInput();
      return;
    }

    setErro(null);
    trocarPrevia(url);
    onChange(escolhido);
  }

  function desfazer() {
    setErro(null);
    trocarPrevia(null);
    onChange(null);
    limparInput();
  }

  const imagemExibida = (arquivo && previa) ?? photoUrl;
  const bloqueado = disabled || verificando;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={inputId}
          className={cn(
            "flex min-h-32 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed px-4 py-5 text-center has-focus-visible:ring-3 has-focus-visible:ring-hubee-500/40",
            erro ? "border-red-600 dark:border-red-400" : "border-hubee-400 dark:border-hubee-500",
            bloqueado ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:bg-hubee-100 dark:hover:bg-hubee-800",
          )}
        >
          <ImageUp aria-hidden="true" className="size-6" />
          <span className="text-sm font-semibold break-all">
            {verificando ? "Verificando imagem..." : (arquivo?.name ?? (photoUrl ? "Trocar imagem" : "Escolher imagem"))}
          </span>
          <span className={hintClassName}>JPG ou PNG, até 2MB. Proporção 16:9.</span>
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={CAPA_TIPOS_ACEITOS.join(",")}
            disabled={bloqueado}
            aria-invalid={erro ? true : undefined}
            aria-describedby={erro ? erroId : undefined}
            onChange={(event) => void escolher(event.target.files?.[0])}
            className="sr-only"
          />
        </label>
        {erro && (
          <p id={erroId} role="alert" className="text-xs text-red-700 dark:text-red-300">
            {erro}
          </p>
        )}
        {arquivo && !disabled && (
          <Button type="button" onClick={desfazer} className={cn(botaoTextoClassName, "self-start bg-transparent")}>
            <Trash2 aria-hidden="true" className="size-4" />
            {photoUrl ? "Manter imagem atual" : "Remover imagem"}
          </Button>
        )}
      </div>

      <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-lg bg-hubee-100 text-sm font-semibold text-hubee-750 dark:bg-hubee-800 dark:text-hubee-100">
        {imagemExibida ? (
          <Image src={imagemExibida} alt="Prévia da capa do evento" fill unoptimized sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        ) : (
          <span>Prévia da capa</span>
        )}
      </div>
    </div>
  );
}
