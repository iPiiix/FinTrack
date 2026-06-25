"use client";
import React, { useRef, useState } from "react";

interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glowColor?: string;
  borderColor?: string;
  size?: number;
  bgClass?: string;
}

export default function SpotlightCard({
  children,
  className = "",
  glowColor = "rgba(16, 185, 129, 0.05)",
  borderColor = "rgba(6, 182, 212, 0.12)",
  size = 320,
  bgClass = "bg-[#09090b]/40",
  ...props
}: SpotlightCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative overflow-hidden rounded-2xl border border-zinc-900/60 ${bgClass} backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] transition-all duration-300 hover:border-zinc-800/80 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_12px_40px_rgba(0,0,0,0.4)] ${className}`}
      {...props}
    >
      {isHovered && (
        <>
          {/* Background Glow */}
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-300 rounded-2xl"
            style={{
              background: `radial-gradient(${size}px circle at ${coords.x}px ${coords.y}px, ${glowColor}, transparent 80%)`
            }}
          />
          {/* Border Glow */}
          <div
            className="pointer-events-none absolute -inset-px transition-opacity duration-300 rounded-2xl"
            style={{
              background: `radial-gradient(${size / 2}px circle at ${coords.x}px ${coords.y}px, ${borderColor}, transparent 80%)`,
              maskImage: "linear-gradient(black, black) content-box, linear-gradient(black, black)",
              WebkitMaskImage: "linear-gradient(black, black) content-box, linear-gradient(black, black)",
              maskComposite: "exclude",
              WebkitMaskComposite: "xor",
              padding: "1px"
            }}
          />
        </>
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
