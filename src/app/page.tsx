"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowUpIcon,
  Check,
  CreditCardIcon,
  LogOutIcon,
  SettingsIcon,
  UserIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button"; //importa botao
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

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import { Checkbox } from "@/components/ui/checkbox";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { Textarea } from "@/components/ui/textarea";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Home() {
  const [isSwitchOn, setIsSwitchOn] = useState(false);

  const items = [
    { label: "Apple", value: "apple" },
    { label: "Banana", value: "banana" },
    { label: "Blueberry", value: "blueberry" },
    { label: "Grapes", value: "grapes" },
    { label: "Pineapple", value: "pineapple" },
  ];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background p-8">
      <div className="fixed top-4 right-4 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="hubee_800">My Account</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="font-bold">
              <UserIcon strokeWidth={2.5} />
              Profile
            </DropdownMenuItem>

            <DropdownMenuItem>
              <CreditCardIcon />
              Billing
            </DropdownMenuItem>
            <DropdownMenuItem>
              <SettingsIcon />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive">
              <LogOutIcon />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center justify-center gap-3">
        <Button variant="hubee_800">Btn hubee_800</Button>
        {/*botao variação escura*/}

        <Button variant="hubee_800" size="icon" aria-label="Submit">
          {/*botao variação escura p cima*/}
          <ArrowUpIcon className="h-4 w-4" />
        </Button>
      </div>

      <Accordion
        type="multiple"
        defaultValue={["shipping"]}
        className="max-w-lg"
      >
        <AccordionItem value="shipping">
          <AccordionTrigger className="font-bold">
            What are your shipping options?
          </AccordionTrigger>
          <AccordionContent>
            We offer standard (5-7 days), express (2-3 days), and overnight
            shipping. Free shipping on international orders.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="returns">
          <AccordionTrigger className="font-bold">
            What is your return policy?
          </AccordionTrigger>
          <AccordionContent>
            Returns accepted within 30 days. Items must be unused and in
            original packaging. Refunds processed within 5-7 business days.
          </AccordionContent>
        </AccordionItem>
        <AccordionItem value="support">
          <AccordionTrigger className="font-bold">
            How can I contact customer support?
          </AccordionTrigger>
          <AccordionContent>
            Reach us via email, live chat, or phone. We respond within 24 hours
            during business days.
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="font-bold text-hubee-800">Card Title</CardTitle>
          <CardDescription>Make changes to your account here.</CardDescription>
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

      <Field className="w-full max-w-sm font-bold">
        <FieldLabel htmlFor="textarea-message font-bold ">Message</FieldLabel>
        <FieldDescription>Enter your message below.</FieldDescription>
        <Textarea id="textarea-message" placeholder="Type your message here." />
      </Field>

      <Select>
        <SelectTrigger className="border-2 border-cinzaclaro">
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Fruits</SelectLabel>
            {items.map((item) => (
              <SelectItem key={item.value} value={item.value}>
                <Check className="h-4 w-4" />
                {item.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>

      <div className="flex items-center gap-3">
        <Switch
          id="mode-switch"
          thumbClassName="bg-hubee-50 data-checked:bg-hubee-neutral-25"
          checked={isSwitchOn}
          onCheckedChange={setIsSwitchOn}
          aria-label="Alternar modo"
        />
        <Label htmlFor="mode-switch">{isSwitchOn ? "ON" : "OFF"}</Label>

        <Checkbox
          id="terms-checkbox-desc"
          name="terms-checkbox-desc"
          defaultChecked
        />
        <FieldContent>
          <FieldLabel htmlFor="terms-checkbox-desc">
            Accept terms and conditions
          </FieldLabel>
        </FieldContent>
      </div>

      <Link href="/versao-escura">
        <Button variant="hubee_800">Ver versão em fundo escuro</Button>
        {/*botao link p viariacao escura*/}
      </Link>
    </main>
  );
}
