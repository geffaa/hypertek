import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";

const SKELETON_CSS = `
  @keyframes skeletonPulse {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 0.8; }
  }
  @keyframes skeletonSpin {
    to { transform: rotate(360deg); }
  }
  .viewer-skeleton { animation: skeletonPulse 1.6s ease-in-out infinite; }
  .viewer-spinner { animation: skeletonSpin 0.9s linear infinite; }
`;
let skeletonCssInjected = false;
function SkeletonFallback() {
  if (!skeletonCssInjected && typeof document !== "undefined") {
    const el = document.createElement("style");
    el.textContent = SKELETON_CSS;
    document.head.appendChild(el);
    skeletonCssInjected = true;
  }
  return (
    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "transparent" }}>
      <div className="viewer-skeleton" style={{
        width: "40%", height: "60%", borderRadius: 12,
        background: "linear-gradient(135deg, rgba(0,212,255,0.08), rgba(99,102,241,0.08))",
        border: "1px solid rgba(0,212,255,0.12)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div className="viewer-spinner" style={{ width: 40, height: 40, borderRadius: "50%", border: "2px solid rgba(0,212,255,0.25)", borderTopColor: "rgba(0,212,255,0.7)" }} />
      </div>
    </div>
  );
}

const MODELS = {
  wraith:      "/vehicles/Spaceship_2.glb",
  voidhawk:    "/vehicles/Spaceship_1.glb",
  spaceship3:  "/vehicles/Spaceship_3.glb",
  spaceship4:  "/vehicles/Spaceship_4.glb",
  spaceship5:  "/vehicles/Spaceship_5.glb",
  spaceship6:  "/vehicles/Spaceship_6.glb",
};

function VehicleModel({ url }) {
  const { scene } = useGLTF(url);

  // Clone so we don't mutate the cached scene
  const normalized = useMemo(() => {
    const clone = scene.clone(true);

    // Compute world-space bounding box of the original scene
    const box = new THREE.Box3().setFromObject(clone);
    if (box.isEmpty()) return clone;

    const center = box.getCenter(new THREE.Vector3());
    const size   = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    // Normalize to fit within 2 units, center at origin
    const s = maxDim > 0 ? 2 / maxDim : 1;
    clone.scale.setScalar(s);
    clone.position.set(-center.x * s, -center.y * s, -center.z * s);

    return clone;
  }, [scene]);

  return <primitive object={normalized} />;
}

export default function Wraith3DViewer({ vehicleId = "wraith" }) {
  const url = MODELS[vehicleId] ?? MODELS.wraith;

  return (
    <Canvas
      gl={{ alpha: true, antialias: true }}
      camera={{ position: [0, 0.8, 4.5], fov: 42 }}
      style={{ width: "100%", height: "100%", cursor: "grab", background: "transparent" }}
    >
      <Suspense fallback={<SkeletonFallback />}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[4, 6, 4]}  intensity={1.4} />
        <directionalLight position={[-4, -2, -4]} intensity={0.35} color="#8ab4f8" />
        <Environment preset="city" />
        <VehicleModel url={url} />
      </Suspense>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minPolarAngle={0}
        maxPolarAngle={Math.PI}
        autoRotate
        autoRotateSpeed={6}
      />
    </Canvas>
  );
}

// Only preload the default model — others load on demand when selected
useGLTF.preload(MODELS.wraith);
