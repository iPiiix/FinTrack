"use client";

import React from "react";

export const NAV = ["OVERVIEW", "TRANSACTIONS", "PORTFOLIO", "AI ADVISOR", "SETTINGS"];

export function TopBar({ time, tab, setTab, loading, openDrawer }: any) {
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 40, display: "flex", alignItems: "center", borderBottom: "1px solid #1C1C1F", background: "rgba(9,9,11,0.97)", backdropFilter: "blur(12px)", height: 56 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 28px", borderRight: "1px solid #1C1C1F", height: "100%", flexShrink: 0 }}>
        <img src="/png.png" alt="FinTrack" style={{ width: 22, height: 22, objectFit: "contain" }} />
        <span style={{ fontWeight: 700, fontSize: 11, letterSpacing: "0.13em", color: "white" }}>FINTRACK</span>
        <span style={{ fontSize: 9, fontWeight: 800, color: "#E8FF47", background: "rgba(232, 255, 71, 0.1)", padding: "2px 6px", borderRadius: 2, marginLeft: 4, letterSpacing: "0.05em" }}>BETA</span>
      </div>
      <nav style={{ display: "flex", height: "100%" }}>
        {NAV.map((item, i) => (
          <button key={item} onClick={() => setTab(item)} className={`ntab ${tab === item ? "on" : ""}`}
            style={{ borderRight: i === NAV.length - 1 ? "1px solid #1C1C1F" : undefined }}>{item}</button>
        ))}
      </nav>
      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 20, padding: "0 28px", flexShrink: 0 }}>
        <button onClick={openDrawer}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "white", color: "black", fontWeight: 700, letterSpacing: "0.07em", fontSize: 10, padding: "8px 16px", border: "none", cursor: "pointer", transition: "background 0.15s ease", borderRadius: 1 }}
          onMouseEnter={e => e.currentTarget.style.background = "#E4E4E7"}
          onMouseLeave={e => e.currentTarget.style.background = "white"}>+ NUEVO REGISTRO</button>
      </div>
    </header>
  );
}
