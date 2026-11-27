import { steps } from "../../utils/instructions.constants";
import boothImage from "../../assets/booth-img.jpg";

interface HowItWorksProps {
  dark?: boolean;
}

export default function HowItWorks({ dark = false }: HowItWorksProps) {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-4 px-4 py-16 sm:px-16 sm:py-20 transition-colors duration-300"
      style={{
        fontFamily: "'Outfit', sans-serif",
        backgroundColor: dark ? "#111111" : "#ffffff",
      }}
    >
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16">
        <div className="min-w-0 lg:flex-1">
          <h2
            className="text-4xl sm:text-5xl mb-10 transition-colors duration-300"
            style={{ fontWeight: 800, color: dark ? "#f4f4f5" : "#111827" }}
          >
            How it works
          </h2>

          <div className="flex flex-col gap-8">
            {steps.map(({ number, title, description }) => (
              <div key={number} className="flex items-start gap-5">
                {/* Number badge */}
                <div
                  className="w-9 h-9 rounded-full bg-red-600 text-white flex items-center justify-center flex-shrink-0 text-sm"
                  style={{ fontWeight: 700 }}
                >
                  {number}
                </div>
                {/* Text */}
                <div>
                  <p
                    className="text-lg mb-1 transition-colors duration-300"
                    style={{
                      fontWeight: 700,
                      color: dark ? "#f4f4f5" : "#111827",
                    }}
                  >
                    {title}
                  </p>
                  <p
                    className="text-base leading-relaxed transition-colors duration-300"
                    style={{
                      fontWeight: 300,
                      color: dark ? "#71717a" : "#6b7280",
                    }}
                  >
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Mock phone/tablet frame */}
        <div className="shrink-0 flex relative w-full max-w-sm lg:w-auto">
          <div
            className="relative w-full lg:w-96 aspect-[2/3] lg:aspect-auto lg:h-[580px] rounded-3xl overflow-hidden shadow-lg border-4 transition-colors duration-300"
            style={{
              borderColor: dark ? "#2a2a2a" : "#e5e7eb",
              backgroundColor: "#1a1a1a",
            }}
          >
            <img
              src={boothImage}
              alt="Booth preview"
              className="w-full h-full object-cover grayscale"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
