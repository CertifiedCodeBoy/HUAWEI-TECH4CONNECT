import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls, useProgress } from "@react-three/drei";
import * as THREE from "three";
import HexSimulationScene from "./HexSimulationScene";
import "./HexSimulation.css";

function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div style={{ color: "#fff", fontSize: "0.9rem" }}>
        {Math.round(progress)}%
      </div>
    </Html>
  );
}

export default function HexSimulation() {
  return (
    <section className="hex-simulation-section">
      <div className="hex-simulation-shell">
        <div className="hex-simulation-stage glow-container">
          <div className="hex-simulation-canvas">
            <Canvas
              orthographic
              dpr={[1, 1.5]}
              shadows
              camera={{
                position: [4.5, 4.25, 4.9],
                zoom: 200,
                near: 0.1,
                far: 100,
              }}
              gl={{
                outputColorSpace: THREE.SRGBColorSpace,
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 1,
                antialias: false,
                powerPreference: "high-performance",
                localClippingEnabled: true,
              }}
              frameloop="always"
            >
              <Suspense fallback={<Loader />}>
                <HexSimulationScene />
                <OrbitControls
                  makeDefault
                  enableDamping
                  dampingFactor={0.08}
                  target={[-1.8, 1.4, 0]}
                  minPolarAngle={0.92}
                  maxPolarAngle={1.28}
                  minAzimuthAngle={-1.08}
                  maxAzimuthAngle={0.45}
                  enableZoom={false}
                />
              </Suspense>
            </Canvas>
          </div>
        </div>

        <div className="hex-simulation-copy">
          <p className="hex-simulation-label">Piezoelectric Energy Platform</p>
          <h2 className="hex-simulation-headline">FOOTSTEPS TO ELECTRICITY</h2>
          <p className="hex-simulation-description">
            Every step becomes stored power. This product transforms human
            motion into a clean electrical output through a durable triangular
            metal floor engineered for high-footfall environments.
          </p>
        </div>
      </div>
    </section>
  );
}
