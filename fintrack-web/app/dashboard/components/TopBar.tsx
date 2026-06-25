"use client";

import React from "react";
import { Plus } from "lucide-react";

export const NAV = ["OVERVIEW", "TRANSACTIONS", "PORTFOLIO", "AI ADVISOR", "SETTINGS"];

export function TopBar({ time, tab, setTab, loading, openDrawer }: any) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#1C1C1F] bg-[#09090B]/95 backdrop-blur-xl h-14 w-full">
      <div 
        className="w-full px-4 md:px-8 flex items-center h-full justify-between"
        style={{ maxWidth: "1280px", marginLeft: "auto", marginRight: "auto", display: "flex" }}
      >
        {/* Brand & Navigation */}
        <div className="flex items-center h-full flex-1 min-w-0">
          <div className="flex items-center gap-2.5 pr-5 h-full shrink-0">
            <img src="/png.png" alt="FinTrack" className="w-[18px] h-[18px] object-contain" />
            <span className="hidden sm:inline font-bold text-[11px] tracking-[0.13em] text-white">FINTRACK</span>
            <span className="text-[9px] font-extrabold text-[#E8FF47] bg-[#E8FF47]/10 px-1.5 py-0.5 rounded-[2px] tracking-[0.05em]">BETA</span>
          </div>

          <nav className="flex h-full overflow-x-auto no-scrollbar scroll-smooth flex-1 min-w-0 border-l border-[#1C1C1F]">
            {NAV.map((item) => (
              <button
                key={item}
                onClick={() => setTab(item)}
                className={`ntab ${tab === item ? "on" : ""} whitespace-nowrap px-5 shrink-0`}
                style={{ fontSize: "10px" }}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>

        {/* CTA */}
        <div className="flex items-center pl-5 h-full shrink-0 border-l border-[#1C1C1F]">
          <button
            onClick={openDrawer}
            className="flex items-center gap-2 bg-white text-black font-bold tracking-[0.1em] text-[10px] px-4 py-2 hover:bg-zinc-200 active:scale-95 rounded-sm whitespace-nowrap transition-all"
          >
            <Plus size={13} strokeWidth={2.5} />
            <span className="hidden sm:inline">NUEVO REGISTRO</span>
            <span className="sm:hidden">+</span>
          </button>
        </div>
      </div>
    </header>
  );
}

