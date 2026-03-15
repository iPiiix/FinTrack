"use client";

import React from "react";
import { Plus } from "lucide-react";

export const NAV = ["OVERVIEW", "TRANSACTIONS", "PORTFOLIO", "AI ADVISOR", "SETTINGS"];

export function TopBar({ time, tab, setTab, loading, openDrawer }: any) {
  return (
    <header className="sticky top-0 z-40 flex items-center border-b border-[#1C1C1F] bg-[#09090B]/95 backdrop-blur-xl h-14 md:h-[56px] w-full overflow-hidden">
      {/* Brand area */}
      <div className="flex items-center gap-2.5 px-4 md:px-7 border-r border-[#1C1C1F] h-full shrink-0">
        <img src="/png.png" alt="FinTrack" className="w-5 h-5 md:w-[22px] md:h-[22px] object-contain" />
        <span className="hidden md:inline font-bold text-[11px] tracking-[0.13em] text-white">FINTRACK</span>
        <span className="text-[9px] font-extrabold text-[#E8FF47] bg-[#E8FF47]/10 px-1.5 py-0.5 rounded-[2px] tracking-[0.05em]">BETA</span>
      </div>

      {/* Navigation - Scrollable on mobile */}
      <nav className="flex h-full overflow-x-auto no-scrollbar scroll-smooth flex-1 md:flex-initial">
        {NAV.map((item, i) => (
          <button 
            key={item} 
            onClick={() => setTab(item)} 
            className={`ntab ${tab === item ? "on" : ""} whitespace-nowrap px-4 md:px-6`}
            style={{ 
               borderRight: i === NAV.length - 1 ? "1px solid #1C1C1F" : undefined,
               fontSize: "9px"
            }}
          >
            {item}
          </button>
        ))}
      </nav>

      {/* Action area */}
      <div className="ml-auto flex items-center gap-4 px-4 md:px-7 shrink-0">
        <button 
          onClick={openDrawer}
          className="flex items-center justify-center md:gap-1.5 bg-white text-black font-bold tracking-[0.07em] text-[10px] w-9 h-9 md:w-auto md:px-4 md:py-2 transition-all hover:bg-zinc-200 active:scale-95 rounded-sm"
        >
          <Plus size={16} className="md:w-3.5 md:h-3.5" />
          <span className="hidden md:inline">NUEVO REGISTRO</span>
        </button>
      </div>
    </header>
  );
}
