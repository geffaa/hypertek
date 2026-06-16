import { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, Environment } from "@react-three/drei";
import * as THREE from "three";

const MODELS = {
  wraith:      "/vehicles/Spaceship_2.glb",
  voidhawk:    "/vehicles/Spaceship_1.glb",
  spaceship3:  "/vehicles/Spaceship_3.glb",
  spaceship4:  "/vehicles/Spaceship_4.glb",
  spaceship5:  "/vehicles/Spaceship_5.glb",
  spaceship6:  "/vehicles/Spaceship_6.glb",
};

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

export default function Wraith3DViewer({ vehicleId = "wraith" }) {
  const url = MODELS[vehicleId] ?? MODELS.wraith;

  return (
    <Suspense fallback={null}>
      <Canvas
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 0.8, 4.5], fov: 42 }}
        style={{ width: "100%", height: "100%", cursor: "grab", background: "transparent" }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[4, 6, 4]}  intensity={1.4} />
        <directionalLight position={[-4, -2, -4]} intensity={0.35} color="#8ab4f8" />
        <Environment preset="city" />
        <VehicleModel url={url} />
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
    </Suspense>
  );
}
