import { useMemo } from "react";
import { Check } from "lucide-react";
import { THEME_CATEGORIES, THEMES } from "../../booth/config/themes";
import { themeSwatchUrl } from "../../booth/render/themeArt";
import type { BoothPalette } from "../../booth/ui";

interface ThemePickerProps {
  value: string;
  onChange: (id: string) => void;
  /** Set when the frame forces a theme (film strip). */
  lockedTo?: string;
  palette: BoothPalette;
}

/** Frame designs grouped by style, with thumbnails rendered from the real pattern. */
export default function ThemePicker({ value, onChange, lockedTo, palette: p }: ThemePickerProps) {
  const current = lockedTo ?? value;
  const swatches = useMemo(() => new Map(THEMES.map((t) => [t.id, themeSwatchUrl(t)])), []);

  if (lockedTo) {
    const t = THEMES.find((x) => x.id === lockedTo);
    return (
      <div className="flex items-center gap-3">
        {t && <img src={swatches.get(t.id)} alt="" className="h-16 w-12 rounded-xl object-cover shadow-sm" />}
        <p className="text-xs" style={{ color: p.sub }}>
          Film strips are always black — that's the look! Pick another layout to use the other designs.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {THEME_CATEGORIES.map((cat) => {
        const items = THEMES.filter((t) => t.category === cat.id);
        if (!items.length) return null;
        return (
          <div key={cat.id}>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest" style={{ color: p.sub }}>
              {cat.name}
            </p>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(64px,1fr))] gap-x-2 gap-y-3">
              {items.map((t) => {
                const active = t.id === current;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onChange(t.id)}
                    className="group flex min-w-0 flex-col items-center gap-1.5 transition-transform active:scale-95"
                    aria-pressed={active}
                    title={t.name}
                  >
                    <span
                      className="relative block h-[68px] w-[52px] overflow-hidden rounded-xl transition-all duration-300 group-hover:-translate-y-0.5"
                      style={{
                        boxShadow: active
                          ? `0 0 0 2px ${p.panel}, 0 0 0 4px ${p.accent}`
                          : "inset 0 0 0 1px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.08)",
                      }}
                    >
                      <img src={swatches.get(t.id)} alt="" className="h-full w-full object-cover" draggable={false} />
                      {active && (
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/95 shadow">
                            <Check size={12} strokeWidth={3} style={{ color: p.accent }} />
                          </span>
                        </span>
                      )}
                    </span>
                    <span
                      className="w-full truncate text-center text-[10.5px] leading-tight"
                      style={{ color: active ? p.text : p.sub, fontWeight: active ? 700 : 500 }}
                    >
                      {t.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
