import { Sun, Moon } from "lucide-react";
import Logo from "./Logo";

interface NavBarProps {
  dark: boolean;
  onToggleDark: () => void;
  onStartBooth?: () => void;
  onLogoClick?: () => void;
}

export default function NavBar({ dark, onToggleDark, onStartBooth, onLogoClick }: NavBarProps) {
  return (
    <header
      className="relative z-10 flex items-center justify-between px-4 py-4 transition-colors duration-300 sm:px-10"
      style={{ borderBottom: `1px solid ${dark ? "#1f1f1f" : "#f3f4f6"}` }}
    >
      <button type="button" onClick={onLogoClick} className="transition-transform hover:-rotate-2 active:scale-95">
        <Logo size={30} dark={dark} />
      </button>
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={onToggleDark}
          aria-label="Toggle dark mode"
          className="transition-colors duration-200"
          style={{ color: dark ? "#a1a1aa" : "#9ca3af" }}
        >
          {dark ? <Moon size={18} strokeWidth={1.5} /> : <Sun size={18} strokeWidth={1.5} />}
        </button>
        {onStartBooth && (
          <button
            type="button"
            onClick={onStartBooth}
            className="rounded-full bg-red-600 px-5 py-2.5 text-sm text-white transition-colors hover:bg-red-700 sm:px-6"
            style={{ fontWeight: 700 }}
          >
            Start Booth
          </button>
        )}
      </div>
    </header>
  );
}
