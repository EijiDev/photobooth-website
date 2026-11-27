import { useState } from "react";
import HeroPage from "./components/pages/HeroPage";
import Features from "./components/pages/Features";
import HowItWorks from "./components/pages/Instruction";
import SetupPage from "./components/pages/SetUpPage";
import BoothPage from "./components/pages/BoothPage";
import Footer from "./components/layout/Footer";
import type { BoothConfig } from "./booth/types";
import { DEFAULT_FRAME_ID, getFrame } from "./booth/config/frames";

type Page = "home" | "setup" | "booth";

const defaultFrame = getFrame(DEFAULT_FRAME_ID);

function App() {
  const [page, setPage] = useState<Page>("home");
  const [dark, setDark] = useState(false);
  const [boothConfig, setBoothConfig] = useState<BoothConfig>({
    frameId: defaultFrame.id,
    count: defaultFrame.counts[0],
    themeId: defaultFrame.defaultTheme,
  });

  const go = (next: Page) => {
    setPage(next);
    window.scrollTo({ top: 0 });
  };
  const toggleDark = () => setDark((d) => !d);

  if (page === "setup") {
    return (
      <SetupPage
        dark={dark}
        onToggleDark={toggleDark}
        onBack={() => go("home")}
        initial={boothConfig}
        onOpenCamera={(config) => {
          setBoothConfig(config);
          go("booth");
        }}
      />
    );
  }

  if (page === "booth") {
    return (
      <BoothPage
        key={`${boothConfig.frameId}-${boothConfig.count}-${boothConfig.themeId}`}
        dark={dark}
        onToggleDark={toggleDark}
        config={boothConfig}
        onBack={() => go("setup")}
        onHome={() => go("home")}
      />
    );
  }

  return (
    <div>
      <HeroPage dark={dark} onToggleDark={toggleDark} onStartBooth={() => go("setup")} />
      <Features dark={dark} />
      <HowItWorks dark={dark} />
      <Footer dark={dark} />
    </div>
  );
}

export default App;
