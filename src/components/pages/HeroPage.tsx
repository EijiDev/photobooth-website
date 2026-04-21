import { useEffect, useState } from "react";
import { Camera, Heart } from "lucide-react";
import NavBar from "../layout/NavBar";

interface SnapBoothProps {
  dark: boolean;
  onToggleDark: () => void;
  onStartBooth: () => void;
}

export default function SnapBooth({
  dark,
  onToggleDark,
  onStartBooth,
}: SnapBoothProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      className="min-h-screen relative overflow-hidden transition-colors duration-300"
      style={{
        fontFamily: "'Outfit', sans-serif",
        backgroundColor: dark ? "#0f0f0f" : "#f8f8f8",
      }}
    >
      {/* Background blobs */}
      <div
        className="absolute top-16 left-8 w-52 h-52 rounded-full blur-3xl pointer-events-none transition-colors duration-300"
        style={{
          backgroundColor: dark
            ? "rgba(220,38,38,0.12)"
            : "rgba(254,202,202,0.5)",
        }}
      />
      <div
        className="absolute bottom-16 right-8 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-colors duration-300"
        style={{
          backgroundColor: dark
            ? "rgba(220,38,38,0.15)"
            : "rgba(252,165,165,0.25)",
        }}
      />

      <NavBar
        dark={dark}
        onToggleDark={onToggleDark}
        onStartBooth={onStartBooth}
      />

      <main className="flex flex-col items-center justify-center text-center pt-20 pb-32 px-6 relative z-10">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 border text-sm px-5 py-2 rounded-full mb-8 transition-all duration-700"
          style={{
            fontWeight: 500,
            border: `1px solid ${dark ? "#3f1a1a" : "#fca5a5"}`,
            backgroundColor: dark ? "#1a0a0a" : "#fff1f2",
            color: dark ? "#f87171" : "#dc2626",
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(24px)",
            transitionDelay: "0ms",
          }}
        >
        </div>

        {/* Headline */}
        <h1
          className="text-7xl leading-tight tracking-tight mb-1 transition-all duration-700"
          style={{
            fontWeight: 800,
            color: dark ? "#f4f4f5" : "#111827",
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(24px)",
            transitionDelay: "100ms",
          }}
        >
          Your personal
        </h1>
        <h1
          className="text-7xl leading-tight tracking-tight mb-8 transition-all duration-700"
          style={{
            fontWeight: 800,
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(24px)",
            transitionDelay: "200ms",
          }}
        >
          <span
            style={{
              background: `linear-gradient(to right, #dc2626 0%, #fca5a5 40%, transparent 100%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            pocket photobooth
          </span>
        </h1>

        {/* Subtext */}
        <p
          className="max-w-xl text-base leading-relaxed mb-12 transition-all duration-700"
          style={{
            fontWeight: 300,
            color: dark ? "#71717a" : "#6b7280",
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(24px)",
            transitionDelay: "300ms",
          }}
        >
          Step inside SnapBooth. No apps, no signups just instant, beautiful
          memories with live filters, photo strips, and looping boomerangs right
          from your browser.
        </p>

        {/* CTA */}
        <button
          onClick={onStartBooth}
          className="inline-flex items-center gap-3 bg-red-600 hover:bg-red-700 active:scale-95 transition-all duration-700 text-white text-base px-9 py-4 rounded-full shadow-md"
          style={{
            fontWeight: 700,
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(24px)",
            transitionDelay: "400ms",
          }}
        >
          <Camera size={18} strokeWidth={2.5} />
          Start Photo Booth
        </button>
      </main>
    </div>
  );
}
