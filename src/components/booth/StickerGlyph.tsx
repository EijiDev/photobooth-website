import type { StickerDef } from "../../booth/types";
import { STICKER_STROKE, stickerFont } from "../../booth/config/stickers";

/** Ring of text-shadows = an outline that matches canvas strokeText. */
function outline(color: string, r: number): string {
  const steps = 12;
  return Array.from({ length: steps }, (_, i) => {
    const a = (i / steps) * Math.PI * 2;
    return `${(Math.cos(a) * r).toFixed(2)}px ${(Math.sin(a) * r).toFixed(2)}px 0 ${color}`;
  }).join(", ");
}

/**
 * DOM rendering of a sticker. `size` (CSS px) is the image width, or the
 * text sticker's base size — the same meaning the canvas export uses.
 */
export default function StickerGlyph({ def, size }: { def: StickerDef; size: number }) {
  if (def.kind === "image") {
    return (
      <img
        src={def.src}
        alt={def.label}
        draggable={false}
        className="pointer-events-none block max-w-none select-none"
        style={{ width: size, height: size / (def.aspect ?? 1) }}
      />
    );
  }
  return (
    <span
      className="block whitespace-nowrap select-none"
      style={{
        font: stickerFont(def, size),
        lineHeight: 1,
        color: def.fill,
        textShadow: outline(def.stroke ?? "#fff", (size * STICKER_STROKE) / 2),
      }}
    >
      {def.content}
    </span>
  );
}
