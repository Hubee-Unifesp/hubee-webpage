"use client";

import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { FooterColumn } from "../types";

interface FooterLinksProps {
  columns: readonly FooterColumn[];
}

export function FooterLinks({ columns }: FooterLinksProps) {
  return (
    <>
      <div className="hidden gap-10 md:flex">
        {columns.map((column) => (
          <div key={column.title} className="min-w-[9rem]">
            <p className="text-xs font-semibold tracking-wide text-hubee-50/70 uppercase dark:text-hubee-800/70">
              {column.title}
            </p>
            <ul className="mt-3 space-y-2.5">
              {column.items.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="rounded text-sm font-medium text-hubee-50 outline-none hover:text-hubee-400 focus-visible:ring-3 focus-visible:ring-hubee-400 dark:text-hubee-800 dark:hover:text-hubee-600 dark:focus-visible:ring-hubee-800"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <Accordion type="multiple" className="md:hidden">
        {columns.map((column) => (
          <AccordionItem
            key={column.title}
            value={column.title}
            className="border-hubee-50/15 dark:border-hubee-800/15"
          >
            <AccordionTrigger className="text-xs font-semibold tracking-wide text-hubee-50 uppercase hover:no-underline dark:text-hubee-800">
              {column.title}
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2.5">
                {column.items.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm font-medium text-hubee-50/90 hover:text-hubee-400 dark:text-hubee-800/90 dark:hover:text-hubee-600"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </>
  );
}
