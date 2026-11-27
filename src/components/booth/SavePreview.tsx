import { useEffect, useState, type CSSProperties } from "react";
import { Download, Hand, X } from "lucide-react";

interface SavePreviewProps {
  blob: Blob;
  filename: string;
  onClose: () => void;
}

const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.userAgent.includes("Macintosh") && navigator.maxTouchPoints > 1);

/**
 * Fallback for phones when the share sheet isn't available (in-app browsers,
 * some Android browsers): show the finished photo full screen so it can be
 * saved to Photos / Gallery with a long-press — the one thing every mobile
 * browser supports.
 */
export default function SavePreview({ blob, filename, onClose }: SavePreviewProps) {
  const [url, setUrl] = useState<string | null>(null);
  const ios = isIOS();

  useEffect(() => {
    const u = URL.createObjectURL(blob);
    // Defer so we don't set state synchronously in the effect body.
    const t = setTimeout(() => setUrl(u), 0);
    return () => {
      clearTimeout(t);
      URL.revokeObjectURL(u);
    };
  }, [blob]);

  return (
    <div
      className="animate-fade-up fixed inset-0 z-[60] flex flex-col items-center justify-center gap-4 bg-black/85 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Save your photo"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white"
        aria-label="Close"
      >
        <X size={20} />
      </button>

      <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-neutral-900">
        <Hand size={16} className="text-red-600" />
        {ios ? "Press & hold the photo → “Save to Photos”" : "Press & hold the photo → “Download image”"}
      </div>

      {url && (
        <img
          src={url}
          alt="Your photo strip"
          className="max-h-[68dvh] max-w-full rounded-lg object-contain shadow-lg"
          // Allow the native long-press menu (don't block callouts/selection here).
          style={{ WebkitTouchCallout: "default", userSelect: "auto" } as CSSProperties}
        />
      )}

      {url && (
        <a
          href={url}
          download={filename}
          className="flex items-center gap-2 text-sm font-semibold text-white/80 underline-offset-4 hover:underline"
        >
          <Download size={15} /> Or save as a file
        </a>
      )}
    </div>
  );
}
