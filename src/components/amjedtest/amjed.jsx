import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF } from "@react-three/drei";
import "./amjed.css";

// A simple 3D model viewer for Amjed's tests
function TestModel() {
  // You can replace '/CHARACTER.glb' with any model you want to test
  const { scene } = useGLTF("/CHARACTER.glb");
  return <primitive object={scene} scale={2} position={[0, -1.5, 0]} />;
}

export default function AmjedTest() {
  return (
    <div className="amjed-container">
      <h2>Amjed's 3D Model Testing Workspace</h2>
      <div className="canvas-wrapper">
        <Canvas camera={{ position: [0, 2, 5], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1.5} />
          <Environment preset="city" />
          <React.Suspense fallback={null}>
            <TestModel />
          </React.Suspense>
          <OrbitControls makeDefault />
        </Canvas>
      </div>
    </div>
  );
}
