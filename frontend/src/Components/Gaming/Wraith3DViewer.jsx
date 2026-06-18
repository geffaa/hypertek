import { Suspense, useMemo, useEffect, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment, Html } from "@react-three/drei";
import * as THREE from "three";

const MODELS = {
  wraith:      "/vehicles/Spaceship_2.glb",
  voidhawk:    "/vehicles/Spaceship_1.glb",
  spaceship3:  "/vehicles/Spaceship_3.glb",
  spaceship4:  "/vehicles/Spaceship_4.glb",
  spaceship5:  "/vehicles/Spaceship_5.glb",
  spaceship6:  "/vehicles/Spaceship_6.glb",
};

/* Preload models in the background (after first paint, when the browser is idle)
   so switching vehicles is instant once a model has been fetched once. drei
   caches by URL, so a model is only ever downloaded a single time per session. */
function preloadAll() {
  const urls = Object.values(MODELS);
  const idle = window.requestIdleCallback || ((cb) => setTimeout(cb, 1));
  urls.forEach((url, i) => idle(() => useGLTF.preload(url), { timeout: 2000 + i * 500 }));
}

function normalize(scene) {
  const clone = scene.clone(true);
  const box = new THREE.Box3().setFromObject(clone);
  if (!box.isEmpty()) {
    const center = box.getCenter(new THREE.Vector3());
    const size   = box.getSize(new THREE.Vector3());
    const s = 2 / Math.max(size.x, size.y, size.z);
    clone.scale.setScalar(s);
    clone.position.set(-center.x * s, -center.y * s, -center.z * s);
  }
  return clone;
}

function VehicleModel({ url }) {
  const { scene } = useGLTF(url);
  const clone = useMemo(() => normalize(scene), [scene]);
  return <primitive object={clone} />;
}

/* In-canvas loader so the WebGL context (and Environment) stays alive while a
   model downloads — only the model swaps, not the whole scene. */
function Loader() {
  return (
    <Html center>
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
        fontFamily: "Orbitron, sans-serif", color: "#22c55e",
        letterSpacing: "0.18em", fontSize: 9, whiteSpace: "nowrap",
        textShadow: "0 0 10px rgba(34,197,94,0.7)", userSelect: "none",
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: "50%",
          border: "2px solid rgba(34,197,94,0.2)",
          borderTopColor: "#22c55e",
          animation: "wraithSpin 0.8s linear infinite",
        }} />
        LOADING
        <style>{`@keyframes wraithSpin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </Html>
  );
}

export default function Wraith3DViewer({ vehicleId = "wraith" }) {
  const url = MODELS[vehicleId] ?? MODELS.wraith;
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    preloadAll();
  }, []);

  return (
    <Canvas
      gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
      dpr={[1, 1.8]}
      camera={{ position: [0, 0.8, 4.5], fov: 42 }}
      style={{ width: "100%", height: "100%", cursor: "grab", background: "transparent" }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 6, 4]}  intensity={1.4} />
      <directionalLight position={[-4, -2, -4]} intensity={0.35} color="#8ab4f8" />
      <Environment preset="city" />
      {/* Suspense lives INSIDE the Canvas, wrapping only the model — switching
          vehicles swaps the model under a loader instead of tearing down the
          entire scene. `key` forces a clean remount per vehicle. */}
      <Suspense fallback={<Loader />}>
        <VehicleModel key={url} url={url} />
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
