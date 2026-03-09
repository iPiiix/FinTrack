"use client";

import React from "react";

export function DashboardStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Inter:wght@300;400;500;600;700&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      body { background: #09090B; color: #FAFAF9; font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }
      input, select, textarea, button { font-family: inherit; }
      select option { background: #18181B; }
      .mono { font-family: 'IBM Plex Mono', monospace; }
      .lbl { font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #52525B; }
      .kpi-num { font-family: 'IBM Plex Mono', monospace; font-size: 32px; font-weight: 300; letter-spacing: -0.03em; line-height: 1; color: #FAFAFA; transition: color 0.4s; }
      .row { transition: background 0.18s ease; }
      .row:hover { background: rgba(255,255,255,0.025); }
      .ptab { font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 500; letter-spacing: 0.06em; padding: 5px 12px; border: 1px solid transparent; cursor: pointer; transition: all 0.2s ease; color: #52525B; background: transparent; border-radius: 2px; }
      .ptab:hover { color: #A1A1AA; background: rgba(255,255,255,0.03); }
      .ptab.on { color: #FAFAFA; border-color: #3F3F46; background: #27272A; }
      .ntab { height: 100%; padding: 0 22px; border: none; border-left: 1px solid #27272A; background: transparent; font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 500; letter-spacing: 0.08em; cursor: pointer; transition: all 0.2s ease; color: #52525B; white-space: nowrap; position: relative; }
      .ntab:hover { color: #A1A1AA; background: rgba(255,255,255,0.02); }
      .ntab.on { background: rgba(255,255,255,0.03); color: #FAFAFA; font-weight: 600; }
      .ntab.on::after { content: ''; position: absolute; bottom: 0; left: 22px; right: 22px; height: 1px; background: rgba(255,255,255,0.3); }
      .inp { width: 100%; background: #0D0D0F; border: 1px solid #27272A; padding: 11px 14px; color: #FAFAFA; font-size: 12px; outline: none; transition: border-color 0.2s ease, box-shadow 0.2s ease; display: block; }
      .inp:focus { border-color: #52525B; box-shadow: 0 0 0 3px rgba(255,255,255,0.03); }
      .inp::placeholder { color: #3F3F46; }
      @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
      .vu { animation: fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) both; }
      @keyframes slideRight { from { transform:translateX(100%); opacity: 0; } to { transform:translateX(0); opacity: 1; } }
      .drawer { animation: slideRight 0.32s cubic-bezier(0.16,1,0.3,1); }
      @keyframes toastIn { from { opacity:0; transform:translateX(16px); } to { opacity:1; transform:translateX(0); } }
      .toast { animation: toastIn 0.28s cubic-bezier(0.16,1,0.3,1); }
      @keyframes livePulse { 0%,100% { box-shadow: 0 0 4px #10B981; } 50% { box-shadow: 0 0 9px #10B981, 0 0 18px rgba(16,185,129,0.3); } }
      .live-dot { animation: livePulse 2.5s ease-in-out infinite; }
      ::-webkit-scrollbar { width: 4px; height: 4px; }
      ::-webkit-scrollbar-track { background: #09090B; }
      ::-webkit-scrollbar-thumb { background: #27272A; border-radius: 2px; }
      ::-webkit-scrollbar-thumb:hover { background: #3F3F46; }
    `}</style>
  );
}
