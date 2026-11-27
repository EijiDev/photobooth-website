/**
 * FILTERS CONFIG
 * ──────────────
 * To add a filter, append an object to FILTERS. That's it — the picker,
 * live preview, thumbnails and the exported PNG all read from here.
 *
 *  ops        CSS filter functions (brightness, contrast, saturate, sepia,
 *             grayscale, hue-rotate). Values are at 100% intensity; the
 *             slider interpolates from "no effect" to these values.
 *  blurLayers bloom() / softFocus()
 *  tints      tint() / liftBlacks()
 *  gradients  vignette() / lightLeak() / flashHotspot()
 *  grain, scanlines, rgbShift, dateStamp
 *
 * See ./effects.ts for the reusable layer helpers.
 */
import type { FilterDef } from "../types";
import {
  bloom,
  flashHotspot,
  liftBlacks,
  lightLeak,
  softFocus,
  tint,
  vignette,
} from "./effects";

export const FILTERS: FilterDef[] = [
  {
    id: "original",
    name: "Original",
    accent: "#e5e7eb",
    ops: [],
  },
  {
    id: "soft-glow",
    name: "Soft Glow",
    accent: "#ffc8dd",
    ops: [
      { fn: "brightness", value: 1.06 },
      { fn: "contrast", value: 0.9 },
      { fn: "saturate", value: 1.05 },
    ],
    blurLayers: [bloom(0.022, 0.38)],
    tints: [liftBlacks(0.5, "#3d2a33"), tint("#ffb3d1", 0.35)],
  },
  {
    id: "korean-clean",
    name: "Korean Clean",
    accent: "#dbeafe",
    ops: [
      { fn: "brightness", value: 1.12 },
      { fn: "contrast", value: 0.86 },
      { fn: "saturate", value: 0.9 },
      { fn: "hue-rotate", value: -4 },
    ],
    blurLayers: [softFocus(0.004, 0.25)],
    tints: [
      tint("#cfe0ff", 0.3), // slightly cool
      tint("#fff1dc", 0.25), // creamy skin
      liftBlacks(0.35, "#2e3440"),
    ],
  },
  {
    id: "warm-film",
    name: "Warm Film",
    accent: "#fcd34d",
    ops: [
      { fn: "sepia", value: 0.22 },
      { fn: "saturate", value: 1.12 },
      { fn: "contrast", value: 0.94 },
      { fn: "brightness", value: 1.03 },
    ],
    tints: [tint("#ffa94d", 0.35), liftBlacks(0.6, "#3a2614")],
    gradients: [vignette(0.25)],
    grain: 0.28,
  },
  {
    id: "vintage-disposable",
    name: "Disposable",
    accent: "#fb923c",
    ops: [
      { fn: "sepia", value: 0.15 },
      { fn: "contrast", value: 1.06 },
      { fn: "saturate", value: 1.18 },
      { fn: "brightness", value: 1.02 },
    ],
    tints: [tint("#ffd08a", 0.25), liftBlacks(0.4, "#2b1f14")],
    gradients: [...lightLeak(0.75), vignette(0.5)],
    grain: 0.42,
    dateStamp: true,
  },
  {
    id: "y2k-digicam",
    name: "Y2K Digicam",
    accent: "#a5f3fc",
    ops: [
      { fn: "saturate", value: 1.65 },
      { fn: "contrast", value: 1.12 },
      { fn: "brightness", value: 1.16 },
    ],
    tints: [tint("#bcd7ff", 0.2)],
    gradients: [flashHotspot(0.55), vignette(0.22)],
    grain: 0.08,
  },
  {
    id: "bw-classic",
    name: "B&W Classic",
    accent: "#9ca3af",
    ops: [
      { fn: "grayscale", value: 1 },
      { fn: "contrast", value: 1.35 },
      { fn: "brightness", value: 1.04 },
    ],
    gradients: [vignette(0.3)],
    grain: 0.35,
  },
  {
    id: "sepia",
    name: "Sepia",
    accent: "#c08a5b",
    ops: [
      { fn: "sepia", value: 0.88 },
      { fn: "contrast", value: 1.05 },
      { fn: "saturate", value: 0.9 },
      { fn: "brightness", value: 0.98 },
    ],
    tints: [tint("#7a4a1d", 0.25), liftBlacks(0.4, "#2a1a0e")],
    gradients: [vignette(0.35)],
    grain: 0.18,
  },
  {
    id: "pastel-cutie",
    name: "Pastel Cutie",
    accent: "#e9d5ff",
    ops: [
      { fn: "brightness", value: 1.1 },
      { fn: "contrast", value: 0.84 },
      { fn: "saturate", value: 0.85 },
    ],
    blurLayers: [bloom(0.015, 0.2)],
    tints: [tint("#ffc1e3", 0.45), tint("#d8c4ff", 0.18, "screen")],
  },
  {
    id: "vhs-glitch",
    name: "VHS Glitch",
    accent: "#818cf8",
    ops: [
      { fn: "saturate", value: 1.35 },
      { fn: "contrast", value: 1.1 },
      { fn: "brightness", value: 1.04 },
      { fn: "hue-rotate", value: -8 },
    ],
    tints: [liftBlacks(0.5, "#14213d")],
    gradients: [vignette(0.25)],
    grain: 0.22,
    scanlines: 0.32,
    rgbShift: 0.005,
  },
  {
    id: "beauty",
    name: "Beauty",
    accent: "#fecdd3",
    ops: [
      { fn: "brightness", value: 1.1 },
      { fn: "contrast", value: 0.94 },
      { fn: "saturate", value: 1.04 },
    ],
    blurLayers: [softFocus(0.007, 0.42), bloom(0.02, 0.12)],
    tints: [tint("#ffe1e6", 0.3)],
  },
  {
    id: "moody-cinematic",
    name: "Moody",
    accent: "#5eead4",
    ops: [
      { fn: "contrast", value: 1.28 },
      { fn: "brightness", value: 0.9 },
      { fn: "saturate", value: 0.88 },
    ],
    tints: [
      tint("#2f7f86", 0.3, "multiply"), // teal shadows
      tint("#ff9a3c", 0.35), // orange highlights / skin
    ],
    gradients: [vignette(0.45)],
  },
];

export const DEFAULT_FILTER_ID = "original";

export function getFilter(id: string): FilterDef {
  return FILTERS.find((f) => f.id === id) ?? FILTERS[0];
}
