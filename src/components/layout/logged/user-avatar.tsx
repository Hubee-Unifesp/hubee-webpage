import { cn } from "@/lib/utils";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  const first = Array.from(parts[0])[0];
  const last = parts.length > 1 ? Array.from(parts[parts.length - 1])[0] : "";
  return (first + last).toLocaleUpperCase("pt-BR");
}

interface UserAvatarProps {
  name: string;
  src?: string | null;
  className?: string;
}

/** Foto da usuária ou, sem foto, as iniciais do nome. Decorativo: o nome fica no rótulo do botão. */
export function UserAvatar({ name, src, className }: UserAvatarProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "flex size-7 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-hubee-400 text-xs font-bold text-hubee-800 select-none dark:bg-hubee-800 dark:text-hubee-400",
        className,
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        getInitials(name)
      )}
    </span>
  );
}
