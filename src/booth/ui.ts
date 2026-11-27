/**
 * UI palette for the setup + booth pages — Pose & Repeat's red & white brand
 * (same colours as the NavBar / hero: red-600 accent, white panels, gray text).
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
        accent: "#dc2626",
        accentHover: "#b91c1c",
        accentSoft: "#1f0b0b",
        chip: "#1a1a1a",
      }
    : {
        bg: "#f8f8f8",
        panel: "#ffffff",
        border: "#e5e7eb",
        text: "#111827",
        sub: "#6b7280",
        accent: "#dc2626",
        accentHover: "#b91c1c",
        accentSoft: "#fef2f2",
        chip: "#f3f4f6",
      };
}
