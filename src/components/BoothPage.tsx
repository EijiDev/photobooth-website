import { useState, useRef, useEffect } from "react";
import { Image, Type, Video, Camera } from "lucide-react";
import NavBar, { useNavBar } from "./layout/NavBar";

const filters = [
  { name: "Normal", style: "none" },
  { name: "B&W", style: "grayscale(100%)" },
  { name: "Vintage", style: "sepia(60%) contrast(90%) brightness(90%)" },
  { name: "Dreamy", style: "saturate(120%) brightness(110%) hue-rotate(10deg)" },
  { name: "Cool", style: "saturate(80%) hue-rotate(180deg) brightness(105%)" },
  { name: "Warm", style: "sepia(40%) saturate(150%) brightness(105%)" },
  { name: "Vivid", style: "saturate(200%) contrast(110%)" },
  { name: "Fade", style: "opacity(85%) saturate(60%) brightness(115%)" },
];

const modes = [
  { id: "single", label: "Single", icon: Image },
  { id: "strip", label: "Strip", icon: Type },
  { id: "boomerang", label: "Boomerang", icon: Video },
];

interface BoothPageProps {
  dark?: boolean;
  onBack?: () => void;
}

export default function BoothPage({ onBack }: Omit<BoothPageProps, "dark">) {
  const { dark, toggleDark } = useNavBar();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeMode, setActiveMode] = useState("single");
  const [activeFilter, setActiveFilter] = useState(0);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturing, setCapturing] = useState(false);

  useEffect(() => {
    startCamera();
    return () => { stream?.getTracks().forEach((t) => t.stop()); };
  }, []);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 1280, height: 720 },
      });
      setStream(s);
      if (videoRef.current) videoRef.current.srcObject = s;
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    setCapturing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.filter = filters[activeFilter].style;
      ctx.drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `snapbooth-${Date.now()}.png`;
        a.click();
        URL.revokeObjectURL(url);
        setTimeout(() => setCapturing(false), 500);
      });
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col transition-colors duration-300"
      style={{ fontFamily: "'Outfit', sans-serif", backgroundColor: dark ? "#0f0f0f" : "#f8f8f8" }}
    >
      <NavBar dark={dark} onToggleDark={toggleDark} onLogoClick={onBack} />

      {/* Mode Selector */}
      <div className="flex justify-center pt-6 pb-4">
        <div
          className="flex items-center gap-1 px-2 py-2 rounded-full transition-colors duration-300"
          style={{ backgroundColor: dark ? "#1a1a1a" : "#ffffff", boxShadow: "0 2px 12px rgba(0,0,0,0.08)" }}
        >
          {modes.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveMode(id)}
              className="flex items-center gap-2 px-5 py-2 rounded-full text-sm transition-all duration-200"
              style={{
                fontWeight: 600,
                backgroundColor: activeMode === id ? "#dc2626" : "transparent",
                color: activeMode === id ? "#ffffff" : dark ? "#a1a1aa" : "#6b7280",
              }}
            >
              <Icon size={15} strokeWidth={2} />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Camera Viewfinder */}
      <div className="flex-1 flex items-start justify-center px-6 pt-2 pb-4">
        <div
          className="relative w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl"
          style={{
            aspectRatio: "16/9",
            backgroundColor: "#000",
            border: `2px solid ${dark ? "#2a2a2a" : "#e5e7eb"}`,
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover scale-x-[-1]"
            style={{ filter: filters[activeFilter].style }}
          />
          {capturing && <div className="absolute inset-0 bg-white animate-ping opacity-80 rounded-3xl" />}
        </div>
      </div>

      {/* Filter Strip */}
      <div className="flex justify-center gap-4 px-6 pb-6 overflow-x-auto">
        {filters.map((f, i) => (
          <div
            key={f.name}
            className="flex flex-col items-center gap-2 cursor-pointer flex-shrink-0"
            onClick={() => setActiveFilter(i)}
          >
            <div
              className="w-16 h-16 rounded-full overflow-hidden transition-all duration-200"
              style={{
                border: activeFilter === i ? "3px solid #dc2626" : `3px solid ${dark ? "#2a2a2a" : "#e5e7eb"}`,
                boxShadow: activeFilter === i ? "0 0 0 2px rgba(220,38,38,0.3)" : "none",
              }}
            >
              <div
                className="w-full h-full"
                style={{
                  backgroundColor: ["#c0392b","#888","#c8a97a","#b8c0ff","#6ec6f5","#f4a261","#e63946","#ccc"][i],
                  filter: f.style,
                }}
              />
            </div>
            <span
              className="text-xs transition-colors duration-200"
              style={{
                fontWeight: activeFilter === i ? 700 : 400,
                color: activeFilter === i ? "#dc2626" : dark ? "#71717a" : "#6b7280",
              }}
            >
              {f.name}
            </span>
          </div>
        ))}
      </div>

      {/* Capture Button */}
      <div className="flex justify-center pb-8">
        <button
          onClick={handleCapture}
          className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 active:scale-95 transition-all duration-200 flex items-center justify-center shadow-lg shadow-red-300/40"
          style={{ border: "4px solid rgba(220,38,38,0.25)" }}
        >
          <Camera size={24} strokeWidth={2} className="text-white" />
        </button>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
