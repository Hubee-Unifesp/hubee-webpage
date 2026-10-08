import Link from "next/link";

export function AuthHeader() {
  return (
    <Link
        href="/"
        aria-label="Hubee-Página inicial"
        className="inline-flex items-center gap-2 rounded-md text-sm outline-none focus-visible:ring-3 focus-visible:ring-hubee-400"
    >
        <span aria-hidden="true" className="flex size-6 items-center justify-center rounded-md bg-hubee-400">
        <span className="size-2 rounded-full bg-hubee-800" />
      </span>
      Logo
    </Link>
  );
}
