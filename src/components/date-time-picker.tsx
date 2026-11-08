"use client";

import { useId, useState, type ComponentProps } from "react";
import { CalendarDays } from "lucide-react";
import { ptBR } from "react-day-picker/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const HORARIO_PADRAO = "09:00";

const resumoFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const pad = (value: number) => String(value).padStart(2, "0");

function separar(value: string): { data: Date | undefined; horario: string } {
  const [dia, horario] = value.split("T");
  if (!dia) return { data: undefined, horario: HORARIO_PADRAO };
  const [ano, mes, diaDoMes] = dia.split("-").map(Number);
  const data = new Date(ano, mes - 1, diaDoMes);
  return Number.isNaN(data.getTime())
    ? { data: undefined, horario: HORARIO_PADRAO }
    : { data, horario: horario?.slice(0, 5) || HORARIO_PADRAO };
}

function juntar(data: Date, horario: string): string {
  return `${data.getFullYear()}-${pad(data.getMonth() + 1)}-${pad(data.getDate())}T${horario}`;
}

export function formatDateTimeLabel(value: string): string | null {
  const { data, horario } = separar(value);
  if (!data) return null;
  const [hora, minuto] = horario.split(":").map(Number);
  data.setHours(hora, minuto);
  return resumoFormatter.format(data).replace(",", " às");
}

type TriggerProps = Pick<ComponentProps<"button">, "id" | "aria-invalid" | "aria-describedby" | "aria-required">;

interface DateTimePickerProps extends TriggerProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  placeholder?: string;
  clearable?: boolean;
  mesInicial?: string;
  className?: string;
}

export function DateTimePicker({
  value,
  onChange,
  onBlur,
  disabled,
  placeholder = "Selecione data e horário",
  clearable = false,
  mesInicial,
  className,
  ...triggerProps
}: DateTimePickerProps) {
  const horarioId = useId();
  const [aberto, setAberto] = useState(false);
  const { data, horario } = separar(value);
  const rotulo = formatDateTimeLabel(value);

  function fechar(proximo: boolean) {
    setAberto(proximo);
    if (!proximo) onBlur?.();
  }

  return (
    <Popover open={aberto} onOpenChange={fechar}>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          type="button"
          variant="outline"
          {...triggerProps}
          className={cn(
            "h-10 w-full cursor-pointer justify-start gap-2 rounded-lg border-hubee-neutral-50 bg-white px-2.5 text-left font-normal text-hubee-800 hover:bg-hubee-50 aria-invalid:border-red-600 dark:border-hubee-700 dark:bg-hubee-900 dark:text-hubee-50 dark:hover:bg-hubee-800 dark:aria-invalid:border-red-400",
            !rotulo && "text-hubee-neutral-300 dark:text-hubee-neutral-200",
            className,
          )}
        >
          <CalendarDays aria-hidden="true" className="size-4 shrink-0" />
          <span className="truncate">{rotulo ?? placeholder}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto gap-3 border border-hubee-400 bg-hubee-50 p-3 text-hubee-800 dark:border-hubee-500 dark:bg-hubee-750 dark:text-hubee-50"
      >
        <Calendar
          mode="single"
          locale={ptBR}
          selected={data}
          required={!clearable}
          defaultMonth={data ?? (mesInicial ? separar(mesInicial).data : undefined)}
          onSelect={(dia: Date | undefined) => onChange(dia ? juntar(dia, horario) : "")}
          className="p-0 [--cell-size:--spacing(10)]"
        />
        <div className="flex items-end gap-2 border-t border-hubee-200 pt-3 dark:border-hubee-50/15">
          <div className="flex flex-1 flex-col gap-1">
            <label htmlFor={horarioId} className="text-xs font-semibold">
              Horário
            </label>
            <input
              id={horarioId}
              type="time"
              value={horario}
              disabled={!data}
              onChange={(event) => data && event.target.value && onChange(juntar(data, event.target.value))}
              className="h-10 rounded-lg border border-hubee-neutral-50 bg-white px-2.5 text-sm text-hubee-800 outline-none focus-visible:border-hubee-500 focus-visible:ring-3 focus-visible:ring-hubee-500/30 disabled:cursor-not-allowed disabled:opacity-50 dark:border-hubee-700 dark:bg-hubee-900 dark:text-hubee-50"
            />
          </div>
          {clearable && value && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                onChange("");
                fechar(false);
              }}
              className="h-10 cursor-pointer rounded-lg px-3 font-semibold"
            >
              Limpar
            </Button>
          )}
          <Button
            type="button"
            onClick={() => fechar(false)}
            className="h-10 cursor-pointer rounded-lg bg-hubee-800 px-4 font-semibold text-hubee-50 hover:bg-hubee-900 dark:bg-hubee-400 dark:text-hubee-800 dark:hover:bg-hubee-300"
          >
            Concluir
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
