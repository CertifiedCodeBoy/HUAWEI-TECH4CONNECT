import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import PEDDashboard from "./components/Dashboard/PEDDashboard";
import HexSimulation from "./components/HexSimulation/HexSimulation";
import AmjedTest from "./components/amjedtest/amjed";
import House from "./components/House/House";
import Battery from "./components/Battery/Battery";
import PowerGrid from "./components/PowerGrid/PowerGrid";
import "./App.css";

function WiresOverlay() {
  return (
    <svg
      className="wires-overlay"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      {/* === BLUE wires: Footsteps (top) → Battery (bottom) === */}
      <path
        className="wire-track"
        vectorEffect="non-scaling-stroke"
        d="M 25 8 V 20 H 15 V 80 H 40 V 95"
      />
      <path
        className="wire-track"
        vectorEffect="non-scaling-stroke"
        d="M 21 8 V 23 H 10 V 77 H 35 V 95"
      />
      <path
        className="wire-track"
        vectorEffect="non-scaling-stroke"
        d="M 29 8 V 17 H 20 V 83 H 45 V 95"
      />

      <path
        className="wire-pulse wire-pulse--blue"
        vectorEffect="non-scaling-stroke"
        d="M 25 8 V 20 H 15 V 80 H 40 V 95"
      />
      <path
        className="wire-pulse wire-pulse--blue"
        vectorEffect="non-scaling-stroke"
        d="M 21 8 V 23 H 10 V 77 H 35 V 95"
        style={{ animationDelay: "0.5s" }}
      />
      <path
        className="wire-pulse wire-pulse--blue"
        vectorEffect="non-scaling-stroke"
        d="M 29 8 V 17 H 20 V 83 H 45 V 95"
        style={{ animationDelay: "1s" }}
      />

      {/* === RED wires: Smart City (middle) → Battery (bottom) === */}
      <path
        className="wire-track"
        vectorEffect="non-scaling-stroke"
        d="M 75 38 V 50 H 85 V 80 H 60 V 95"
      />
      <path
        className="wire-track"
        vectorEffect="non-scaling-stroke"
        d="M 79 38 V 53 H 90 V 77 H 65 V 95"
      />
      <path
        className="wire-track"
        vectorEffect="non-scaling-stroke"
        d="M 71 38 V 47 H 80 V 83 H 55 V 95"
      />

      <path
        className="wire-pulse wire-pulse--red"
        vectorEffect="non-scaling-stroke"
        d="M 75 38 V 50 H 85 V 80 H 60 V 95"
      />
      <path
        className="wire-pulse wire-pulse--red"
        vectorEffect="non-scaling-stroke"
        d="M 79 38 V 53 H 90 V 77 H 65 V 95"
        style={{ animationDelay: "0.5s" }}
      />
      <path
        className="wire-pulse wire-pulse--red"
        vectorEffect="non-scaling-stroke"
        d="M 71 38 V 47 H 80 V 83 H 55 V 95"
        style={{ animationDelay: "1s" }}
      />
    </svg>
  );
}

function MainLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <PEDDashboard />
        <div className="simulation-stack">
          <WiresOverlay />
          <HexSimulation />
          <House />
          <PowerGrid />
          <Battery />
        </div>
      </main>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />} />
        <Route path="/amjed" element={<AmjedTest />} />
      </Routes>
    </BrowserRouter>
  );
}
