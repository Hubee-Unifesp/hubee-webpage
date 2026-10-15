import Link from "next/link";
import { HubeeLogo } from "@/components/brand";

export function AuthHeader() {
  return (
    <Link
      href="/"
      aria-label="Hubee — página inicial"
      className="inline-flex items-center rounded-md outline-none hover:opacity-85 focus-visible:ring-3 focus-visible:ring-hubee-400"
    >
      <HubeeLogo tone="white" priority className="h-8 md:h-9 block lg:hidden dark:lg:block" />
      <HubeeLogo tone="dark" priority className="h-8 md:h-9 hidden lg:block dark:lg:hidden" />
    </Link>
  );
}
