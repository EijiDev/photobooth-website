import { useState } from "react";
import { compositeGrid } from "./compositeGrid";

export function useCapture(totalShots: number, grid: string, captureFrame: () => string) {
  const [shots, setShots] = useState<string[]>([]);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [finalImage, setFinalImage] = useState<string | null>(null);

  const handleCapture = (timerStr: string) => {
    const secs = parseInt(timerStr);
    let count = secs;
    setCountdown(count);
    const interval = setInterval(() => {
      count--;
      if (count === 0) {
        clearInterval(interval);
        setCountdown(null);
        const dataUrl = captureFrame();
        setShots(prev => {
          const next = [...prev, dataUrl];
          if (next.length >= totalShots) {
            compositeGrid(grid, next).then(setFinalImage);
          }
          return next;
        });
      } else {
        setCountdown(count);
      }
    }, 1000);
  };

  const handleDownload = (img: string | null) => {
    if (!img) return;
    const a = document.createElement("a");
    a.href = img;
    a.download = `snapbooth-${Date.now()}.png`;
    a.click();
  };

  const handleShare = async (img: string | null) => {
    if (!img) return;
    const res = await fetch(img);
    const blob = await res.blob();
    const file = new File([blob], "snapbooth.png", { type: "image/png" });
    if (navigator.share) await navigator.share({ files: [file], title: "SnapBooth" });
  };

  const handleRetake = () => {
    setShots([]);
    setFinalImage(null);
  };

  return { shots, countdown, finalImage, handleCapture, handleDownload, handleShare, handleRetake };
}
