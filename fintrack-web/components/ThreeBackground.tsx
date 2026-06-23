"use client";

import { Canvas } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";

export default function ThreeBackground() {
  return (
    <div className="fixed inset-0 -z-10 bg-[#09090B]">
      <Canvas camera={{ position: [0, 0, 1] }}>
        <Sparkles count={500} scale={15} size={2.5} speed={0.5} opacity={0.5} color="#E8FF47" />
        <Sparkles count={500} scale={15} size={1} speed={0.2} opacity={0.3} color="#ffffff" />
      </Canvas>
      {/* Vignette overlay */}
      <div 
        className="absolute inset-0 bg-radial-gradient from-transparent to-[#09090B] pointer-events-none" 
        style={{ background: "radial-gradient(circle at center, transparent 0%, #09090B 100%)" }} 
      />
    </div>
  );
}
