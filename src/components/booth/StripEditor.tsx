import { useEffect, useRef, useState } from "react";
import type { Design, Layout, PlacedSticker } from "../../booth/types";
import { composeDesign } from "../../booth/render/compose";
import { ensureFonts } from "../../booth/config/fonts";
import { useElementSize } from "../../hooks/useElementSize";
import StickerLayer from "./StickerLayer";

interface StripEditorProps {
  design: Design;
  layout: Layout;
  shots: (HTMLCanvasElement | null)[];
  stickers: PlacedSticker[];
  date: Date;
  selectedUid: string | null;
  onSelect: (uid: string | null) => void;
  onStickerChange: (uid: string, patch: Partial<PlacedSticker>) => void;
  onStickerRemove: (uid: string) => void;
  busy: boolean;
  maxHeight: string;
}

/**
 * The strip preview: drawn with the SAME composeDesign() used for export,
 * with stickers on a DOM layer on top so they stay draggable.
 */
export default function StripEditor({
  design,
  layout,
  shots,
  stickers,
  date,
  selectedUid,
  onSelect,
  onStickerChange,
  onStickerRemove,
  busy,
  maxHeight,
}: StripEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [wrapRef, size] = useElementSize<HTMLDivElement>();
  const [fontsTick, setFontsTick] = useState(0);
  const aspect = layout.width / layout.height;

  // Redraw once web fonts are ready (canvas can't wait for them by itself).
  useEffect(() => {
    let alive = true;
    ensureFonts().then(() => alive && setFontsTick((t) => t + 1));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !size.width) return;
    const dpr = window.devicePixelRatio || 1;
    const scale = Math.min(2, Math.max(0.4, (size.width * dpr) / layout.width));
    composeDesign(canvas, design, layout, shots, { scale, stickers: [], placeholders: true, date });
  }, [design, layout, shots, date, size.width, fontsTick]);

  return (
    <div
      ref={wrapRef}
      className="relative mx-auto select-none overflow-visible rounded-xl shadow-[0_4px_20px_-6px_rgba(0,0,0,0.22)] ring-1 ring-black/5"
      style={{ aspectRatio: `${aspect}`, width: `min(100%, calc(${maxHeight} * ${aspect}))` }}
      onPointerDown={() => onSelect(null)}
    >
      <canvas ref={canvasRef} className="block h-full w-full rounded-xl" />
      {size.width > 0 && (
        <StickerLayer
          stickers={stickers}
          k={size.width / layout.width}
          layoutW={layout.width}
          layoutH={layout.height}
          selectedUid={selectedUid}
          onSelect={onSelect}
          onChange={onStickerChange}
          onRemove={onStickerRemove}
        />
      )}
      {busy && (
        <div className="pointer-events-none absolute right-2 top-2 rounded-full bg-white/85 px-2.5 py-1 text-[11px] font-semibold text-red-600 dark:text-red-400 shadow">
          applying filter…
        </div>
      )}
    </div>
  );
}
