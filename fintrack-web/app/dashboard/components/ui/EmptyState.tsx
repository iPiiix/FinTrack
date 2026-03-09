"use client";

import React from "react";

export function EmptyState({ title, desc }: { title: string; desc: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 40px", textAlign: "center" }}>
      <img src="/png.png" alt="FinTrack" style={{ width: 48, height: 48, objectFit: "contain", marginBottom: 24, opacity: 0.4 }} />
      <div style={{ fontSize: 14, fontWeight: 500, color: "#71717A", marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 12, color: "#3F3F46", maxWidth: 320 }}>{desc}</div>
    </div>
  );
}
