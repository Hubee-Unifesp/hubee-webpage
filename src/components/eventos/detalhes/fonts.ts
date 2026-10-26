import { DM_Serif_Display } from "next/font/google";

/**
 * Fonte serifada de display dos títulos da página de detalhes (protótipo GOL-138).
 * Exposta como `--font-dm-serif`; use a classe `font-display` (mapeada em `globals.css`).
 */
export const displayFont = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-dm-serif",
  display: "swap",
});
