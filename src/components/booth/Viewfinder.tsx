import { Camera, LoaderCircle } from "lucide-react";
import type { ResolvedLook, Slot } from "../../booth/types";
import { needsMask, shapePath } from "../../booth/render/shapes";
import { useElementSize } from "../../hooks/useElementSize";
import LookLayers from "./LookLayers";
import StreamVideo from "./StreamVideo";

interface ViewfinderProps {
  stream: MediaStream | null;
  error: string | null;
  onVideoElement: (el: HTMLVideoElement | null) => void;
  mirror: boolean;
  look: ResolvedLook;
  /** The slot being shot — the viewfinder takes its aspect ratio and shape. */
  slot: Slot;
  countdown: number | null;
  label: string;
  dateText: string;
  /** CSS length limiting the height (e.g. "var(--preview-max)"). */
  maxHeight: string;
}

/** Live camera with the filter applied in real time, cropped exactly like the final slot. */
export default function Viewfinder({
  stream,
  error,
  onVideoElement,
  mirror,
  look,
  slot,
  countdown,
  label,
  dateText,
  maxHeight,
}: ViewfinderProps) {
  const [ref, size] = useElementSize<HTMLDivElement>();
  const aspect = slot.w / slot.h;
  const videoClass = "absolute inset-0 h-full w-full object-cover";
  const mirrorStyle = mirror ? { transform: "scaleX(-1)" } : undefined;

  return (
    <div
      ref={ref}
      className="relative mx-auto overflow-hidden rounded-[28px] bg-neutral-900 shadow-md transition-all duration-500"
      style={{ aspectRatio: `${aspect}`, width: `min(100%, calc(${maxHeight} * ${aspect}))` }}
    >
      {stream && (
        <LookLayers
          look={look}
          width={size.width}
          dateText={dateText}
          animateGrain
          renderSource={(style, key) => (
            <StreamVideo
              key={key}
              stream={stream}
              onElement={key === "base" ? onVideoElement : undefined}
              className={videoClass}
              style={{ ...style, ...mirrorStyle }}
            />
          )}
        />
      )}

      {/* Dim everything outside heart / arch cut-outs */}
      {needsMask(slot) && (
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox={`0 0 ${slot.w} ${slot.h}`}
          preserveAspectRatio="none"
        >
          <path
            d={`M0 0H${slot.w}V${slot.h}H0Z ${shapePath(slot)}`}
            fill="rgba(20,10,15,0.55)"
            fillRule="evenodd"
          />
          <path
            d={shapePath(slot)}
            fill="none"
            stroke="white"
            strokeOpacity={0.8}
            strokeWidth={slot.w * 0.008}
            strokeDasharray={`${slot.w * 0.03} ${slot.w * 0.02}`}
          />
        </svg>
      )}

      <span className="absolute left-3 top-3 rounded-full bg-black/40 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
        {label}
      </span>

      {!stream && !error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white/80">
          <LoaderCircle className="animate-spin" size={28} />
          <span className="text-sm">Starting camera…</span>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center text-white">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
            <Camera size={22} />
          </div>
          <p className="max-w-xs text-sm leading-relaxed">{error}</p>
        </div>
      )}

      {countdown !== null && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <span
            key={countdown}
            className="animate-pop font-black text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)]"
            style={{ fontSize: "min(32vw, 160px)" }}
          >
            {countdown}
          </span>
        </div>
      )}
    </div>
  );
}
