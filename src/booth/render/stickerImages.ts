/**
 * Sticker artwork cache. Canvas can only draw images that are already
 * decoded, so we preload them (in the picker and before export) and draw
 * synchronously from this cache.
 */
import type { PlacedSticker } from "../types";
import { getSticker } from "../config/stickers";

const loaded = new Map<string, HTMLImageElement>();
const pending = new Map<string, Promise<HTMLImageElement>>();

export function loadImage(src: string): Promise<HTMLImageElement> {
  const done = loaded.get(src);
  if (done) return Promise.resolve(done);
  let p = pending.get(src);
  if (!p) {
    p = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.decoding = "async";
      img.onload = () => {
        loaded.set(src, img);
        resolve(img);
      };
      img.onerror = () => reject(new Error(`Sticker failed to load: ${src}`));
      img.src = src;
    });
    pending.set(src, p);
  }
  return p;
}

export function getLoadedImage(src: string | undefined): HTMLImageElement | null {
  return src ? (loaded.get(src) ?? null) : null;
}

/** Makes sure every placed image sticker is ready to be drawn on canvas. */
export async function preloadStickerImages(stickers: PlacedSticker[]): Promise<void> {
  const srcs = new Set(
    stickers.map((s) => getSticker(s.stickerId)?.src).filter((s): s is string => !!s),
  );
  await Promise.all([...srcs].map(loadImage));
}
