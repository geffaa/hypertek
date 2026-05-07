import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, Stage } from "@react-three/drei";

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
  return <primitive object={scene} />;
}

export default function Wraith3DViewer({ vehicleId = "wraith" }) {
  const url = MODELS[vehicleId] ?? MODELS.wraith;
  return (
    <Canvas gl={{ alpha: true }} style={{ width: "100%", height: "100%", cursor: "grab", background: "transparent" }}>
      <Suspense fallback={null}>
        <Stage
          environment="city"
          intensity={0.6}
          adjustCamera={1.0}
          shadows={false}
        >
          <VehicleModel url={url} />
        </Stage>
      </Suspense>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        enableDamping
        dampingFactor={0.08}
        minPolarAngle={0}
        maxPolarAngle={Math.PI}
        autoRotate
        autoRotateSpeed={8}
      />
    </Canvas>
  );
}

Object.values(MODELS).forEach((url) => useGLTF.preload(url));
