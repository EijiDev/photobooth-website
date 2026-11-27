import { useCallback, useEffect, useRef, useState } from "react";
import type { RawShot } from "../booth/types";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const uid = () =>
  globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export type ShootResult = "complete" | "partial" | "cancelled" | "camera-not-ready";

/**
 * Runs the 3-2-1 countdown → capture → flash sequence for one or more slots.
 * Each shot is stored raw (unfiltered, uncropped), so filters and retakes can
 * be changed later without quality loss.
 */
export function useBoothSession(totalShots: number, capture: () => HTMLCanvasElement | null) {
  const [shots, setShots] = useState<(RawShot | null)[]>(() => Array(totalShots).fill(null));
  const [countdown, setCountdown] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [flashKey, setFlashKey] = useState(0);

  // Source of truth for the async loop (state updates are async).
  const shotsRef = useRef<(RawShot | null)[]>(shots);
  // Bumping this cancels any running sequence.
  const runId = useRef(0);

  useEffect(() => {
    const ids = runId;
    return () => {
      ids.current++; // cancel on unmount
    };
  }, []);

  const shoot = useCallback(
    async (indices: number[], seconds: number): Promise<ShootResult> => {
      const id = ++runId.current;
      const alive = () => runId.current === id;

      for (const index of indices) {
        setActiveIndex(index);
        for (let s = seconds; s > 0; s--) {
          if (!alive()) return "cancelled";
          setCountdown(s);
          await sleep(1000);
        }
        if (!alive()) return "cancelled";
        setCountdown(null);

        const canvas = capture();
        if (!canvas) {
          setActiveIndex(null);
          return "camera-not-ready";
        }
        const next = [...shotsRef.current];
        next[index] = { id: uid(), canvas };
        shotsRef.current = next;
        setShots(next);
        setFlashKey((k) => k + 1);
        // Let the flash play (+ a beat to re-pose in countdown mode). Short in instant mode.
        await sleep(seconds === 0 ? 250 : 650);
      }

      if (!alive()) return "cancelled";
      setActiveIndex(null);
      return shotsRef.current.every(Boolean) ? "complete" : "partial";
    },
    [capture],
  );

  const cancel = useCallback(() => {
    runId.current++;
    setCountdown(null);
    setActiveIndex(null);
  }, []);

  const reset = useCallback(() => {
    runId.current++;
    const empty = Array(totalShots).fill(null);
    shotsRef.current = empty;
    setShots(empty);
    setCountdown(null);
    setActiveIndex(null);
  }, [totalShots]);

  return { shots, countdown, activeIndex, flashKey, running: activeIndex !== null, shoot, cancel, reset };
}
