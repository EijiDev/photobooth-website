/**
 * Shared types for the booth system.
 *
 *  - "Look"   = a filter (colour ops + overlay layers) at some intensity.
 *  - "Frame"  = a layout of photo slots + text area + optional frame art.
 *  - "Theme"  = the paper/background of the frame (colour or pattern).
 *  - "Design" = everything the user customised for one strip.
 *
 * Both the live CSS preview and the Canvas exporter read the same data,
 * which is what keeps the downloaded PNG identical to what users see.
 */

/** Blend modes understood by BOTH CSS `mix-blend-mode` and Canvas `globalCompositeOperation`. */
export type BlendMode =
  | "normal"
  | "multiply"
  | "screen"
  | "overlay"
  | "soft-light"
  | "color"
  | "lighten";

/* ───────────────────────────── Filters ───────────────────────────── */

export type CssOpName =
  | "brightness"
  | "contrast"
  | "saturate"
  | "sepia"
  | "grayscale"
  | "hue-rotate";

/** One CSS filter function. `value` is its strength at 100% intensity (hue-rotate is in degrees). */
export interface CssOp {
  fn: CssOpName;
  value: number;
}

/** A flat colour laid over the photo with a blend mode (tints, lifted blacks…). */
export interface TintLayer {
  color: string;
  opacity: number;
  blend: BlendMode;
}

/** A blurred copy of the photo laid over itself — bloom (screen) or soft-focus smoothing (normal). */
export interface BlurLayer {
  /** Blur radius as a fraction of the photo width (resolution independent). */
  radius: number;
  opacity: number;
  blend: BlendMode;
}

/**
 * An elliptical radial gradient (vignette, light leak, flash hot-spot).
 * Centre and radii are fractions of the photo box, so it renders the same at any size.
 */
export interface GradientLayer {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  stops: [offset: number, color: string][];
  opacity: number;
  blend: BlendMode;
}

export interface FilterDef {
  id: string;
  name: string;
  /** Colour used for the label chip under the thumbnail. */
  accent: string;
  /** CSS-filter colour operations, applied in order. */
  ops: CssOp[];
  blurLayers?: BlurLayer[];
  tints?: TintLayer[];
  gradients?: GradientLayer[];
  /** Film grain strength 0..1. */
  grain?: number;
  /** VHS scanline strength 0..1. */
  scanlines?: number;
  /** RGB split as a fraction of the photo width. */
  rgbShift?: number;
  /** Burn an orange '26 11 27 style date into each photo. */
  dateStamp?: boolean;
}

/** A filter after the intensity slider is applied. Consumed by the CSS preview AND the canvas renderer. */
export interface ResolvedLook {
  filterId: string;
  intensity: number;
  ops: CssOp[];
  /** `ops` as a CSS `filter` string (or "none"). */
  css: string;
  blurLayers: BlurLayer[];
  tints: TintLayer[];
  gradients: GradientLayer[];
  grain: number;
  scanlines: number;
  rgbShift: number;
  dateStamp: boolean;
}

/* ───────────────────────────── Frames ───────────────────────────── */

export type SlotShape = "rect" | "rounded" | "heart" | "arch" | "circle";

/** Where one photo goes on the frame. Units are layout pixels (see Layout.width). */
export interface Slot {
  x: number;
  y: number;
  w: number;
  h: number;
  shape?: SlotShape;
  /** Corner radius for "rounded". */
  radius?: number;
  /** Tilt in degrees (collage look). */
  rotate?: number;
  /** White mini-polaroid border around the photo, in px (bottom edge is thicker). */
  mat?: number;
  /** Stroke drawn around the photo shape. */
  outline?: { color: string; width: number };
}

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface Layout {
  width: number;
  height: number;
  slots: Slot[];
  /** Area for caption / footer / date stamp. */
  textArea: Box;
  /** Base caption size in px (multiplied by the caption font's sizeScale). */
  captionSize: number;
}

export interface FrameDef {
  id: string;
  name: string;
  description: string;
  /** Allowed photo counts. The first one is the default. */
  counts: number[];
  /** Builds the layout for a given photo count. */
  build: (count: number) => Layout;
  defaultTheme: string;
  /** Forces a theme (e.g. film strips are always black). */
  lockedTheme?: string;
  defaultCaption: string;
  defaultFont?: string;
  /** Extra frame art drawn on top of the photos (sprocket holes, header text…). */
  decorate?: (ctx: CanvasRenderingContext2D, layout: Layout, theme: ThemeDef) => void;
}

export interface ThemeDef {
  id: string;
  name: string;
  /** Picker section (see THEME_CATEGORIES). */
  category: string;
  /** Main colour (fallback / accents). */
  base: string;
  /** Caption text colour. */
  ink: string;
  /** Footer text colour. */
  subInk: string;
  /** Optional panel drawn behind the text on busy patterns so it stays readable. */
  textPanel?: string;
  /** Paints the frame background on a canvas (in layout units). Picker thumbnails are rendered from this too. */
  paint: (ctx: CanvasRenderingContext2D, w: number, h: number) => void;
}

/* ─────────────────────────── Decorations ─────────────────────────── */

export interface StickerDef {
  id: string;
  label: string;
  /** "image" = SVG/PNG artwork, "text" = outlined word sticker. */
  kind: "image" | "text";
  /** Picker section (see STICKER_CATEGORIES). */
  category: string;
  /** Image stickers: imported asset URL. */
  src?: string;
  /** Image stickers: width / height. */
  aspect?: number;
  /** Size when added, as a fraction of the frame width. */
  defaultSize?: number;
  /** Text stickers: the word(s). */
  content?: string;
  /** Text stickers only. */
  family?: string;
  weight?: number;
  fill?: string;
  stroke?: string;
  /** Text stickers only: font size relative to the sticker size. */
  scale?: number;
}

/** A sticker placed on the frame. Position/size are in layout units. */
export interface PlacedSticker {
  uid: string;
  stickerId: string;
  x: number;
  y: number;
  size: number;
  rotation: number;
}

export interface CaptionFontDef {
  id: string;
  name: string;
  family: string;
  weight: number;
  /** Some fonts (pixel!) are much wider; this normalises their size. */
  sizeScale: number;
}

/** Everything the user picked for the strip (stickers are kept separately for performance). */
export interface Design {
  frameId: string;
  count: number;
  themeId: string;
  filterId: string;
  intensity: number;
  caption: string;
  captionFontId: string;
  footer: string;
  dateStamp: boolean;
}

/** What the setup page hands to the booth page. */
export interface BoothConfig {
  frameId: string;
  count: number;
  themeId: string;
}

/** An unfiltered, full-frame (already mirrored for selfies) capture. */
export interface RawShot {
  id: string;
  canvas: HTMLCanvasElement;
}
