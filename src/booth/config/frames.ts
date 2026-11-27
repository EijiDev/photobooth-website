/**
 * FRAMES / LAYOUTS CONFIG
 * ───────────────────────
 * Each frame has a `build(count)` that returns a Layout in "layout pixels".
 * The export multiplies everything by EXPORT_SCALE for a high-res PNG.
 *
 * To add a frame: append to FRAMES with
 *   - slots:    where each photo goes (+ optional shape / tilt / mat / outline)
 *   - textArea: where caption, footer and date stamp are drawn
 *   - decorate: optional extra art drawn over the photos
 * The setup-page thumbnail is generated from the layout automatically.
 */
import type { Box, FrameDef, Layout, Slot, ThemeDef } from "../types";
import { DATE_FONT, UI_FONT } from "./fonts";
import { fillRoundRect } from "../render/canvas";

/** Final PNG = layout size × this. */
export const EXPORT_SCALE = 2;

/** Mini-polaroid mats are this many times thicker at the bottom. */
export const MAT_BOTTOM_RATIO = 2.75;

/** Splits a box into rows×cols equal slots. */
function gridSlots(
  box: Box,
  rows: number,
  cols: number,
  gap: number,
  extra: Partial<Slot> = {},
): Slot[] {
  const w = (box.w - gap * (cols - 1)) / cols;
  const h = (box.h - gap * (rows - 1)) / rows;
  const slots: Slot[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      slots.push({ x: box.x + c * (w + gap), y: box.y + r * (h + gap), w, h, ...extra });
    }
  }
  return slots;
}

/** Scattered, tilted mini-polaroids for the barkada collage. */
const COLLAGE_ROWS: Record<number, number[]> = {
  3: [1, 2],
  4: [2, 2],
  5: [2, 1, 2],
  6: [2, 2, 2],
};
const COLLAGE_TILT = [-3, 2.5, -2, 3, -2.5, 2];

function collageSlots(count: number, area: Box): Slot[] {
  const rows = COLLAGE_ROWS[count] ?? COLLAGE_ROWS[4];
  const mat = 16;
  const matBottom = mat * MAT_BOTTOM_RATIO;
  const cellH = area.h / rows.length;
  const slots: Slot[] = [];
  rows.forEach((cols, r) => {
    const cellW = area.w / cols;
    for (let c = 0; c < cols; c++) {
      const i = slots.length;
      const h = cellH - mat - matBottom - 36;
      const w = Math.min(cellW - mat * 2 - 36, h * 1.25);
      const cx = area.x + cellW * (c + 0.5) + (i % 2 ? 10 : -10);
      const cy = area.y + cellH * (r + 0.5) - (matBottom - mat) / 2;
      slots.push({ x: cx - w / 2, y: cy - h / 2, w, h, rotate: COLLAGE_TILT[i % 6], mat });
    }
  });
  return slots;
}

/* ─────────────── frame art ─────────────── */

/** Film strip: sprocket holes + orange edge print. */
function filmDecor(ctx: CanvasRenderingContext2D, layout: Layout) {
  const { width: W, height: H } = layout;
  const holeW = 34;
  const holeH = 46;
  ctx.save();
  ctx.fillStyle = "#efe9dc";
  for (let y = 24; y + holeH < H - 10; y += 86) {
    fillRoundRect(ctx, 26, y, holeW, holeH, 7);
    fillRoundRect(ctx, W - 26 - holeW, y, holeW, holeH, 7);
  }
  ctx.fillStyle = "#f5a524";
  ctx.font = `22px ${DATE_FONT}`;
  ctx.textBaseline = "bottom";
  layout.slots.forEach((s, i) => {
    const y = s.y - 12;
    ctx.textAlign = "left";
    ctx.fillText(`${i + 1}`, s.x, y);
    ctx.textAlign = "center";
    ctx.fillText("POSE & REPEAT 400", s.x + s.w / 2, y);
    ctx.textAlign = "right";
    ctx.fillText(`${i + 1}A`, s.x + s.w, y);
  });
  ctx.restore();
}

/** Small header line, Korean photo-booth style. */
const headerDecor =
  (text: string) => (ctx: CanvasRenderingContext2D, layout: Layout, theme: ThemeDef) => {
    const y = layout.slots[0].y / 2;
    ctx.save();
    ctx.font = `600 40px ${UI_FONT}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (theme.textPanel) {
      const w = ctx.measureText(text).width + 60;
      ctx.fillStyle = theme.textPanel;
      fillRoundRect(ctx, layout.width / 2 - w / 2, y - 34, w, 68, 34);
    }
    ctx.fillStyle = theme.ink;
    ctx.fillText(text, layout.width / 2, y + 2);
    ctx.restore();
  };

/* ─────────────── the frames ─────────────── */

export const FRAMES: FrameDef[] = [
  {
    id: "classic-4cut",
    name: "Classic Strip",
    description: "4-cut vertical photobooth strip",
    counts: [4],
    defaultTheme: "white",
    defaultCaption: "snap snap!",
    build: () => {
      const W = 600, H = 2100, m = 36, text = 250;
      return {
        width: W,
        height: H,
        slots: gridSlots({ x: m, y: m, w: W - m * 2, h: H - m - text }, 4, 1, 20),
        textArea: { x: m, y: H - text + 10, w: W - m * 2, h: text - 30 },
        captionSize: 64,
      };
    },
  },
  {
    id: "grid-2x2",
    name: "2×2 Grid",
    description: "4 photos in a square grid",
    counts: [4],
    defaultTheme: "cream",
    defaultCaption: "core memory",
    build: () => {
      const W = 1200, H = 1500, m = 48, text = 240;
      return {
        width: W,
        height: H,
        slots: gridSlots({ x: m, y: m, w: W - m * 2, h: H - m - text }, 2, 2, 24, {
          shape: "rounded",
          radius: 18,
        }),
        textArea: { x: m, y: H - text + 10, w: W - m * 2, h: text - 30 },
        captionSize: 96,
      };
    },
  },
  {
    id: "polaroid",
    name: "Polaroid",
    description: "1 photo, white border + caption",
    counts: [1],
    defaultTheme: "white",
    defaultCaption: "good times ♡",
    defaultFont: "handwritten",
    build: () => ({
      width: 1000,
      height: 1200,
      slots: [{ x: 56, y: 56, w: 888, h: 888 }],
      textArea: { x: 56, y: 960, w: 888, h: 220 },
      captionSize: 110,
    }),
  },
  {
    id: "film-strip",
    name: "Film Strip",
    description: "Sprocket holes & frame numbers",
    counts: [4],
    defaultTheme: "black",
    lockedTheme: "black",
    defaultCaption: "roll no. 1",
    defaultFont: "pixel",
    decorate: filmDecor,
    build: () => {
      const W = 720, H = 2250, text = 260;
      return {
        width: W,
        height: H,
        slots: gridSlots({ x: 96, y: 72, w: W - 192, h: H - 72 - text }, 4, 1, 52),
        textArea: { x: 96, y: H - text + 20, w: W - 192, h: text - 50 },
        captionSize: 64,
      };
    },
  },
  {
    id: "korean-6cut",
    name: "6-Cut Korean",
    description: "2×3 strip on a coloured background",
    counts: [6],
    defaultTheme: "pastel-pink",
    defaultCaption: "best day ever",
    decorate: headerDecor("♡ pose & repeat ♡"),
    build: () => {
      const W = 1200, H = 1800, m = 56, top = 130, text = 240;
      return {
        width: W,
        height: H,
        slots: gridSlots({ x: m, y: top, w: W - m * 2, h: H - top - text }, 3, 2, 24, {
          shape: "rounded",
          radius: 14,
        }),
        textArea: { x: m, y: H - text + 20, w: W - m * 2, h: text - 40 },
        captionSize: 84,
      };
    },
  },
  {
    id: "couple-hearts",
    name: "Couple Hearts",
    description: "2 photos in heart cut-outs",
    counts: [2],
    defaultTheme: "pastel-pink",
    defaultCaption: "you & me",
    defaultFont: "handwritten",
    build: () => {
      const outline = { color: "#ffffff", width: 10 };
      return {
        width: 1200,
        height: 1000,
        slots: [
          { x: 50, y: 60, w: 530, h: 520, shape: "heart", outline },
          { x: 620, y: 60, w: 530, h: 520, shape: "heart", outline },
        ],
        textArea: { x: 60, y: 640, w: 1080, h: 300 },
        captionSize: 110,
      };
    },
  },
  {
    id: "couple-arches",
    name: "Couple Arches",
    description: "2 photos in arch windows",
    counts: [2],
    defaultTheme: "cream",
    defaultCaption: "us, always",
    defaultFont: "retro-serif",
    build: () => ({
      width: 1200,
      height: 1200,
      slots: [
        { x: 70, y: 70, w: 500, h: 740, shape: "arch" },
        { x: 630, y: 70, w: 500, h: 740, shape: "arch" },
      ],
      textArea: { x: 70, y: 850, w: 1060, h: 300 },
      captionSize: 100,
    }),
  },
  {
    id: "barkada-collage",
    name: "Barkada Collage",
    description: "3–6 tilted mini polaroids",
    counts: [4, 3, 5, 6],
    defaultTheme: "gingham-pink",
    defaultCaption: "barkada goals",
    defaultFont: "bold-sans",
    build: (count) => ({
      width: 1200,
      height: 1800,
      slots: collageSlots(count, { x: 60, y: 50, w: 1080, h: 1490 }),
      textArea: { x: 60, y: 1575, w: 1080, h: 195 },
      captionSize: 96,
    }),
  },
];

export const DEFAULT_FRAME_ID = "classic-4cut";

export function getFrame(id: string): FrameDef {
  return FRAMES.find((f) => f.id === id) ?? FRAMES[0];
}

/** Guarantees the count is one the frame supports. */
export function normalizeCount(frame: FrameDef, count: number): number {
  return frame.counts.includes(count) ? count : frame.counts[0];
}
