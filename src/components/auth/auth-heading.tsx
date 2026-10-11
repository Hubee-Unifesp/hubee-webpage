export const authLinkClassName =
  "w-fit text-hubee-750 underline underline-offset-2 hover:text-hubee-900 focus-visible:outline-2 focus-visible:outline-hubee-500 dark:text-hubee-neutral-50 dark:hover:text-hubee-50";

export function AuthHeading({ title, description }: { title: string; description: string }) {
  return (
    <header className="mb-6 space-y-2">
      <h1 className="text-3xl font-bold text-hubee-800 lg:text-[48px] dark:text-hubee-50">{title}</h1>
      <p className="text-base text-hubee-750 dark:text-hubee-50">{description}</p>
    </header>
  );
}
