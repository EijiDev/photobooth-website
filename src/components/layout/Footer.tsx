import { Camera } from "lucide-react";

interface FooterProps {
  dark?: boolean;
}

export default function Footer({ dark = false }: FooterProps) {
  return (
    <footer
      className="px-10 py-8 transition-colors duration-300"
      style={{
        fontFamily: "'Outfit', sans-serif",
        borderTop: `1px solid ${dark ? "#2f2f2f" : "#e5e7eb"}`,
        backgroundColor: dark ? "#0f0f0f" : "#f8f8f8",
      }}
    >
      <div className="max-w-6xl mx-auto flex flex-col items-center justify-center gap-3">
        <p className="text-sm" style={{ fontWeight: 300, color: dark ? "#71717a" : "#9ca3af" }}>
          © {new Date().getFullYear()} SnapBooth. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
