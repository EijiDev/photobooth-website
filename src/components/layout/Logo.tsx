import { BRAND } from "../../brand";

/**
 * Logo mark: a tilted maroon photo strip with three poses — smile, wink, tongue out.
 * (The same artwork, inverted, is the favicon in public/favicon.svg.)
 */
export function LogoMark({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden>
      <g transform="rotate(-8 32 32)">
        <rect x="19" y="3" width="26" height="58" rx="5" fill="#7a1f2b" />
        {/* frames */}
        <rect x="23" y="7.5" width="18" height="13.5" rx="2.5" fill="#fff" />
        <rect x="23" y="23.5" width="18" height="13.5" rx="2.5" fill="#fff" />
        <rect x="23" y="39.5" width="18" height="13.5" rx="2.5" fill="#fff" />
        {/* pose 1: smile */}
        <circle cx="29" cy="12.8" r="1.25" fill="#7a1f2b" />
        <circle cx="35" cy="12.8" r="1.25" fill="#7a1f2b" />
        <path d="M28.6 16 Q32 19.2 35.4 16" fill="none" stroke="#7a1f2b" strokeWidth="1.5" strokeLinecap="round" />
        {/* pose 2: wink + grin */}
        <path d="M27.6 29 Q29 27.6 30.4 29" fill="none" stroke="#7a1f2b" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="35" cy="28.6" r="1.25" fill="#7a1f2b" />
        <path d="M28.4 31.4 H35.6 Q35.2 35 32 35 Q28.8 35 28.4 31.4Z" fill="#7a1f2b" />
        {/* pose 3: tongue out */}
        <circle cx="29" cy="44.6" r="1.25" fill="#7a1f2b" />
        <circle cx="35" cy="44.6" r="1.25" fill="#7a1f2b" />
        <path d="M28.6 47.4 Q32 50.4 35.4 47.4" fill="none" stroke="#7a1f2b" strokeWidth="1.5" strokeLinecap="round" />
        <ellipse cx="33.4" cy="49.6" rx="1.7" ry="2" fill="#ff8fa3" />
        {/* tiny heart in the caption area */}
        <path d="M32 59 C29.6 57.4 29.4 55.6 30.6 55.2 C31.3 55 31.8 55.4 32 55.9 C32.2 55.4 32.7 55 33.4 55.2 C34.6 55.6 34.4 57.4 32 59Z" fill="#fff" />
      </g>
      {/* sparkle */}
      <path d="M52 5 Q52 10 57 10 Q52 10 52 15 Q52 10 47 10 Q52 10 52 5Z" fill="#c96e7d" />
      <path d="M11 46 Q11 49 14 49 Q11 49 11 52 Q11 49 8 49 Q11 49 11 46Z" fill="#dfa2ac" />
    </svg>
  );
}

/** Logo mark + "pose & repeat" wordmark (the "&" is hand-written in maroon). */
export default function Logo({
  size = 28,
  dark = false,
  className = "",
}: {
  size?: number;
  dark?: boolean;
  className?: string;
}) {
  return (
    <span className={`inline-flex select-none items-center gap-1.5 ${className}`} aria-label={BRAND.name}>
      <LogoMark size={size} />
      <span
        className="whitespace-nowrap leading-none tracking-tight"
        style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 800, fontSize: size * 0.62, color: dark ? "#f4f4f5" : "#111827" }}
        aria-hidden
      >
        pose
        <span
          className="inline-block -rotate-6 text-red-600 dark:text-red-400"
          style={{
            fontFamily: "'Caveat', cursive",
            fontWeight: 700,
            fontSize: size * 0.95,
            lineHeight: 0.6,
            // Caveat's "&" overhangs its advance width, so it needs extra room on the right.
            marginLeft: size * 0.06,
            marginRight: size * 0.3,
          }}
        >
          &amp;
        </span>
        repeat
      </span>
    </span>
  );
}
