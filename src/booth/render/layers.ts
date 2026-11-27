/**
 * Reusable overlay layers: grain, vignette / light leak (gradients), tints,
 * scanlines, RGB shift and the date stamp.
 *
 * Each layer has a CSS form (live preview) and a canvas form (export) built
 * from the same numbers, so both look the same.
 */
import type { CSSProperties } from "react";
import type { GradientLayer, TintLayer } from "../types";
import { DATE_FONT } from "../config/fonts";
import { createCanvas, ctx2d, toCompositeOp } from "./canvas";

/* ───────────── grain ───────────── */

const GRAIN_TILE = 256;
/** A grain tile spans this fraction of the photo width (keeps grain size resolution independent). */
const GRAIN_TILE_FRACTION = 0.25;

let grainTile: HTMLCanvasElement | null = null;
let grainUrl: string | null = null;

/** Deterministic monochrome noise tile (seeded so it's identical every time). */
function getGrainTile(): HTMLCanvasElement {
  if (grainTile) return grainTile;
  const c = createCanvas(GRAIN_TILE, GRAIN_TILE);
  const ctx = ctx2d(c);
  const img = ctx.createImageData(GRAIN_TILE, GRAIN_TILE);
  let seed = 1337;
  for (let i = 0; i < img.data.length; i += 4) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const v = seed >>> 24;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  grainTile = c;
  return c;
}

export function grainCss(amount: number): CSSProperties {
  grainUrl ??= getGrainTile().toDataURL();
  return {
    backgroundImage: `url(${grainUrl})`,
    backgroundSize: `${GRAIN_TILE_FRACTION * 100}% auto`,
    backgroundRepeat: "repeat",
    mixBlendMode: "overlay",
    opacity: amount,
  };
}

export function drawGrain(ctx: CanvasRenderingContext2D, amount: number, w: number, h: number) {
  if (amount <= 0) return;
  const pattern = ctx.createPattern(getGrainTile(), "repeat");
  if (!pattern) return;
  const s = (w * GRAIN_TILE_FRACTION) / GRAIN_TILE;
  pattern.setTransform(new DOMMatrix([s, 0, 0, s, 0, 0]));
  ctx.save();
  ctx.globalAlpha = Math.min(1, amount);
  ctx.globalCompositeOperation = "overlay";
  ctx.fillStyle = pattern;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/* ───────────── tints ───────────── */

export function tintCss(t: TintLayer): CSSProperties {
  return { backgroundColor: t.color, opacity: t.opacity, mixBlendMode: t.blend };
}

export function drawTint(ctx: CanvasRenderingContext2D, t: TintLayer, w: number, h: number) {
  ctx.save();
  ctx.globalAlpha = Math.min(1, t.opacity);
  ctx.globalCompositeOperation = toCompositeOp(t.blend);
  ctx.fillStyle = t.color;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

/* ───────────── gradients (vignette, light leak, flash) ───────────── */

export function gradientCss(g: GradientLayer): CSSProperties {
  const stops = g.stops.map(([o, c]) => `${c} ${o * 100}%`).join(", ");
  return {
    backgroundImage: `radial-gradient(ellipse ${g.rx * 100}% ${g.ry * 100}% at ${g.cx * 100}% ${g.cy * 100}%, ${stops})`,
    opacity: Math.min(1, g.opacity),
    mixBlendMode: g.blend,
  };
}

export function drawGradient(ctx: CanvasRenderingContext2D, g: GradientLayer, w: number, h: number) {
  ctx.save();
  ctx.globalAlpha = Math.min(1, g.opacity);
  ctx.globalCompositeOperation = toCompositeOp(g.blend);
  // Scale a unit circle into the ellipse — same geometry as CSS `ellipse rx% ry%`.
  ctx.translate(g.cx * w, g.cy * h);
  ctx.scale(g.rx * w, g.ry * h);
  const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, 1);
  g.stops.forEach(([o, c]) => grad.addColorStop(o, c));
  ctx.fillStyle = grad;
  ctx.fillRect(-g.cx / g.rx, -g.cy / g.ry, 1 / g.rx, 1 / g.ry);
  ctx.restore();
}

/* ───────────── scanlines ───────────── */

const SCANLINES = 160;

export function scanlineCss(amount: number): CSSProperties {
  return {
    backgroundImage: "linear-gradient(to bottom, #000 0 50%, transparent 50% 100%)",
    backgroundSize: `100% ${100 / SCANLINES}%`,
    opacity: amount,
  };
}

export function drawScanlines(ctx: CanvasRenderingContext2D, amount: number, w: number, h: number) {
  if (amount <= 0) return;
  const p = h / SCANLINES;
  ctx.save();
  ctx.globalAlpha = Math.min(1, amount);
  ctx.fillStyle = "#000";
  for (let i = 0; i < SCANLINES; i++) ctx.fillRect(0, i * p, w, p / 2);
  ctx.restore();
}

/* ───────────── RGB shift ───────────── */

/** Red sampled from the right, blue from the left — matches the preview's SVG filter. */
export function applyRgbShift(canvas: HTMLCanvasElement, px: number) {
  const s = Math.round(px);
  if (s < 1) return;
  const ctx = ctx2d(canvas);
  const { width: w, height: h } = canvas;
  const img = ctx.getImageData(0, 0, w, h);
  const src = new Uint8ClampedArray(img.data);
  const d = img.data;
  for (let y = 0; y < h; y++) {
    const row = y * w;
    for (let x = 0; x < w; x++) {
      const i = (row + x) * 4;
      d[i] = src[(row + Math.min(w - 1, x + s)) * 4];
      d[i + 2] = src[(row + Math.max(0, x - s)) * 4 + 2];
    }
  }
  ctx.putImageData(img, 0, 0);
}

/* ───────────── date stamp ───────────── */

export const DATE_STAMP = {
  color: "#ff9533",
  glow: "rgba(255,80,0,0.85)",
  /** Font size as a fraction of photo width. */
  size: 0.065,
  right: 0.06,
  bottom: 0.07,
};

/** '26 11 27 — like a disposable camera. */
export function formatDateStamp(d: Date): string {
  const yy = String(d.getFullYear()).slice(-2);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `'${yy} ${mm} ${dd}`;
}

export function dateStampCss(photoWidth: number): CSSProperties {
  const size = photoWidth * DATE_STAMP.size;
  return {
    position: "absolute",
    right: `${DATE_STAMP.right * 100}%`,
    bottom: `${DATE_STAMP.bottom * 100}%`,
    fontFamily: DATE_FONT,
    fontSize: size,
    lineHeight: 1,
    color: DATE_STAMP.color,
    textShadow: `0 0 ${size * 0.18}px ${DATE_STAMP.glow}`,
    pointerEvents: "none",
    whiteSpace: "nowrap",
  };
}

export function drawDateStamp(ctx: CanvasRenderingContext2D, text: string, w: number, h: number) {
  const size = w * DATE_STAMP.size;
  ctx.save();
  ctx.font = `${size}px ${DATE_FONT}`;
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.fillStyle = DATE_STAMP.color;
  ctx.shadowColor = DATE_STAMP.glow;
  ctx.shadowBlur = size * 0.35;
  ctx.fillText(text, w * (1 - DATE_STAMP.right), h * (1 - DATE_STAMP.bottom));
  ctx.restore();
}
