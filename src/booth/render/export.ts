/** Download / share helpers. Everything stays on the device — nothing is uploaded. */
import { BRAND } from "../../brand";

export function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not export the image."))),
      "image/png",
    ),
  );
}

export function downloadBlob(blob: Blob, filename: string) {
  // Object URLs are more reliable than huge data: URLs (especially on iOS).
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

/** iPhone / iPad (iPadOS reports itself as a Mac with touch). */
export function isIOSDevice(): boolean {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.userAgent.includes("Macintosh") && navigator.maxTouchPoints > 1)
  );
}

/** Can this browser share image files (false in most in-app browsers)? */
export function canShareFiles(): boolean {
  try {
    return !!navigator.canShare?.({ files: [new File([""], "x.png", { type: "image/png" })] });
  } catch {
    return false;
  }
}

export type ShareResult = "shared" | "cancelled" | "unsupported";

/** Uses the native share sheet (Messenger, IG, etc. on phones) when files can be shared. */
export async function shareBlob(blob: Blob, filename: string): Promise<ShareResult> {
  const file = new File([blob], filename, { type: "image/png" });
  if (!navigator.canShare?.({ files: [file] })) return "unsupported";
  try {
    // Files only: on iPhone, adding a title/text can hide the "Save Image" option.
    await navigator.share({ files: [file] });
    return "shared";
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") return "cancelled";
    throw err;
  }
}

export function exportFilename() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${BRAND.slug}-${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}.png`;
}
