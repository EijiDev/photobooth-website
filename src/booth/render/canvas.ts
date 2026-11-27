/** Small canvas utilities + feature detection. */
import type { BlendMode } from "../types";
import { roundedRectPath } from "./shapes";

export function createCanvas(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = Math.max(1, Math.round(w));
  c.height = Math.max(1, Math.round(h));
  return c;
}

/**
 * Gets the 2D context. Pass `cpu: true` on the FIRST call for canvases we read
 * pixels from or export: a CPU-backed canvas can't be wiped by a GPU context
 * loss (which silently turns a canvas fully transparent).
 */
export function ctx2d(canvas: HTMLCanvasElement, cpu = false): CanvasRenderingContext2D {
  const ctx = canvas.getContext("2d", cpu ? { willReadFrequently: true } : undefined);
  if (!ctx) throw new Error("Canvas 2D is not supported on this device.");
  return ctx;
}

/** CSS "normal" is canvas "source-over"; every other mode shares the same name. */
export function toCompositeOp(mode: BlendMode): GlobalCompositeOperation {
  return mode === "normal" ? "source-over" : mode;
}

let filterSupport: boolean | null = null;

/**
 * Does this browser support `ctx.filter`? (Older iOS Safari doesn't.)
 * We test by actually drawing — reading the property back isn't reliable
 * because assigning an unknown property just creates it.
 */
export function supportsCanvasFilter(): boolean {
  if (filterSupport !== null) return filterSupport;
  try {
    const ctx = ctx2d(createCanvas(4, 4));
    ctx.filter = "invert(1)";
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 4, 4);
    filterSupport = ctx.getImageData(1, 1, 1, 1).data[0] < 128;
  } catch {
    filterSupport = false;
  }
  return filterSupport;
}

/** Returns a blurred copy of `src`. Uses ctx.filter when available, otherwise a down/up-sample blur. */
export function blurredCopy(src: HTMLCanvasElement, radiusPx: number): HTMLCanvasElement {
  const out = createCanvas(src.width, src.height);
  const ctx = ctx2d(out);
  if (radiusPx < 0.5) {
    ctx.drawImage(src, 0, 0);
    return out;
  }
  if (supportsCanvasFilter()) {
    ctx.filter = `blur(${radiusPx}px)`;
    ctx.drawImage(src, 0, 0);
    ctx.filter = "none";
    return out;
  }
  const factor = Math.max(1, radiusPx / 1.5);
  const small = createCanvas(src.width / factor, src.height / factor);
  const sctx = ctx2d(small);
  sctx.imageSmoothingQuality = "high";
  sctx.drawImage(src, 0, 0, small.width, small.height);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(small, 0, 0, out.width, out.height);
  return out;
}

/** Centre crop of a srcW×srcH image to the given aspect ratio (same as CSS object-fit: cover). */
export function coverCrop(srcW: number, srcH: number, aspect: number) {
  let sw = srcW;
  let sh = srcW / aspect;
  if (sh > srcH) {
    sh = srcH;
    sw = srcH * aspect;
  }
  return { sx: (srcW - sw) / 2, sy: (srcH - sh) / 2, sw, sh };
}

export function fillRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fill(new Path2D(roundedRectPath(w, h, r)));
  ctx.restore();
}

export const nextFrame = () =>
  new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
