import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  Camera,
  Check,
  Download,
  LoaderCircle,
  Moon,
  RotateCcw,
  Share2,
  Square,
  Sun,
  SwitchCamera,
  Timer,
  Zap,
} from "lucide-react";
import type { BoothConfig, Design, PlacedSticker } from "../../booth/types";
import { EXPORT_SCALE, getFrame, normalizeCount } from "../../booth/config/frames";
import { DEFAULT_FILTER_ID, getFilter } from "../../booth/config/filters";
import { ensureFonts } from "../../booth/config/fonts";
import { DEFAULT_STICKER_SIZE, getSticker } from "../../booth/config/stickers";
import { preloadStickerImages } from "../../booth/render/stickerImages";
import { resolveLook } from "../../booth/render/look";
import { formatDateStamp } from "../../booth/render/layers";
import { makeThumb } from "../../booth/render/renderLook";
import { composeDesign, looksBlank } from "../../booth/render/compose";
import { createCanvas } from "../../booth/render/canvas";
import { canvasToBlob, downloadBlob, exportFilename, shareBlob } from "../../booth/render/export";
import { boothPalette, type BoothPalette } from "../../booth/ui";
import { useCamera, type Facing } from "../../hooks/useCamera";
import { useBoothSession } from "../../hooks/useBoothSession";
import { useProcessedShots } from "../../hooks/useProcessedShots";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { useElementSize } from "../../hooks/useElementSize";
import Viewfinder from "../booth/Viewfinder";
import Logo from "../layout/Logo";
import { BRAND } from "../../brand";
import FilterPicker from "../booth/FilterPicker";
import StripEditor from "../booth/StripEditor";
import EditPanel from "../booth/EditPanel";
import SavePreview from "../booth/SavePreview";

interface BoothPageProps {
  dark: boolean;
  onToggleDark: () => void;
  config: BoothConfig;
  onBack: () => void;
  onHome: () => void;
}

/** Countdown options in seconds. 0 = no timer: every tap captures instantly. */
const TIMERS = [0, 3, 5, 10];
const TIMER_KEY = `${BRAND.slug}.timer`;

function loadTimer(): number {
  try {
    const v = Number(localStorage.getItem(TIMER_KEY));
    return TIMERS.includes(v) && localStorage.getItem(TIMER_KEY) !== null ? v : 3;
  } catch {
    return 3;
  }
}

/** Side-by-side edit layout on laptops/desktops and on any landscape screen wide enough. */
const WIDE_LAYOUT = "(min-width: 1024px), (orientation: landscape) and (min-width: 640px)";

const uid = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;

/**
 * Two phases:
 *  - shoot: live viewfinder with filter, countdown + flash, per-photo retake
 *  - edit:  composed strip preview, filter/theme/stickers/text, download & share
 */
export default function BoothPage({ dark, onToggleDark, config, onBack, onHome }: BoothPageProps) {
  const p = boothPalette(dark);
  const frame = getFrame(config.frameId);
  const count = normalizeCount(frame, config.count);
  const layout = useMemo(() => frame.build(count), [frame, count]);
  const totalShots = layout.slots.length;

  const [sessionDate] = useState(() => new Date());
  const dateText = formatDateStamp(sessionDate);

  const [phase, setPhase] = useState<"shoot" | "edit">("shoot");
  const [facing, setFacing] = useState<Facing>("user");
  const [timer, setTimerState] = useState(loadTimer);
  const setTimer = (t: number) => {
    setTimerState(t);
    try {
      localStorage.setItem(TIMER_KEY, String(t)); // remember the choice
    } catch {
      /* private mode — fine */
    }
  };
  const instant = timer === 0;
  const [retakeIndex, setRetakeIndex] = useState<number | null>(null);
  const [design, setDesign] = useState<Design>(() => ({
    frameId: frame.id,
    count,
    themeId: frame.lockedTheme ?? config.themeId,
    filterId: DEFAULT_FILTER_ID,
    intensity: 1,
    caption: frame.defaultCaption,
    captionFontId: frame.defaultFont ?? "bold-sans",
    footer: "",
    dateStamp: false,
  }));
  const [stickers, setStickers] = useState<PlacedSticker[]>([]);
  const [selectedSticker, setSelectedSticker] = useState<string | null>(null);
  const [liveThumb, setLiveThumb] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [exporting, setExporting] = useState<"download" | "share" | null>(null);
  /** Phone fallback: full-screen photo to long-press → Save to Photos. */
  const [saveFallback, setSaveFallback] = useState<Blob | null>(null);
  /** Phones: PNG rendered ahead of time, so the share sheet opens instantly on tap. */
  const [prepared, setPrepared] = useState<{ blob: Blob; source: unknown } | null>(null);
  const isPhone = useMediaQuery("(pointer: coarse)");

  const camera = useCamera(phase === "shoot", facing);
  const session = useBoothSession(totalShots, camera.capture);
  const filter = getFilter(design.filterId);
  const look = useMemo(
    () => resolveLook(getFilter(design.filterId), design.intensity),
    [design.filterId, design.intensity],
  );
  const processed = useProcessedShots(session.shots, layout, look, phase === "edit", sessionDate);

  const updateDesign = (patch: Partial<Design>) => setDesign((d) => ({ ...d, ...patch }));

  /* ── responsive edit layout ── */
  const wide = useMediaQuery(WIDE_LAYOUT);
  const [previewRef, previewSize] = useElementSize<HTMLElement>();

  /* ── toast auto-hide ── */
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(t);
  }, [toast]);

  /* ── live thumbnails for the filter picker (refreshed from the camera) ── */
  const { stream, getVideo, mirror } = camera;
  useEffect(() => {
    if (phase !== "shoot" || !stream) return;
    const grab = () => {
      const v = getVideo();
      if (v && v.videoWidth) setLiveThumb(makeThumb(v, v.videoWidth, v.videoHeight, 140, mirror));
    };
    const first = setTimeout(grab, 500);
    const every = setInterval(grab, 1500);
    return () => {
      clearTimeout(first);
      clearInterval(every);
    };
  }, [phase, stream, getVideo, mirror]);

  const trayThumbs = useMemo(
    () => session.shots.map((s) => (s ? makeThumb(s.canvas, s.canvas.width, s.canvas.height, 120) : null)),
    [session.shots],
  );
  const editThumb = trayThumbs.find(Boolean) ?? null;

  /* ── shooting ── */
  const remaining = session.shots.flatMap((s, i) => (s ? [] : [i]));
  const taken = totalShots - remaining.length;
  const allTaken = remaining.length === 0;
  const viewIndex = session.activeIndex ?? retakeIndex ?? (allTaken ? 0 : remaining[0]);

  const runShoot = async (indices: number[]) => {
    const result = await session.shoot(indices, timer);
    if (result === "camera-not-ready") setToast("Camera isn't ready yet — try again in a sec.");
    if (result === "complete") {
      setRetakeIndex(null);
      setPhase("edit");
    }
  };

  const onShutter = () => {
    if (session.running) {
      // Countdown mode: tapping again stops the sequence. Instant mode: ignore double taps.
      if (!instant) session.cancel();
      return;
    }
    if (retakeIndex !== null) return void runShoot([retakeIndex]);
    if (allTaken) return setPhase("edit");
    // Instant mode = one photo per tap. Countdown mode = shoots all remaining photos in a row.
    void runShoot(instant ? [remaining[0]] : remaining);
  };

  // Spacebar / Enter = shutter on laptops (ignored while typing).
  const shutterRef = useRef(onShutter);
  useEffect(() => {
    shutterRef.current = onShutter;
  });
  useEffect(() => {
    if (phase !== "shoot") return;
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT", "BUTTON"].includes(el.tagName))) return;
      if (e.code === "Space" || e.key === "Enter") {
        e.preventDefault();
        shutterRef.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase]);

  const retakeFromEdit = (i: number) => {
    setSelectedSticker(null);
    setRetakeIndex(i);
    setPhase("shoot");
  };

  const leave = (go: () => void) => {
    if (!session.shots.some(Boolean) || window.confirm("Leave the booth? Your photos will be lost.")) {
      session.cancel();
      go();
    }
  };

  const startOver = () => {
    if (!window.confirm("Start over with new photos?")) return;
    session.reset();
    setStickers([]);
    setRetakeIndex(null);
    setPhase("shoot");
  };

  /* ── stickers ── */
  const addSticker = (stickerId: string) => {
    const s: PlacedSticker = {
      uid: uid(),
      stickerId,
      x: layout.width * (0.3 + Math.random() * 0.4),
      y: layout.height * (0.3 + Math.random() * 0.4),
      size: layout.width * (getSticker(stickerId)?.defaultSize ?? DEFAULT_STICKER_SIZE),
      rotation: Math.random() * 24 - 12,
    };
    setStickers((list) => [...list, s]);
    setSelectedSticker(s.uid);
  };
  const changeSticker = (id: string, patch: Partial<PlacedSticker>) =>
    setStickers((list) => list.map((s) => (s.uid === id ? { ...s, ...patch } : s)));
  const selectSticker = (id: string | null) => {
    setSelectedSticker(id);
    // bring the selected sticker to the front
    if (id)
      setStickers((list) =>
        list[list.length - 1]?.uid === id
          ? list
          : [...list.filter((s) => s.uid !== id), ...list.filter((s) => s.uid === id)],
      );
  };

  /* ── export ── */
  const ready =
    !processed.busy &&
    processed.canvases.length === totalShots &&
    processed.canvases.every(Boolean);

  const buildPng = useCallback(async () => {
    await Promise.all([ensureFonts(), preloadStickerImages(stickers)]);
    // Render on a fresh CPU-backed canvas; verify it isn't blank and retry once if it is.
    for (let attempt = 0; attempt < 2; attempt++) {
      const canvas = composeDesign(createCanvas(1, 1), design, layout, processed.canvases, {
        scale: EXPORT_SCALE,
        stickers,
        placeholders: false,
        date: sessionDate,
        cpu: true,
      });
      if (!looksBlank(canvas)) return canvasToBlob(canvas);
    }
    throw new Error("Export produced a blank image");
  }, [design, layout, processed.canvases, stickers, sessionDate]);

  /*
   * Phones: browsers can't write straight into Photos/Gallery, but the share
   * sheet can ("Save Image" on iPhone, "Save to gallery"/Photos on Android).
   * iOS only opens it right after a tap, so the PNG is rendered in the
   * background while the user edits and is ready the moment they tap Save.
   */
  useEffect(() => {
    if (!isPhone || phase !== "edit" || !ready) return;
    let cancelled = false;
    const t = setTimeout(() => {
      buildPng()
        .then((blob) => !cancelled && setPrepared({ blob, source: buildPng }))
        .catch(() => {});
    }, 600);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [isPhone, phase, ready, buildPng]);

  /** Desktop: regular file download. */
  const onDownload = async () => {
    setExporting("download");
    try {
      downloadBlob(await buildPng(), exportFilename());
      setToast("Downloaded! Check your Downloads folder.");
    } catch {
      setToast("Couldn't export — please try again.");
    } finally {
      setExporting(null);
    }
  };

  /** Phones (Save to Photos) and Share: native share sheet, with a long-press fallback. */
  const onShareSheet = async (kind: "download" | "share") => {
    // Only use the pre-rendered PNG if it matches the current design.
    const fresh = prepared && prepared.source === buildPng ? prepared.blob : null;
    if (fresh) {
      try {
        const result = await shareBlob(fresh, exportFilename());
        if (result !== "unsupported") return; // shared or cancelled by the user
      } catch {
        /* e.g. NotAllowedError — fall through to the long-press preview */
      }
    }
    setExporting(kind);
    try {
      const blob = fresh ?? (await buildPng());
      if (!fresh && !isPhone) {
        // Desktop "Share": try the share sheet, else download.
        const result = await shareBlob(blob, exportFilename()).catch(() => "unsupported" as const);
        if (result === "unsupported") {
          downloadBlob(blob, exportFilename());
          setToast("Sharing isn't supported here, so we downloaded it instead.");
        }
        return;
      }
      setSaveFallback(blob);
    } catch {
      setToast("Couldn't export — please try again.");
    } finally {
      setExporting(null);
    }
  };

  /* ── render ── */
  const capturing = session.countdown !== null;
  const shutterLabel = session.running
    ? instant
      ? "Snap!"
      : "Tap to stop"
    : instant && retakeIndex === null && !allTaken
      ? `Tap to snap · photo ${taken + 1} of ${totalShots}`
      : retakeIndex !== null
      ? `Retake photo ${retakeIndex + 1}`
      : allTaken
        ? "Continue to edit"
        : taken > 0
          ? `Take ${remaining.length} more`
          : `Take ${totalShots} photo${totalShots > 1 ? "s" : ""}`;

  return (
    <div
      className={`preview-max flex flex-col transition-colors duration-300 ${
        phase === "edit" ? "h-[100dvh] overflow-hidden" : "min-h-[100dvh]"
      }`}
      style={{ fontFamily: "'Outfit', sans-serif", backgroundColor: p.bg, color: p.text }}
    >
      {/* ───────── Header (fades out during the countdown so the shot is distraction-free) ───────── */}
      <header
        className="sticky top-0 z-30 border-b backdrop-blur transition-opacity duration-300"
        style={{
          backgroundColor: dark ? "rgba(17,17,17,0.9)" : "rgba(255,255,255,0.9)",
          borderColor: p.border,
          opacity: capturing ? 0 : 1,
          pointerEvents: capturing ? "none" : "auto",
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={() => leave(onBack)}
            className="flex items-center gap-1.5 text-sm transition-colors hover:text-red-600"
            style={{ color: p.sub, fontWeight: 500 }}
            aria-label="Back to setup"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back</span>
          </button>

          <button
            type="button"
            onClick={() => leave(onHome)}
            className="hidden transition-transform hover:-rotate-2 md:flex"
          >
            <Logo size={28} dark={dark} />
          </button>

          {/* Step indicator */}
          <div className="mx-auto flex items-center gap-2 md:mx-0 md:ml-6">
            <StepPill n={1} label="Shoot" active={phase === "shoot"} done={phase === "edit"} p={p} />
            <span className="h-px w-5" style={{ backgroundColor: p.border }} />
            <StepPill n={2} label="Edit" active={phase === "edit"} done={false} p={p} />
          </div>

          <div className="ml-auto hidden items-center gap-2 lg:flex">
            {[frame.name, `${filter.name} filter`].map((tag) => (
              <span
                key={tag}
                className="rounded-full border px-2.5 py-1 text-xs"
                style={{ borderColor: p.border, color: p.text, fontWeight: 500 }}
              >
                {tag}
              </span>
            ))}
          </div>
          <span
            className="hidden text-xs tabular-nums sm:inline lg:ml-2"
            style={{ color: p.sub, fontWeight: 500 }}
          >
            {taken} / {totalShots} shots
          </span>
          <button
            type="button"
            onClick={onToggleDark}
            aria-label="Toggle dark mode"
            className="transition-colors"
            style={{ color: dark ? "#a1a1aa" : "#9ca3af" }}
          >
            {dark ? <Moon size={18} strokeWidth={1.5} /> : <Sun size={18} strokeWidth={1.5} />}
          </button>
        </div>
      </header>

      {phase === "shoot" ? (
        /* ───────── SHOOT ─────────
           Phone: camera → tray → filters → controls (shutter stays in thumb reach)
           Desktop: camera + controls on the left, settings panel on the right */
        <main
          className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-4 px-4 pb-8 pt-4 sm:px-6 md:grid md:grid-cols-[minmax(0,1fr)_340px] md:content-start md:gap-x-8 md:gap-y-5 md:pt-6 md:[grid-template-areas:'cam_side''ctrl_side']"
        >
          <section className="flex flex-col items-center gap-3 md:[grid-area:cam]">
            <Viewfinder
              stream={camera.stream}
              error={camera.error}
              onVideoElement={camera.attachVideo}
              mirror={camera.mirror}
              look={look}
              slot={layout.slots[viewIndex]}
              countdown={session.countdown}
              label={retakeIndex !== null ? `Retaking photo ${retakeIndex + 1}` : `Photo ${viewIndex + 1} of ${totalShots}`}
              dateText={dateText}
              maxHeight="var(--shoot-max)"
            />
            {totalShots > 1 && (
              <ShotTray
                thumbs={trayThumbs}
                activeIndex={session.running || retakeIndex !== null ? viewIndex : null}
                disabled={session.running}
                cssFilter={look.css}
                onRetake={(i) => void runShoot([i])}
                p={p}
              />
            )}
          </section>

          <aside
            className="md:self-start md:rounded-2xl md:border md:bg-[var(--panel)] md:p-5 md:[grid-area:side]"
            style={{ borderColor: p.border, ["--panel" as string]: p.panel }}
          >
            <div className="hidden md:block">
              <PanelTitle title="Filters" subtitle="Applied live and baked into every photo" p={p} />
            </div>
            <FilterPicker
                selectedId={design.filterId}
                onSelect={(filterId) => updateDesign({ filterId })}
                intensity={design.intensity}
                onIntensity={(intensity) => updateDesign({ intensity })}
                thumbSrc={liveThumb}
                dateText={dateText}
                palette={p}
              />

            <div className="mt-6 hidden border-t pt-5 md:block" style={{ borderColor: p.border }}>
              <PanelTitle title="Your strip" subtitle={`${frame.name} · ${frame.description}`} p={p} />
              <ul className="space-y-2 text-xs" style={{ color: p.sub }}>
                <li>
                  • {instant ? "No timer — every tap takes a photo instantly" : `${timer}-second countdown before each shot`}
                </li>
                <li className="hidden lg:list-item">• Press Space to take a photo</li>
                <li>• Tap a photo in the tray to retake just that one</li>
                <li>• Add stickers, captions & a date stamp after shooting</li>
              </ul>
            </div>
          </aside>

          {/* Controls */}
          <section
            className="flex flex-col items-center gap-3 md:[grid-area:ctrl]"
            style={{ opacity: camera.error ? 0.5 : 1 }}
          >
            {/* Timer: Off = instant capture on every tap */}
            <div
              className="flex items-center gap-1 rounded-full border p-1"
              style={{ borderColor: p.border, backgroundColor: p.panel }}
              role="radiogroup"
              aria-label="Countdown timer"
            >
              <Timer size={14} className="mx-1.5" style={{ color: p.sub }} />
              {TIMERS.map((t) => (
                <button
                  key={t}
                  type="button"
                  role="radio"
                  aria-checked={timer === t}
                  aria-label={t === 0 ? "No timer, instant capture" : `${t} second timer`}
                  disabled={session.running}
                  onClick={() => setTimer(t)}
                  className="flex items-center gap-1 rounded-full px-3 py-1.5 text-xs transition-all disabled:opacity-50 sm:text-sm"
                  style={{
                    fontWeight: 600,
                    backgroundColor: timer === t ? (t === 0 ? "#7a1f2b" : p.text) : "transparent",
                    color: timer === t ? "#ffffff" : p.text,
                  }}
                >
                  {t === 0 ? (
                    <>
                      <Zap size={13} fill={timer === 0 ? "currentColor" : "none"} /> Off
                    </>
                  ) : (
                    `${t}s`
                  )}
                </button>
              ))}
            </div>

            <div className="grid w-full max-w-md grid-cols-[1fr_auto_1fr] items-center gap-3">
              {/* Progress */}
              <span
                className="justify-self-start rounded-full border px-3 py-2 text-xs tabular-nums"
                style={{ borderColor: p.border, backgroundColor: p.panel, color: p.text, fontWeight: 700 }}
                aria-label={`${taken} of ${totalShots} photos taken`}
              >
                {taken}/{totalShots}
              </span>

              {/* Shutter with progress ring */}
              <ShutterButton
                running={session.running && !instant}
                disabled={!camera.stream && !allTaken}
                progress={totalShots > 1 ? taken / totalShots : 0}
                label={shutterLabel}
                onClick={onShutter}
                p={p}
              />

              {/* Flip camera */}
              <button
                type="button"
                disabled={session.running}
                onClick={() => setFacing((f) => (f === "user" ? "environment" : "user"))}
                className="flex h-11 w-11 items-center justify-center justify-self-end rounded-full border transition-transform active:rotate-180 disabled:opacity-50"
                style={{ borderColor: p.border, backgroundColor: p.panel, color: p.text }}
                aria-label="Switch camera"
              >
                <SwitchCamera size={18} />
              </button>
            </div>

            <span className="text-sm" style={{ color: p.sub, fontWeight: 600 }}>
              {shutterLabel}
            </span>

            {retakeIndex !== null && !session.running && (
              <button
                type="button"
                onClick={() => {
                  setRetakeIndex(null);
                  setPhase("edit");
                }}
                className="text-xs underline-offset-4 hover:underline"
                style={{ color: p.sub, fontWeight: 500 }}
              >
                Cancel retake
              </button>
            )}
          </section>
        </main>
      ) : (
        /* ───────── EDIT ─────────
           Portrait (phones / tablets): preview on top + bottom sheet with tools.
           Landscape & desktop: preview left + tools panel right.
           Both fill exactly one screen, so the preview never scrolls away while editing. */
        <main className={`flex min-h-0 flex-1 ${wide ? "flex-row" : "flex-col"}`}>
          <section
            ref={previewRef}
            className="flex min-h-0 min-w-0 flex-1 items-center justify-center p-3 sm:p-6"
          >
            {previewSize.height > 0 && (
              <StripEditor
                design={design}
                layout={layout}
                shots={processed.canvases}
                stickers={stickers}
                date={sessionDate}
                selectedUid={selectedSticker}
                onSelect={selectSticker}
                onStickerChange={changeSticker}
                onStickerRemove={(id) => setStickers((list) => list.filter((s) => s.uid !== id))}
                busy={processed.busy}
                maxHeight={`${Math.floor(previewSize.height)}px`}
              />
            )}
          </section>

          <EditPanel
            variant={wide ? "side" : "sheet"}
            className={
              wide
                ? "h-full w-[min(420px,46vw)] shrink-0 border-l"
                : "h-[min(48dvh,520px)] shrink-0 rounded-t-3xl border-t shadow-[0_-4px_16px_-8px_rgba(0,0,0,0.12)]"
            }
            design={design}
            onChange={updateDesign}
            onAddSticker={addSticker}
            onClearStickers={() => setStickers([])}
            stickerCount={stickers.length}
            thumbSrc={editThumb}
            dateText={dateText}
            onChangeLayout={() => leave(onBack)}
            photos={trayThumbs}
            onRetake={retakeFromEdit}
            onStartOver={startOver}
            palette={p}
            footer={
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => (isPhone ? onShareSheet("download") : onDownload())}
                  disabled={!ready || exporting !== null}
                  className="flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-red-600 py-3 text-sm text-white shadow-md transition-all hover:bg-red-700 active:scale-95 disabled:opacity-50"
                  style={{ fontWeight: 700 }}
                >
                  {exporting === "download" ? <LoaderCircle size={17} className="animate-spin" /> : <Download size={17} />}
                  <span className="truncate">{isPhone ? "Save to Photos" : "Download PNG"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onShareSheet("share")}
                  disabled={!ready || exporting !== null}
                  className="flex shrink-0 items-center justify-center gap-2 rounded-full border px-4 py-3 text-sm text-red-600 dark:text-red-400 transition-all hover:bg-red-50 active:scale-95 disabled:opacity-50 sm:px-5"
                  style={{ borderColor: "#7a1f2b", fontWeight: 700 }}
                  aria-label="Share"
                >
                  {exporting === "share" ? <LoaderCircle size={17} className="animate-spin" /> : <Share2 size={17} />}
                  <span className="hidden min-[360px]:inline">Share</span>
                </button>
              </div>
            }
          />
        </main>
      )}

      {/* Camera flash */}
      {session.flashKey > 0 && (
        <div key={session.flashKey} className="animate-flash pointer-events-none fixed inset-0 z-50 bg-white" />
      )}

      {/* Phone fallback: long-press to save */}
      {saveFallback && (
        <SavePreview blob={saveFallback} filename={exportFilename()} onClose={() => setSaveFallback(null)} />
      )}

      {/* Toast */}
      {toast && (
        <div className="animate-fade-up fixed inset-x-0 bottom-6 z-50 flex justify-center px-4" role="status">
          <div
            className="rounded-full px-5 py-3 text-sm shadow-md"
            style={{ backgroundColor: p.text, color: p.panel, fontWeight: 600 }}
          >
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}

/* ───────────────────────── small pieces ───────────────────────── */

function StepPill({
  n,
  label,
  active,
  done,
  p,
}: {
  n: number;
  label: string;
  active: boolean;
  done: boolean;
  p: BoothPalette;
}) {
  return (
    <span className="flex items-center gap-1.5 text-xs" style={{ fontWeight: 600, color: active ? p.text : p.sub }}>
      <span
        className="flex h-6 w-6 items-center justify-center rounded-full text-[11px] text-white transition-colors"
        style={{ backgroundColor: active || done ? "#7a1f2b" : p.sub, fontWeight: 700 }}
      >
        {done ? <Check size={12} strokeWidth={3} /> : n}
      </span>
      {label}
    </span>
  );
}

function PanelTitle({ title, subtitle, p }: { title: string; subtitle: string; p: BoothPalette }) {
  return (
    <div className="mb-4">
      <p className="text-sm" style={{ fontWeight: 700, color: p.text }}>
        {title}
      </p>
      <p className="text-xs" style={{ color: p.sub }}>
        {subtitle}
      </p>
    </div>
  );
}

function ShotTray({
  thumbs,
  activeIndex,
  disabled,
  cssFilter,
  onRetake,
  p,
}: {
  thumbs: (string | null)[];
  activeIndex: number | null;
  disabled: boolean;
  cssFilter: string;
  onRetake: (i: number) => void;
  p: BoothPalette;
}) {
  return (
    <div className="flex flex-wrap justify-center gap-2">
      {thumbs.map((src, i) => {
        const active = i === activeIndex;
        return (
          <button
            key={i}
            type="button"
            disabled={!src || disabled}
            onClick={() => onRetake(i)}
            className="group relative h-12 w-12 overflow-hidden rounded-xl border-2 transition-all disabled:cursor-default"
            style={{
              borderColor: active ? "#7a1f2b" : src ? "transparent" : p.border,
              borderStyle: src || active ? "solid" : "dashed",
              backgroundColor: p.panel,
              transform: active ? "translateY(-2px)" : undefined,
            }}
            aria-label={src ? `Retake photo ${i + 1}` : `Photo ${i + 1} not taken yet`}
          >
            {src ? (
              <>
                <img
                  src={src}
                  alt=""
                  className="animate-sticker-in h-full w-full object-cover"
                  style={{ filter: cssFilter === "none" ? undefined : cssFilter }}
                />
                {!disabled && (
                  <span className="absolute inset-0 flex items-center justify-center bg-red-600/70 text-white opacity-0 transition-opacity group-hover:opacity-100">
                    <RotateCcw size={16} />
                  </span>
                )}
              </>
            ) : (
              <span className="text-xs" style={{ color: active ? "#7a1f2b" : p.sub, fontWeight: 700 }}>
                {i + 1}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Big red shutter. The ring around it fills up as photos are taken. */
function ShutterButton({
  running,
  disabled,
  progress,
  label,
  onClick,
  p,
}: {
  running: boolean;
  disabled: boolean;
  progress: number;
  label: string;
  onClick: () => void;
  p: BoothPalette;
}): ReactNode {
  const R = 42;
  const C = 2 * Math.PI * R;
  return (
    <div className="relative h-[92px] w-[92px]">
      <svg viewBox="0 0 92 92" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="46" cy="46" r={R} fill="none" stroke={p.border} strokeWidth="4" />
        <circle
          cx="46"
          cy="46"
          r={R}
          fill="none"
          stroke="#7a1f2b"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - progress)}
          className="transition-[stroke-dashoffset] duration-500"
        />
      </svg>
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        className="absolute inset-[10px] flex items-center justify-center rounded-full bg-red-600 text-white shadow-lg transition-all hover:bg-red-700 active:scale-90 disabled:opacity-40"
        aria-label={label}
      >
        {running ? <Square size={22} fill="currentColor" /> : <Camera size={28} strokeWidth={2.2} />}
      </button>
    </div>
  );
}
