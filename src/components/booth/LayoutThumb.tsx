import { useId } from "react";
import type { Layout, ThemeDef } from "../../booth/types";
import { MAT_BOTTOM_RATIO } from "../../booth/config/frames";
import { shapePath } from "../../booth/render/shapes";
import { themeSwatchUrl } from "../../booth/render/themeArt";

interface LayoutThumbProps {
  layout: Layout;
  theme: ThemeDef;
  accent: string;
  height: number;
}

/** Auto-generated SVG preview of any layout — new frames get a thumbnail for free. */
export default function LayoutThumb({ layout, theme, accent, height }: LayoutThumbProps) {
  const { width: W, height: H, textArea: t } = layout;
  const clip = `lt${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const r = W * 0.04;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ height, width: (height * W) / H }} aria-hidden>
      <defs>
        <clipPath id={clip}>
          <rect width={W} height={H} rx={r} />
        </clipPath>
      </defs>
      {/* The real frame design, rendered from its pattern */}
      <image
        href={themeSwatchUrl(theme)}
        width={W}
        height={H}
        preserveAspectRatio="xMidYMid slice"
        clipPath={`url(#${clip})`}
      />
      <rect width={W} height={H} rx={r} fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth={W * 0.008} />
      {theme.textPanel && (
        <rect x={t.x + t.w * 0.18} y={t.y + t.h * 0.15} width={t.w * 0.64} height={t.h * 0.7} rx={t.h * 0.15} fill={theme.textPanel} />
      )}
      {layout.slots.map((s, i) => (
        <g
          key={i}
          transform={`translate(${s.x + s.w / 2} ${s.y + s.h / 2}) rotate(${s.rotate ?? 0}) translate(${-s.w / 2} ${-s.h / 2})`}
        >
          {s.mat ? (
            <rect
              x={-s.mat}
              y={-s.mat}
              width={s.w + s.mat * 2}
              height={s.h + s.mat + s.mat * MAT_BOTTOM_RATIO}
              fill="#fff"
            />
          ) : null}
          <path d={shapePath(s)} fill="#e9e6ea" />
          <path d={shapePath(s)} fill={accent} opacity={0.18 + (i % 3) * 0.1} />
        </g>
      ))}
      <rect
        x={t.x + t.w * 0.25}
        y={t.y + t.h * 0.3}
        width={t.w * 0.5}
        height={Math.max(8, t.h * 0.16)}
        rx={t.h * 0.08}
        fill={theme.ink}
        opacity={0.7}
      />
      <rect
        x={t.x + t.w * 0.35}
        y={t.y + t.h * 0.6}
        width={t.w * 0.3}
        height={Math.max(6, t.h * 0.09)}
        rx={t.h * 0.05}
        fill={theme.ink}
        opacity={0.4}
      />
    </svg>
  );
}
