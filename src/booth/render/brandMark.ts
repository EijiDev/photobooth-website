/**
 * The Pose & Repeat watermark drawn on every exported photo strip.
 * Two versions so it stays visible: maroon for light designs, white for dark ones.
 */
import markDark from "../../assets/logo-mark.svg";
import markLight from "../../assets/logo-mark-light.svg";
import { getLoadedImage, loadImage } from "./stickerImages";

export function preloadBrandMarks(): Promise<void> {
  return Promise.all([loadImage(markDark), loadImage(markLight)])
    .then(() => undefined)
    .catch(() => undefined);
}

/** `onDark` = the frame design is dark (light text), so use the white mark. */
export function brandMark(onDark: boolean): HTMLImageElement | null {
  return getLoadedImage(onDark ? markLight : markDark);
}

/** True when a #rrggbb colour is light (used to detect dark designs from their text colour). */
export function isLightColor(color: string): boolean {
  const m = /^#?([0-9a-f]{6})$/i.exec(color.trim());
  if (!m) return false;
  const n = parseInt(m[1], 16);
  const lum = (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  return lum > 0.6;
}
