import { useState } from "react";
import SnapBooth from "./components/HeroPage";
import Features from "./components/Features";
import HowItWorks from "./components/Instruction";
import BoothPage from "./components/BoothPage";
import Footer from "./components/layout/Footer";

function App() {
  const [dark, setDark] = useState(false);
  const [inBooth, setInBooth] = useState(false);

  if (inBooth) {
    return <BoothPage dark={dark} onBack={() => setInBooth(false)} />;
  }
  return (
    <div
      className="transition-colors duration-300"
      style={{ backgroundColor: dark ? "#0f0f0f" : "#f8f8f8" }}
    >
      <SnapBooth onStartBooth={() => setInBooth(true)} />
      <Features dark={dark} />
      <HowItWorks dark={dark} />
      <Footer dark={dark} />
    </div>
  );
}

export default App;