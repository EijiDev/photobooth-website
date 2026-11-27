import { useId, type CSSProperties, type ReactNode } from "react";
import type { ResolvedLook } from "../../booth/types";
import {
  dateStampCss,
  gradientCss,
  grainCss,
  scanlineCss,
  tintCss,
} from "../../booth/render/layers";

interface LookLayersProps {
  look: ResolvedLook;
  /** Rendered width in CSS px (blur radius, RGB shift and date size depend on it). */
  width: number;
  dateText: string;
  /** Draws the photo source (video or img) with the given extra style. */
  renderSource: (style: CSSProperties, key: string) => ReactNode;
  /** Animate the grain (live camera only). */
  animateGrain?: boolean;
}

const layer = "absolute inset-0 pointer-events-none";

/**
 * Live CSS version of a look. The DOM order here matches the drawing order in
 * renderLook.ts, so the preview and the exported photo look the same.
 */
export default function LookLayers({
  look,
  width,
  dateText,
  renderSource,
  animateGrain,
}: LookLayersProps) {
  const svgId = `rgb${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const shift = look.rgbShift * width;
  const baseFilter = look.css === "none" ? "" : look.css;

  return (
    <div className="absolute inset-0 overflow-hidden" style={{ isolation: "isolate" }}>
      {/* Base photo; the RGB split lives on the wrapper so a missing SVG-filter feature only drops the split. */}
      <div className="absolute inset-0" style={{ filter: shift >= 0.5 ? `url(#${svgId})` : undefined }}>
        {renderSource({ filter: baseFilter || undefined }, "base")}
      </div>

      {/* Bloom / soft-focus copies */}
      {look.blurLayers.map((l, i) =>
        renderSource(
          {
            filter: `${baseFilter} blur(${(l.radius * width).toFixed(2)}px)`,
            mixBlendMode: l.blend,
            opacity: l.opacity,
          },
          `blur-${i}`,
        ),
      )}

      {look.tints.map((t, i) => (
        <div key={`tint-${i}`} className={layer} style={tintCss(t)} />
      ))}
      {look.gradients.map((g, i) => (
        <div key={`grad-${i}`} className={layer} style={gradientCss(g)} />
      ))}
      {look.grain > 0 && (
        <div
          className={`${layer} ${animateGrain ? "animate-grain" : ""}`}
          style={grainCss(look.grain)}
        />
      )}
      {look.scanlines > 0 && <div className={layer} style={scanlineCss(look.scanlines)} />}
      {look.dateStamp && width > 0 && <span style={dateStampCss(width)}>{dateText}</span>}

      {shift >= 0.5 && (
        <svg width="0" height="0" className="absolute" aria-hidden>
          <filter id={svgId} colorInterpolationFilters="sRGB" x="0" y="0" width="100%" height="100%">
            <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
            <feOffset in="r" dx={-shift} dy="0" result="r2" />
            <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
            <feColorMatrix in="SourceGraphic" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
            <feOffset in="b" dx={shift} dy="0" result="b2" />
            <feBlend in="r2" in2="g" mode="screen" result="rg" />
            <feBlend in="rg" in2="b2" mode="screen" />
          </filter>
        </svg>
      )}
    </div>
  );
}
