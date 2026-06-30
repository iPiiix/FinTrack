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
    return <div className="vu m-4 md:m-6 p-6 md:p-12 text-center text-zinc-500">Error de conexión al cargar portfolio</div>;
  }

  return (
    <div className="vu flex flex-col gap-6">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-[26px] font-light text-[#F4F4F5] tracking-tight mb-2">Portfolio</h2>
          <span className="lbl text-zinc-500 uppercase">WEALTHTECH ENGINE · {tickers.length} {tickers.length === 1 ? "ACTIVO" : "ACTIVOS"}</span>
        </div>
        <button onClick={openAssetDrawer}
          className="flex items-center gap-2 bg-white text-black font-bold tracking-[0.07em] text-[10px] px-4 py-2 hover:bg-zinc-200 transition-colors rounded-sm"
        >
          <Plus size={14} /> AÑADIR ACTIVO
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="fintrack-card-outer">
          <div className="fintrack-card-inner min-h-[100px] justify-between">
            <span className="lbl text-zinc-500">INVERSIÓN TOTAL</span>
            <span className="mono text-xl md:text-2xl text-[#E4E4E7] mt-3">€{fmt(totalInvestedGlobal, 2)}</span>
          </div>
        </div>
        <div className="fintrack-card-outer">
          <div className="fintrack-card-inner min-h-[100px] justify-between">
            <span className="lbl text-zinc-500">VALOR ACTUAL</span>
            <span className="mono text-xl md:text-2xl text-[#E4E4E7] mt-3">€{fmt(totalValueGlobal, 2)}</span>
          </div>
        </div>
        <div className="fintrack-card-outer">
          <div className="fintrack-card-inner min-h-[100px] justify-between">
            <span className="lbl text-zinc-500">RETORNO (ROI)</span>
            <span className={`mono text-xl md:text-2xl mt-3 ${globalPnL >= 0 ? "text-[#10B981]" : "text-[#F87171]"}`}>
              {globalPnL >= 0 ? "+" : "−"}€{fmt(Math.abs(globalPnL), 2)}
              <span className="text-xs ml-2 font-normal opacity-90">
                ({globalPnL >= 0 ? "+" : "−"}{fmt(Math.abs(globalPnLPct), 2)}%)
              </span>
            </span>
          </div>
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
                          className="text-[9px] font-bold tracking-widest text-zinc-600 border border-zinc-800 px-2 py-1 hover:bg-white/5 hover:text-zinc-400 transition-colors uppercase">VENDER</button>
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
