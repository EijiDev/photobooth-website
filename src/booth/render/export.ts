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

export type ShareResult = "shared" | "cancelled" | "unsupported";

/** Uses the native share sheet (Messenger, IG, etc. on phones) when files can be shared. */
export async function shareBlob(blob: Blob, filename: string): Promise<ShareResult> {
  const file = new File([blob], filename, { type: "image/png" });
  if (!navigator.canShare?.({ files: [file] })) return "unsupported";
  try {
    await navigator.share({ files: [file], title: BRAND.name });
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
