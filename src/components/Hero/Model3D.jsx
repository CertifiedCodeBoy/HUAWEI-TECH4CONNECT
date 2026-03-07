import { useRef, useEffect } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

// useGLTF.preload("/mama.glb");

/*
  scrollRef — a React ref whose .current is a number 0→1.
  Reading from a ref inside useFrame is zero-cost: no React re-renders on scroll.
*/
export default function Model3D({ scrollRef, mouseRef }) {
  const groupRef = useRef();
  const { scene, animations } = useGLTF("/hueawi+name.glb");
  const { actions, names } = useAnimations(animations, groupRef);

  // ── Fix PBR colour spaces & shadows ───────────────────────────────────────
  useEffect(() => {
    scene.traverse((obj) => {
      if (!obj.isMesh) return;
      obj.castShadow = obj.receiveShadow = true;
      const mat = obj.material;
      if (!mat) return;
      ["map", "emissiveMap"].forEach((k) => {
        if (mat[k]) {
          mat[k].colorSpace = THREE.SRGBColorSpace;
          mat[k].needsUpdate = true;
        }
      });
      mat.needsUpdate = true;
    });
  }, [scene]);

  // ── Center model on its own bounding box, no empty space ─────────────────
  // This runs once after scene is ready. We offset the group so the
  // visual centre of the mesh sits exactly at world origin (0,0,0),
  // then shift it down so it appears lower on screen.
  useEffect(() => {
    if (!groupRef.current) return;
    const box = new THREE.Box3().setFromObject(groupRef.current);
    const centre = new THREE.Vector3();
    box.getCenter(centre);
    // Shift the group opposite to centre so origin == visual centre,
    // then pull down by 0.6 in local Y
    groupRef.current.position.set(-centre.x, -centre.y - 0.35, -centre.z);
  }, [scene]);

  // ── Keep animation paused at t=0 (static logo pose) ─────────────────────
  useEffect(() => {
    if (names.length > 0) {
      const a = actions[names[0]];
      if (a) {
        a.reset();
        a.play();
        // Use requestAnimationFrame to defer mutation after render
        requestAnimationFrame(() => {
          a.paused = true;
          a.time = 0;
        });
      }
    }
  }, [names, actions]);

  // ── Per-frame rotation + scroll Y offset: read refs – ZERO React re-renders
  const tiltX = useRef(0);
  const scrollY = useRef(0);
  const parallax = useRef({ x: 0, y: 0 });
  const outerRef = useRef();

  useFrame((state) => {
    if (!groupRef.current) return;

    const scroll = scrollRef.current ?? 0;

    // Scroll tilt: stays at the centred origin, tilts to face skyward
    const targetTilt = -scroll * (Math.PI * 0.48);
    tiltX.current = THREE.MathUtils.lerp(tiltX.current, targetTilt, 0.06);

    // Scroll-driven upward movement — starts early and moves further up
    const threshold = 0.001;
    const adjustedScroll = Math.max(0, (scroll - threshold) / (1 - threshold));
    const targetY = 0.2 + adjustedScroll * 2.2;
    scrollY.current = THREE.MathUtils.lerp(scrollY.current, targetY, 0.08);

    // Gentle floating bounce (~10px at fov 40 / z 2.8 ≈ 0.023 units)
    const elapsed = state.clock.getElapsedTime();
    const floatOffset = Math.sin(elapsed * 0.8) * 0.023;

    if (outerRef.current) {
      outerRef.current.position.y = scrollY.current + floatOffset;
    }

    // Subtle mouse parallax
    const mx = mouseRef.current?.x ?? 0;
    const my = mouseRef.current?.y ?? 0;
    parallax.current.y = THREE.MathUtils.lerp(
      parallax.current.y,
      mx * 0.22,
      0.05,
    );
    parallax.current.x = THREE.MathUtils.lerp(
      parallax.current.x,
      my * 0.09,
      0.05,
    );

    groupRef.current.rotation.x = tiltX.current + parallax.current.x;
    groupRef.current.rotation.y = parallax.current.y;
  });

  return (
    <group ref={outerRef} scale={1.6} position={[0, 0, 0]}>
      {/* inner group is manually centred by the useEffect above */}
      <group ref={groupRef}>
        <primitive object={scene} />
      </group>
    </group>
  );
}
