import React, { Suspense, useRef } from "react";
import { Canvas, useFrame, invalidate } from "@react-three/fiber";
import { Environment, useGLTF, Float } from "@react-three/drei";
import * as THREE from "three";
import { useInView } from "../../hooks/useInView";
import "./House.css";

function CityGroup() {
  const { scene } = useGLTF("/city.glb");
  const groupRef = useRef();

  // Gentle float & slow rotation
  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y += 0.002;
    invalidate();
  });

  return (
    <group ref={groupRef} position={[0, -1, 0]}>
      <Float speed={1.5} rotationIntensity={0.1} floatIntensity={0.2}>
        <primitive object={scene} scale={1.2} />
      </Float>
    </group>
  );
}

export default function SmartCity() {
  const [sentinelRef, inView] = useInView("400px");
  return (
    <section className="city-section" id="smart-city" ref={sentinelRef}>
      <div className="city-shell">
        <div className="city-stage glow-container">
          <div className="city-canvas">
            {inView ? <Canvas
              camera={{ position: [0, 6, 12], fov: 40 }}
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
              <ambientLight intensity={0.25} />
              <directionalLight position={[10, 10, 5]} intensity={1.2} />

              {/* Dynamic colored accent lights for the bloomy glow */}
              <pointLight
                position={[-4, 2, 3]}
                intensity={2.5}
                color="#00e5ff"
                distance={20}
              />
              <pointLight
                position={[4, -1, -2]}
                intensity={2.5}
                color="#ff3b26"
                distance={20}
              />

              <Environment preset="night" environmentIntensity={0.3} />

              <Suspense fallback={null}>
                <CityGroup />
              </Suspense>
            </Canvas> : null}
          </div>
        </div>

        <div className="city-copy">
          <p className="city-label">Interconnected Ecosystem</p>
          <h2 className="city-headline">SMART CITY GRID</h2>
          <p className="city-description">
            The generated power is distributed efficiently across the smart city
            infrastructure. Automated routing ensures energy flows seamlessly
            from steps to storage, powering streets, buildings, and daily life
            with zero emissions.
          </p>
        </div>
      </div>
    </section>
  );
}
