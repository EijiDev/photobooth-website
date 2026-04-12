import { useState } from "react";
import { Camera, Sun, Moon } from "lucide-react";

interface NavBarProps {
  dark: boolean;
  onToggleDark: () => void;
  onStartBooth?: () => void;
  onLogoClick?: () => void;
}

export default function NavBar({ dark, onToggleDark, onStartBooth, onLogoClick }: NavBarProps) {
  return (
    <header
      className="flex items-center justify-between px-10 py-4 relative z-10 transition-colors duration-300"
      style={{ borderBottom: `1px solid ${dark ? "#1f1f1f" : "#f3f4f6"}` }}
    >
      <div
        className="flex items-center gap-2 text-red-600 text-base tracking-tight cursor-pointer select-none"
        style={{ fontWeight: 700 }}
        onClick={onLogoClick}
      >
        <Camera size={18} strokeWidth={2.5} />
        <span>SnapBooth</span>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleDark}
          className="transition-colors duration-200"
          style={{ color: dark ? "#a1a1aa" : "#9ca3af" }}
        >
          {dark ? <Moon size={18} strokeWidth={1.5} /> : <Sun size={18} strokeWidth={1.5} />}
        </button>
        <button
          onClick={onStartBooth}
          className="bg-red-600 hover:bg-red-700 transition-colors text-white text-sm px-6 py-2.5 rounded-full"
          style={{ fontWeight: 700 }}
        >
          Start Booth
        </button>
      </div>
    </header>
  );
}

export function useNavBar() {
  const [dark, setDark] = useState(false);
  return { dark, toggleDark: () => setDark((d) => !d) };
}