import type { CSSProperties } from "react";
import { ArrowDown, Camera } from "lucide-react";
import NavBar from "../layout/NavBar";
import { BRAND } from "../../brand";
// Emoji "poses" shown inside the hero strips (no real photos).
import pGrin from "../../assets/stickers/props-grin.svg";
import pWink from "../../assets/stickers/props-wink-tongue.svg";
import pCool from "../../assets/stickers/props-cool.svg";
import pKiss from "../../assets/stickers/props-kiss.svg";
import pLaugh from "../../assets/stickers/props-laugh.svg";
import pAngel from "../../assets/stickers/props-angel.svg";
import pWow from "../../assets/stickers/props-wow.svg";
import bunny from "../../assets/stickers/bunny.svg";
import cat from "../../assets/stickers/cat.svg";
import bear from "../../assets/stickers/bear.svg";
import chick from "../../assets/stickers/chick.svg";
import catEars from "../../assets/stickers/cat-ears.svg";
import sparkles from "../../assets/stickers/sparkles.svg";
import heartEyes from "../../assets/stickers/props-heart-eyes.svg";
import soCute from "../../assets/stickers/props-sign-so-cute.svg";
import bow from "../../assets/stickers/bow.svg";

interface HeroPageProps {
  dark: boolean;
  onToggleDark: () => void;
  onStartBooth: () => void;
}

/** Staggered entrance via CSS (no mount state needed). */
const reveal = (delayMs: number): CSSProperties => ({ animationDelay: `${delayMs}ms` });

/* ───────────── Hero visual: fanned photo strips, like the logo ───────────── */

interface StripLook {
  /** Strip paper (CSS background). */
  paper: string;
  /** Background of each photo frame. */
  frame: string;
  /** One "pose" per frame. */
  poses: string[];
  caption: string;
  captionColor: string;
  captionFont: string;
}


function MiniStrip({ look, className, style }: { look: StripLook; className: string; style?: CSSProperties }) {
  return (
    <div className={`absolute ${className}`} style={style}>
      <div
        className="flex w-[92px] flex-col gap-[5px] rounded-[6px] p-[6px] pb-0 min-[400px]:w-[104px] shadow-[0_6px_18px_-8px_rgba(0,0,0,0.3)] ring-1 ring-black/5 sm:w-[148px] sm:gap-2 sm:p-[10px]"
        style={{ background: look.paper }}
      >
        {look.poses.map((src, i) => (
          <div
            key={i}
            className="flex aspect-[4/3] w-full items-center justify-center rounded-[2px]"
            style={{ background: look.frame }}
          >
            <img src={src} alt="" draggable={false} className="h-[72%] w-auto" style={{ rotate: `${(i % 2 ? 1 : -1) * 6}deg` }} />
          </div>
        ))}
        <div
          className="flex h-8 items-center justify-center sm:h-11"
          style={{ color: look.captionColor, fontFamily: look.captionFont, fontWeight: 700 }}
        >
          <span className="text-[13px] sm:text-[18px]">{look.caption}</span>
        </div>
      </div>
    </div>
  );
}

const LOOKS: StripLook[] = [
  {
    paper: "#ffffff",
    frame: "#f1f1f3",
    poses: [pGrin, pWink, pCool, pKiss],
    caption: "snap snap!",
    captionColor: "#111827",
    captionFont: "'Outfit', sans-serif",
  },
  {
    paper:
      "linear-gradient(90deg, rgba(244,114,182,0.4) 50%, transparent 50%) 0 0 / 16px 16px, linear-gradient(rgba(244,114,182,0.4) 50%, #fff 50%) 0 0 / 16px 16px",
    frame: "#fde7ee",
    poses: [bunny, cat, bear, chick],
    caption: "besties ♡",
    captionColor: "#be185d",
    captionFont: "'Caveat', cursive",
  },
  {
    paper: "linear-gradient(180deg, #6b1d28, #4a121a)",
    frame: "#f4e8dc",
    poses: [pLaugh, pAngel, pWow, heartEyes],
    caption: "'26 11 27",
    captionColor: "#ff9533",
    captionFont: "'Share Tech Mono', monospace",
  },
];

const FLOATERS = [
  { src: soCute, alt: "SO CUTE sign sticker", className: "left-[0%] top-[4%] w-[104px] sm:w-[160px]", rot: -10, delay: 0 },
  { src: heartEyes, alt: "Heart-eyes sticker", className: "right-[4%] top-[2%] w-[58px] sm:w-[78px]", rot: 12, delay: 600 },
  { src: catEars, alt: "Cat ears sticker", className: "right-[30%] top-[-2%] w-[70px] sm:w-[96px]", rot: 8, delay: 1200 },
  { src: sparkles, alt: "Sparkles sticker", className: "left-[6%] bottom-[10%] w-[56px] sm:w-[74px]", rot: 0, delay: 300 },
  { src: bow, alt: "Bow sticker", className: "right-[2%] bottom-[16%] w-[60px] sm:w-[80px]", rot: -14, delay: 900 },
];

function HeroVisual() {
  return (
    <div className="relative mx-auto h-[370px] w-full max-w-[360px] min-[400px]:h-[410px] sm:h-[500px] sm:max-w-[520px]" aria-hidden>
      <MiniStrip look={LOOKS[1]} className="left-[6%] top-[14%] -rotate-[12deg] sm:left-[8%]" />
      <MiniStrip look={LOOKS[2]} className="right-[6%] top-[16%] rotate-[11deg] sm:right-[8%]" />
      <MiniStrip look={LOOKS[0]} className="left-1/2 top-[6%] z-10 -translate-x-1/2 -rotate-[2deg]" />

      {FLOATERS.map((f) => (
        <div key={f.alt} className={`absolute z-20 ${f.className}`} style={{ transform: `rotate(${f.rot}deg)` }}>
          <img
            src={f.src}
            alt=""
            draggable={false}
            className="animate-float w-full drop-shadow-sm"
            style={{ animationDelay: `${f.delay}ms` }}
          />
        </div>
      ))}
    </div>
  );
}

/* ───────────── Page ───────────── */

export default function HeroPage({ dark, onToggleDark, onStartBooth }: HeroPageProps) {
  const text = dark ? "#f4f4f5" : "#111827";
  const sub = dark ? "#a1a1aa" : "#6b7280";

  return (
    <div
      className="relative min-h-[100dvh] overflow-hidden transition-colors duration-300"
      style={{ fontFamily: "'Outfit', sans-serif", backgroundColor: dark ? "#0f0f0f" : "#f8f8f8" }}
    >
      <NavBar dark={dark} onToggleDark={onToggleDark} onStartBooth={onStartBooth} />

      <main className="relative z-10 mx-auto grid max-w-6xl items-center gap-6 px-6 pb-20 pt-8 sm:pt-14 lg:grid-cols-[1.05fr_1fr] lg:gap-6 lg:pb-28 lg:pt-16">
        {/* Copy */}
        <section className="flex flex-col items-center text-center lg:items-start lg:text-left">

          <h1
            className="animate-fade-up text-5xl leading-[1.02] tracking-tight sm:text-7xl"
            style={{ ...reveal(100), fontWeight: 800, color: text }}
          >
            Strike a pose.
            <br />
            <span className="text-red-600 dark:text-red-400">
              Do it{" "}
              <span className="relative inline-block" style={{ fontFamily: "'Caveat', cursive", fontWeight: 700 }}>
                <span className="relative z-10 text-[1.15em]">again.</span>
                {/* hand-drawn underline */}
                <svg
                  viewBox="0 0 200 20"
                  preserveAspectRatio="none"
                  className="absolute -bottom-1 left-0 h-[0.28em] w-full"
                  aria-hidden
                >
                  <path d="M4 14 Q50 4 100 11 T196 8" fill="none" stroke="#7a1f2b" strokeOpacity="0.28" strokeWidth="5" strokeLinecap="round" />
                </svg>
              </span>
            </span>
          </h1>

          <p
            className="animate-fade-up mt-6 max-w-md text-base leading-relaxed sm:text-lg"
            style={{ ...reveal(200), fontWeight: 300, color: sub }}
          >
            {BRAND.name} turns your phone or laptop into a Korean-style photobooth. Pick a strip, snap your
            barkada or your special someone, then decorate with filters, frames and cute stickers.
          </p>

          <div
            className="animate-fade-up mt-8 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row"
            style={reveal(300)}
          >
            <button
              type="button"
              onClick={onStartBooth}
              className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-red-600 px-9 py-4 text-base text-white shadow-sm transition-colors hover:bg-red-700 active:scale-95 sm:w-auto"
              style={{ fontWeight: 700 }}
            >
              <Camera size={18} strokeWidth={2.5} />
              Start Photo Booth
            </button>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm transition-colors hover:text-red-600"
              style={{ color: sub, fontWeight: 600 }}
            >
              How it works <ArrowDown size={15} />
            </a>
          </div>

        </section>

        {/* Visual */}
        <section className="animate-fade-up mt-4 lg:mt-0" style={reveal(350)}>
          <HeroVisual />
        </section>
      </main>
    </div>
  );
}
