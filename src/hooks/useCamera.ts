import { useCallback, useEffect, useRef, useState } from "react";
import { createCanvas, ctx2d } from "../booth/render/canvas";

export type Facing = "user" | "environment";

function cameraErrorMessage(err: unknown): string {
  if (!window.isSecureContext) {
    return "The camera only works over HTTPS (or on localhost). Open the site with https:// to take photos.";
  }
  const name = err instanceof DOMException ? err.name : "";
  if (name === "NotAllowedError")
    return "Camera access was blocked. Allow camera permission in your browser settings, then reload.";
  if (name === "NotFoundError" || name === "OverconstrainedError")
    return "No camera was found on this device.";
  if (name === "NotReadableError")
    return "Your camera is being used by another app. Close it and try again.";
  return "Couldn't start the camera. Please reload and try again.";
}

/** Use the widest zoom the camera allows (some phones default to a tighter crop). */
function zoomOut(stream: MediaStream) {
  const track = stream.getVideoTracks()[0];
  const caps = track?.getCapabilities?.() as (MediaTrackCapabilities & { zoom?: { min: number } }) | undefined;
  if (caps?.zoom) {
    track
      .applyConstraints({ advanced: [{ zoom: caps.zoom.min } as MediaTrackConstraintSet] })
      .catch(() => {});
  }
}

/**
 * Starts the camera while `active` is true and stops every track when it turns
 * false or the component unmounts. Safe under React StrictMode: a stream that
 * arrives after cleanup is stopped right away, so the camera light doesn't stay on.
 */
export function useCamera(active: boolean, facing: Facing) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    let current: MediaStream | null = null;

    const request = navigator.mediaDevices?.getUserMedia
      ? navigator.mediaDevices.getUserMedia({
          // 4:3 is the sensor's native shape: 16:9 modes crop it and look "zoomed in",
          // especially on phone front cameras.
          video: {
            facingMode: facing,
            width: { ideal: 1600 },
            height: { ideal: 1200 },
            aspectRatio: { ideal: 4 / 3 },
          },
          audio: false,
        })
      : Promise.reject(new Error("getUserMedia unavailable"));

    request
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        current = s;
        zoomOut(s);
        setStream(s);
        setError(null);
      })
      .catch((err) => {
        if (!cancelled) setError(cameraErrorMessage(err));
      });

    return () => {
      cancelled = true;
      current?.getTracks().forEach((t) => t.stop());
    };
  }, [active, facing]);

  /** Pass to the <video> that should be used for captures. */
  const attachVideo = useCallback((el: HTMLVideoElement | null) => {
    videoRef.current = el;
  }, []);

  const mirror = facing === "user";

  /** Grabs the current frame at full resolution (mirrored for selfies, like the preview). */
  const capture = useCallback((): HTMLCanvasElement | null => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || !video.videoWidth) return null;
    const c = createCanvas(video.videoWidth, video.videoHeight);
    const ctx = ctx2d(c);
    if (mirror) {
      ctx.translate(c.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0);
    return c;
  }, [mirror]);

  const getVideo = useCallback(() => videoRef.current, []);

  const live = active && stream?.active ? stream : null;
  return { stream: live, error: active ? error : null, attachVideo, capture, getVideo, mirror };
}
