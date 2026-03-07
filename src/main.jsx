import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { useGLTF } from "@react-three/drei";
import "./index.css";
import App from "./App.jsx";

// Kick off GLB downloads immediately — before any Canvas mounts
useGLTF.preload("/CHARACTER.glb");
useGLTF.preload("/hueawi+name.glb");
useGLTF.preload("/battery.glb");
useGLTF.preload("/city.glb");

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
