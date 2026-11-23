import { cn } from "@/lib/utils";
import type { InviteStatus } from "@/types/membro-organizacao";
import type { OrganizationAccessLevel } from "@/types/usuario";
import { INVITE_STATUS_LABELS, MEMBER_LEVEL_LABELS } from "./membros.data";

const papelStyles: Record<OrganizationAccessLevel, string> = {
  manage:
    "border-hubee-400/70 bg-hubee-200 text-hubee-800 dark:border-hubee-400 dark:bg-hubee-400/20 dark:text-hubee-200",
  write:
    "border-stone-300 bg-stone-100 text-stone-800 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-200",
  read:
    "border-hubee-300 bg-hubee-neutral-25 text-hubee-750 dark:border-stone-600 dark:bg-stone-800 dark:text-stone-300",
};

const statusStyles: Record<InviteStatus, string> = {
  ACCEPTED:
    "border-emerald-300 bg-emerald-100 text-emerald-800 dark:border-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300",
  PENDING:
    "border-amber-300 bg-amber-100 text-amber-900 dark:border-amber-700 dark:bg-amber-950/80 dark:text-amber-300",
  DECLINED:
    "border-red-300 bg-red-100 text-red-800 dark:border-red-800 dark:bg-red-950/80 dark:text-red-300",
};

const baseBadgeClassName =
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold whitespace-nowrap";

export function PapelMembroBadge({
  level,
  prefix,
  className,
}: {
  level: OrganizationAccessLevel;
  prefix?: string;
  className?: string;
}) {
  return (
    <span className={cn(baseBadgeClassName, papelStyles[level], className)}>
      {prefix ? `${prefix}: ${MEMBER_LEVEL_LABELS[level]}` : MEMBER_LEVEL_LABELS[level]}
    </span>
  );
}

export function StatusConviteBadge({
  status,
  className,
}: {
  status: InviteStatus;
  className?: string;
}) {
  return (
    <span className={cn(baseBadgeClassName, statusStyles[status], className)}>
      {INVITE_STATUS_LABELS[status]}
    </span>
  );
}
