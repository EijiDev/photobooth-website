import { useMemo, useState, type ReactNode } from "react";
import { ArrowLeft, Check, ChevronRight } from "lucide-react";
import NavBar from "../layout/NavBar";
import type { BoothConfig } from "../../booth/types";
import { FRAMES, getFrame, normalizeCount } from "../../booth/config/frames";
import { getTheme, THEMES } from "../../booth/config/themes";
import { boothPalette, type BoothPalette } from "../../booth/ui";
import LayoutThumb from "../booth/LayoutThumb";
import ThemePicker from "../booth/ThemePicker";

interface SetupPageProps {
  dark?: boolean;
  onToggleDark?: () => void;
  onBack: () => void;
  initial: BoothConfig;
  onOpenCamera: (config: BoothConfig) => void;
}

export default function SetupPage({
  dark = false,
  onToggleDark,
  onBack,
  initial,
  onOpenCamera,
}: SetupPageProps) {
  const p = boothPalette(dark);
  const [frameId, setFrameId] = useState(initial.frameId);
  const [count, setCount] = useState(initial.count);
  const [themeId, setThemeId] = useState(initial.themeId);

  const frame = getFrame(frameId);
  const shots = normalizeCount(frame, count);
  const effectiveTheme = frame.lockedTheme ?? themeId;

  // One thumbnail layout per frame (built once).
  const thumbs = useMemo(
    () => FRAMES.map((f) => ({ frame: f, layout: f.build(f.counts[0]) })),
    [],
  );

  const pickFrame = (id: string) => {
    const f = getFrame(id);
    setFrameId(id);
    setCount(f.counts[0]);
    setThemeId(f.defaultTheme);
  };

  return (
    <div
      className="min-h-[100dvh] transition-colors duration-300"
      style={{ fontFamily: "'Outfit', sans-serif", backgroundColor: p.bg }}
    >
      <NavBar dark={dark} onToggleDark={onToggleDark ?? (() => {})} onLogoClick={onBack} />

      <div className="mx-auto max-w-5xl px-4 pb-36 pt-6 sm:px-6 sm:pt-8">
        <button
          type="button"
          onClick={onBack}
          className="mb-5 flex items-center gap-2 text-sm font-medium"
          style={{ color: p.sub }}
        >
          <ArrowLeft size={15} /> Back to Home
        </button>

        <h1 className="mb-1 text-3xl font-extrabold sm:text-4xl" style={{ color: p.text }}>
          Set up your strip
        </h1>
        <p className="mb-8 text-sm font-light" style={{ color: p.sub }}>
          Pick a layout and a frame design. You can still change the design, filters, stickers and text after shooting.
        </p>

        {/* Step 1 — Frame */}
        <Step n={1} title="Choose a frame" palette={p}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {thumbs.map(({ frame: f, layout }) => {
              const active = f.id === frameId;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => pickFrame(f.id)}
                  className="relative flex flex-col items-center gap-2 rounded-3xl border p-3 text-center transition-all duration-300 hover:-translate-y-0.5 active:scale-[0.97]"
                  style={{
                    backgroundColor: p.panel,
                    borderColor: active ? p.accent : p.border,
                    boxShadow: "none",
                  }}
                >
                  {active && (
                    <span
                      className="animate-pop absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full text-white"
                      style={{ backgroundColor: p.accent }}
                    >
                      <Check size={11} strokeWidth={3} />
                    </span>
                  )}
                  <div className="flex h-28 items-center justify-center">
                    <LayoutThumb
                      layout={layout}
                      theme={getTheme(f.lockedTheme ?? f.defaultTheme)}
                      accent={p.accent}
                      height={layout.height > layout.width * 1.6 ? 112 : 92}
                    />
                  </div>
                  <span className="text-sm font-bold" style={{ color: active ? p.accent : p.text }}>
                    {f.name}
                  </span>
                  <span className="text-[11px] leading-tight" style={{ color: p.sub }}>
                    {f.description}
                  </span>
                </button>
              );
            })}
          </div>

          {frame.counts.length > 1 && (
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold" style={{ color: p.text }}>
                How many photos?
              </span>
              {[...frame.counts].sort((a, b) => a - b).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setCount(n)}
                  className="h-9 w-9 rounded-full text-sm font-bold transition-all active:scale-90"
                  style={{
                    backgroundColor: n === shots ? p.accent : p.chip,
                    color: n === shots ? "#fff" : p.text,
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          )}
        </Step>

        {/* Step 2 — Theme */}
        <Step n={2} title={`Frame design (${THEMES.length} styles)`} palette={p}>
          <ThemePicker value={themeId} onChange={setThemeId} lockedTo={frame.lockedTheme} palette={p} />
        </Step>

      </div>

      {/* Bottom bar */}
      <div
        className="fixed inset-x-0 bottom-0 border-t px-4 py-3 backdrop-blur sm:px-6 sm:py-4"
        style={{ backgroundColor: `${p.panel}ee`, borderColor: p.border }}
      >
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {/* Live mini preview of the current pick — always visible */}
            <div key={`${frameId}-${shots}-${effectiveTheme}`} className="animate-sticker-in shrink-0 drop-shadow-sm">
              <LayoutThumb layout={frame.build(shots)} theme={getTheme(effectiveTheme)} accent={p.accent} height={56} />
            </div>
            <div className="min-w-0 text-xs" style={{ color: p.sub }}>
              <p className="truncate text-sm font-bold" style={{ color: p.text }}>
                {frame.name}
              </p>
              <p className="truncate">
                {shots} photo{shots > 1 ? "s" : ""} · {getTheme(effectiveTheme).name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onOpenCamera({ frameId, count: shots, themeId: effectiveTheme })}
            className="flex shrink-0 items-center gap-2 rounded-full bg-red-600 px-6 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-red-700 active:scale-95"
          >
            Open Camera <ChevronRight size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Step({
  n,
  title,
  palette: p,
  children,
}: {
  n: number;
  title: string;
  palette: BoothPalette;
  children: ReactNode;
}) {
  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center gap-3">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white"
          style={{ backgroundColor: p.accent }}
        >
          {n}
        </span>
        <h2 className="text-lg font-bold" style={{ color: p.text }}>
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}
