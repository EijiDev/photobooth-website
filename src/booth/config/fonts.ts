/**
 * FONTS CONFIG
 * Caption fonts are loaded from Google Fonts in index.html. To add one:
 *   1. add the family to the <link> in index.html
 *   2. add an entry here
 */
import type { CaptionFontDef } from "../types";

export const CAPTION_FONTS: CaptionFontDef[] = [
  {
    id: "handwritten",
    name: "Handwritten",
    family: '"Caveat", "Segoe Print", cursive',
    weight: 700,
    sizeScale: 1.25,
  },
  {
    id: "retro-serif",
    name: "Retro Serif",
    family: '"DM Serif Display", Georgia, serif',
    weight: 400,
    sizeScale: 1,
  },
  {
    id: "pixel",
    name: "Pixel",
    family: '"Press Start 2P", ui-monospace, monospace',
    weight: 400,
    sizeScale: 0.55,
  },
  {
    id: "bold-sans",
    name: "Bold Sans",
    family: '"Outfit", system-ui, sans-serif',
    weight: 800,
    sizeScale: 0.95,
  },
];

export const UI_FONT = '"Outfit", system-ui, sans-serif';
/** Retro orange digital date-stamp font. */
export const DATE_FONT = '"Share Tech Mono", ui-monospace, monospace';

export function getCaptionFont(id: string): CaptionFontDef {
  return CAPTION_FONTS.find((f) => f.id === id) ?? CAPTION_FONTS[0];
}

/** Builds a CSS/canvas `font` shorthand. */
export function fontString(weight: number, sizePx: number, family: string) {
  return `${weight} ${sizePx}px ${family}`;
}

let fontsReady: Promise<void> | null = null;

/**
 * Canvas can't lazy-load web fonts, so we make sure every font is ready
 * before drawing text. Safe to call repeatedly.
 */
export function ensureFonts(): Promise<void> {
  if (!fontsReady) {
    const specs = [
      ...CAPTION_FONTS.map((f) => fontString(f.weight, 40, f.family)),
      fontString(500, 40, UI_FONT),
      fontString(600, 40, UI_FONT),
      fontString(800, 40, UI_FONT),
      fontString(400, 40, DATE_FONT),
    ];
    fontsReady =
      typeof document !== "undefined" && document.fonts
        ? Promise.all(
            specs.map((s) => document.fonts.load(s).catch(() => [])),
          ).then(() => undefined)
        : Promise.resolve();
  }
  return fontsReady;
}
