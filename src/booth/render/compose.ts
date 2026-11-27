/**
 * Composes the final strip: theme background → photos in their slots →
 * frame art → caption/footer/date → stickers.
 * The editor preview and the PNG export both use this function.
 */
import type { Design, Layout, PlacedSticker, Slot, ThemeDef } from "../types";
import { getFrame, MAT_BOTTOM_RATIO } from "../config/frames";
import { getTheme } from "../config/themes";
import { DATE_FONT, fontString, getCaptionFont, UI_FONT } from "../config/fonts";
import { getSticker, STICKER_STROKE, stickerFont } from "../config/stickers";
import { coverCrop, ctx2d, fillRoundRect } from "./canvas";
import { shapePath } from "./shapes";
import { getLoadedImage } from "./stickerImages";
import { themeBackground } from "./themeArt";
import { brandMark, isLightColor } from "./brandMark";
import { BRAND } from "../../brand";
import { DATE_STAMP, formatDateStamp } from "./layers";

export interface ComposeOptions {
  /** Output pixels per layout pixel. */
  scale: number;
  /** Stickers to bake in (the editor draws them as DOM instead, so they stay draggable). */
  stickers: PlacedSticker[];
  /** Show numbered placeholders for photos not taken yet. */
  placeholders: boolean;
  date: Date;
  /** Use a CPU-backed canvas (recommended for exports). */
  cpu?: boolean;
}

export function composeDesign(
  target: HTMLCanvasElement,
  design: Design,
  layout: Layout,
  shots: (HTMLCanvasElement | null)[],
  opts: ComposeOptions,
): HTMLCanvasElement {
  const frame = getFrame(design.frameId);
  const theme = getTheme(frame.lockedTheme ?? design.themeId);

  target.width = Math.round(layout.width * opts.scale);
  target.height = Math.round(layout.height * opts.scale);
  const ctx = ctx2d(target, opts.cpu);
  ctx.setTransform(opts.scale, 0, 0, opts.scale, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  ctx.drawImage(themeBackground(theme, layout.width, layout.height, opts.scale), 0, 0, layout.width, layout.height);
  layout.slots.forEach((slot, i) => drawSlot(ctx, slot, shots[i] ?? null, i, opts.placeholders));
  frame.decorate?.(ctx, layout, theme);
  drawText(ctx, layout, theme, design, opts.date);
  opts.stickers.forEach((s) => drawSticker(ctx, s));

  return target;
}

/**
 * Every theme paints an opaque background, so a transparent corner means the
 * canvas was wiped (e.g. GPU context loss) and must not be exported.
 */
export function looksBlank(canvas: HTMLCanvasElement): boolean {
  try {
    const ctx = ctx2d(canvas, true);
    const a = ctx.getImageData(1, 1, 1, 1).data[3];
    const b = ctx.getImageData(canvas.width - 2, canvas.height - 2, 1, 1).data[3];
    return a === 0 && b === 0;
  } catch {
    return false;
  }
}

function drawSlot(
  ctx: CanvasRenderingContext2D,
  slot: Slot,
  img: HTMLCanvasElement | null,
  index: number,
  placeholders: boolean,
) {
  const { w, h } = slot;
  ctx.save();
  ctx.translate(slot.x + w / 2, slot.y + h / 2);
  if (slot.rotate) ctx.rotate((slot.rotate * Math.PI) / 180);
  ctx.translate(-w / 2, -h / 2);

  if (slot.mat) {
    const m = slot.mat;
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.18)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-m, -m, w + m * 2, h + m + m * MAT_BOTTOM_RATIO);
    ctx.restore();
  }

  const path = new Path2D(shapePath(slot));
  ctx.save();
  ctx.clip(path);
  if (img) {
    const c = coverCrop(img.width, img.height, w / h);
    ctx.drawImage(img, c.sx, c.sy, c.sw, c.sh, 0, 0, w, h);
  } else if (placeholders) {
    ctx.fillStyle = "rgba(140,120,130,0.22)";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.font = fontString(700, Math.min(w, h) * 0.22, UI_FONT);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(index + 1), w / 2, h / 2);
  }
  ctx.restore();

  if (slot.outline) {
    ctx.lineWidth = slot.outline.width;
    ctx.strokeStyle = slot.outline.color;
    ctx.stroke(path);
  }
  ctx.restore();
}

interface TextLine {
  text: string;
  size: number;
  font: (size: number) => string;
  color: string;
  glow?: string;
  /** Logo drawn to the left of the text (watermark line). */
  mark?: HTMLImageElement | null;
  /** Line height factor (default 1.3). */
  lh?: number;
  alpha?: number;
}

const LINE = 1.3;
/** Extra width taken by a line's logo (mark + gap), relative to its font size. */
const markExtra = (l: TextLine) => (l.mark ? l.size * 1.75 : 0);

/** Caption, footer and date stamp, stacked and centred in the layout's text area. */
function drawText(
  ctx: CanvasRenderingContext2D,
  layout: Layout,
  theme: ThemeDef,
  design: Design,
  date: Date,
) {
  const box = layout.textArea;
  const captionFont = getCaptionFont(design.captionFontId);
  const lines: TextLine[] = [];

  if (design.caption.trim()) {
    lines.push({
      text: design.caption.trim(),
      size: layout.captionSize * captionFont.sizeScale,
      font: (s) => fontString(captionFont.weight, s, captionFont.family),
      color: theme.ink,
    });
  }
  if (design.footer.trim()) {
    lines.push({
      text: design.footer.trim(),
      size: layout.captionSize * 0.36,
      font: (s) => fontString(600, s, UI_FONT),
      color: theme.subInk,
    });
  }
  if (design.dateStamp) {
    lines.push({
      text: formatDateStamp(date),
      size: layout.captionSize * 0.4,
      font: (s) => fontString(400, s, DATE_FONT),
      color: DATE_STAMP.color,
      glow: DATE_STAMP.glow,
    });
  }
  // Watermark: logo + name on every strip, for recognition.
  lines.push({
    text: BRAND.name.toLowerCase(),
    size: layout.captionSize * 0.24,
    font: (s) => fontString(700, s, UI_FONT),
    color: theme.subInk,
    mark: brandMark(isLightColor(theme.ink)),
    lh: 2,
    alpha: 0.9,
  });

  // Shrink long lines to fit the width…
  const maxW = box.w * 0.92;
  for (const line of lines) {
    ctx.font = line.font(line.size);
    const w = ctx.measureText(line.text).width + markExtra(line);
    if (w > maxW) line.size *= maxW / w;
  }
  // …and the whole block to fit the height.
  let total = lines.reduce((sum, l) => sum + l.size * (l.lh ?? LINE), 0);
  if (total > box.h) {
    const k = box.h / total;
    lines.forEach((l) => (l.size *= k));
    total = box.h;
  }

  ctx.save();
  if (theme.textPanel) {
    const widest = Math.max(
      ...lines.map((l) => {
        ctx.font = l.font(l.size);
        return ctx.measureText(l.text).width + markExtra(l);
      }),
    );
    const pw = Math.min(box.w, widest + 80);
    const ph = Math.min(box.h, total + 40);
    ctx.fillStyle = theme.textPanel;
    fillRoundRect(ctx, box.x + (box.w - pw) / 2, box.y + (box.h - ph) / 2, pw, ph, 28);
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  let y = box.y + (box.h - total) / 2;
  for (const line of lines) {
    ctx.font = line.font(line.size);
    ctx.fillStyle = line.color;
    ctx.shadowColor = line.glow ?? "transparent";
    ctx.shadowBlur = line.glow ? line.size * 0.35 : 0;
    ctx.globalAlpha = line.alpha ?? 1;
    const lh = line.size * (line.lh ?? LINE);
    const cy = y + lh / 2;
    if (line.mark) {
      // [logo] pose & repeat — centred as one unit
      const m = line.size * 1.4;
      const gap = line.size * 0.35;
      const tw = ctx.measureText(line.text).width;
      const x0 = box.x + box.w / 2 - (m + gap + tw) / 2;
      ctx.drawImage(line.mark, x0, cy - m / 2, m, m);
      ctx.textAlign = "left";
      ctx.fillText(line.text, x0 + m + gap, cy);
      ctx.textAlign = "center";
    } else {
      ctx.fillText(line.text, box.x + box.w / 2, cy);
    }
    ctx.globalAlpha = 1;
    y += lh;
  }
  ctx.restore();
}

export function drawSticker(ctx: CanvasRenderingContext2D, placed: PlacedSticker) {
  const def = getSticker(placed.stickerId);
  if (!def) return;
  ctx.save();
  ctx.translate(placed.x, placed.y);
  ctx.rotate((placed.rotation * Math.PI) / 180);

  if (def.kind === "image") {
    // `size` is the sticker's width; artwork must be preloaded (see stickerImages.ts).
    const img = getLoadedImage(def.src);
    if (img) {
      const w = placed.size;
      const h = w / (def.aspect ?? 1);
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
    }
  } else {
    const text = def.content ?? "";
    ctx.font = stickerFont(def, placed.size);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    ctx.lineWidth = placed.size * STICKER_STROKE;
    ctx.strokeStyle = def.stroke ?? "#fff";
    ctx.strokeText(text, 0, 0);
    ctx.fillStyle = def.fill ?? "#000";
    ctx.fillText(text, 0, 0);
  }
  ctx.restore();
}
