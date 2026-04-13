import { useState } from "react";
import SnapBooth from "./components/pages/HeroPage";
import Features from "./components/pages/Features";
import HowItWorks from "./components/pages/Instruction";
import SetupPage from "./components/pages/SetUpPage";
import BoothPage from "./components/pages/BoothPage";
import Footer from "./components/layout/Footer";

type Page = "home" | "setup" | "booth";

interface BoothConfig {
  mode: string;
  grid: string;
  frame: string;
}

function App() {
  const [page, setPage] = useState<Page>("home");
  const [dark, setDark] = useState(false);
  const [boothConfig, setBoothConfig] = useState<BoothConfig>({
    mode: "photo",
    grid: "single",
    frame: "none",
  });

  if (page === "setup") {
    return (
      <SetupPage
        dark={dark}
        onToggleDark={() => setDark((d) => !d)}
        onBack={() => setPage("home")}
        onOpenCamera={(config) => {
          setBoothConfig(config);
          setPage("booth");
        }}
      />
    );
  }

  if (page === "booth") {
    return (
      <BoothPage
        dark={dark}
        onToggleDark={() => setDark((d) => !d)}
        config={boothConfig}
        onBack={() => setPage("setup")}
        onHome={() => setPage("home")}
      />
    );
  }

  return (
    <div>
      <SnapBooth
        dark={dark}
        onToggleDark={() => setDark((d) => !d)}
        onStartBooth={() => setPage("setup")}
      />
      <Features dark={dark} />
      <HowItWorks dark={dark} />
      <Footer dark={dark} />
    </div>
  );
}

export default App;
