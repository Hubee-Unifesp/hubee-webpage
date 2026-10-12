"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Dialog as DialogPrimitive } from "radix-ui";

/**
 * Primitivos do Radix Dialog: fecham com Esc, prendem o foco e devolvem o foco
 * ao elemento que abriu. Use `Modal` (components/modal.tsx) para o caso comum.
 */
const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogClose = DialogPrimitive.Close;
const DialogPortal = DialogPrimitive.Portal;
const DialogTitle = DialogPrimitive.Title;
const DialogDescription = DialogPrimitive.Description;

function DialogOverlay({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-hubee-900/60 duration-150 data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 motion-reduce:animate-none",
        className,
      )}
      {...props}
    />
  );
}

export { Dialog, DialogTrigger, DialogClose, DialogPortal, DialogOverlay, DialogTitle, DialogDescription };
