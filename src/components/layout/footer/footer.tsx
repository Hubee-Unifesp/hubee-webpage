import Link from "next/link";
import { cn } from "@/lib/utils";
import { FooterLinks } from "./links/footer-links";
import { getFooterColumns } from "./links/footer-links.config";
import type { FooterProps } from "./types";

export function Footer({ role = "guest", className, homeHref = "/" }: FooterProps) {
  const columns = getFooterColumns(role, homeHref);
  const topHref = `${homeHref}#inicio`;

  return (
    <footer
      className={cn(
        "mx-4 mt-16 rounded-t-2xl bg-hubee-800 px-6 py-8 text-hubee-50 sm:mx-8 sm:px-10 md:mt-24 md:rounded-t-3xl dark:bg-hubee-400 dark:text-hubee-800",
        className,
      )}
    >
      <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs">
          <Link
            href={topHref}
            aria-label="Hubee — página inicial"
            className="rounded-md font-heading text-2xl font-extrabold tracking-tighter outline-none hover:text-hubee-400 focus-visible:ring-3 focus-visible:ring-hubee-400 dark:hover:text-hubee-50 dark:focus-visible:ring-hubee-800"
          >
            LOGO
          </Link>
          <p className="mt-3 text-sm text-hubee-50/80 dark:text-hubee-800/80">
            Encontre eventos universitários e acompanhe seus ingressos. Para agremiações, tudo do
            planejamento à venda em um só lugar.
          </p>
        </div>

        <FooterLinks columns={columns} />
      </div>

      <div className="mt-8 flex flex-col-reverse items-center gap-3 border-t border-hubee-50/15 pt-5 text-xs text-hubee-50/70 sm:flex-row sm:justify-between dark:border-hubee-800/15 dark:text-hubee-800/70">
        <p>© {new Date().getFullYear()} Hubee. Projeto acadêmico de Engenharia de Software — UNIFESP</p>
        <a
          href={topHref}
          className="rounded font-medium text-hubee-50 outline-none hover:text-hubee-400 focus-visible:ring-3 focus-visible:ring-hubee-400 dark:text-hubee-800 dark:hover:text-hubee-600 dark:focus-visible:ring-hubee-800"
        >
          Voltar ao topo ↑
        </a>
      </div>
    </footer>
  );
}
