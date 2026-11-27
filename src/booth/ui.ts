/**
 * UI palette for the setup + booth pages — Pose & Repeat's dark-maroon & white brand
 * (same colours as the NavBar / hero: maroon accent, white panels, gray text).
 */
export interface BoothPalette {
  bg: string;
  panel: string;
  border: string;
  text: string;
  sub: string;
  accent: string;
  accentHover: string;
  accentSoft: string;
  chip: string;
}

export function boothPalette(dark: boolean): BoothPalette {
  return dark
    ? {
        bg: "#0a0a0a",
        panel: "#111111",
        border: "#2a2a2a",
        text: "#f4f4f5",
        sub: "#71717a",
        accent: "#b54a5d",
        accentHover: "#9a3a4c",
        accentSoft: "#211012",
        chip: "#1a1a1a",
      }
    : {
        bg: "#f8f8f8",
        panel: "#ffffff",
        border: "#e5e7eb",
        text: "#111827",
        sub: "#6b7280",
        accent: "#7a1f2b",
        accentHover: "#5f1621",
        accentSoft: "#f8eef0",
        chip: "#f3f4f6",
      };
}
