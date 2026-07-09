import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

export default function CarModel({ color = "#6366F1", wireframe = false }) {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.3;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={groupRef} scale={1.2}>
      {/* Car body */}
      <mesh position={[0, 0.35, 0]}>
        <boxGeometry args={[2.4, 0.5, 1.2]} />
        <meshStandardMaterial color={color} wireframe={wireframe} metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Cabin */}
      <mesh position={[0.1, 0.75, 0]}>
        <boxGeometry args={[1.4, 0.45, 1.0]} />
        <meshStandardMaterial color={color} wireframe={wireframe} metalness={0.6} roughness={0.3} transparent opacity={0.85} />
      </mesh>

      {/* Windshield */}
      <mesh position={[-0.5, 0.72, 0]} rotation={[0, 0, -0.3]}>
        <planeGeometry args={[0.5, 0.4]} />
        <meshStandardMaterial color="#88CCFF" transparent opacity={0.3} metalness={1} roughness={0} side={2} />
      </mesh>

      {/* Front wheel left */}
      <mesh position={[-0.8, 0.1, 0.65]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Front wheel right */}
      <mesh position={[-0.8, 0.1, -0.65]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Rear wheel left */}
      <mesh position={[0.8, 0.1, 0.65]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Rear wheel right */}
      <mesh position={[0.8, 0.1, -0.65]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Headlights */}
      <mesh position={[-1.22, 0.35, 0.4]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#FBBF24" emissive="#FBBF24" emissiveIntensity={2} />
      </mesh>
      <mesh position={[-1.22, 0.35, -0.4]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="#FBBF24" emissive="#FBBF24" emissiveIntensity={2} />
      </mesh>

      {/* Taillights */}
      <mesh position={[1.22, 0.35, 0.4]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={2} />
      </mesh>
      <mesh position={[1.22, 0.35, -0.4]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#EF4444" emissive="#EF4444" emissiveIntensity={2} />
      </mesh>

      {/* Battery indicator (glowing strip on bottom) */}
      <mesh position={[0, 0.08, 0]}>
        <boxGeometry args={[2.2, 0.04, 1.0]} />
        <meshStandardMaterial color="#6366F1" emissive="#6366F1" emissiveIntensity={1.5} transparent opacity={0.8} />
      </mesh>
    </group>
  );
}
