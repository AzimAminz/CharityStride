"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import {
  Icosahedron,
  MeshDistortMaterial,
  Float,
  Stars,
  Environment,
  Torus,
} from "@react-three/drei";
import { useRef, useMemo, Suspense } from "react";
import * as THREE from "three";

function Particles({ count = 2000 }) {
  const points = useMemo(() => {
    const p = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (Math.random() - 0.5) * 20;
      p[i * 3 + 1] = (Math.random() - 0.5) * 20;
      p[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return p;
  }, [count]);

  const pointsRef = useRef();

  useFrame((state) => {
    const { clock } = state;
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.getElapsedTime() * 0.05;
      // Rhythmic breathing effect for particles
      const s = 1 + Math.sin(clock.getElapsedTime() * 0.2) * 0.1;
      pointsRef.current.scale.set(s, s, s);
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={points}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#10b981"
        transparent
        opacity={0.6}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function EmeraldCore() {
  const mesh = useRef();
  const ring1 = useRef();
  const ring2 = useRef();

  useFrame((state) => {
    const { clock, mouse } = state;
    const t = clock.getElapsedTime();

    if (mesh.current) {
      // Mouse interaction + auto floating
      mesh.current.rotation.x = THREE.MathUtils.lerp(
        mesh.current.rotation.x,
        mouse.y * 0.8 + Math.sin(t * 0.5) * 0.2,
        0.05
      );
      mesh.current.rotation.y = THREE.MathUtils.lerp(
        mesh.current.rotation.y,
        mouse.x * 0.8 + Math.cos(t * 0.5) * 0.2,
        0.05
      );

      // Intense pulsing
      const pulse = 1 + Math.sin(t * 2) * 0.08;
      mesh.current.scale.setScalar(pulse);
    }

    if (ring1.current) {
      ring1.current.rotation.x = t * 0.5;
      ring1.current.rotation.y = t * 0.2;
    }

    if (ring2.current) {
      ring2.current.rotation.z = t * 0.3;
      ring2.current.rotation.x = t * 0.4;
    }
  });

  return (
    <group>
      {/* Central Morphing Core */}
      <Icosahedron ref={mesh} args={[1, 15]}>
        <MeshDistortMaterial
          color="#10b981"
          speed={4} // Faster distortion
          distort={0.4}
          radius={1}
          metalness={1}
          roughness={0}
          emissive="#10b981"
          emissiveIntensity={0.8}
        />
      </Icosahedron>

      {/* Energy Rings */}
      <Torus ref={ring1} args={[2, 0.02, 16, 100]}>
        <meshBasicMaterial color="#10b981" transparent opacity={0.2} />
      </Torus>
      <Torus ref={ring2} args={[2.5, 0.01, 16, 100]}>
        <meshBasicMaterial color="#059669" transparent opacity={0.15} />
      </Torus>

      {/* Strong Core Glow */}
      <pointLight intensity={15} color="#10b981" distance={6} />
    </group>
  );
}

export default function Hero3D() {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 75 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
          preserveDrawingBuffer: true,
        }}
      >
        <Suspense fallback={null}>
          <color attach="background" args={["#050505"]} />

          <ambientLight intensity={0.4} />
          {/* Strictly Emerald/Green/White theme lighting */}
          <pointLight position={[10, 10, 10]} intensity={3} color="#10b981" />
          <pointLight
            position={[-10, -10, -10]}
            intensity={1}
            color="#059669"
          />

          <Float speed={3} rotationIntensity={1} floatIntensity={1}>
            <EmeraldCore />
          </Float>

          <Particles count={3000} />

          <Stars
            radius={50}
            depth={50}
            count={2000}
            factor={3}
            saturation={0}
            fade
            speed={1.5}
          />

          <Environment preset="night" />
        </Suspense>
      </Canvas>
    </div>
  );
}
