import type { ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AuthSubmitButtonProps {
  isLoading: boolean;
  loadingLabel: string;
  children: ReactNode;
}

export function AuthSubmitButton({ isLoading, loadingLabel, children }: AuthSubmitButtonProps) {
  return (
    <Button
      type="submit"
      disabled={isLoading}
      aria-busy={isLoading}
      className="h-10 w-full bg-hubee-400 text-hubee-900 hover:bg-hubee-500"
    >
      {isLoading ? (
        <>
          <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />
          {loadingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
