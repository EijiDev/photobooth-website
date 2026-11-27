/**
 * Photo-slot shapes as SVG path strings.
 * The same string feeds canvas (`new Path2D(d)`) and the viewfinder's SVG
 * mask, so the cut-out you see while shooting is the one that gets exported.
 */
import type { Slot } from "../types";

export function roundedRectPath(w: number, h: number, radius: number): string {
  const r = Math.max(0, Math.min(radius, w / 2, h / 2));
  if (r === 0) return `M0 0H${w}V${h}H0Z`;
  return [
    `M${r} 0H${w - r}`,
    `A${r} ${r} 0 0 1 ${w} ${r}V${h - r}`,
    `A${r} ${r} 0 0 1 ${w - r} ${h}H${r}`,
    `A${r} ${r} 0 0 1 0 ${h - r}V${r}`,
    `A${r} ${r} 0 0 1 ${r} 0Z`,
  ].join("");
}

/** Classic heart drawn in a 0..1 box, then scaled to w×h. */
function heartPath(w: number, h: number): string {
  const p = (x: number, y: number) => `${x * w} ${y * h}`;
  return [
    `M${p(0.5, 0.25)}`,
    `C${p(0.5, 0.22)} ${p(0.45, 0.1)} ${p(0.25, 0.1)}`,
    `C${p(0, 0.1)} ${p(0, 0.38)} ${p(0, 0.38)}`,
    `C${p(0, 0.55)} ${p(0.2, 0.77)} ${p(0.5, 0.95)}`,
    `C${p(0.8, 0.77)} ${p(1, 0.55)} ${p(1, 0.38)}`,
    `C${p(1, 0.38)} ${p(1, 0.1)} ${p(0.75, 0.1)}`,
    `C${p(0.6, 0.1)} ${p(0.5, 0.22)} ${p(0.5, 0.25)}Z`,
  ].join("");
}

/** Arch window: semicircle on top, straight sides. */
function archPath(w: number, h: number): string {
  const r = w / 2;
  return `M0 ${h}V${r}A${r} ${r} 0 0 1 ${w} ${r}V${h}Z`;
}

function ellipsePath(w: number, h: number): string {
  return `M0 ${h / 2}A${w / 2} ${h / 2} 0 1 1 ${w} ${h / 2}A${w / 2} ${h / 2} 0 1 1 0 ${h / 2}Z`;
}

/** Path for a slot, in the slot's local coordinates (0,0 = top-left). */
export function shapePath(slot: Pick<Slot, "shape" | "radius" | "w" | "h">): string {
  const { w, h } = slot;
  switch (slot.shape) {
    case "heart":
      return heartPath(w, h);
    case "arch":
      return archPath(w, h);
    case "circle":
      return ellipsePath(w, h);
    case "rounded":
      return roundedRectPath(w, h, slot.radius ?? 16);
    default:
      return roundedRectPath(w, h, 0);
  }
}

/** Shapes that need a cut-out mask in the viewfinder. */
export function needsMask(slot: Pick<Slot, "shape">): boolean {
  return slot.shape === "heart" || slot.shape === "arch" || slot.shape === "circle";
}
