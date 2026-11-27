import { useMemo } from "react";
import { FILTERS } from "../../booth/config/filters";
import { resolveLook } from "../../booth/render/look";
import type { BoothPalette } from "../../booth/ui";
import LookLayers from "./LookLayers";

interface FilterPickerProps {
  selectedId: string;
  onSelect: (id: string) => void;
  intensity: number;
  onIntensity: (value: number) => void;
  /** Small snapshot used for every thumbnail (camera frame or first photo). */
  thumbSrc: string | null;
  dateText: string;
  palette: BoothPalette;
}

const THUMB = 64;

/** Horizontally scrolling filter thumbnails + intensity slider. */
export default function FilterPicker({
  selectedId,
  onSelect,
  intensity,
  onIntensity,
  thumbSrc,
  dateText,
  palette: p,
}: FilterPickerProps) {
  const looks = useMemo(() => FILTERS.map((f) => ({ filter: f, look: resolveLook(f, 1) })), []);
  const selected = FILTERS.find((f) => f.id === selectedId);

  return (
    <div className="w-full">
      {/* Horizontal swipe strip on phones, tidy grid inside the desktop side panel */}
      <div className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 pt-1 md:mx-0 md:grid md:grid-cols-[repeat(auto-fill,minmax(68px,1fr))] md:justify-items-center md:gap-x-2 md:gap-y-3 md:overflow-visible md:px-0">
        {looks.map(({ filter, look }) => {
          const active = filter.id === selectedId;
          return (
            <button
              key={filter.id}
              type="button"
              onClick={() => onSelect(filter.id)}
              className="flex shrink-0 snap-start flex-col items-center gap-1.5 transition-transform active:scale-95"
              aria-pressed={active}
              aria-label={filter.name}
            >
              <div
                aria-hidden
                className="relative overflow-hidden rounded-2xl transition-all duration-300"
                style={{
                  width: THUMB,
                  height: THUMB,
                  background: filter.accent,
                  boxShadow: active ? `0 0 0 3px ${p.panel}, 0 0 0 5px ${p.accent}` : "none",
                  transform: active ? "translateY(-2px)" : undefined,
                }}
              >
                {thumbSrc && (
                  <LookLayers
                    look={look}
                    width={THUMB}
                    dateText={dateText}
                    renderSource={(style, key) => (
                      <img
                        key={key}
                        src={thumbSrc}
                        alt=""
                        draggable={false}
                        className="absolute inset-0 h-full w-full object-cover"
                        style={style}
                      />
                    )}
                  />
                )}
              </div>
              <span
                className="text-[11px] whitespace-nowrap"
                style={{ color: active ? p.text : p.sub, fontWeight: active ? 700 : 500 }}
              >
                {filter.name}
              </span>
            </button>
          );
        })}
      </div>

      <label
        className="mt-2 flex items-center gap-3 text-xs"
        style={{ color: p.sub, opacity: selected?.id === "original" ? 0.45 : 1 }}
      >
        <span className="w-16 shrink-0 font-semibold">Intensity</span>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(intensity * 100)}
          disabled={selected?.id === "original"}
          onChange={(e) => onIntensity(Number(e.target.value) / 100)}
          className="booth-range flex-1"
          style={{ ["--accent" as string]: p.accent, ["--track" as string]: p.accentSoft }}
          aria-label="Filter intensity"
        />
        <span className="w-10 text-right font-semibold tabular-nums" style={{ color: p.text }}>
          {Math.round(intensity * 100)}%
        </span>
      </label>
    </div>
  );
}
