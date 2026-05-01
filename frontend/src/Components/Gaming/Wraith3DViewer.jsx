import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, Stage } from "@react-three/drei";

const MODEL_URL = "/vehicles/3D%20Racing%20Vehicle%204.glb";

function WraithModel() {
  const { scene } = useGLTF(MODEL_URL);
  return <primitive object={scene} />;
}

export default function Wraith3DViewer() {
  return (
    <Canvas style={{ width: "100%", height: "100%", cursor: "grab" }}>
      <Suspense fallback={null}>
        <Stage
          environment="city"
          intensity={0.6}
          adjustCamera={0.85}
          shadows={false}
        >
          <WraithModel />
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

useGLTF.preload(MODEL_URL);
