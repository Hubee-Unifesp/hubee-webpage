"use client";

import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Loader2, User, X } from "lucide-react";
import { Dialog as DialogPrimitive } from "radix-ui";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  compileGithubReadme,
  fetchMemberGithubReadme,
  type ReadmeInlineToken,
} from "@/lib/github-profile";
import { cn } from "@/lib/utils";
import type { TeamMemberProfile } from "./team.config";

interface TeamMemberDialogProps {
  member: TeamMemberProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCloseAutoFocus?: (event: Event) => void;
}

function InlineTokens({ tokens }: { tokens: readonly ReadmeInlineToken[] }) {
  return (
    <>
      {tokens.map((token, idx) => {
        switch (token.type) {
          case "bold":
            return (
              <strong
                key={idx}
                className="font-semibold text-hubee-800 dark:text-hubee-50"
              >
                {token.value}
              </strong>
            );
          case "italic":
            return (
              <em key={idx} className="italic">
                {token.value}
              </em>
            );
          case "code":
            return (
              <code
                key={idx}
                className="rounded bg-hubee-200/70 px-1.5 py-0.5 font-mono text-xs font-medium text-hubee-800 dark:bg-hubee-750 dark:text-hubee-50"
              >
                {token.value}
              </code>
            );
          case "link":
            return (
              <a
                key={idx}
                href={token.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-hubee-750 underline underline-offset-4 hover:text-hubee-800 dark:text-hubee-400 dark:hover:text-hubee-200"
              >
                {token.label}
              </a>
            );
          case "text":
          default:
            return <span key={idx}>{token.value}</span>;
        }
      })}
    </>
  );
}

/**
 * Renderiza a AST compilada do README do GitHub em blocos visuais ricos
 * (títulos, parágrafos com negrito/código/links, listas aninhadas e pílulas de tecnologias).
 */
function CompiledReadmeView({ content }: { content: string }) {
  const blocks = useMemo(() => compileGithubReadme(content), [content]);

  if (blocks.length === 0) {
    return (
      <p className="text-sm leading-relaxed text-hubee-800 dark:text-hubee-50/90">
        {content}
      </p>
    );
  }

  return (
    <div className="space-y-3.5 text-sm leading-relaxed text-hubee-800 dark:text-hubee-50/90">
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading": {
            const headingClasses =
              block.level === 1
                ? "text-base font-bold text-hubee-800 dark:text-hubee-50"
                : block.level === 2
                  ? "pt-1 text-sm font-bold tracking-tight text-hubee-800 dark:text-hubee-50"
                  : "pt-1 text-xs font-bold tracking-wide text-hubee-750 uppercase dark:text-hubee-200";
            return (
              <h4 key={index} className={headingClasses}>
                <InlineTokens tokens={block.tokens} />
              </h4>
            );
          }

          case "paragraph":
            return (
              <p key={index} className="leading-relaxed">
                <InlineTokens tokens={block.tokens} />
              </p>
            );

          case "list":
            return (
              <ul key={index} className="space-y-1.5">
                {block.items.map((item, itemIdx) => (
                  <li
                    key={itemIdx}
                    className={cn(
                      "flex items-start gap-2 leading-relaxed",
                      item.indent && "pl-5 text-xs text-hubee-750 dark:text-hubee-200",
                    )}
                  >
                    <span
                      aria-hidden="true"
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-hubee-500 dark:bg-hubee-400"
                    />
                    <span>
                      <InlineTokens tokens={item.tokens} />
                    </span>
                  </li>
                ))}
              </ul>
            );

          case "badges":
            return (
              <div key={index} className="flex flex-wrap gap-1.5 pt-0.5">
                {block.items.map((badge) => (
                  <span
                    key={badge}
                    className="inline-flex items-center rounded-md border border-hubee-200 bg-hubee-100 px-2.5 py-1 text-xs font-semibold text-hubee-800 dark:border-hubee-50/15 dark:bg-hubee-800 dark:text-hubee-50"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            );

          case "divider":
            return (
              <hr
                key={index}
                className="my-2 border-hubee-200/80 dark:border-hubee-50/10"
              />
            );
        }
      })}
    </div>
  );
}

export function TeamMemberDialog({
  member,
  open,
  onOpenChange,
  onCloseAutoFocus,
}: TeamMemberDialogProps) {
  const [failedAvatarFor, setFailedAvatarFor] = useState<string | null>(null);
  const [loadedReadmes, setLoadedReadmes] = useState<
    Record<string, { content: string; isCustom: boolean }>
  >({});

  useEffect(() => {
    if (!open || !member) return;
    const username = member.username;
    const fallbackBio = member.fallbackBio;

    if (loadedReadmes[username]) return;

    let cancelled = false;

    fetchMemberGithubReadme(username).then((readme) => {
      if (cancelled) return;
      setLoadedReadmes((prev) => ({
        ...prev,
        [username]: {
          content: readme ?? fallbackBio,
          isCustom: readme !== null,
        },
      }));
    });

    return () => {
      cancelled = true;
    };
  }, [loadedReadmes, member, open]);

  if (!member) return null;

  const imgFailed = failedAvatarFor === member.id;
  const resolvedReadme = loadedReadmes[member.username];
  const isLoadingReadme = open && !resolvedReadme;
  const displayContent = resolvedReadme?.content ?? member.readmeContent;
  const hasCustomReadme = resolvedReadme?.isCustom ?? member.hasCustomReadme;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
          onCloseAutoFocus={onCloseAutoFocus}
          className="fixed top-1/2 left-1/2 z-50 max-h-[90vh] w-[calc(100%-2rem)] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-hubee-200 bg-hubee-neutral-25 text-hubee-800 shadow-xl duration-150 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 motion-reduce:animate-none dark:border-hubee-50/15 dark:bg-hubee-800 dark:text-hubee-50"
        >
          <div className="grid md:grid-cols-[260px_1fr]">
            {/* Coluna da foto (mantém continuidade visual com o card de origem) */}
            <div className="relative flex min-h-56 flex-col items-center justify-center bg-hubee-100 p-6 md:min-h-88 dark:bg-hubee-900">
              {!imgFailed ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={member.avatarUrl}
                  alt={`Foto de ${member.name}`}
                  onError={() => setFailedAvatarFor(member.id)}
                  className="size-36 rounded-full border-2 border-hubee-200 object-cover shadow-sm md:size-44 dark:border-hubee-750"
                />
              ) : (
                <div className="flex size-36 flex-col items-center justify-center rounded-full border border-hubee-200 bg-hubee-50 text-hubee-750 md:size-44 dark:border-hubee-750 dark:bg-hubee-800 dark:text-hubee-200">
                  <User aria-hidden="true" className="size-12 stroke-[1.5]" />
                </div>
              )}
              <span className="mt-3 text-xs font-medium text-hubee-750 dark:text-hubee-200">
                @{member.username}
              </span>
            </div>

            {/* Coluna de apresentação e README compilado */}
            <div className="flex flex-col p-6 md:p-8">
              <div className="flex items-start justify-between gap-4">
                <span className="pt-1 text-xs font-semibold tracking-wider text-hubee-750 uppercase dark:text-hubee-200">
                  Nosso time · @{member.username}
                </span>

                <DialogClose asChild>
                  <button
                    type="button"
                    aria-label="Fechar detalhe do integrante"
                    className="inline-flex min-h-11 min-w-11 items-center gap-2 rounded-lg border border-hubee-800/30 bg-hubee-50 px-3.5 py-2 text-sm font-semibold text-hubee-800 transition-colors outline-none hover:bg-hubee-100 focus-visible:ring-2 focus-visible:ring-hubee-800 focus-visible:ring-offset-2 dark:border-hubee-400/50 dark:bg-hubee-900 dark:text-hubee-50 dark:hover:bg-hubee-750 dark:focus-visible:ring-hubee-400"
                  >
                    <span>Fechar</span>
                    <X aria-hidden="true" className="size-4" />
                  </button>
                </DialogClose>
              </div>

              <DialogTitle className="mt-3 font-heading text-2xl font-bold tracking-tight text-hubee-800 md:text-3xl dark:text-hubee-50">
                {member.name}
              </DialogTitle>

              <DialogDescription className="mt-1.5 text-sm font-medium text-hubee-750 dark:text-hubee-200">
                {member.role}
              </DialogDescription>

              <hr className="my-5 border-hubee-200 dark:border-hubee-50/15" />

              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold tracking-wider text-hubee-750 uppercase dark:text-hubee-200">
                  {hasCustomReadme
                    ? "Apresentação · README do GitHub"
                    : "Apresentação"}
                </p>
                <a
                  href={member.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 rounded text-xs font-semibold text-hubee-750 underline underline-offset-4 outline-none hover:text-hubee-800 focus-visible:ring-2 focus-visible:ring-hubee-800 dark:text-hubee-400 dark:hover:text-hubee-200 dark:focus-visible:ring-hubee-400"
                >
                  Ver GitHub
                  <ExternalLink aria-hidden="true" className="size-3.5" />
                </a>
              </div>

              <div
                tabIndex={0}
                aria-label={`Apresentação de ${member.name}`}
                className="mt-3 max-h-64 overflow-y-auto rounded-lg border border-hubee-200/70 bg-hubee-50/70 p-4 outline-none focus-visible:ring-2 focus-visible:ring-hubee-800 dark:border-hubee-50/10 dark:bg-hubee-900/50 dark:focus-visible:ring-hubee-400"
              >
                {isLoadingReadme ? (
                  <div className="flex items-center gap-2 py-4 text-sm text-hubee-750 dark:text-hubee-200">
                    <Loader2
                      aria-hidden="true"
                      className="size-4 animate-spin"
                    />
                    <span>Carregando README do GitHub...</span>
                  </div>
                ) : (
                  <CompiledReadmeView content={displayContent} />
                )}
              </div>
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}
