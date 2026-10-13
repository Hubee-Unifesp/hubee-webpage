import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface ContaCardProps {
  title: string;
  description?: string;
  /** `danger` pinta o título de vermelho (ex.: Excluir Conta). */
  tone?: "default" | "danger";
  className?: string;
  children: ReactNode;
}

/** Cartão de seção das páginas da conta (Detalhes da Compra, Dados Pessoais, Trocar Senha…). */
export function ContaCard({ title, description, tone = "default", className, children }: ContaCardProps) {
  const titleId = useId();

  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        "rounded-xl border border-hubee-200 bg-hubee-neutral-25 p-5 shadow-sm md:p-6 dark:border-hubee-50/10 dark:bg-hubee-50/7",
        className,
      )}
    >
      <h2
        id={titleId}
        className={cn("text-base font-semibold", tone === "danger" && "text-red-600 dark:text-red-400")}
      >
        {title}
      </h2>
      {description && <p className="mt-1 text-xs text-hubee-neutral-300 dark:text-hubee-200">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function ContaPageTitle({ children }: { children: ReactNode }) {
  return <h1 className="font-heading text-3xl font-bold tracking-tight">{children}</h1>;
}
