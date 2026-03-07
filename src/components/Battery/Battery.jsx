import React, { Suspense, useRef } from "react";
import { Canvas, useFrame, invalidate } from "@react-three/fiber";
import { Environment, useGLTF, Clone, Float } from "@react-three/drei";
import * as THREE from "three";
import { useInView } from "../../hooks/useInView";
import "./Battery.css";

function BatteryGroup() {
  const { scene } = useGLTF("/battery.glb");
  const groupRef = useRef();

  // Parallax effect based on pointer
  useFrame((state) => {
    if (!groupRef.current) return;
    const targetX = (state.pointer.x * Math.PI) / 12;
    const targetY = (state.pointer.y * Math.PI) / 12;

    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetX,
      0.05,
    );
    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      -targetY,
      0.05,
    );
    invalidate();
  });

  return (
    <group ref={groupRef} position={[0, -0.5, 0]}>
      <Float speed={2} rotationIntensity={0.2} floatIntensity={0.3}>
        {/* Render 3 batteries right next to each other */}
        <Clone
          object={scene}
          position={[-1.6, 0, 0]}
          scale={1.5}
          rotation={[0, -Math.PI / 8, 0]}
        />
        <Clone
          object={scene}
          position={[0, 0, 0]}
          scale={1.5}
          rotation={[0, -Math.PI / 8, 0]}
        />
        <Clone
          object={scene}
          position={[1.6, 0, 0]}
          scale={1.5}
          rotation={[0, -Math.PI / 8, 0]}
        />
      </Float>
    </group>
  );
}

export default function Battery() {
  const [sentinelRef, inView] = useInView("400px");
  return (
    <section className="battery-section" ref={sentinelRef}>
      <div className="battery-shell">
        <div className="battery-copy">
          <p className="battery-label">Energy Storage</p>
          <h2 className="battery-headline">SCALABLE POWER CELLS</h2>
          <p className="battery-description">
            Harnessed footprint electricity seamlessly cycles into continuous
            high-capacity storage. Our array of modular batteries ensures zero
            wastage, acting as an uninterrupted baseline for the smart urban
            grid.
          </p>
        </div>

        <div className="battery-stage glow-container">
          <div className="battery-canvas">
            {inView ? <Canvas
              camera={{ position: [0, 1.2, 7.5], fov: 35 }}
              dpr={1}
              frameloop="demand"
              gl={{
                antialias: false,
                toneMapping: THREE.ACESFilmicToneMapping,
                powerPreference: "high-performance",
              }}
            >
              <color attach="background" args={["#080808"]} />

              {/* Lighting */}
              <ambientLight intensity={0.15} />
              <directionalLight position={[6, 8, 5]} intensity={1.0} />

              {/* Dynamic colored accent lights for the bloomy glow */}
              <pointLight
                position={[-4, 2, 3]}
                intensity={2.5}
                color="#ff3b26"
                distance={15}
              />
              <pointLight
                position={[4, -1, -2]}
                intensity={1.5}
                color="#ff855b"
                distance={15}
              />

              <Environment preset="studio" environmentIntensity={0.15} />

              <Suspense fallback={null}>
                <BatteryGroup />
              </Suspense>
            </Canvas> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
