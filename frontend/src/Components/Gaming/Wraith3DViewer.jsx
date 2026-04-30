import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useGLTF, OrbitControls, Stage } from "@react-three/drei";

const MODEL_URL = "/vehicles/3D%20Racing%20Vehicle%204.glb";

function WraithModel() {
  const { scene } = useGLTF(MODEL_URL);
  return <primitive object={scene} />;
}

export default function Wraith3DViewer({ onClick }) {
  return (
    <Canvas
      style={{ width: "100%", height: "100%", cursor: "grab" }}
      onClick={onClick}
    >
      <Suspense fallback={null}>
        <Stage
          environment="city"
          intensity={0.6}
          adjustCamera={1.2}
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
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={Math.PI / 1.8}
      />
    </Canvas>
  );
}

useGLTF.preload(MODEL_URL);
