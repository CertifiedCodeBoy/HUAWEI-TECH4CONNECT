import { Suspense, useRef, useEffect, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { Html, useProgress } from "@react-three/drei";
import * as THREE from "three";
import Model3D from "./Model3D";
import "./Hero.css";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useFrame, useThree } from "@react-three/fiber";

// ── Minimal loader ────────────────────────────────────────────────────────────
function Loader() {
  const { progress } = useProgress();
  return (
    <Html center>
      <div className="hero-loader">
        <div className="hero-loader-bar" style={{ width: `${progress}%` }} />
        <span>{Math.round(progress)}%</span>
      </div>
    </Html>
  );
}
// ── Repelling Particles ──────────────────────────────────────────────
const _plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const _ray = new THREE.Raycaster();
const _mouseW = new THREE.Vector3();
const _ndc = new THREE.Vector2();

function RepellingParticles({
  mouseRef,
  count,
  color,
  baseSize,
  spread,
  opacity = 0.5,
}) {
  const pointsRef = useRef();
  const { camera } = useThree();

  const { initial, positions, geometry, material } = useMemo(() => {
    const init = new Float32Array(count * 3);
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * spread[0];
      const y = (Math.random() - 0.5) * spread[1];
      const z = (Math.random() - 0.5) * spread[2];
      init[i * 3] = x;
      init[i * 3 + 1] = y;
      init[i * 3 + 2] = z;
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      sz[i] = baseSize * (0.8 + Math.random() * 0.4);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sz, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uColor: { value: new THREE.Color(color) },
        uOpacity: { value: opacity },
      },
      vertexShader: /* glsl */ `
        attribute float aSize;
        void main() {
          vec4 mv = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * (100.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        uniform float uOpacity;
        void main() {
          float d = length(gl_PointCoord - 0.5);
          if (d > 0.5) discard;
          float alpha = smoothstep(0.5, 0.05, d) * uOpacity;
          gl_FragColor = vec4(uColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
    });
    return { initial: init, positions: pos, geometry: geo, material: mat };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useFrame(() => {
    if (!pointsRef.current) return;

    _ndc.set(mouseRef.current.x, mouseRef.current.y);
    _ray.setFromCamera(_ndc, camera);
    _ray.ray.intersectPlane(_plane, _mouseW);

    const repelRadius = 1.2;
    const repelForce = 0.06;
    const returnSpeed = 0.015;
    const posAttr = geometry.attributes.position;

    for (let i = 0; i < count; i++) {
      const ix = i * 3;
      let px = positions[ix];
      let py = positions[ix + 1];
      let pz = positions[ix + 2];

      const dx = px - _mouseW.x;
      const dy = py - _mouseW.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < repelRadius && dist > 0.001) {
        const f = (1 - dist / repelRadius) * repelForce;
        px += (dx / dist) * f;
        py += (dy / dist) * f;
      }

      px += (initial[ix] - px) * returnSpeed;
      py += (initial[ix + 1] - py) * returnSpeed;
      pz += (initial[ix + 2] - pz) * returnSpeed;

      positions[ix] = px;
      positions[ix + 1] = py;
      positions[ix + 2] = pz;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <primitive object={geometry} attach="geometry" />
      <primitive object={material} attach="material" />
    </points>
  );
}
// ── Hero ──────────────────────────────────────────────────────────────────────
export default function Hero() {
  // Scroll progress stored as a ref → no React re-renders on scroll
  const scrollRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0 });
  const zoneRef = useRef(null);
  const canvasWrap = useRef(null);

  // Update scrollRef on scroll — pure ref write, zero re-renders
  useEffect(() => {
    const onScroll = () => {
      const maxScroll =
        document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return;
      scrollRef.current = Math.min(1, Math.max(0, window.scrollY / maxScroll));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Mouse NDC
  useEffect(() => {
    const el = canvasWrap.current;
    if (!el) return;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - r.top) / r.height) * 2 + 1;
    };
    const onLeave = () => {
      mouseRef.current.x = 0;
      mouseRef.current.y = 0;
    };
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  // ── Depth parallax — smooth CSS custom properties for DOM layers ─────────
  useEffect(() => {
    let rafId;
    const smooth = { x: 0, y: 0 };

    const tick = () => {
      const mx = mouseRef.current?.x ?? 0;
      const my = mouseRef.current?.y ?? 0;
      smooth.x += (mx - smooth.x) * 0.04;
      smooth.y += (my - smooth.y) * 0.04;

      const root = zoneRef.current;
      if (root) {
        root.style.setProperty("--mx", smooth.x.toFixed(4));
        root.style.setProperty("--my", smooth.y.toFixed(4));
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, []);

  return (
    /* 100vh hero zone — no extra scroll height, no black gap */
    <div className="hero-zone" ref={zoneRef}>
      <div className="hero-sticky">
        {/* Cosmic / nebula background — behind canvas */}
        <div className="hero-bg" />

        {/* Light source overlay in top-left corner */}
        <div className="hero-lightsource" />

        {/* Logo moved to Navbar */}

        {/* Golden glow behind the 3D model */}
        <div className="hero-glow" />

        {/* 3-D canvas fills the full sticky viewport */}
        <div className="hero-canvas" ref={canvasWrap}>
          <Canvas
            /*
              dpr capped at 1.5 — prevents rendering at 3× on Retina displays.
              frameloop="always" lets useFrame animate smoothly.
              No antialias (we skip post-processing entirely for performance).
            */
            dpr={[1, 1.5]}
            camera={{ position: [0, -0.3, 2.8], fov: 40 }}
            gl={{
              outputColorSpace: THREE.SRGBColorSpace,
              toneMapping: THREE.ACESFilmicToneMapping,
              toneMappingExposure: 1.1,
              antialias: false,
              powerPreference: "high-performance",
            }}
            frameloop="always"
          >
            {/* ── Lights (no Environment HDR = faster) ── */}
            <ambientLight intensity={0.45} />
            <directionalLight
              position={[4, 8, 14]}
              intensity={1.2}
              color="#fffce2"
            />
            <directionalLight
              position={[-4, 3, -2]}
              intensity={0.9}
              color="#c9e8ff"
            />
            <directionalLight
              position={[0, 2, -6]}
              intensity={0.6}
              color="#ffe0c8"
            />
            {/* Warm fill from top-left for the Huawei glow */}
            <pointLight
              position={[-5, 5, 2]}
              intensity={12}
              color="#ff5522"
              distance={18}
              decay={2}
            />

            <Suspense fallback={<Loader />}>
              <Model3D scrollRef={scrollRef} mouseRef={mouseRef} />

              <EffectComposer disableNormalPass>
                <Bloom
                  luminanceThreshold={0.2}
                  mipmapBlur
                  intensity={0.9}
                  radius={0.6}
                />
              </EffectComposer>
            </Suspense>

            {/* Repelling dust particles */}
            <RepellingParticles
              mouseRef={mouseRef}
              count={120}
              color="#ffffff"
              baseSize={0.15}
              spread={[8, 5, 3]}
              opacity={0.5}
            />
            <RepellingParticles
              mouseRef={mouseRef}
              count={52}
              color="#ff0000"
              baseSize={0.2}
              spread={[7, 4.5, 3]}
              opacity={0.4}
            />

            {/* NO EffectComposer / Bloom / SMAA / ContactShadows
                These were the primary performance killers. */}
          </Canvas>
        </div>
      </div>
    </div>
  );
}
