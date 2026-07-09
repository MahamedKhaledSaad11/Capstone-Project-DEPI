import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows } from "@react-three/drei";
import CarModel from "./CarModel";

export default function CarScene({ className = "" }) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        camera={{ position: [3, 2, 3], fov: 45 }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 5]} intensity={1} color="#ffffff" />
          <pointLight position={[-3, 3, -3]} intensity={0.5} color="#6366F1" />
          <pointLight position={[3, 1, 3]} intensity={0.3} color="#A855F7" />

          {/* Car */}
          <CarModel color="#6366F1" />

          {/* Shadow */}
          <ContactShadows
            position={[0, -0.1, 0]}
            opacity={0.4}
            scale={5}
            blur={2.5}
            far={4}
          />

          {/* Controls */}
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            autoRotate
            autoRotateSpeed={1.5}
            maxPolarAngle={Math.PI / 2.1}
            minPolarAngle={Math.PI / 4}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
