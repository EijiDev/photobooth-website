import { useEffect, useRef, useState } from "react";
import { features } from "../../utils/features.constants";

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  dark,
  index,
}: {
  icon: any;
  title: string;
  description: string;
  dark: boolean;
  index: number;
}) {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className="flex flex-col p-8 rounded-2xl transition-all duration-700"
      style={{
        border: `1px solid ${dark ? "#1f1f1f" : "#e5e7eb"}`,
        backgroundColor: dark ? "#141414" : "#ffffff",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transitionDelay: `${index * 100}ms`,
      }}
    >
      {/* Icon box */}
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-8 transition-colors duration-300"
        style={{ backgroundColor: dark ? "#1a0a0a" : "#fff1f2" }}
      >
        <Icon size={20} strokeWidth={1.75} className="text-red-500" />
      </div>

      {/* Title */}
      <h3
        className="text-lg mb-2 transition-colors duration-300"
        style={{
          fontWeight: 700,
          fontFamily: "'Outfit', sans-serif",
          color: dark ? "#f4f4f5" : "#111827",
        }}
      >
        {title}
      </h3>

      {/* Description */}
      <p
        className="text-sm leading-relaxed transition-colors duration-300"
        style={{
          fontWeight: 300,
          fontFamily: "'Outfit', sans-serif",
          color: dark ? "#71717a" : "#6b7280",
        }}
      >
        {description}
      </p>
    </div>
  );
}

export default function Features({ dark = false }: { dark?: boolean }) {
  return (
    <section
      className="px-10 py-20 transition-colors duration-300"
      style={{
        fontFamily: "'Outfit', sans-serif",
        backgroundColor: dark ? "#0f0f0f" : "#f8f8f8",
      }}
    >
      {/* Heading */}
      <div className="text-center mb-14">
        <h2
          className="text-5xl mb-3 transition-colors duration-300"
          style={{
            fontWeight: 800,
            color: dark ? "#f4f4f5" : "#111827",
          }}
        >
          Everything you need
        </h2>
        <p
          className="text-base transition-colors duration-300"
          style={{
            fontWeight: 300,
            color: dark ? "#71717a" : "#6b7280",
          }}
        >
          Packed with features to make every capture perfect.
        </p>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-4 gap-5 max-w-6xl mx-auto">
        {features.map((f, i) => (
          <FeatureCard
            key={f.title}
            icon={f.icon}
            title={f.title}
            description={f.description}
            dark={dark}
            index={i}
          />
        ))}
      </div>
    </section>
  );
}
