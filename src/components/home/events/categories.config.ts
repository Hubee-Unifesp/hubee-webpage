import {
  GraduationCap,
  Mic,
  Music,
  Presentation,
  Ticket,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import type { EventCategory } from "@/lib/api/events";

interface CategoryStyle {
  label: string;
  icon: LucideIcon;
  mediaClassName: string;
  patternClassName: string;
}

export const categoryConfig: Record<EventCategory, CategoryStyle> = {
  festas: {
    label: "Festas",
    icon: Music,
    mediaClassName: "bg-hubee-400 text-hubee-800",
    patternClassName: "text-hubee-600/40",
  },
  shows: {
    label: "Shows",
    icon: Mic,
    mediaClassName: "bg-hubee-800 text-hubee-100",
    patternClassName: "text-hubee-600/50",
  },
  palestras: {
    label: "Palestras",
    icon: Presentation,
    mediaClassName: "bg-hubee-neutral-25 text-hubee-800",
    patternClassName: "text-hubee-neutral-200/50",
  },
  esportes: {
    label: "Esportes",
    icon: Trophy,
    mediaClassName: "bg-hubee-500 text-hubee-800",
    patternClassName: "text-hubee-700/40",
  },
  academicos: {
    label: "Acadêmicos",
    icon: GraduationCap,
    mediaClassName: "bg-hubee-700 text-hubee-50",
    patternClassName: "text-hubee-500/50",
  },
  outros: {
    label: "Outros",
    icon: Ticket,
    mediaClassName: "bg-hubee-300 text-hubee-800",
    patternClassName: "text-hubee-600/40",
  },
};
