import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, Stage } from "@react-three/drei";

const MODELS = {
  wraith:   "/vehicles/3D%20Racing%20Vehicle%204.glb",
  voidhawk: "/vehicles/3D%20Racing%20Vehicle%202.glb",
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
      />
    </Canvas>
  );
}

Object.values(MODELS).forEach((url) => useGLTF.preload(url));
