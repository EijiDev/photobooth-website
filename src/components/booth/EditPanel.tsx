import { useState, type ReactNode } from "react";
import { Images, Palette, RotateCcw, Sparkles, Sticker, Trash2, Type } from "lucide-react";
import type { Design } from "../../booth/types";
import type { BoothPalette } from "../../booth/ui";
import { CAPTION_FONTS, DATE_FONT } from "../../booth/config/fonts";
import { STICKER_CATEGORIES, STICKERS } from "../../booth/config/stickers";
import { getFrame } from "../../booth/config/frames";
import { DATE_STAMP } from "../../booth/render/layers";
import FilterPicker from "./FilterPicker";
import ThemePicker from "./ThemePicker";
import StickerGlyph from "./StickerGlyph";

type Tab = "filter" | "frame" | "stickers" | "text" | "photos";

const TABS: { id: Tab; label: string; icon: typeof Palette }[] = [
  { id: "filter", label: "Filter", icon: Sparkles },
  { id: "frame", label: "Frame", icon: Palette },
  { id: "stickers", label: "Stickers", icon: Sticker },
  { id: "text", label: "Text", icon: Type },
  { id: "photos", label: "Photos", icon: Images },
];

interface EditPanelProps {
  design: Design;
  onChange: (patch: Partial<Design>) => void;
  onAddSticker: (stickerId: string) => void;
  onClearStickers: () => void;
  stickerCount: number;
  thumbSrc: string | null;
  dateText: string;
  onChangeLayout: () => void;
  /** Thumbnails of the taken photos (Photos tab). */
  photos: (string | null)[];
  onRetake: (index: number) => void;
  onStartOver: () => void;
  /** Pinned at the bottom of the panel (Download / Share). */
  footer?: ReactNode;
  /** "sheet" = phone bottom sheet, "side" = right-hand panel. */
  variant: "sheet" | "side";
  className?: string;
  palette: BoothPalette;
}

export default function EditPanel({
  design,
  onChange,
  onAddSticker,
  onClearStickers,
  stickerCount,
  thumbSrc,
  dateText,
  onChangeLayout,
  photos,
  onRetake,
  onStartOver,
  footer,
  variant,
  className = "",
  palette: p,
}: EditPanelProps) {
  const [tab, setTab] = useState<Tab>("filter");
  const frame = getFrame(design.frameId);
  const inputStyle = { backgroundColor: p.chip, borderColor: p.border, color: p.text };
  const sheet = variant === "sheet";

  return (
    <div
      className={`flex min-h-0 flex-col ${className}`}
      style={{ backgroundColor: p.panel, borderColor: p.border }}
    >
      {/* Sheet grabber (decorative, phone layout) */}
      {sheet && <span className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full" style={{ backgroundColor: p.border }} />}

      {/* Tabs */}
      <div className="shrink-0 px-3 pt-2 sm:px-4 sm:pt-4">
        <div className="grid grid-cols-5 gap-1 rounded-2xl p-1" style={{ backgroundColor: p.chip }} role="tablist">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTab(id)}
                className="flex min-w-0 flex-col items-center gap-0.5 rounded-xl px-0.5 py-1.5 text-[10px] font-semibold transition-all min-[380px]:text-[11px] lg:flex-row lg:justify-center lg:gap-1.5 lg:py-2 lg:text-xs"
                style={{
                  backgroundColor: active ? p.panel : "transparent",
                  color: active ? p.accent : p.sub,
                  boxShadow: active ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
                }}
              >
                <Icon size={16} className="shrink-0" />
                <span className="max-w-full truncate">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable tab content */}
      <div key={tab} className="animate-fade-up min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-4 sm:px-4">
        {tab === "photos" && (
          <div>
            <p className="mb-3 text-xs" style={{ color: p.sub }}>
              Not happy with one? Tap it to retake just that photo.
            </p>
            <div className="grid grid-cols-3 gap-2 min-[400px]:grid-cols-4">
              {photos.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onRetake(i)}
                  className="group relative aspect-square overflow-hidden rounded-2xl border transition-transform active:scale-95"
                  style={{ borderColor: p.border, backgroundColor: p.chip }}
                  aria-label={`Retake photo ${i + 1}`}
                >
                  {src && <img src={src} alt="" className="h-full w-full object-cover" />}
                  <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/30 text-[11px] font-semibold text-white transition-colors group-hover:bg-red-600/70">
                    <RotateCcw size={16} /> Retake {i + 1}
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={onStartOver}
              className="mt-4 flex items-center gap-1.5 text-xs font-semibold transition-colors hover:text-red-600"
              style={{ color: p.sub }}
            >
              <Trash2 size={13} /> Start over with new photos
            </button>
          </div>
        )}

        {tab === "filter" && (
          <FilterPicker
            selectedId={design.filterId}
            onSelect={(filterId) => onChange({ filterId })}
            intensity={design.intensity}
            onIntensity={(intensity) => onChange({ intensity })}
            thumbSrc={thumbSrc}
            dateText={dateText}
            palette={p}
          />
        )}

        {tab === "frame" && (
          <div className="space-y-5">
            <Section title="Frame design" palette={p}>
              <ThemePicker
                value={design.themeId}
                onChange={(themeId) => onChange({ themeId })}
                lockedTo={frame.lockedTheme}
                palette={p}
              />
            </Section>
            <Section title="Layout" palette={p}>
              <div className="flex items-center justify-between gap-3 rounded-2xl border px-4 py-3" style={{ borderColor: p.border }}>
                <div>
                  <p className="text-sm font-bold" style={{ color: p.text }}>
                    {frame.name}
                  </p>
                  <p className="text-xs" style={{ color: p.sub }}>
                    {design.count} photo{design.count > 1 ? "s" : ""} · {frame.description}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onChangeLayout}
                  className="shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold"
                  style={{ backgroundColor: p.accentSoft, color: p.accent }}
                >
                  Change
                </button>
              </div>
            </Section>
          </div>
        )}

        {tab === "stickers" && (
          <div>
            <p className="mb-3 text-xs" style={{ color: p.sub }}>
              Tap to add. Drag to move — use the red corner handle to resize & rotate.
            </p>
            <div className="space-y-4">
              {STICKER_CATEGORIES.map((cat) => {
                const items = STICKERS.filter((s) => s.category === cat.id);
                if (!items.length) return null;
                const words = cat.id === "words" || cat.id === "signs";
                return (
                  <div key={cat.id}>
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-widest" style={{ color: p.sub }}>
                      {cat.name}
                    </p>
                    <div className={words ? "flex flex-wrap gap-2" : "grid grid-cols-[repeat(auto-fill,minmax(60px,1fr))] gap-2 sm:grid-cols-[repeat(auto-fill,minmax(72px,1fr))]"}>
                      {items.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          title={s.label}
                          aria-label={`Add ${s.label} sticker`}
                          onClick={() => onAddSticker(s.id)}
                          className={`flex items-center justify-center rounded-2xl transition-transform hover:scale-110 active:scale-90 ${
                            words ? "px-3 py-2" : "aspect-square p-1.5"
                          }`}
                          style={{ backgroundColor: p.chip }}
                        >
                          <StickerGlyph def={s} size={s.kind === "image" && words ? 30 * (s.aspect ?? 1) : words ? 34 : 40} />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            {stickerCount > 0 && (
              <button
                type="button"
                onClick={onClearStickers}
                className="mt-4 flex items-center gap-1.5 text-xs font-semibold"
                style={{ color: p.sub }}
              >
                <Trash2 size={13} /> Remove all stickers ({stickerCount})
              </button>
            )}
          </div>
        )}

        {tab === "text" && (
          <div className="space-y-5">
            <Section title="Caption" palette={p}>
              <input
                value={design.caption}
                maxLength={40}
                onChange={(e) => onChange({ caption: e.target.value })}
                placeholder="write something cute…"
                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-red-200"
                style={inputStyle}
              />
              <div className="mt-3 grid grid-cols-2 gap-2">
                {CAPTION_FONTS.map((f) => {
                  const active = design.captionFontId === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => onChange({ captionFontId: f.id })}
                      className="truncate rounded-2xl border px-3 py-2.5 transition-all active:scale-95"
                      style={{
                        fontFamily: f.family,
                        fontWeight: f.weight,
                        fontSize: 15 * f.sizeScale + (f.id === "pixel" ? 2 : 0),
                        borderColor: active ? p.accent : p.border,
                        backgroundColor: active ? p.accentSoft : "transparent",
                        color: p.text,
                      }}
                    >
                      {f.name}
                    </button>
                  );
                })}
              </div>
            </Section>

            <Section title="Footer text" palette={p}>
              <input
                value={design.footer}
                maxLength={48}
                onChange={(e) => onChange({ footer: e.target.value })}
                placeholder="Mark & Anna • 11.27.26"
                className="w-full rounded-2xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-red-200"
                style={inputStyle}
              />
            </Section>

            <label className="flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3" style={{ borderColor: p.border }}>
              <span>
                <span className="block text-sm font-bold" style={{ color: p.text }}>
                  Date stamp
                </span>
                <span style={{ fontFamily: DATE_FONT, color: DATE_STAMP.color, textShadow: `0 0 6px ${DATE_STAMP.glow}` }}>
                  {dateText}
                </span>
              </span>
              <Switch checked={design.dateStamp} onChange={(dateStamp) => onChange({ dateStamp })} palette={p} />
            </label>
          </div>
        )}
      </div>

      {/* Pinned actions (Download / Share) */}
      {footer && (
        <div
          className="shrink-0 border-t px-3 pt-3 sm:px-4"
          style={{ borderColor: p.border, paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
        >
          {footer}
        </div>
      )}
    </div>
  );
}

function Section({
  title,
  palette: p,
  children,
}: {
  title: string;
  palette: BoothPalette;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="mb-2.5 text-xs font-semibold uppercase tracking-widest" style={{ color: p.sub }}>
        {title}
      </p>
      {children}
    </div>
  );
}

function Switch({
  checked,
  onChange,
  palette: p,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  palette: BoothPalette;
}) {
  return (
    <span className="relative inline-flex">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span
        className="h-7 w-12 rounded-full transition-colors"
        style={{ backgroundColor: checked ? p.accent : p.border }}
      />
      <span
        className="absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300"
        style={{ transform: checked ? "translateX(20px)" : "none" }}
      />
    </span>
  );
}
