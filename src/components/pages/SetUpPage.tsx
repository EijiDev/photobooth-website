import { useState } from "react";
import { ArrowLeft, Camera, Video, Check, ChevronRight } from "lucide-react";
import NavBar from "../layout/NavBar";

interface SetupPageProps {
  dark?: boolean;
  onToggleDark?: () => void;
  onBack: () => void;
  onOpenCamera: (config: { mode: string; grid: string; frame: string }) => void;
}

const modes = [
  { id: "photo", label: "Photo", icon: Camera },
  { id: "boomerang", label: "Boomerang", icon: Video },
];

const grids = [
  {
    id: "single",
    label: "Single",
    photos: "1 photo",
    icon: ({ selected }: { selected: boolean }) => (
      <svg viewBox="0 0 48 36" className="w-10 h-7">
        <rect
          x="6"
          y="4"
          width="36"
          height="28"
          rx="3"
          fill={selected ? "#dc2626" : "#d1d5db"}
          opacity="0.85"
        />
      </svg>
    ),
  },
  {
    id: "sidebyside",
    label: "Side by Side",
    photos: "2 photos",
    icon: ({ selected }: { selected: boolean }) => (
      <svg viewBox="0 0 48 36" className="w-10 h-7">
        <rect
          x="4"
          y="4"
          width="18"
          height="28"
          rx="2"
          fill={selected ? "#dc2626" : "#d1d5db"}
        />
        <rect
          x="26"
          y="4"
          width="18"
          height="28"
          rx="2"
          fill={selected ? "#dc2626" : "#d1d5db"}
        />
      </svg>
    ),
  },
  {
    id: "stacked",
    label: "Stacked",
    photos: "2 photos",
    icon: ({ selected }: { selected: boolean }) => (
      <svg viewBox="0 0 48 36" className="w-10 h-7">
        <rect
          x="6"
          y="3"
          width="36"
          height="13"
          rx="2"
          fill={selected ? "#dc2626" : "#d1d5db"}
        />
        <rect
          x="6"
          y="20"
          width="36"
          height="13"
          rx="2"
          fill={selected ? "#dc2626" : "#d1d5db"}
        />
      </svg>
    ),
  },
  {
    id: "2x2",
    label: "2×2 Grid",
    photos: "4 photos",
    icon: ({ selected }: { selected: boolean }) => (
      <svg viewBox="0 0 48 36" className="w-10 h-7">
        <rect
          x="4"
          y="3"
          width="18"
          height="13"
          rx="2"
          fill={selected ? "#dc2626" : "#d1d5db"}
        />
        <rect
          x="26"
          y="3"
          width="18"
          height="13"
          rx="2"
          fill={selected ? "#dc2626" : "#d1d5db"}
        />
        <rect
          x="4"
          y="20"
          width="18"
          height="13"
          rx="2"
          fill={selected ? "#dc2626" : "#d1d5db"}
        />
        <rect
          x="26"
          y="20"
          width="18"
          height="13"
          rx="2"
          fill={selected ? "#dc2626" : "#d1d5db"}
        />
      </svg>
    ),
  },
  {
    id: "vertstrip",
    label: "Vert Strip",
    photos: "3 photos",
    icon: ({ selected }: { selected: boolean }) => (
      <svg viewBox="0 0 48 36" className="w-10 h-7">
        <rect
          x="4"
          y="3"
          width="12"
          height="30"
          rx="2"
          fill={selected ? "#dc2626" : "#d1d5db"}
        />
        <rect
          x="18"
          y="3"
          width="12"
          height="30"
          rx="2"
          fill={selected ? "#dc2626" : "#d1d5db"}
        />
        <rect
          x="32"
          y="3"
          width="12"
          height="30"
          rx="2"
          fill={selected ? "#dc2626" : "#d1d5db"}
        />
      </svg>
    ),
  },
  {
    id: "horizstrip",
    label: "Horiz Strip",
    photos: "3 photos",
    icon: ({ selected }: { selected: boolean }) => (
      <svg viewBox="0 0 48 36" className="w-10 h-7">
        <rect
          x="4"
          y="3"
          width="40"
          height="9"
          rx="2"
          fill={selected ? "#dc2626" : "#d1d5db"}
        />
        <rect
          x="4"
          y="14"
          width="40"
          height="9"
          rx="2"
          fill={selected ? "#dc2626" : "#d1d5db"}
        />
        <rect
          x="4"
          y="25"
          width="40"
          height="9"
          rx="2"
          fill={selected ? "#dc2626" : "#d1d5db"}
        />
      </svg>
    ),
  },
  {
    id: "triptych",
    label: "Triptych",
    photos: "3 photos",
    icon: ({ selected }: { selected: boolean }) => (
      <svg viewBox="0 0 48 36" className="w-10 h-7">
        <rect
          x="4"
          y="3"
          width="12"
          height="18"
          rx="2"
          fill={selected ? "#dc2626" : "#d1d5db"}
        />
        <rect
          x="18"
          y="3"
          width="12"
          height="28"
          rx="2"
          fill={selected ? "#dc2626" : "#d1d5db"}
        />
        <rect
          x="32"
          y="3"
          width="12"
          height="18"
          rx="2"
          fill={selected ? "#dc2626" : "#d1d5db"}
        />
      </svg>
    ),
  },
  {
    id: "collage",
    label: "Collage",
    photos: "3 photos",
    icon: ({ selected }: { selected: boolean }) => (
      <svg viewBox="0 0 48 36" className="w-10 h-7">
        <rect
          x="4"
          y="3"
          width="22"
          height="30"
          rx="2"
          fill={selected ? "#dc2626" : "#d1d5db"}
        />
        <rect
          x="28"
          y="3"
          width="16"
          height="13"
          rx="2"
          fill={selected ? "#dc2626" : "#d1d5db"}
        />
        <rect
          x="28"
          y="20"
          width="16"
          height="13"
          rx="2"
          fill={selected ? "#dc2626" : "#d1d5db"}
        />
      </svg>
    ),
  },
];

const frames = [
  {
    id: "none",
    label: "None",
    preview: () => (
      <div
        className="w-full h-full rounded-lg"
        style={{ background: "linear-gradient(135deg, #c4b5fd, #93c5fd)" }}
      />
    ),
  },
  {
    id: "classic",
    label: "Classic",
    preview: () => (
      <div
        className="w-full h-full rounded-lg border-4 border-white"
        style={{ background: "linear-gradient(135deg, #c4b5fd, #93c5fd)" }}
      />
    ),
  },
  {
    id: "polaroid",
    label: "Polaroid",
    preview: () => (
      <div
        className="w-full h-full rounded-lg flex flex-col"
        style={{ background: "#fff", padding: "3px 3px 10px 3px" }}
      >
        <div
          className="flex-1 rounded"
          style={{ background: "linear-gradient(135deg, #c4b5fd, #93c5fd)" }}
        />
      </div>
    ),
  },
  {
    id: "hearts",
    label: "Hearts",
    preview: () => (
      <div
        className="w-full h-full rounded-lg relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #fda4af, #fb7185)" }}
      >
        <span className="absolute top-1 left-1 text-white text-xs">♥</span>
        <span className="absolute bottom-1 right-1 text-white text-xs">♥</span>
      </div>
    ),
  },
  {
    id: "film",
    label: "Film",
    preview: () => (
      <div className="w-full h-full rounded-lg relative overflow-hidden bg-gray-900">
        <div className="absolute left-0 top-0 bottom-0 w-2 flex flex-col justify-around px-0.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-sm h-1.5" />
          ))}
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-2 flex flex-col justify-around px-0.5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-sm h-1.5" />
          ))}
        </div>
        <div
          className="absolute inset-x-3 inset-y-1 rounded"
          style={{ background: "linear-gradient(135deg, #c4b5fd, #93c5fd)" }}
        />
      </div>
    ),
  },
  {
    id: "glam",
    label: "Glam",
    preview: () => (
      <div
        className="w-full h-full rounded-lg border-4"
        style={{
          background: "linear-gradient(135deg, #c4b5fd, #93c5fd)",
          borderColor: "#fbbf24",
        }}
      />
    ),
  },
];

export default function SetupPage({
  dark = false,
  onToggleDark,
  onBack,
  onOpenCamera,
}: SetupPageProps) {
  const [mode, setMode] = useState("photo");
  const [grid, setGrid] = useState("single");
  const [frame, setFrame] = useState("none");

  const text = dark ? "#f4f4f5" : "#111827";
  const sub = dark ? "#71717a" : "#6b7280";
  const border = dark ? "#2a2a2a" : "#e5e7eb";
  const cardBg = dark ? "#141414" : "#ffffff";

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{
        fontFamily: "'Outfit', sans-serif",
        backgroundColor: dark ? "#0f0f0f" : "#f8f8f8",
      }}
    >
      <NavBar
        dark={dark}
        onToggleDark={onToggleDark ?? (() => {})}
        onLogoClick={onBack}
      />
      <div className="max-w-5xl mx-auto px-6 pt-8 pb-32">
        {/* Back */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm mb-6 transition-colors"
          style={{ color: sub, fontWeight: 500 }}
        >
          <ArrowLeft size={15} />
          Back to Home
        </button>

        {/* Title */}
        <h1 className="text-4xl mb-1" style={{ fontWeight: 800, color: text }}>
          Set Up Your Shot
        </h1>
        <p className="text-sm mb-8" style={{ color: sub, fontWeight: 300 }}>
          Choose your options, then open the camera to capture your moment.
        </p>

        {/* Divider */}
        <div className="border-t mb-8" style={{ borderColor: border }} />

        {/* Step 1 — Mode */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center text-xs"
              style={{ fontWeight: 700 }}
            >
              1
            </div>
            <span className="text-lg" style={{ fontWeight: 700, color: text }}>
              Choose Mode
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            {modes.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setMode(id)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all text-sm"
                style={{
                  fontWeight: 600,
                  backgroundColor: mode === id ? "#dc2626" : cardBg,
                  borderColor: mode === id ? "#dc2626" : border,
                  color: mode === id ? "#fff" : text,
                }}
              >
                <Icon size={15} strokeWidth={2} />
                {label}
                {mode === id && <Check size={13} strokeWidth={3} />}
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t mb-8" style={{ borderColor: border }} />

        {/* Step 2 — Grid */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center text-xs"
              style={{ fontWeight: 700 }}
            >
              2
            </div>
            <span className="text-lg" style={{ fontWeight: 700, color: text }}>
              Grid Layout
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            {grids.map(({ id, label, photos, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setGrid(id)}
                className="flex flex-col items-center gap-1.5 p-3 rounded-2xl border transition-all"
                style={{
                  width: 90,
                  backgroundColor: cardBg,
                  borderColor: grid === id ? "#dc2626" : border,
                  borderWidth: grid === id ? 2 : 1,
                }}
              >
                <Icon selected={grid === id} />
                <span
                  className="text-xs"
                  style={{
                    fontWeight: 600,
                    color: grid === id ? "#dc2626" : text,
                  }}
                >
                  {label}
                </span>
                <span
                  className="text-xs"
                  style={{ color: sub, fontWeight: 300 }}
                >
                  {photos}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="border-t mb-8" style={{ borderColor: border }} />

        {/* Step 3 — Frame */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-7 h-7 rounded-full bg-red-600 text-white flex items-center justify-center text-xs"
              style={{ fontWeight: 700 }}
            >
              3
            </div>
            <span className="text-lg" style={{ fontWeight: 700, color: text }}>
              Choose Frame
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            {frames.map(({ id, label, preview: Preview }) => (
              <button
                key={id}
                onClick={() => setFrame(id)}
                className="flex flex-col items-center gap-2 p-2 rounded-2xl border transition-all"
                style={{
                  width: 90,
                  backgroundColor: cardBg,
                  borderColor: frame === id ? "#dc2626" : border,
                  borderWidth: frame === id ? 2 : 1,
                }}
              >
                <div
                  className="w-full rounded-lg overflow-hidden"
                  style={{ height: 56 }}
                >
                  <Preview />
                </div>
                <span
                  className="text-xs"
                  style={{
                    fontWeight: 600,
                    color: frame === id ? "#dc2626" : text,
                  }}
                >
                  {label}
                </span>
                {frame === id && (
                  <div className="w-5 h-5 rounded-full bg-red-600 flex items-center justify-center">
                    <Check size={10} strokeWidth={3} className="text-white" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="fixed bottom-0 left-0 right-0 px-6 py-4 border-t transition-colors duration-300"
        style={{
          backgroundColor: dark ? "#0f0f0f" : "#ffffff",
          borderColor: border,
        }}
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            {[
              { label: "Mode", value: modes.find((m) => m.id === mode)?.label },
              { label: "Grid", value: grids.find((g) => g.id === grid)?.label },
              {
                label: "Frame",
                value: frames.find((f) => f.id === frame)?.label,
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs"
                style={{
                  borderColor: border,
                  color: text,
                  fontWeight: 500,
                  backgroundColor: cardBg,
                }}
              >
                <span style={{ color: sub }}>{label}:</span>
                <span style={{ fontWeight: 700 }}>{value}</span>
              </div>
            ))}
          </div>
          <button
            onClick={() => onOpenCamera({ mode, grid, frame })}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 active:scale-95 transition-all text-white px-6 py-3 rounded-full text-sm"
            style={{ fontWeight: 700 }}
          >
            Open Camera
            <ChevronRight size={16} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </div>
  );
}
