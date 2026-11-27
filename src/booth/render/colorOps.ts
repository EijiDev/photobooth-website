/**
 * CSS filter colour operations on canvas.
 *
 * Where `ctx.filter` exists we hand it the exact CSS string used by the live
 * preview. Otherwise (older iOS Safari) we apply the same operations per pixel
 * using the colour matrices from the W3C Filter Effects spec, so exports still
 * match the preview.
 */
import type { CssOp } from "../types";
import { supportsCanvasFilter } from "./canvas";
import { cssFilterString } from "./look";

/** 3×4 affine matrix in 0..255 space: rows of [r, g, b, offset]. */
type Mat = number[];

function opMatrix({ fn, value: v }: CssOp): Mat {
  switch (fn) {
    case "brightness":
      return [v, 0, 0, 0, 0, v, 0, 0, 0, 0, v, 0];
    case "contrast": {
      const o = 127.5 * (1 - v);
      return [v, 0, 0, o, 0, v, 0, o, 0, 0, v, o];
    }
    case "saturate":
      return [
        0.213 + 0.787 * v, 0.715 - 0.715 * v, 0.072 - 0.072 * v, 0,
        0.213 - 0.213 * v, 0.715 + 0.285 * v, 0.072 - 0.072 * v, 0,
        0.213 - 0.213 * v, 0.715 - 0.715 * v, 0.072 + 0.928 * v, 0,
      ];
    case "grayscale": {
      const a = 1 - Math.min(1, v);
      return [
        0.2126 + 0.7874 * a, 0.7152 - 0.7152 * a, 0.0722 - 0.0722 * a, 0,
        0.2126 - 0.2126 * a, 0.7152 + 0.2848 * a, 0.0722 - 0.0722 * a, 0,
        0.2126 - 0.2126 * a, 0.7152 - 0.7152 * a, 0.0722 + 0.9278 * a, 0,
      ];
    }
    case "sepia": {
      const a = 1 - Math.min(1, v);
      return [
        0.393 + 0.607 * a, 0.769 - 0.769 * a, 0.189 - 0.189 * a, 0,
        0.349 - 0.349 * a, 0.686 + 0.314 * a, 0.168 - 0.168 * a, 0,
        0.272 - 0.272 * a, 0.534 - 0.534 * a, 0.131 + 0.869 * a, 0,
      ];
    }
    case "hue-rotate": {
      const r = (v * Math.PI) / 180;
      const c = Math.cos(r);
      const s = Math.sin(r);
      return [
        0.213 + c * 0.787 - s * 0.213, 0.715 - c * 0.715 - s * 0.715, 0.072 - c * 0.072 + s * 0.928, 0,
        0.213 - c * 0.213 + s * 0.143, 0.715 + c * 0.285 + s * 0.14, 0.072 - c * 0.072 - s * 0.283, 0,
        0.213 - c * 0.213 - s * 0.787, 0.715 - c * 0.715 + s * 0.715, 0.072 + c * 0.928 + s * 0.072, 0,
      ];
    }
  }
}

const clamp255 = (n: number) => (n < 0 ? 0 : n > 255 ? 255 : n);

/** Applies ops in order, clamping between steps like the browser does. */
export function applyColorOps(img: ImageData, ops: CssOp[]) {
  const mats = ops.map(opMatrix);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    let r = d[i];
    let g = d[i + 1];
    let b = d[i + 2];
    for (const m of mats) {
      const nr = m[0] * r + m[1] * g + m[2] * b + m[3];
      const ng = m[4] * r + m[5] * g + m[6] * b + m[7];
      const nb = m[8] * r + m[9] * g + m[10] * b + m[11];
      r = clamp255(nr);
      g = clamp255(ng);
      b = clamp255(nb);
    }
    d[i] = r;
    d[i + 1] = g;
    d[i + 2] = b;
  }
}

/** Draws a source crop into ctx (filling dw×dh at 0,0) with colour ops applied. */
export function drawWithColorOps(
  ctx: CanvasRenderingContext2D,
  src: CanvasImageSource,
  crop: { sx: number; sy: number; sw: number; sh: number },
  dw: number,
  dh: number,
  ops: CssOp[],
) {
  const draw = () => ctx.drawImage(src, crop.sx, crop.sy, crop.sw, crop.sh, 0, 0, dw, dh);
  if (!ops.length) return draw();
  if (supportsCanvasFilter()) {
    ctx.filter = cssFilterString(ops);
    draw();
    ctx.filter = "none";
    return;
  }
  draw();
  const img = ctx.getImageData(0, 0, dw, dh);
  applyColorOps(img, ops);
  ctx.putImageData(img, 0, 0);
}
