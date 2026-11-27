import { useCallback, useEffect, useRef, type CSSProperties } from "react";

interface StreamVideoProps {
  stream: MediaStream | null;
  className?: string;
  style?: CSSProperties;
  /** Receives the <video> element (used to register the capture source). */
  onElement?: (el: HTMLVideoElement | null) => void;
}

/** A muted, inline <video> bound to a MediaStream. Several can share one stream. */
export default function StreamVideo({ stream, className, style, onElement }: StreamVideoProps) {
  const local = useRef<HTMLVideoElement | null>(null);

  const setRef = useCallback(
    (el: HTMLVideoElement | null) => {
      local.current = el;
      onElement?.(el);
    },
    [onElement],
  );

  useEffect(() => {
    const v = local.current;
    if (!v) return;
    if (v.srcObject !== stream) v.srcObject = stream;
    if (stream) v.play().catch(() => {});
  }, [stream]);

  return <video ref={setRef} autoPlay playsInline muted className={className} style={style} />;
}
