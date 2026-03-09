"use client";

import React from "react";

export const NAV = ["OVERVIEW", "TRANSACTIONS", "PORTFOLIO", "SETTINGS"];

export function TopBar({ time, tab, setTab, loading, openDrawer }: any) {
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 40, display: "flex", alignItems: "center", borderBottom: "1px solid #1C1C1F", background: "rgba(9,9,11,0.97)", backdropFilter: "blur(12px)", height: 56 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 28px", borderRight: "1px solid #1C1C1F", height: "100%", flexShrink: 0 }}>
        <img src="/png.png" alt="FinTrack" style={{ width: 22, height: 22, objectFit: "contain" }} />
        <span style={{ fontWeight: 700, fontSize: 11, letterSpacing: "0.13em", color: "white" }}>FINTRACK</span>
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
          onMouseLeave={e => e.currentTarget.style.background = "white"}>+ NEW ENTRY</button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className={loading ? "" : "live-dot"} style={{ width: 6, height: 6, borderRadius: "50%", background: loading ? "#FBBF24" : "#10B981", flexShrink: 0 }} />
          <span className="lbl">{loading ? "SYNCING…" : "LIVE"}</span>
        </div>
        <div style={{ width: 1, height: 20, background: "#1C1C1F" }} />
        <span className="mono" style={{ fontSize: 11, color: "#52525B" }}>{time} CET</span>
      </div>
    </header>
  );
}
