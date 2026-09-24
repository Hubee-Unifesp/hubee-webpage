import Link from "next/link";
import { ArrowUpIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

import {
  Card,
  CardHeader,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function VersaoEscuraPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#181000] p-8 text-[#fffbed]">
      <div className="flex items-center justify-center gap-3">
        <Button variant="hubee_50">Btn hubee_50</Button>

        <Button variant="hubee_50" size="icon" aria-label="Submit">
          <ArrowUpIcon className="h-4 w-4" />
        </Button>
      </div>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="font-bold text-hubee-800">Card Title</CardTitle>
          <CardDescription>
            Make changes to your account here. Click save when you&apos;re done.
          </CardDescription>
          <CardAction>
            <Button variant="link">Sign Up</Button>
          </CardAction>
        </CardHeader>

        <CardContent>
          <form>
            <div className="flex flex-col gap-6">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Seu email"
                  required
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot your password?
                  </a>
                </div>
                <Input
                  placeholder="Sua senha"
                  required
                  id="password"
                  type="password"
                />
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Link href="/">
        <Button variant="hubee_50">Voltar para a versão clara</Button>
      </Link>
    </main>
  );
}
