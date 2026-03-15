"use client";

import React, { useState, useEffect, useCallback } from "react";
import { fmt } from "../../../lib/utils";
import { EmptyState } from "./ui/EmptyState";
import { Plus, BarChart3, Lock } from "lucide-react";

export function PortfolioView({ activos, deleteAsset, openAssetDrawer }: any) {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const groupedActivos = React.useMemo(() => {
    if (!activos || activos.error === 402 || !Array.isArray(activos)) return {};
    const group: Record<string, { totalQty: number; totalInvested: number, avgPrice: number, originalIds: number[] }> = {};
    activos.forEach((a: any) => {
      if (!group[a.ticker]) group[a.ticker] = { totalQty: 0, totalInvested: 0, avgPrice: 0, originalIds: [] };
      const absQty = Math.abs(a.cantidad);
      group[a.ticker].totalQty += absQty;
      group[a.ticker].totalInvested += (absQty * Math.abs(a.precio_compra));
      group[a.ticker].originalIds.push(a.id_activo);
    });
    return group;
  }, [activos]);

  const tickers = Object.keys(groupedActivos);

  const fetchQuotes = useCallback(async () => {
    if (tickers.length === 0) { setLoading(false); return; }
    const symbols = [...tickers];
    if (!symbols.includes("EUR=X")) symbols.push("EUR=X");
    
    try {
      const res = await fetch(`/api/quote?symbols=${symbols.join(",")}`);
      if (res.ok) { const data = await res.json(); setQuotes(data.quotes || []); }
    } catch { /* ignore */ }
    setLoading(false);
  }, [tickers]);

  useEffect(() => { 
    fetchQuotes(); 
    const iv = setInterval(fetchQuotes, 30000); 
    return () => clearInterval(iv); 
  }, [fetchQuotes]);

  const eurRateQuote = quotes.find(q => q.symbol === "EUR=X");
  const eurRate = eurRateQuote ? eurRateQuote.price : 0.92;

  const totalInvestedGlobal = Object.values(groupedActivos).reduce((sum, g) => sum + g.totalInvested, 0);
  let totalValueGlobal = 0;
  
  tickers.forEach(t => {
    const q = quotes.find(q => q.symbol === t);
    const group = groupedActivos[t];
    const avgBuyPrice = group.totalInvested / (group.totalQty || 1);
    let price = q ? q.price : avgBuyPrice; 
    if (q && q.currency === "USD") price = price * eurRate;
    totalValueGlobal += (group.totalQty * price);
  });

  const globalPnL = totalValueGlobal - totalInvestedGlobal;
  const globalPnLPct = totalInvestedGlobal > 0 ? (globalPnL / totalInvestedGlobal) * 100 : 0;

  if (activos?.error === 402) {
    return (
      <div className="vu relative flex min-h-[70vh] items-center justify-center overflow-hidden m-4 md:m-6 p-6 md:p-12 border border-[#1C1C1F] bg-[#0A0A0C]">
        <div className="absolute inset-0 z-0 flex flex-col gap-4 p-8 opacity-[0.035] blur-[3px] pointer-events-none select-none">
          <div className="flex justify-between border-b border-zinc-800 pb-4">
            <div className="h-6 w-32 bg-zinc-700" />
            <div className="h-6 w-24 bg-zinc-700" />
          </div>
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex justify-between py-3 border-b border-zinc-800/50">
              <div className="flex gap-4">
                <div className="h-8 w-8 rounded-full bg-zinc-700" />
                <div className="h-8 w-24 rounded-sm bg-zinc-700" />
              </div>
              <div className="h-8 w-32 rounded-sm bg-zinc-700" />
            </div>
          ))}
        </div>
        
        <div className="relative z-10 flex max-w-lg flex-col items-center justify-center text-center">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-sm border border-zinc-800 bg-zinc-900/50">
            <Lock size={20} className="text-zinc-500" />
          </div>
          <h2 className="mb-4 font-['Bebas_Neue'] text-3xl md:text-5xl tracking-wide text-[#FAFAF9] leading-none uppercase">
            ASIGNACIÓN DE <span className="text-[#E8FF47]">ACTIVOS</span>
          </h2>
          <span className="lbl mb-6 inline-block bg-[#E8FF47]/10 text-[#E8FF47] px-2 py-1 uppercase">FUNCIÓN PRO BLOQUEADA</span>
          <p className="mb-8 font-light leading-relaxed text-zinc-400 text-sm md:text-base px-4">
            Controla tu asignación en bolsa, criptomonedas y materias primas centralizado en una única fuente de la verdad con datos directos del mercado.
          </p>
          <button 
            onClick={() => window.location.href = "/pricing"}
            className="flex items-center gap-2 bg-[#E8FF47] px-8 py-3.5 font-mono text-[10px] font-bold tracking-[0.22em] text-black transition-all hover:bg-[#d4ed36] hover:scale-105"
          >
            DESBLOQUEAR PORTFOLIO
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="vu px-4 md:px-12 py-8 md:py-11">
      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 border-b border-[#1C1C1F] pb-8 md:pb-12 mb-8">
        <div>
          <h2 className="text-2xl md:text-[26px] font-light text-[#F4F4F5] tracking-tight mb-2">Portfolio</h2>
          <span className="lbl text-zinc-500 uppercase">WEALTHTECH ENGINE · {tickers.length} ACTIVOS</span>
        </div>
        <div>
          <span className="lbl block mb-2 text-zinc-500">INVERSIÓN TOTAL</span>
          <span className="mono text-lg md:text-xl text-[#E4E4E7]">€{fmt(totalInvestedGlobal, 2)}</span>
        </div>
        <div>
          <span className="lbl block mb-2 text-zinc-500">VALOR ACTUAL</span>
          <span className="mono text-lg md:text-xl text-[#E4E4E7]">€{fmt(totalValueGlobal, 2)}</span>
        </div>
        <div className="flex justify-between items-end lg:items-center">
          <div>
            <span className="lbl block mb-2 text-zinc-500">RETORNO (ROI)</span>
            <span className={`mono text-lg md:text-xl ${globalPnL >= 0 ? "text-[#10B981]" : "text-[#F87171]"}`}>
              {globalPnL >= 0 ? "+" : "−"}€{fmt(Math.abs(globalPnL), 2)}
            </span>
            <div className={`mono text-[11px] mt-1 ${globalPnL >= 0 ? "text-[#10B981]/70" : "text-[#F87171]/70"}`}>
              {globalPnL >= 0 ? "+" : "−"}{fmt(Math.abs(globalPnLPct), 2)}%
            </div>
          </div>
          <button onClick={openAssetDrawer}
            className="hidden sm:flex items-center gap-2 bg-white text-black font-bold tracking-[0.07em] text-[10px] px-4 py-2 hover:bg-zinc-200 transition-colors rounded-sm"
          >
            <Plus size={14} /> NEW ASSET
          </button>
        </div>
      </div>

      {loading ? (
        <EmptyState title="Cargando Mercado..." desc="Conectando con Yahoo Finance y valorando portfolio" />
      ) : tickers.length === 0 ? (
        <EmptyState title="Portfolio Vacío" desc="Añade tu primer activo para empezar a medir tu rentabilidad" />
      ) : (
        <div className="border border-[#1C1C1F] rounded-sm overflow-hidden bg-[#09090B]">
          <div className="overflow-x-auto no-scrollbar">
            <div className="min-w-[850px] md:min-w-0">
              {/* Header */}
              <div className="grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_90px] px-6 py-3 border-b border-[#1C1C1F] bg-white/[0.015]">
                {["ACTIVO", "CANTIDAD", "MERCADO", "INVERSIÓN", "RETORNO", ""].map((h, i) => (
                  <span key={h} className={`lbl ${i > 0 ? "text-right" : "text-left"}`}>{h}</span>
                ))}
              </div>
              {/* List */}
              <div className="max-h-[calc(100vh-380px)] overflow-y-auto">
                {tickers.map((t, i) => {
                  const q = quotes.find(x => x.symbol === t);
                  const group = groupedActivos[t];
                  const avgBuyPrice = group.totalInvested / (group.totalQty || 1);
                  const currentPrice = q ? q.price : avgBuyPrice;
                  let priceInEur = currentPrice;
                  if (q && q.currency === "USD") priceInEur = currentPrice * eurRate;
                  const currentValueEur = group.totalQty * priceInEur;
                  const pnl = currentValueEur - group.totalInvested;
                  const pnlPct = group.totalInvested > 0 ? (pnl / group.totalInvested) * 100 : 0;
                  const pos = pnl >= 0;

                  return (
                    <div key={t} className="grid grid-cols-[2.5fr_1fr_1fr_1fr_1fr_90px] px-6 py-5 items-center border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 border border-[#1C1C1F] bg-white/[0.02] flex items-center justify-center shrink-0">
                          <span className="mono text-[9px] font-bold text-zinc-600 uppercase tracking-widest">{t.slice(0, 4)}</span>
                        </div>
                        <div className="min-w-0">
                          <div className="text-[13px] font-medium text-[#E4E4E7] truncate mb-1">{q ? q.name : t}</div>
                          <div className="lbl text-zinc-600 truncate">{t} · {q ? q.currency : "USD"}</div>
                        </div>
                      </div>
                      <span className="mono text-[12px] font-medium text-zinc-400 text-right pr-2">{fmt(group.totalQty, 3)}</span>
                      <div className="text-right pr-2">
                        <span className="mono text-[12px] font-medium text-zinc-200">{q?.currency === "EUR" ? "€" : "$"}{fmt(currentPrice, 2)}</span>
                        {q && <div className={`mono text-[9px] mt-1 ${q.change >= 0 ? "text-[#10B981]/70" : "text-[#F87171]/70"}`}>{q.change >= 0 ? "+" : ""}{fmt(q.changePercent, 2)}%</div>}
                      </div>
                      <span className="mono text-[12px] text-zinc-500 text-right pr-2">€{fmt(group.totalInvested, 2)}</span>
                      <div className="text-right">
                        <span className={`mono text-[12px] font-bold ${pos ? "text-[#10B981]" : "text-[#F87171]"}`}>
                          {pos ? "+" : "−"}€{fmt(Math.abs(pnl), 2)}
                        </span>
                        <div className={`mono text-[9px] mt-1 ${pos ? "text-[#10B981]/70" : "text-[#F87171]/70"}`}>
                          {pos ? "+" : "−"}{fmt(Math.abs(pnlPct), 2)}%
                        </div>
                      </div>
                      <div className="flex justify-end pr-1">
                        <button onClick={() => deleteAsset(group.originalIds[0])}
                          className="text-[9px] font-bold tracking-widest text-zinc-600 border border-zinc-800 px-2 py-1 hover:bg-white/5 hover:text-zinc-400 transition-colors uppercase">SELL</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
