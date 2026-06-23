"use client";

export default function ThreeBackground() {
  return (
    <div className="fixed inset-0 -z-10 bg-[#09090B]">
      {/* Central glow */}
      <div
        className="absolute top-[35%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] max-w-[900px] h-[50vh] rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(232,255,71,0.09) 0%, rgba(232,255,71,0.03) 45%, transparent 72%)",
          filter: "blur(48px)",
        }}
      />
    </div>
  );
}
