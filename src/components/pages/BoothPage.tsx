import { useState } from "react";
import { ArrowLeft, Camera, Download, Share2 } from "lucide-react";
import NavBar from "../layout/NavBar";
import {
  filters,
  timers,
  gridShots,
  gridLabels,
} from "../utils/booth.constants";
import { useCamera } from "../../hooks/useCamera";
import { useCapture } from "../../hooks/useCapture";

interface BoothPageProps {
  dark: boolean;
  onToggleDark: () => void;
  config: { mode: string; grid: string; frame: string };
  onBack: () => void;
  onHome?: () => void;
}

function GridPreview({ grid, shots }: { grid: string; shots: string[] }) {
  const isEmpty = shots.length === 0;

  const imgStyle = (src: string) => ({
    backgroundImage: src ? `url(${src})` : "none",
    backgroundColor: isEmpty ? "#1a1a1a" : "#333",
    backgroundSize: "cover",
    backgroundPosition: "center",
  });

  const cell = (src: string, key: number) => (
    <div
      key={key}
      className="rounded overflow-hidden flex-1"
      style={imgStyle(src)}
    />
  );

  if (grid === "single")
    return (
      <div className="w-full h-full rounded" style={imgStyle(shots[0] || "")} />
    );
  if (grid === "sidebyside")
    return (
      <div className="w-full h-full flex gap-1">
        {[0, 1].map((i) => cell(shots[i] || "", i))}
      </div>
    );
  if (grid === "stacked")
    return (
      <div className="w-full h-full flex flex-col gap-1">
        {[0, 1].map((i) => cell(shots[i] || "", i))}
      </div>
    );
  if (grid === "2x2")
    return (
      <div className="w-full h-full grid grid-cols-2 gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded overflow-hidden"
            style={imgStyle(shots[i] || "")}
          />
        ))}
      </div>
    );
  if (grid === "vertstrip")
    return (
      <div className="w-full h-full flex gap-1">
        {[0, 1, 2].map((i) => cell(shots[i] || "", i))}
      </div>
    );
  if (grid === "horizstrip")
    return (
      <div className="w-full h-full flex flex-col gap-1">
        {[0, 1, 2].map((i) => cell(shots[i] || "", i))}
      </div>
    );
  if (grid === "triptych")
    return (
      <div className="w-full h-full flex gap-1">
        <div className="flex flex-col gap-1 flex-1">
          {cell(shots[0] || "", 0)}
          <div
            className="rounded overflow-hidden h-8"
            style={imgStyle(shots[2] || "")}
          />
        </div>
        <div
          className="flex-1 rounded overflow-hidden"
          style={imgStyle(shots[1] || "")}
        />
      </div>
    );
  if (grid === "collage")
    return (
      <div className="w-full h-full flex gap-1">
        <div
          className="flex-1 rounded overflow-hidden"
          style={imgStyle(shots[0] || "")}
        />
        <div className="flex flex-col gap-1 flex-1">
          {cell(shots[1] || "", 1)}
          {cell(shots[2] || "", 2)}
        </div>
      </div>
    );
  return (
    <div className="w-full h-full rounded" style={imgStyle(shots[0] || "")} />
  );
}

export default function BoothPage({
  dark,
  onToggleDark,
  config,
  onBack,
  onHome,
}: BoothPageProps) {
  const [activeFilter, setActiveFilter] = useState(0);
  const [activeTimer, setActiveTimer] = useState("3s");
  const totalShots = gridShots[config.grid] || 1;
  const { videoRef, canvasRef, captureFrame } = useCamera(activeFilter);
  const {
    shots,
    countdown,
    finalImage,
    handleCapture,
    handleDownload,
    handleShare,
    handleRetake,
  } = useCapture(totalShots, config.grid, captureFrame);

  const border = dark ? "#2a2a2a" : "#e5e7eb";
  const text = dark ? "#f4f4f5" : "#111827";
  const sub = dark ? "#71717a" : "#6b7280";
  const panelBg = dark ? "#111" : "#ffffff";

  return (
    <div
      className="h-screen flex flex-col overflow-hidden transition-colors duration-300"
      style={{
        fontFamily: "'Outfit', sans-serif",
        backgroundColor: dark ? "#0a0a0a" : "#f3f4f6",
      }}
    >
      <NavBar dark={dark} onToggleDark={onToggleDark} onLogoClick={onHome} />

      {/* Top bar */}
      <div
        className="flex items-center gap-3 px-5 py-3 border-b flex-shrink-0"
        style={{ backgroundColor: panelBg, borderColor: border }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm transition-colors"
          style={{ color: sub, fontWeight: 500 }}
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div className="flex items-center gap-2 ml-2">
          {[
            gridLabels[config.grid],
            `${config.frame === "none" ? "None" : config.frame} Frame`,
            `${filters[activeFilter].name} Filter`,
          ].map((tag) => (
            <span
              key={tag}
              className="text-xs px-2.5 py-1 rounded-full border"
              style={{ borderColor: border, color: text, fontWeight: 500 }}
            >
              {tag}
            </span>
          ))}
        </div>
        <div
          className="ml-auto text-xs"
          style={{ color: sub, fontWeight: 500 }}
        >
          {shots.length} / {totalShots} shots
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Camera area */}
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6">
          {/* Viewfinder */}
          <div
            className="relative rounded-2xl overflow-hidden shadow-2xl"
            style={{
              width: "100%",
              maxWidth: 640,
              aspectRatio: "4/3",
              backgroundColor: "#000",
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{
                filter: filters[activeFilter].style,
                transform: "scaleX(-1)",
              }}
            />
            {countdown !== null && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <span
                  className="text-white font-black"
                  style={{ fontSize: 96, fontFamily: "'Outfit', sans-serif" }}
                >
                  {countdown}
                </span>
              </div>
            )}
          </div>

          {/* Filter strip */}
          <div className="flex items-center gap-3">
            {filters.map((f, i) => (
              <button
                key={f.name}
                onClick={() => setActiveFilter(i)}
                className="flex flex-col items-center gap-1"
              >
                <div
                  className="w-10 h-10 rounded-full transition-all"
                  style={{
                    background: `radial-gradient(circle at 40% 35%, ${f.color}dd, ${f.color}66)`,
                    border:
                      activeFilter === i
                        ? "2.5px solid #dc2626"
                        : "2.5px solid transparent",
                    boxShadow:
                      activeFilter === i
                        ? "0 0 0 2px rgba(220,38,38,0.25)"
                        : "none",
                  }}
                />
                <span
                  className="text-xs"
                  style={{
                    fontWeight: activeFilter === i ? 700 : 400,
                    color: activeFilter === i ? text : sub,
                  }}
                >
                  {f.name}
                </span>
              </button>
            ))}
          </div>

          {/* Timer + Capture */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <span style={{ color: sub }}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 3" />
                  <path d="M9 2h6" />
                </svg>
              </span>
              {timers.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTimer(t)}
                  className="px-3 py-1 rounded-full text-sm border transition-all"
                  style={{
                    fontWeight: 600,
                    backgroundColor: activeTimer === t ? text : "transparent",
                    color: activeTimer === t ? (dark ? "#000" : "#fff") : text,
                    borderColor: border,
                  }}
                >
                  {t}
                </button>
              ))}
            </div>

            <button
              onClick={() => handleCapture(activeTimer)}
              disabled={countdown !== null || shots.length >= totalShots}
              className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center shadow-lg disabled:opacity-50"
              style={{ border: "4px solid rgba(220,38,38,0.3)" }}
            >
              <Camera size={22} strokeWidth={2} className="text-white" />
            </button>
          </div>
        </div>

        {/* Right panel */}
        <div
          className="w-72 flex flex-col border-l flex-shrink-0 overflow-y-auto"
          style={{ backgroundColor: panelBg, borderColor: border }}
        >
          <div className="p-5 border-b" style={{ borderColor: border }}>
            <p
              className="text-sm mb-0.5"
              style={{ fontWeight: 700, color: text }}
            >
              Preview
            </p>
            <p className="text-xs mb-3" style={{ color: sub }}>
              {finalImage
                ? "Your photo is ready!"
                : "Capture a photo to see the result here"}
            </p>

            <div
              className="w-full rounded-xl border overflow-hidden"
              style={{
                aspectRatio: "4/3",
                borderColor: border,
                backgroundColor: dark ? "#1a1a1a" : "#f9fafb",
                borderStyle: finalImage ? "solid" : "dashed",
              }}
            >
              {finalImage ? (
                <img
                  src={finalImage}
                  alt="preview"
                  className="w-full h-full object-cover"
                />
              ) : shots.length > 0 ? (
                <div className="w-full h-full p-2">
                  <GridPreview grid={config.grid} shots={shots} />
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: dark ? "#2a2a2a" : "#f3f4f6" }}
                  >
                    <Camera
                      size={18}
                      strokeWidth={1.5}
                      style={{ color: sub }}
                    />
                  </div>
                  <p
                    className="text-xs text-center px-4"
                    style={{ fontWeight: 600, color: text }}
                  >
                    No photo yet
                  </p>
                  <p
                    className="text-xs text-center px-4"
                    style={{ color: sub }}
                  >
                    {totalShots} shot{totalShots > 1 ? "s" : ""} will compose
                    into a {gridLabels[config.grid]} layout
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-1.5 mt-3 flex-wrap">
              {[
                gridLabels[config.grid],
                config.frame === "none" ? "None" : config.frame,
                filters[activeFilter].name,
              ].map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full border"
                  style={{ borderColor: border, color: sub }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {finalImage && (
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleDownload(finalImage)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full border text-xs transition-all hover:bg-red-50"
                  style={{
                    borderColor: "#dc2626",
                    color: "#dc2626",
                    fontWeight: 600,
                  }}
                >
                  <Download size={13} /> Download
                </button>
                <button
                  onClick={() => handleShare(finalImage)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full border text-xs transition-all hover:bg-red-50"
                  style={{
                    borderColor: "#dc2626",
                    color: "#dc2626",
                    fontWeight: 600,
                  }}
                >
                  <Share2 size={13} /> Share
                </button>
              </div>
            )}
            {finalImage && (
              <button
                onClick={handleRetake}
                className="w-full mt-2 py-2 rounded-full text-xs transition-all"
                style={{ color: sub, fontWeight: 500 }}
              >
                Retake
              </button>
            )}
          </div>

          <div className="p-5">
            <p
              className="text-xs mb-3 tracking-widest uppercase"
              style={{ color: sub, fontWeight: 600 }}
            >
              Current Settings
            </p>
            {[
              {
                label: "Mode",
                value: config.mode === "photo" ? "Photo" : "Boomerang",
              },
              { label: "Grid", value: gridLabels[config.grid] },
              {
                label: "Frame",
                value: config.frame === "none" ? "None" : config.frame,
              },
              { label: "Filter", value: filters[activeFilter].name },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex justify-between py-2 border-b"
                style={{ borderColor: border }}
              >
                <span
                  className="text-sm"
                  style={{ color: sub, fontWeight: 400 }}
                >
                  {label}
                </span>
                <span
                  className="text-sm"
                  style={{ color: text, fontWeight: 600 }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
