/**
 * Bakes a look into one photo:
 *   crop → colour ops → blur layers → RGB shift → tints → gradients → grain → scanlines → date
 * The order mirrors the DOM stacking order in <LookLayers>, so they match.
 */
import type { ResolvedLook } from "../types";
import {
  blurredCopy,
  coverCrop,
  createCanvas,
  ctx2d,
  supportsCanvasFilter,
  toCompositeOp,
} from "./canvas";
import { drawWithColorOps } from "./colorOps";
import {
  applyRgbShift,
  drawDateStamp,
  drawGradient,
  drawGrain,
  drawScanlines,
  drawTint,
  formatDateStamp,
} from "./layers";

export interface RenderLookOptions {
  /** Output aspect ratio (slot width / height). */
  aspect: number;
  /** Cap on output width in px. */
  maxWidth: number;
  /** Date burned in by filters with a date stamp. */
  date: Date;
}

export function renderLook(
  source: HTMLCanvasElement,
  look: ResolvedLook,
  { aspect, maxWidth, date }: RenderLookOptions,
): HTMLCanvasElement {
  const crop = coverCrop(source.width, source.height, aspect);
  const w = Math.round(Math.min(crop.sw, maxWidth));
  const h = Math.round(w / aspect);

  const out = createCanvas(w, h);
  // CPU-backed when we'll read pixels back (RGB shift / no ctx.filter fallback).
  const ctx = ctx2d(out, look.rgbShift > 0 || (look.ops.length > 0 && !supportsCanvasFilter()));
  ctx.imageSmoothingQuality = "high";
  drawWithColorOps(ctx, source, crop, w, h, look.ops);

  // Blur copies come from the colour-graded photo, before the RGB split (as in the preview).
  const blurs = look.blurLayers.map((layer) => ({
    layer,
    canvas: blurredCopy(out, layer.radius * w),
  }));

  if (look.rgbShift > 0) applyRgbShift(out, look.rgbShift * w);

  for (const { layer, canvas } of blurs) {
    ctx.save();
    ctx.globalAlpha = Math.min(1, layer.opacity);
    ctx.globalCompositeOperation = toCompositeOp(layer.blend);
    ctx.drawImage(canvas, 0, 0);
    ctx.restore();
  }
  look.tints.forEach((t) => drawTint(ctx, t, w, h));
  look.gradients.forEach((g) => drawGradient(ctx, g, w, h));
  drawGrain(ctx, look.grain, w, h);
  drawScanlines(ctx, look.scanlines, w, h);
  if (look.dateStamp) drawDateStamp(ctx, formatDateStamp(date), w, h);

  return out;
}

/** Small square data-URL thumbnail (for the filter picker). */
export function makeThumb(
  source: CanvasImageSource,
  srcW: number,
  srcH: number,
  size = 140,
  mirror = false,
): string {
  const c = createCanvas(size, size);
  const ctx = ctx2d(c);
  const crop = coverCrop(srcW, srcH, 1);
  if (mirror) {
    ctx.translate(size, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(source, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, size, size);
  return c.toDataURL("image/jpeg", 0.8);
}
