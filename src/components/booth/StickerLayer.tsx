import { useRef, type PointerEvent as ReactPointerEvent } from "react";
import { Maximize2, X } from "lucide-react";
import type { PlacedSticker } from "../../booth/types";
import { getSticker } from "../../booth/config/stickers";
import StickerGlyph from "./StickerGlyph";

interface StickerLayerProps {
  stickers: PlacedSticker[];
  /** CSS px per layout px. */
  k: number;
  layoutW: number;
  layoutH: number;
  selectedUid: string | null;
  onSelect: (uid: string) => void;
  onChange: (uid: string, patch: Partial<PlacedSticker>) => void;
  onRemove: (uid: string) => void;
}

/** Draggable stickers over the preview. Drag to move; drag the corner handle to resize + rotate. */
export default function StickerLayer(props: StickerLayerProps) {
  // Keep DOM order stable (sorted by uid) and stack with z-index instead, so
  // bringing a sticker to the front never moves its node mid-drag (which would
  // drop pointer capture).
  const stable = [...props.stickers].sort((a, b) => (a.uid < b.uid ? -1 : 1));
  return (
    <div className="pointer-events-none absolute inset-0">
      {stable.map((s) => (
        <StickerItem key={s.uid} sticker={s} z={props.stickers.indexOf(s) + 1} {...props} />
      ))}
    </div>
  );
}

type Drag =
  | { mode: "move"; startX: number; startY: number; x: number; y: number }
  | { mode: "transform"; cx: number; cy: number; dist: number; angle: number; size: number; rotation: number };

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function StickerItem({
  sticker,
  k,
  layoutW,
  layoutH,
  selectedUid,
  onSelect,
  onChange,
  onRemove,
  z,
}: StickerLayerProps & { sticker: PlacedSticker; z: number }) {
  const drag = useRef<Drag | null>(null);
  const el = useRef<HTMLDivElement>(null);
  const def = getSticker(sticker.stickerId);
  if (!def) return null;
  const selected = selectedUid === sticker.uid;

  const startMove = (e: ReactPointerEvent) => {
    e.stopPropagation();
    onSelect(sticker.uid);
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { mode: "move", startX: e.clientX, startY: e.clientY, x: sticker.x, y: sticker.y };
  };

  const startTransform = (e: ReactPointerEvent) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    const rect = el.current!.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    drag.current = {
      mode: "transform",
      cx,
      cy,
      dist: Math.max(1, Math.hypot(e.clientX - cx, e.clientY - cy)),
      angle: Math.atan2(e.clientY - cy, e.clientX - cx),
      size: sticker.size,
      rotation: sticker.rotation,
    };
  };

  const onMove = (e: ReactPointerEvent) => {
    const d = drag.current;
    if (!d) return;
    if (d.mode === "move") {
      onChange(sticker.uid, {
        x: clamp(d.x + (e.clientX - d.startX) / k, 0, layoutW),
        y: clamp(d.y + (e.clientY - d.startY) / k, 0, layoutH),
      });
    } else {
      const dx = e.clientX - d.cx;
      const dy = e.clientY - d.cy;
      onChange(sticker.uid, {
        size: clamp((d.size * Math.hypot(dx, dy)) / d.dist, layoutW * 0.04, layoutW * 0.8),
        rotation: d.rotation + ((Math.atan2(dy, dx) - d.angle) * 180) / Math.PI,
      });
    }
  };

  const endDrag = () => {
    drag.current = null;
  };

  return (
    <div
      ref={el}
      className="pointer-events-auto absolute cursor-grab touch-none active:cursor-grabbing"
      style={{
        left: sticker.x * k,
        top: sticker.y * k,
        transform: `translate(-50%, -50%) rotate(${sticker.rotation}deg)`,
        zIndex: z,
      }}
      onPointerDown={startMove}
      onPointerMove={onMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <div
        className="animate-sticker-in rounded-lg p-1"
        style={{ outline: selected ? "2px dashed rgba(122,31,43,0.9)" : "none", outlineOffset: 2 }}
      >
        <StickerGlyph def={def} size={sticker.size * k} />
      </div>

      {selected && (
        <>
          <button
            type="button"
            aria-label="Remove sticker"
            className="absolute -left-3 -top-3 flex h-7 w-7 items-center justify-center rounded-full bg-white text-red-600 dark:text-red-400 shadow-md"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onRemove(sticker.uid)}
          >
            <X size={14} strokeWidth={3} />
          </button>
          <span
            role="button"
            aria-label="Resize or rotate sticker"
            className="absolute -bottom-3 -right-3 flex h-7 w-7 touch-none items-center justify-center rounded-full bg-red-600 text-white shadow-md"
            onPointerDown={startTransform}
            onPointerMove={onMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            <Maximize2 size={13} strokeWidth={2.5} />
          </span>
        </>
      )}
    </div>
  );
}
