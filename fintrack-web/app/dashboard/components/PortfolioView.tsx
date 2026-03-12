"use client";

import React, { useState, useEffect, useCallback } from "react";
import { fmt } from "../../../lib/utils";
import { EmptyState } from "./ui/EmptyState";

export function PortfolioView({ activos, deleteAsset, openAssetDrawer }: any) {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Group user assets by ticker (in case they bought AAPL 3 different times)
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
  const eurRate = eurRateQuote ? eurRateQuote.price : 0.92; // Fallback estimate

  const totalInvestedGlobal = Object.values(groupedActivos).reduce((sum, g) => sum + g.totalInvested, 0);
  let totalValueGlobal = 0;
  
  tickers.forEach(t => {
    const q = quotes.find(q => q.symbol === t);
    const group = groupedActivos[t];
    // Fallback if quote is unavailable so it doesn't artificially crash the global ROI
    const avgBuyPrice = group.totalInvested / (group.totalQty || 1);
    let price = q ? q.price : avgBuyPrice; 
    if (q && q.currency === "USD") price = price * eurRate;
    totalValueGlobal += (group.totalQty * price);
  });

  const globalPnL = totalValueGlobal - totalInvestedGlobal;
  const globalPnLPct = totalInvestedGlobal > 0 ? (globalPnL / totalInvestedGlobal) * 100 : 0;

  if (activos?.error === 402) {
    return (
      <div className="vu relative flex min-h-[70vh] items-center justify-center overflow-hidden" style={{ margin: "24px", padding: "48px", border: "1px solid #1C1C1F", background: "#0A0A0C" }}>
        {/* Background blurred mockup */}
        <div className="absolute inset-0 z-0 flex flex-col gap-4 p-8 opacity-[0.035] blur-[3px] pointer-events-none" aria-hidden>
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
        
        {/* Lock Content */}
        <div className="relative z-10 flex max-w-lg flex-col items-center justify-center text-center">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-sm border border-zinc-800 bg-zinc-900/50">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          <h2 className="mb-4" style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(32px,4vw,48px)", letterSpacing: "0.02em", color: "#FAFAF9", lineHeight: 1 }}>
            ASIGNACIÓN DE <span style={{ color: "#E8FF47" }}>ACTIVOS</span>
          </h2>
          <span className="lbl mb-6" style={{ display: "inline-block", background: "rgba(232, 255, 71, 0.1)", color: "#E8FF47", padding: "4px 8px" }}>
            FUNCIÓN PRO BLOQUEADA
          </span>
          <p className="mb-8 font-light leading-relaxed text-zinc-400" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14 }}>
            Controla tu asignación en bolsa, criptomonedas y materias primas centralizado en una única fuente de la verdad con datos directos del mercado y cálculos reales de ROI.
          </p>
          <button 
            onClick={() => window.location.href = "/pricing"}
            className="flex items-center gap-2 bg-[#E8FF47] px-8 py-3.5 font-mono text-[10px] font-bold tracking-[0.22em] text-black transition-all duration-200 hover:bg-[#d4ed36]"
          >
            DESBLOQUEAR PORTFOLIO
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="vu" style={{ padding: "44px 48px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderBottom: "1px solid #1C1C1F", marginBottom: 32, paddingBottom: 24, gap: 24 }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 300, color: "#F4F4F5", letterSpacing: "-0.02em", marginBottom: 8 }}>Portfolio</h2>
          <span className="lbl">WEALTHTECH ENGINE · {tickers.length} ACTIVOS</span>
        </div>
        <div>
          <span className="lbl" style={{ display: "block", marginBottom: 8 }}>INVERSIÓN TOTAL</span>
          <span className="mono" style={{ fontSize: 18, color: "#E4E4E7" }}>€{fmt(totalInvestedGlobal, 2)}</span>
        </div>
        <div>
          <span className="lbl" style={{ display: "block", marginBottom: 8 }}>VALOR ACTUAL</span>
          <span className="mono" style={{ fontSize: 18, color: "#E4E4E7" }}>€{fmt(totalValueGlobal, 2)}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <span className="lbl" style={{ display: "block", marginBottom: 8 }}>RETORNO GLOBAL (ROI)</span>
            <span className="mono" style={{ fontSize: 18, color: globalPnL >= 0 ? "#10B981" : "#F87171" }}>
              {globalPnL >= 0 ? "+" : "-"}&euro;{fmt(Math.abs(globalPnL), 2)} ({globalPnL >= 0 ? "+" : "-"}{fmt(Math.abs(globalPnLPct), 2)}%)
            </span>
          </div>
          <button onClick={openAssetDrawer}
            style={{ background: "white", color: "black", border: "none", padding: "8px 16px", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", cursor: "pointer" }}>+ NEW ASSET</button>
        </div>
      </div>

      {loading ? <EmptyState title="Cargando Mercado..." desc="Conectando con Yahoo Finance y valorando portfolio" /> :
        tickers.length === 0 ? <EmptyState title="Portfolio Vacío" desc="Añade tu primer activo para empezar a medir tu rentabilidad" /> : (
          <div style={{ border: "1px solid #1C1C1F", overflow: "hidden" }}>
            <div style={{ display: "grid", padding: "12px 24px", borderBottom: "1px solid #1C1C1F", background: "rgba(255,255,255,0.015)", gridTemplateColumns: "2.5fr 1fr 1fr 1fr 1fr 90px" }}>
              {["ACTIVO", "CANTIDAD", "PRECIO MERCADO", "INVERSIÓN", "RETORNO", ""].map((h, i) => (
                <span key={h} className="lbl" style={{ textAlign: i > 0 ? "right" : "left" }}>{h}</span>
              ))}
            </div>
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
                <div key={t} className="row" style={{ display: "grid", padding: "18px 24px", borderBottom: i < tickers.length - 1 ? "1px solid rgba(28,28,31,0.6)" : "none", alignItems: "center", gridTemplateColumns: "2.5fr 1fr 1fr 1fr 1fr 90px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 36, height: 36, border: "1px solid #1C1C1F", background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span className="mono" style={{ fontSize: 9, fontWeight: 600, color: "#52525B" }}>{t.slice(0, 4)}</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#E4E4E7", marginBottom: 3 }}>{q ? q.name : t}</div>
                      <div className="lbl">{t} · {q ? q.currency : "USD"}</div>
                    </div>
                  </div>
                  <span className="mono" style={{ fontSize: 13, fontWeight: 500, color: "#D4D4D8", textAlign: "right" }}>{fmt(group.totalQty, 4)}</span>
                  <div style={{ textAlign: "right" }}>
                    <span className="mono" style={{ fontSize: 13, fontWeight: 500, color: "#E4E4E7" }}>{q?.currency === "EUR" ? "€" : "$"}{fmt(currentPrice, 2)}</span>
                    {q && <div className="mono" style={{ fontSize: 10, color: q.change >= 0 ? "rgba(16,185,129,0.7)" : "rgba(248,113,113,0.7)", marginTop: 2 }}>{q.change >= 0 ? "+" : ""}{fmt(q.changePercent, 2)}%</div>}
                  </div>
                  <span className="mono" style={{ fontSize: 13, color: "#A1A1AA", textAlign: "right" }}>€{fmt(group.totalInvested, 2)}</span>
                  <div style={{ textAlign: "right" }}>
                    <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: pos ? "#10B981" : "#F87171" }}>
                      {pos ? "+" : "-"}{q?.currency === "EUR" ? "€" : "$"}{fmt(Math.abs(pnl), 2)}
                    </span>
                    <div className="mono" style={{ fontSize: 10, color: pos ? "rgba(16,185,129,0.7)" : "rgba(248,113,113,0.7)", marginTop: 2 }}>
                      {pos ? "+" : "-"}{fmt(Math.abs(pnlPct), 2)}%
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <button onClick={() => deleteAsset(group.originalIds[0])}
                      style={{ fontSize: 9, color: "#3F3F46", background: "none", border: "1px solid #1C1C1F", padding: "4px 8px", cursor: "pointer", letterSpacing: "0.05em", fontWeight: 600 }}>SELL</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}
