/**
 * Reusable overlay-layer presets used by the filters config.
 *
 * Every helper returns plain data; the CSS preview (LookLayers) and the
 * canvas renderer (renderLook) both know how to draw that data, so a new
 * filter only needs to combine these building blocks.
 */
import type { BlendMode, BlurLayer, GradientLayer, TintLayer } from "../types";

/** Darkened edges. */
export const vignette = (strength: number): GradientLayer => ({
  cx: 0.5,
  cy: 0.5,
  rx: 0.78,
  ry: 0.78,
  stops: [
    [0.42, "rgba(0,0,0,0)"],
    [1, "rgba(0,0,0,0.9)"],
  ],
  opacity: strength,
  blend: "normal",
});

/** Warm orange/red light leaking in from the edges of the "film". */
export const lightLeak = (strength: number): GradientLayer[] => [
  {
    cx: 0,
    cy: 0.18,
    rx: 0.6,
    ry: 0.65,
    stops: [
      [0, "rgba(255,120,40,0.95)"],
      [0.45, "rgba(255,70,60,0.45)"],
      [1, "rgba(255,60,60,0)"],
    ],
    opacity: strength,
    blend: "screen",
  },
  {
    cx: 1.02,
    cy: 0.88,
    rx: 0.42,
    ry: 0.5,
    stops: [
      [0, "rgba(255,196,80,0.85)"],
      [1, "rgba(255,150,0,0)"],
    ],
    opacity: strength * 0.8,
    blend: "screen",
  },
];

/** Bright on-camera flash hot-spot (digicam look). */
export const flashHotspot = (strength: number): GradientLayer => ({
  cx: 0.5,
  cy: 0.4,
  rx: 0.62,
  ry: 0.62,
  stops: [
    [0, "rgba(255,255,255,0.75)"],
    [0.55, "rgba(255,255,255,0.18)"],
    [1, "rgba(255,255,255,0)"],
  ],
  opacity: strength,
  blend: "screen",
});

/** Colour wash. Soft-light keeps skin natural; use "screen"/"multiply" for stronger casts. */
export const tint = (
  color: string,
  opacity: number,
  blend: BlendMode = "soft-light",
): TintLayer => ({ color, opacity, blend });

/** Raises the darkest tones towards `color` → faded / matte film blacks. */
export const liftBlacks = (opacity: number, color = "#3b3b3b"): TintLayer => ({
  color,
  opacity,
  blend: "lighten",
});

/** Dreamy glow: blurred copy screened on top. */
export const bloom = (radius: number, opacity: number): BlurLayer => ({
  radius,
  opacity,
  blend: "screen",
});

/** Soft focus / skin smoothing: blurred copy blended normally on top. */
export const softFocus = (radius: number, opacity: number): BlurLayer => ({
  radius,
  opacity,
  blend: "normal",
});
