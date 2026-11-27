/**
 * PATTERN LIBRARY for frame designs.
 *
 * A `Paint` fills the whole frame background (in layout pixels). Painters are
 * small building blocks — combine them with `layers(...)` to make new designs:
 *
 *   paint: layers(solid("#fff0f5"), pattern(heart("#ff7aa2", 26), 70, { stagger: true }))
 *
 * Everything random is seeded, so a design always looks identical in the
 * preview and in the exported PNG.
 */

export type Paint = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
/** Draws one motif centred on (0,0). `rand` is a seeded 0..1 generator. */
export type Motif = (ctx: CanvasRenderingContext2D, rand: () => number) => void;

/** Seeded pseudo-random generator (deterministic). */
export function rng(seed: number): () => number {
  let s = seed >>> 0 || 1;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const TAU = Math.PI * 2;
const pick = <T,>(arr: T[], r: () => number) => arr[Math.floor(r() * arr.length) % arr.length];

/* ───────────────────────── base painters ───────────────────────── */

export const solid =
  (color: string): Paint =>
  (ctx, w, h) => {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, w, h);
  };

/** Runs several painters in order (each isolated with save/restore). */
export const layers =
  (...paints: Paint[]): Paint =>
  (ctx, w, h) => {
    for (const p of paints) {
      ctx.save();
      p(ctx, w, h);
      ctx.restore();
    }
  };

/** Linear gradient. `angle` works like CSS (180 = top → bottom). */
export const linear =
  (stops: string[], angle = 180): Paint =>
  (ctx, w, h) => {
    const a = (angle * Math.PI) / 180;
    const dx = Math.sin(a);
    const dy = -Math.cos(a);
    const half = (Math.abs(w * dx) + Math.abs(h * dy)) / 2;
    const g = ctx.createLinearGradient(w / 2 - dx * half, h / 2 - dy * half, w / 2 + dx * half, h / 2 + dy * half);
    stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  };

/** Soft "mesh gradient" blobs. x/y are 0..1, r is a fraction of the longer side. */
export const blobs =
  (items: { x: number; y: number; r: number; color: string }[]): Paint =>
  (ctx, w, h) => {
    const m = Math.max(w, h);
    for (const b of items) {
      const g = ctx.createRadialGradient(b.x * w, b.y * h, 0, b.x * w, b.y * h, b.r * m);
      g.addColorStop(0, b.color);
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }
  };

export const checker =
  (a: string, b: string, size: number): Paint =>
  (ctx, w, h) => {
    ctx.fillStyle = a;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = b;
    for (let y = 0; y * size < h; y++)
      for (let x = 0; x * size < w; x++) if ((x + y) % 2) ctx.fillRect(x * size, y * size, size, size);
  };

/** Gingham: translucent stripes both ways; crossings get darker. */
export const gingham =
  (base: string, stripe: string, size: number): Paint =>
  (ctx, w, h) => {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = stripe;
    for (let x = 0; x < w; x += size * 2) ctx.fillRect(x, 0, size, h);
    for (let y = 0; y < h; y += size * 2) ctx.fillRect(0, y, w, size);
  };

/** Tartan / plaid: repeating bands [color, width, offset] in both directions. */
export const plaid =
  (base: string, bands: [color: string, width: number, offset: number][], period: number): Paint =>
  (ctx, w, h) => {
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, w, h);
    for (const [color, bw, off] of bands) {
      ctx.fillStyle = color;
      for (let x = off; x < w; x += period) ctx.fillRect(x, 0, bw, h);
      for (let y = off; y < h; y += period) ctx.fillRect(0, y, w, bw);
    }
  };

/** Stripes cycling through `colors`. angle 0 = vertical. */
export const stripes =
  (colors: string[], width: number, angle = 0): Paint =>
  (ctx, w, h) => {
    const d = Math.hypot(w, h);
    ctx.translate(w / 2, h / 2);
    ctx.rotate((angle * Math.PI) / 180);
    let i = 0;
    for (let x = -d; x < d; x += width, i++) {
      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(x, -d, width + 0.5, d * 2);
    }
  };

/** Graph paper with optional heavier line every `major` cells. */
export const gridPaper =
  (bg: string, line: string, size: number, major = 0, majorLine = line): Paint =>
  (ctx, w, h) => {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    let i = 0;
    for (let x = 0; x <= w; x += size, i++) {
      ctx.fillStyle = major && i % major === 0 ? majorLine : line;
      ctx.fillRect(x, 0, major && i % major === 0 ? 2 : 1, h);
    }
    i = 0;
    for (let y = 0; y <= h; y += size, i++) {
      ctx.fillStyle = major && i % major === 0 ? majorLine : line;
      ctx.fillRect(0, y, w, major && i % major === 0 ? 2 : 1);
    }
  };

/** Woven linen / canvas texture. */
export const linen =
  (bg: string, thread: string, gap = 4): Paint =>
  (ctx, w, h) => {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = thread;
    for (let x = 0; x < w; x += gap) ctx.fillRect(x, 0, 1, h);
    for (let y = 0; y < h; y += gap) ctx.fillRect(0, y, w, 1);
  };

/** Retro 70s wavy bands. */
export const waves =
  (bg: string, colors: string[], band: number, amp: number, wavelength: number): Paint =>
  (ctx, w, h) => {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    const thick = band * 0.62;
    let i = 0;
    for (let y = -band; y < h + band; y += band, i++) {
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      for (let x = 0; x <= w + 8; x += 8) ctx.lineTo(x, y + Math.sin((x / wavelength) * TAU) * amp);
      for (let x = w + 8; x >= 0; x -= 8) ctx.lineTo(x, y + thick + Math.sin((x / wavelength) * TAU) * amp);
      ctx.closePath();
      ctx.fill();
    }
  };

/** Glowing diagonal neon lines on a dark background. */
export const neonLines =
  (bg: string, colors: string[], gap: number): Paint =>
  (ctx, w, h) => {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    ctx.lineWidth = 3;
    ctx.shadowBlur = 12;
    let i = 0;
    for (let x = -h; x < w; x += gap, i++) {
      const c = colors[i % colors.length];
      ctx.strokeStyle = c;
      ctx.shadowColor = c;
      ctx.beginPath();
      ctx.moveTo(x, h);
      ctx.lineTo(x + h, 0);
      ctx.stroke();
    }
  };

/** Newsprint: columns of grey "text" lines. */
export const newsprint =
  (bg: string, ink: string): Paint =>
  (ctx, w, h) => {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    const r = rng(42);
    const col = 150;
    const gap = 22;
    ctx.fillStyle = ink;
    for (let x = 16; x < w; x += col + gap) {
      let y = 18;
      while (y < h) {
        if (r() < 0.08) {
          ctx.fillRect(x, y, col * (0.6 + r() * 0.4), 14); // headline
          y += 28;
        } else {
          ctx.fillRect(x, y, col * (r() < 0.15 ? 0.5 + r() * 0.3 : 0.92 + r() * 0.08), 5);
          y += 12;
        }
      }
    }
  };

/* ───────────────────────── motif placement ───────────────────────── */

interface PatternOpts {
  /** Offset every other row (brick / half-drop). */
  stagger?: boolean;
  /** Random position jitter, as a fraction of spacing. */
  jitter?: number;
  /** Random rotation range in degrees (±). */
  rotate?: number;
  seed?: number;
}

/** Repeats a motif on a regular grid. */
export const pattern =
  (motif: Motif, spacing: number, opts: PatternOpts = {}): Paint =>
  (ctx, w, h) => {
    const r = rng(opts.seed ?? 7);
    const rowH = opts.stagger ? spacing * 0.87 : spacing;
    let row = 0;
    for (let y = -spacing / 2; y < h + spacing; y += rowH, row++) {
      const off = opts.stagger && row % 2 ? spacing / 2 : 0;
      for (let x = off - spacing / 2; x < w + spacing; x += spacing) {
        const jx = (r() - 0.5) * (opts.jitter ?? 0) * spacing;
        const jy = (r() - 0.5) * (opts.jitter ?? 0) * spacing;
        const rot = (r() - 0.5) * 2 * (opts.rotate ?? 0);
        ctx.save();
        ctx.translate(x + jx, y + jy);
        if (rot) ctx.rotate((rot * Math.PI) / 180);
        motif(ctx, r);
        ctx.restore();
      }
    }
  };

/** Scatters a motif randomly. `density` = motifs per 100×100 px. */
export const scatter =
  (motif: Motif, density: number, opts: { rotate?: number; seed?: number } = {}): Paint =>
  (ctx, w, h) => {
    const r = rng(opts.seed ?? 11);
    const n = Math.round(((w * h) / 10000) * density);
    for (let i = 0; i < n; i++) {
      ctx.save();
      ctx.translate(r() * w, r() * h);
      ctx.rotate(((r() - 0.5) * 2 * (opts.rotate ?? 180) * Math.PI) / 180);
      motif(ctx, r);
      ctx.restore();
    }
  };

/* ───────────────────────── motifs ───────────────────────── */

export const dot =
  (color: string, radius: number): Motif =>
  (ctx) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, TAU);
    ctx.fill();
  };

export const heart =
  (color: string, s: number): Motif =>
  (ctx) => {
    const p = (x: number, y: number): [number, number] => [(x - 0.5) * s, (y - 0.52) * s];
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(...p(0.5, 0.25));
    ctx.bezierCurveTo(...p(0.5, 0.22), ...p(0.45, 0.1), ...p(0.25, 0.1));
    ctx.bezierCurveTo(...p(0, 0.1), ...p(0, 0.38), ...p(0, 0.38));
    ctx.bezierCurveTo(...p(0, 0.55), ...p(0.2, 0.77), ...p(0.5, 0.95));
    ctx.bezierCurveTo(...p(0.8, 0.77), ...p(1, 0.55), ...p(1, 0.38));
    ctx.bezierCurveTo(...p(1, 0.38), ...p(1, 0.1), ...p(0.75, 0.1));
    ctx.bezierCurveTo(...p(0.6, 0.1), ...p(0.5, 0.22), ...p(0.5, 0.25));
    ctx.fill();
  };

/** 4-point curved sparkle ✦ */
export const sparkle =
  (color: string, s: number): Motif =>
  (ctx) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.quadraticCurveTo(0, 0, s, 0);
    ctx.quadraticCurveTo(0, 0, 0, s);
    ctx.quadraticCurveTo(0, 0, -s, 0);
    ctx.quadraticCurveTo(0, 0, 0, -s);
    ctx.fill();
  };

export const star =
  (color: string, s: number): Motif =>
  (ctx) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const rad = i % 2 ? s * 0.45 : s;
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      ctx.lineTo(Math.cos(a) * rad, Math.sin(a) * rad);
    }
    ctx.closePath();
    ctx.fill();
  };

/** Simple round-petal flower. */
export const flower =
  (petal: string, center: string, s: number, petals = 5): Motif =>
  (ctx) => {
    ctx.fillStyle = petal;
    for (let i = 0; i < petals; i++) {
      const a = (i / petals) * TAU;
      ctx.beginPath();
      ctx.ellipse(Math.cos(a) * s * 0.5, Math.sin(a) * s * 0.5, s * 0.42, s * 0.36, a, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = center;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.3, 0, TAU);
    ctx.fill();
  };

export const daisy =
  (petal: string, center: string, s: number): Motif =>
  (ctx) => {
    ctx.fillStyle = petal;
    for (let i = 0; i < 9; i++) {
      ctx.save();
      ctx.rotate((i / 9) * TAU);
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.55, s * 0.17, s * 0.42, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = center;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.26, 0, TAU);
    ctx.fill();
  };

/** Stylised damask rose with leaves (dark-floral frames). */
export const damask =
  (color: string, s: number): Motif =>
  (ctx) => {
    ctx.fillStyle = color;
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * TAU - Math.PI / 2;
      ctx.beginPath();
      ctx.arc(Math.cos(a) * s * 0.36, Math.sin(a) * s * 0.36, s * 0.3, 0, TAU);
      ctx.fill();
    }
    // leaves
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(side * s * 0.78, s * 0.62, s * 0.34, s * 0.14, side * 0.7, 0, TAU);
      ctx.fill();
    }
    // inner swirl (knock-out)
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = s * 0.07;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.18, 0, Math.PI * 1.5);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.42, Math.PI * 0.2, Math.PI * 0.9);
    ctx.stroke();
    ctx.globalCompositeOperation = "source-over";
  };

/** Sakura petal with the little notch. */
export const petal =
  (color: string, s: number): Motif =>
  (ctx) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, s * 0.5);
    ctx.bezierCurveTo(-s * 0.55, s * 0.1, -s * 0.35, -s * 0.5, -s * 0.08, -s * 0.5);
    ctx.lineTo(0, -s * 0.36);
    ctx.lineTo(s * 0.08, -s * 0.5);
    ctx.bezierCurveTo(s * 0.35, -s * 0.5, s * 0.55, s * 0.1, 0, s * 0.5);
    ctx.fill();
  };

export const cherry =
  (s: number): Motif =>
  (ctx) => {
    ctx.strokeStyle = "#5a8f3a";
    ctx.lineWidth = s * 0.07;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-s * 0.28, s * 0.2);
    ctx.quadraticCurveTo(-s * 0.1, -s * 0.3, s * 0.12, -s * 0.5);
    ctx.moveTo(s * 0.3, s * 0.12);
    ctx.quadraticCurveTo(s * 0.25, -s * 0.2, s * 0.12, -s * 0.5);
    ctx.stroke();
    ctx.fillStyle = "#6cc46f";
    ctx.beginPath();
    ctx.ellipse(s * 0.32, -s * 0.48, s * 0.2, s * 0.09, -0.4, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#e8344e";
    for (const [x, y] of [[-s * 0.28, s * 0.32], [s * 0.3, s * 0.24]]) {
      ctx.beginPath();
      ctx.arc(x, y, s * 0.2, 0, TAU);
      ctx.fill();
    }
  };

export const strawberry =
  (s: number): Motif =>
  (ctx) => {
    ctx.fillStyle = "#ff5a7a";
    ctx.beginPath();
    ctx.moveTo(0, s * 0.55);
    ctx.bezierCurveTo(-s * 0.5, s * 0.25, -s * 0.48, -s * 0.3, 0, -s * 0.25);
    ctx.bezierCurveTo(s * 0.48, -s * 0.3, s * 0.5, s * 0.25, 0, s * 0.55);
    ctx.fill();
    ctx.fillStyle = "#ffe9a8";
    for (const [x, y] of [[-0.15, 0], [0.15, 0], [0, 0.18], [-0.18, 0.2], [0.18, 0.2], [0, -0.08]])
      ctx.fillRect(x * s - 1.5, y * s - 2, 3, 4);
    ctx.fillStyle = "#5cc26b";
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i - 2) * 0.55;
      ctx.beginPath();
      ctx.ellipse(Math.cos(a) * s * 0.14, -s * 0.3 + Math.sin(a) * s * 0.06, s * 0.14, s * 0.06, a, 0, TAU);
      ctx.fill();
    }
  };

export const bow =
  (color: string, s: number): Motif =>
  (ctx) => {
    ctx.fillStyle = color;
    for (const side of [-1, 1]) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(side * s * 0.25, -s * 0.45, side * s * 0.7, -s * 0.35, side * s * 0.62, 0);
      ctx.bezierCurveTo(side * s * 0.6, s * 0.3, side * s * 0.25, s * 0.15, 0, 0);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(side * s * 0.04, s * 0.05);
      ctx.lineTo(side * s * 0.3, s * 0.55);
      ctx.lineTo(side * s * 0.14, s * 0.48);
      ctx.lineTo(side * s * 0.02, s * 0.1);
      ctx.fill();
    }
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.11, 0, TAU);
    ctx.fill();
  };

export const cloud =
  (color: string, s: number): Motif =>
  (ctx) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    for (const [x, y, r] of [[-0.3, 0.05, 0.22], [0, -0.1, 0.3], [0.3, 0.05, 0.22], [0, 0.1, 0.24]]) {
      ctx.moveTo(x * s + r * s, y * s);
      ctx.arc(x * s, y * s, r * s, 0, TAU);
    }
    ctx.fill();
  };

export const snowflake =
  (color: string, s: number): Motif =>
  (ctx) => {
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1.5, s * 0.08);
    ctx.lineCap = "round";
    for (let i = 0; i < 6; i++) {
      ctx.save();
      ctx.rotate((i / 6) * TAU);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -s * 0.5);
      ctx.moveTo(0, -s * 0.3);
      ctx.lineTo(-s * 0.12, -s * 0.42);
      ctx.moveTo(0, -s * 0.3);
      ctx.lineTo(s * 0.12, -s * 0.42);
      ctx.stroke();
      ctx.restore();
    }
  };

/** Multicolour confetti (rectangles + dots). */
export const confetti =
  (colors: string[], s: number): Motif =>
  (ctx, r) => {
    ctx.fillStyle = pick(colors, r);
    if (r() < 0.5) ctx.fillRect(-s / 2, -s / 5, s, (s * 2) / 5);
    else {
      ctx.beginPath();
      ctx.arc(0, 0, s * 0.28, 0, TAU);
      ctx.fill();
    }
  };

/** Irregular blob (cow spots, terrazzo chips, leopard). */
function blobPath(ctx: CanvasRenderingContext2D, r: () => number, s: number, points = 7) {
  const pts = Array.from({ length: points }, (_, i) => {
    const a = (i / points) * TAU;
    const rad = s * (0.6 + r() * 0.4);
    return [Math.cos(a) * rad, Math.sin(a) * rad];
  });
  ctx.beginPath();
  for (let i = 0; i < points; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % points];
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    if (i === 0) ctx.moveTo((pts[points - 1][0] + x1) / 2, (pts[points - 1][1] + y1) / 2);
    ctx.quadraticCurveTo(x1, y1, mx, my);
  }
  ctx.closePath();
}

export const blob =
  (colors: string[], s: number, points = 7): Motif =>
  (ctx, r) => {
    ctx.fillStyle = pick(colors, r);
    blobPath(ctx, r, s * (0.6 + r() * 0.6), points);
    ctx.fill();
  };

/** Leopard rosette: broken dark ring around a warmer centre. */
export const leopard =
  (ring: string, center: string, s: number): Motif =>
  (ctx, r) => {
    ctx.fillStyle = center;
    blobPath(ctx, r, s * 0.55, 6);
    ctx.fill();
    ctx.fillStyle = ring;
    const pieces = 3 + Math.floor(r() * 2);
    for (let i = 0; i < pieces; i++) {
      const a = (i / pieces) * TAU + r() * 0.6;
      ctx.save();
      ctx.translate(Math.cos(a) * s * 0.72, Math.sin(a) * s * 0.72);
      ctx.rotate(a + Math.PI / 2);
      ctx.beginPath();
      ctx.ellipse(0, 0, s * (0.32 + r() * 0.18), s * 0.17, 0, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
  };

/** Paper fibres / specks (kraft, recycled paper). */
export const fleck =
  (colors: string[], s: number): Motif =>
  (ctx, r) => {
    ctx.fillStyle = pick(colors, r);
    if (r() < 0.7) ctx.fillRect(0, 0, s * (0.3 + r()), s * 0.3);
    else ctx.fillRect(0, 0, s * (1.5 + r() * 2.5), s * 0.18);
  };
