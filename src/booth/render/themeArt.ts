/**
 * Renders frame designs (themes) to images:
 *  - small swatches for the pickers (generated from the real `paint`, so the
 *    thumbnail always matches the export)
 *  - cached full-size backgrounds, so busy patterns aren't repainted on every
 *    caption keystroke
 */
import type { ThemeDef } from "../types";
import { createCanvas, ctx2d } from "./canvas";

const swatches = new Map<string, string>();

/** Portrait swatch (data URL) showing the pattern at a representative scale. */
export function themeSwatchUrl(theme: ThemeDef): string {
  const hit = swatches.get(theme.id);
  if (hit) return hit;
  const W = 260; // layout units painted…
  const H = 340;
  const S = 0.4; // …shrunk to 104×136 px
  const c = createCanvas(W * S, H * S);
  const ctx = ctx2d(c);
  ctx.scale(S, S);
  theme.paint(ctx, W, H);
  const url = c.toDataURL("image/png");
  swatches.set(theme.id, url);
  return url;
}

const backgrounds = new Map<string, HTMLCanvasElement>();
const MAX_BACKGROUNDS = 6;

/** Full-size painted background at the given scale (LRU-cached). */
export function themeBackground(theme: ThemeDef, w: number, h: number, scale: number): HTMLCanvasElement {
  const key = `${theme.id}|${w}|${h}|${scale.toFixed(3)}`;
  const hit = backgrounds.get(key);
  if (hit) {
    backgrounds.delete(key); // refresh LRU position
    backgrounds.set(key, hit);
    return hit;
  }
  const c = createCanvas(w * scale, h * scale);
  // CPU-backed: a cached canvas must survive GPU context loss (it's reused in exports).
  const ctx = ctx2d(c, true);
  ctx.scale(c.width / w, c.height / h);
  theme.paint(ctx, w, h);
  backgrounds.set(key, c);
  if (backgrounds.size > MAX_BACKGROUNDS) backgrounds.delete(backgrounds.keys().next().value!);
  return c;
}
