import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { Environment, useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";

useGLTF.preload("/CHARACTER.glb");

// ── Triangle grid layout helpers ───────────────────────────────────────────────
const TRI_SIDE = 0.6; // side length of each equilateral triangle
const TRI_GAP = 0.028; // visible seam between tiles
const TRI_HEIGHT = 0.06; // tile thickness
const GRID_COLS = 28; // columns of triangles
const GRID_ROWS = 12; // rows of triangles
const TREADMILL_SPEED = 1;
const CHARACTER_ANIMATION_SPEED = 0.5;
const CHARACTER_TARGET_HEIGHT = 3.4;

const clipPlanes = [
  new THREE.Plane(new THREE.Vector3(0, 0, 1), 2.2),
  new THREE.Plane(new THREE.Vector3(0, 0, -1), 2.2),
];

// Returns Float32Array: [x, y, z, isFlipped, ...] per tile (4 floats each)
function generateTriPositions(cols, rows) {
  const positions = [];
  const s = TRI_SIDE + TRI_GAP;
  const h = s * (Math.sqrt(3) / 2);
  const offsetX = (cols * s) / 2;
  const offsetZ = (rows * h) / 2;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      let xUp = col * s;
      if (row % 2 !== 0) xUp += s / 2;
      let zUp = row * h + h / 3;
      positions.push(xUp - offsetX, 0, zUp - offsetZ, 0);

      let xDown = col * s + s / 2;
      if (row % 2 !== 0) xDown -= s / 2;
      let zDown = row * h + (2 * h) / 3;
      positions.push(xDown - offsetX, 0, zDown - offsetZ, 1);
    }
  }
  return new Float32Array(positions);
}

// ── Foot targets dynamically track the Character Bones ──────────────────────
const SINK_DEPTH = 0.055;
const BASE_TILE_COLOR = new THREE.Color("#49515c");
const ACTIVE_TILE_COLOR = new THREE.Color("#df3b26");

function createMetalTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");

  context.fillStyle = "#7f8993";
  context.fillRect(0, 0, size, size);

  for (let y = 0; y < size; y += 8) {
    const stripe = 118 + Math.sin(y * 0.11) * 12;
    context.fillStyle = `rgb(${stripe}, ${stripe + 6}, ${stripe + 12})`;
    context.fillRect(0, y, size, 4);
  }

  for (let i = 0; i < 1800; i++) {
    const value = 108 + Math.random() * 52;
    context.fillStyle = `rgba(${value}, ${value}, ${value}, 0.22)`;
    context.fillRect(
      Math.random() * size,
      Math.random() * size,
      1 + Math.random() * 2,
      1 + Math.random() * 2,
    );
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 6);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function createBumpTexture() {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext("2d");

  context.fillStyle = "#808080";
  context.fillRect(0, 0, size, size);

  for (let y = 0; y < size; y += 10) {
    const tone = 118 + Math.sin(y * 0.17) * 20;
    context.fillStyle = `rgb(${tone}, ${tone}, ${tone})`;
    context.fillRect(0, y, size, 3);
  }

  for (let i = 0; i < 1400; i++) {
    const tone = 90 + Math.random() * 80;
    context.fillStyle = `rgba(${tone}, ${tone}, ${tone}, 0.32)`;
    context.fillRect(
      Math.random() * size,
      Math.random() * size,
      1 + Math.random() * 2,
      1 + Math.random() * 2,
    );
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(10, 8);
  return texture;
}

// ── Cached geometry (created once, shared) ────────────────────────────────────
// Equilateral triangle prism: CylinderGeometry with 3 radial segments
const triGeometry = new THREE.CylinderGeometry(
  TRI_SIDE / Math.sqrt(3),
  TRI_SIDE / Math.sqrt(3),
  TRI_HEIGHT,
  3,
);

// ── Game State ────────────────────────────────────────────────────────────────
// Connects the character exact animation frame with the floor simulation
const globalFootState = {
  animTime: 0,
  animDuration: 1,
  leftX: 0.16,
  leftZ: -0.4,
  rightX: -0.16,
  rightZ: 0.4,
};

function createTriTopEdgeGeometry() {
  const R = TRI_SIDE / Math.sqrt(3);
  const y = TRI_HEIGHT * 0.5 + 0.002;
  const w = R * (Math.sqrt(3) / 2);
  const h = R / 2;

  const vertices = [0, y, R, w, y, -h, w, y, -h, -w, y, -h, -w, y, -h, 0, y, R];

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(vertices, 3),
  );
  return geometry;
}

const triTopEdgeGeometry = createTriTopEdgeGeometry();

// ── Animated Character ─────────────────────────────────────────────────────────
function Character() {
  const groupRef = useRef();
  const { scene, animations } = useGLTF("/CHARACTER.glb");
  const { actions, names } = useAnimations(animations, groupRef);

  // Fix colour spaces, enable shadows
  useEffect(() => {
    scene.traverse((obj) => {
      if (!obj.isMesh) return;
      obj.castShadow = true;
      obj.receiveShadow = true;
      const mat = obj.material;
      if (!mat) return;
      ["map", "emissiveMap"].forEach((k) => {
        if (mat[k]) {
          mat[k].colorSpace = THREE.SRGBColorSpace;
          mat[k].needsUpdate = true;
        }
      });
      if ("color" in mat && mat.color) {
        mat.color = new THREE.Color("#e6e6e1");
      }
      if ("emissive" in mat && mat.emissive) {
        mat.emissive = new THREE.Color("#000000");
      }
      if ("emissiveIntensity" in mat) {
        mat.emissiveIntensity = 0;
      }
      if ("envMapIntensity" in mat) {
        mat.envMapIntensity = 0.22;
      }
      if ("metalness" in mat) {
        mat.metalness = 0.08;
      }
      if ("roughness" in mat) {
        mat.roughness = 0.84;
      }
      mat.needsUpdate = true;
    });
  }, [scene]);

  // Apply centering + scaling on the GROUP, never mutate the cached scene
  useEffect(() => {
    if (!groupRef.current) return;

    // Ensure scene has identity transforms for correct measurement
    scene.position.set(0, 0, 1.4);
    scene.rotation.set(0, 0, 0);
    scene.scale.setScalar(1);
    scene.updateWorldMatrix(true, true);

    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(size);
    box.getCenter(center);

    const safeHeight = Math.max(size.y, 0.001);
    const scale = CHARACTER_TARGET_HEIGHT / safeHeight;

    // Apply on the group so the cached scene stays untouched
    groupRef.current.scale.setScalar(scale);
    groupRef.current.position.set(
      -center.x * scale,
      -box.min.y * scale,
      -center.z * scale,
    );
  }, [scene]);

  // Play the first (walk-cycle) animation on loop
  useEffect(() => {
    if (names.length === 0) return;
    const clip = actions[names[0]];
    if (clip) {
      clip
        .reset()
        .setLoop(THREE.LoopRepeat, Infinity)
        .setEffectiveTimeScale(CHARACTER_ANIMATION_SPEED)
        .fadeIn(0.3)
        .play();
    }
    return () => {
      if (clip) {
        clip.setEffectiveTimeScale(1).fadeOut(0.3);
      }
    };
  }, [actions, names]);

  const leftFootRef = useRef(null);
  const rightFootRef = useRef(null);

  useEffect(() => {
    scene.traverse((node) => {
      if (node.isBone) {
        const n = node.name.toLowerCase();
        if (n.includes("left") && (n.includes("foot") || n.includes("toe"))) {
          if (!leftFootRef.current) leftFootRef.current = node;
        }
        if (n.includes("right") && (n.includes("foot") || n.includes("toe"))) {
          if (!rightFootRef.current) rightFootRef.current = node;
        }
      }
    });
  }, [scene]);

  useFrame(() => {
    if (names.length > 0 && actions[names[0]]) {
      const clip = actions[names[0]];
      globalFootState.animTime = clip.time;
      globalFootState.animDuration = clip.getClip().duration || 1;
    }

    if (leftFootRef.current && rightFootRef.current) {
      const lPos = new THREE.Vector3();
      const rPos = new THREE.Vector3();
      leftFootRef.current.getWorldPosition(lPos);
      rightFootRef.current.getWorldPosition(rPos);

      // Map absolute world X coordinates slightly shifted since they group is at X = -1.9
      // Floor checking works best relative to the group local space (so + 1.9 fixes it)
      globalFootState.leftX = lPos.x + 1.9;
      globalFootState.leftZ = lPos.z;
      globalFootState.rightX = rPos.x + 1.9;
      globalFootState.rightZ = rPos.z;
    }
  });

  return (
    <group ref={groupRef} rotation={[0, Math.PI / 2, 0]}>
      <primitive object={scene} />
    </group>
  );
}

// ── Triangle Floor + per-frame interaction ────────────────────────────────────
function TriFloor() {
  const tileGroupRefs = useRef([]);
  const tileMeshRefs = useRef([]);
  const lightL = useRef();
  const lightR = useRef();

  const triData = useMemo(() => generateTriPositions(GRID_COLS, GRID_ROWS), []);
  const count = triData.length / 4; // 4 floats per tile: x, y, z, flipped
  const tileIndices = useMemo(
    () => Array.from({ length: count }, (_, index) => index),
    [count],
  );
  const triStrideX = TRI_SIDE + TRI_GAP;
  const wrapWidth = GRID_COLS * triStrideX;
  const metalTexture = useMemo(() => createMetalTexture(), []);
  const bumpTexture = useMemo(() => createBumpTexture(), []);

  // Mutable per-tile state used by the frame loop.
  const stateRef = useRef(null);
  const tmpColorRef = useRef(null);

  useEffect(() => {
    stateRef.current = {
      baseY: new Float32Array(count),
      currentY: new Float32Array(count),
      currentScale: new Float32Array(count).fill(1),
      emissive: new Float32Array(count),
    };
    tmpColorRef.current = new THREE.Color();
  }, [count]);

  useEffect(() => {
    if (!stateRef.current) return;
    const state = stateRef.current;

    for (let i = 0; i < count; i++) {
      const idx = i * 4;
      const y = triData[idx + 1];
      state.baseY[i] = y;
      state.currentY[i] = y;
    }
  }, [count, triData]);

  // ── Per-frame: distance check, sink/glow, lerp back ──────────────────────
  useFrame((_, delta) => {
    if (!stateRef.current || !tmpColorRef.current) return;
    const state = stateRef.current;
    const tmpColor = tmpColorRef.current;
    const dt = Math.min(delta, 0.05); // clamp for tab-out
    const elapsed = performance.now() * 0.001;
    const treadmillOffset = (elapsed * TREADMILL_SPEED) % wrapWidth;

    // Determine exact foot pressure completely synced to the walking animation phase
    // animTime cycles from 0 to animDuration
    // Assuming standard walk cycle: Left foot down at phase ~0/1.0, Right foot down at phase 0.5
    // You might need to offset the phase depending on the specific GLTF animation!
    // We add a modifiable offset here (e.g., +0.2) to let us manually fine tune the exact sync
    const phaseOffset = 0.25;
    const phase =
      (globalFootState.animTime / globalFootState.animDuration + phaseOffset) %
      1.0;

    // Convert 0..1 phase into a repeating -1 to 1 waveform
    const stepPhase = Math.sin(phase * Math.PI * 2);

    const leftPressure = Math.max(0, stepPhase);
    const rightPressure = Math.max(0, -stepPhase);

    let bestL = -1,
      bestR = -1;
    let minDL = Infinity,
      minDR = Infinity;

    // First pass: find exactly ONE closest tile for each foot strike zone
    for (let i = 0; i < count; i++) {
      const idx = i * 4;
      let x = triData[idx] - treadmillOffset;
      if (x < -wrapWidth * 0.5) x += wrapWidth;
      const z = triData[idx + 2];

      const dxL = x - globalFootState.leftX;
      const dzL = z - globalFootState.leftZ;
      const distL = dxL * dxL + dzL * dzL;
      if (distL < minDL) {
        minDL = distL;
        bestL = i;
      }

      const dxR = x - globalFootState.rightX;
      const dzR = z - globalFootState.rightZ;
      const distR = dxR * dxR + dzR * dzR;
      if (distR < minDR) {
        minDR = distR;
        bestR = i;
      }
    }

    // Dynamic light tracking
    if (lightL.current && bestL !== -1) {
      let xL = triData[bestL * 4] - treadmillOffset;
      if (xL < -wrapWidth * 0.5) xL += wrapWidth;
      lightL.current.position.set(xL, -0.06, triData[bestL * 4 + 2]);
      lightL.current.intensity = leftPressure * 14.0;
    }
    if (lightR.current && bestR !== -1) {
      let xR = triData[bestR * 4] - treadmillOffset;
      if (xR < -wrapWidth * 0.5) xR += wrapWidth;
      lightR.current.position.set(xR, -0.06, triData[bestR * 4 + 2]);
      lightR.current.intensity = rightPressure * 14.0;
    }

    // Second pass: apply physical transforms and colors
    for (let i = 0; i < count; i++) {
      const idx = i * 4;
      const baseX = triData[idx];
      let x = baseX - treadmillOffset;
      if (x < -wrapWidth * 0.5) x += wrapWidth;
      const z = triData[idx + 2];
      const flipped = triData[idx + 3];

      // Only the single closest tile per foot gets influence
      const influence = Math.max(
        i === bestL ? leftPressure : 0,
        i === bestR ? rightPressure : 0,
      );

      // Target Y & emissive
      const targetY = state.baseY[i] - influence * SINK_DEPTH;
      const targetEmissive = influence;

      // Smooth lerp for spring-back
      const lerpSpeed = 10 * dt;
      state.currentY[i] += (targetY - state.currentY[i]) * lerpSpeed;
      state.currentScale[i] += (1 - state.currentScale[i]) * lerpSpeed; // scale stays 1
      state.emissive[i] += (targetEmissive - state.emissive[i]) * lerpSpeed;

      const tileGroup = tileGroupRefs.current[i];
      const tileMesh = tileMeshRefs.current[i];
      if (!tileGroup || !tileMesh) continue;

      tileGroup.position.set(x, state.currentY[i], z);
      tileGroup.rotation.set(0, flipped ? Math.PI : 0, 0);

      const e = THREE.MathUtils.smoothstep(state.emissive[i], 0.05, 0.95);
      const glowBoost = 0.96 + e * 0.18;
      tmpColor.copy(BASE_TILE_COLOR).multiplyScalar(glowBoost);
      tmpColor.lerp(ACTIVE_TILE_COLOR, e);
      tileMesh.material.color.copy(tmpColor);
    }
  });

  return (
    <group>
      <pointLight
        ref={lightL}
        position={[globalFootState.leftX, -0.04, globalFootState.leftZ]}
        color="#ff2200"
        distance={2.5}
        decay={1.5}
      />
      <pointLight
        ref={lightR}
        position={[globalFootState.rightX, -0.04, globalFootState.rightZ]}
        color="#ff2200"
        distance={2.5}
        decay={1.5}
      />
      {tileIndices.map((index) => (
        <group
          key={index}
          ref={(node) => {
            tileGroupRefs.current[index] = node;
          }}
        >
          <mesh
            ref={(node) => {
              tileMeshRefs.current[index] = node;
            }}
            geometry={triGeometry}
            castShadow
            receiveShadow
          >
            <meshStandardMaterial
              color="#4d5661"
              map={metalTexture}
              bumpMap={bumpTexture}
              bumpScale={0.012}
              roughnessMap={bumpTexture}
              roughness={0.74}
              metalness={0.2}
              emissive="#020202"
              emissiveIntensity={0.01}
              clippingPlanes={clipPlanes}
            />
          </mesh>

          <lineSegments geometry={triTopEdgeGeometry} renderOrder={2}>
            <lineBasicMaterial
              color="#222831"
              transparent
              opacity={0.32}
              depthWrite={false}
              clippingPlanes={clipPlanes}
            />
          </lineSegments>
        </group>
      ))}
    </group>
  );
}

// ── Main Scene Composition ─────────────────────────────────────────────────────
export default function HexSimulationScene() {
  return (
    <>
      {/* Background */}
      <color attach="background" args={["#000000"]} />
      <fog attach="fog" args={["#000000", 14, 30]} />
      <Environment preset="studio" environmentIntensity={0.3} />

      {/* ── Lighting ── */}
      <ambientLight intensity={1.35} />
      <hemisphereLight
        args={["#f6f7fb", "#383c44", 1.1]}
        position={[0, 8, 0]}
      />

      <directionalLight
        position={[5.5, 8.5, 6.5]}
        intensity={3.2}
        color="#ffffff"
        castShadow
        shadow-mapSize-width={1536}
        shadow-mapSize-height={1536}
        shadow-bias={-0.0002}
      />

      <directionalLight
        position={[-6.5, 4.8, 1.5]}
        intensity={1.15}
        color="#d6dde7"
      />

      <pointLight
        position={[0.5, 4.2, 5.2]}
        intensity={0.95}
        color="#f4f4f1"
        distance={18}
        decay={2}
      />

      <pointLight
        position={[-2.4, 2.2, -3.4]}
        intensity={0.45}
        color="#aeb8c4"
        distance={16}
        decay={2}
      />

      {/* ── Scene objects ── */}
      <group position={[-1.9, 0, 0]}>
        <TriFloor />
        {/* Raise character slightly so its feet sit exactly on the top surface of the uncompressed tiles */}
        <group position-y={TRI_HEIGHT * 0.5 + 0.015}>
          <Character />
        </group>
      </group>
    </>
  );
}
