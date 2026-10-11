"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Button } from "@/components/ui/button";
import { Dialog, DialogDescription, DialogOverlay, DialogPortal, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Obrigatório: nomeia o diálogo para leitores de tela. */
  title: string;
  description?: string;
  children?: ReactNode;
  /** Área de ações (botões). Fica alinhada à direita, abaixo do conteúdo. */
  footer?: ReactNode;
  /** Quando `false`, o modal não fecha com Esc, clique fora ou no X (ex.: ação em andamento). */
  dismissible?: boolean;
  className?: string;
}

/**
 * Modal base da área logada.
 * Acessível: `role="dialog"` com título/descrição associados, foco preso dentro
 * dele, fecha com Esc e devolve o foco ao botão que o abriu.
 *
 * @example
 * <Modal open={open} onOpenChange={setOpen} title="Excluir conta" footer={<Button>Confirmar</Button>}>
 *   Esta ação não pode ser desfeita.
 * </Modal>
 */
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  dismissible = true,
  className,
}: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          data-slot="modal"
          // Sem descrição, desliga a associação para o Radix não emitir aviso no console.
          {...(description ? {} : { "aria-describedby": undefined })}
          onEscapeKeyDown={(event) => !dismissible && event.preventDefault()}
          onPointerDownOutside={(event) => !dismissible && event.preventDefault()}
          onInteractOutside={(event) => !dismissible && event.preventDefault()}
          className={cn(
            "fixed top-1/2 left-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 flex-col gap-4 overflow-y-auto rounded-xl border border-hubee-400 bg-hubee-50 p-6 text-hubee-800 shadow-lg outline-none duration-150 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 motion-reduce:animate-none dark:border-hubee-500 dark:bg-hubee-750 dark:text-hubee-50",
            className,
          )}
        >
          <div className="flex flex-col gap-1 pr-8">
            <DialogTitle className="text-lg leading-snug font-semibold">{title}</DialogTitle>
            {description && (
              <DialogDescription className="text-sm text-hubee-neutral-300 dark:text-hubee-100">
                {description}
              </DialogDescription>
            )}
          </div>

          {children && <div className="text-sm">{children}</div>}

          {footer && <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">{footer}</div>}

          {dismissible && (
            <DialogPrimitive.Close asChild>
              <Button
                type="button"
                variant="hubee_header"
                size="icon-sm"
                aria-label="Fechar"
                className="absolute top-3 right-3 text-current hover:text-hubee-600 focus-visible:ring-hubee-800 dark:hover:text-hubee-200 dark:focus-visible:ring-hubee-400"
              >
                <X aria-hidden="true" />
              </Button>
            </DialogPrimitive.Close>
          )}
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
