import { useEffect, useRef, useState } from "react";
import type { Layout, RawShot, ResolvedLook } from "../booth/types";
import { EXPORT_SCALE } from "../booth/config/frames";
import { renderLook } from "../booth/render/renderLook";
import { nextFrame } from "../booth/render/canvas";

/** Hard cap so huge camera frames don't blow up phone memory. */
const MAX_PHOTO_WIDTH = 1600;

/**
 * Applies the current look to every raw shot, cropped to its slot's aspect
 * ratio and sized for the high-res export. Results are cached per
 * shot/slot/filter/intensity and the work is debounced so dragging the
 * intensity slider stays smooth.
 */
export function useProcessedShots(
  shots: (RawShot | null)[],
  layout: Layout,
  look: ResolvedLook,
  enabled: boolean,
  date: Date,
) {
  const cache = useRef(new Map<string, HTMLCanvasElement>());
  const [state, setState] = useState<{ canvases: (HTMLCanvasElement | null)[]; busy: boolean }>({
    canvases: [],
    busy: false,
  });

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    const run = async () => {
      setState((s) => ({ ...s, busy: true }));
      const keep = new Set<string>();
      const out: (HTMLCanvasElement | null)[] = [];

      for (let i = 0; i < layout.slots.length; i++) {
        const shot = shots[i];
        if (!shot) {
          out.push(null);
          continue;
        }
        const slot = layout.slots[i];
        const aspect = slot.w / slot.h;
        const key = `${shot.id}|${aspect.toFixed(4)}|${look.filterId}|${look.intensity}`;
        keep.add(key);
        let canvas = cache.current.get(key);
        if (!canvas) {
          await nextFrame(); // yield between photos so the UI stays responsive
          if (cancelled) return;
          canvas = renderLook(shot.canvas, look, {
            aspect,
            maxWidth: Math.min(MAX_PHOTO_WIDTH, slot.w * EXPORT_SCALE),
            date,
          });
          cache.current.set(key, canvas);
        }
        out.push(canvas);
      }

      for (const key of cache.current.keys()) if (!keep.has(key)) cache.current.delete(key);
      if (!cancelled) setState({ canvases: out, busy: false });
    };

    const timer = setTimeout(run, 90);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [shots, layout, look, enabled, date]);

  return state;
}
