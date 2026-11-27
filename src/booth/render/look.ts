/** Turns a FilterDef + intensity (0..1) into a ResolvedLook. */
import type { CssOp, CssOpName, FilterDef, ResolvedLook } from "../types";

/** The value of each CSS filter function that means "no change". */
const IDENTITY: Record<CssOpName, number> = {
  brightness: 1,
  contrast: 1,
  saturate: 1,
  sepia: 0,
  grayscale: 0,
  "hue-rotate": 0,
};

const round = (n: number) => Math.round(n * 10000) / 10000;

export function cssFilterString(ops: CssOp[]): string {
  if (!ops.length) return "none";
  return ops
    .map(({ fn, value }) =>
      fn === "hue-rotate" ? `hue-rotate(${round(value)}deg)` : `${fn}(${round(value)})`,
    )
    .join(" ");
}

export function resolveLook(filter: FilterDef, intensity: number): ResolvedLook {
  const t = Math.min(1, Math.max(0, intensity));
  const ops =
    t === 0
      ? []
      : filter.ops.map((op) => ({
          fn: op.fn,
          value: IDENTITY[op.fn] + (op.value - IDENTITY[op.fn]) * t,
        }));
  const scaled = <T extends { opacity: number }>(layers: T[] = []) =>
    layers.map((l) => ({ ...l, opacity: l.opacity * t })).filter((l) => l.opacity > 0.001);

  return {
    filterId: filter.id,
    intensity: t,
    ops,
    css: cssFilterString(ops),
    blurLayers: scaled(filter.blurLayers),
    tints: scaled(filter.tints),
    gradients: scaled(filter.gradients),
    grain: (filter.grain ?? 0) * t,
    scanlines: (filter.scanlines ?? 0) * t,
    rgbShift: (filter.rgbShift ?? 0) * t,
    dateStamp: !!filter.dateStamp && t > 0,
  };
}
