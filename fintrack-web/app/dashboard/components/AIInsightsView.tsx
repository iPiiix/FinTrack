"use client";

import React, { useEffect, useState } from "react";
import { fmt } from "../../../lib/utils";

export function AIInsightsView() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchAI = async () => {
      try {
        const token = localStorage.getItem("fintrack_token");
        const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
        const res = await fetch(`${API}/analytics/ai/insights`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.status === 401) {
          localStorage.removeItem("fintrack_token");
          window.location.href = "/auth";
          return;
        }
        if (res.status === 402) {
          if (active) setData({ error: 402 });
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch AI insights");
        const json = await res.json();
        if (active) setData(json);
      } catch (e) {
        console.error(e);
      } finally {
        if (active) setLoading(false);
      }
    };
    fetchAI();
    return () => { active = false; };
  }, []);

  if (loading) return <div className="vu" style={{ padding: "44px 48px" }}><span className="lbl">SINTETIZANDO DATOS...</span></div>;
  if (data?.error === 402) {
    return (
      <div className="vu relative flex min-h-[70vh] items-center justify-center overflow-hidden" style={{ margin: "24px", padding: "48px", border: "1px solid #1C1C1F", background: "#0A0A0C" }}>
        {/* Background blurred mockup */}
        <div className="absolute inset-0 z-0 flex flex-col gap-6 p-8 opacity-[0.04] blur-sm pointer-events-none" aria-hidden>
          <div className="h-20 w-full rounded-sm bg-zinc-700" />
          <div className="grid grid-cols-2 gap-6">
            <div className="h-40 w-full rounded-sm bg-zinc-700" />
            <div className="h-40 w-full rounded-sm bg-zinc-700" />
          </div>
          <div className="h-24 w-full rounded-sm bg-zinc-700" />
        </div>
        
        {/* Lock Content */}
        <div className="relative z-10 flex max-w-lg flex-col items-center justify-center text-center">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-sm border border-zinc-800 bg-zinc-900/50">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-500"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
          </div>
          <h2 className="mb-4" style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(32px,4vw,48px)", letterSpacing: "0.02em", color: "#FAFAF9", lineHeight: 1 }}>
            INTELIGENCIA <span style={{ color: "#E8FF47" }}>ARTIFICIAL</span>
          </h2>
          <span className="lbl mb-6" style={{ display: "inline-block", background: "rgba(232, 255, 71, 0.1)", color: "#E8FF47", padding: "4px 8px" }}>
            FUNCIÓN PRO BLOQUEADA
          </span>
          <p className="mb-8 font-light leading-relaxed text-zinc-400" style={{ fontFamily: "'DM Sans',sans-serif", fontSize: 14 }}>
            Conecta tus finanzas a nuestro motor heurístico analítico. Modelos de IA analizan matemáticamente tus gastos para arrojar consejos tácticos y proyectar tu patrimonio neto en tiempo real.
          </p>
          <button 
            onClick={() => window.location.href = "/pricing"}
            className="flex items-center gap-2 bg-[#E8FF47] px-8 py-3.5 font-mono text-[10px] font-bold tracking-[0.22em] text-black transition-all duration-200 hover:bg-[#d4ed36]"
          >
            DESBLOQUEAR AI ADVISOR
          </button>
        </div>
      </div>
    );
  }
  if (!data) return <div className="vu" style={{ padding: "44px 48px" }}><span className="lbl">ERROR DE CONEXIÓN IA</span></div>;

  return (
    <div className="vu" style={{ padding: "44px 48px", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 26, fontWeight: 300, color: "#F4F4F5", letterSpacing: "-0.02em", marginBottom: 8 }}>AI Advisor & Projections</h2>
        <span className="lbl">MOTOR HEURÍSTICO FINANCIERO · MODELO LOCAL</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20, marginBottom: 40 }}>
        {/* Core Projections */}
        <div style={{ background: "#0A0A0C", border: "1px solid #1C1C1F", padding: "28px" }}>
          <span className="lbl" style={{ color: "#A1A1AA" }}>PROYECCIÓN 30 DÍAS (PATRIMONIO)</span>
          <div className="kpi-num" style={{ margin: "16px 0 8px 0" }}>€ {fmt(data.projected_net_worth || 0, 0)}</div>
          <span style={{ fontSize: 11, color: data.projected_change >= 0 ? "#10B981" : "#F87171" }}>
            {data.projected_change >= 0 ? "↑" : "↓"} Cambio estimado: €{fmt(Math.abs(data.projected_change), 0)}
          </span>
        </div>

        <div style={{ background: "#0A0A0C", border: "1px solid #1C1C1F", padding: "28px" }}>
          <span className="lbl" style={{ color: "#A1A1AA" }}>TASA DE AHORRO EN TENDENCIA</span>
          <div className="kpi-num" style={{ margin: "16px 0 8px 0" }}>{fmt(data.savings_rate || 0, 1)}%</div>
          <div style={{ marginTop: 14, height: 2, background: "#1C1C1F", overflow: "hidden", borderRadius: 1 }}>
            <div style={{ height: "100%", background: data.savings_rate >= 20 ? "#10B981" : (data.savings_rate > 0 ? "#FBBF24" : "#F87171"), width: `${Math.min(Math.max(data.savings_rate, 0), 100)}%`, transition: "width 1.2s", borderRadius: 1 }} />
          </div>
        </div>
      </div>

      {/* AI Recommendations */}
      <div style={{ marginBottom: 40 }}>
        <span className="lbl" style={{ display: "block", marginBottom: 16 }}>SÍNTESIS Y CONSEJOS</span>
        {data.recommendations && data.recommendations.length > 0 ? data.recommendations.map((rec: any, i: number) => (
          <div key={i} style={{ borderLeft: `3px solid ${rec.type === "positive" ? "#10B981" : rec.type === "warning" ? "#FBBF24" : rec.type === "negative" ? "#F87171" : "#A1A1AA"}`, background: "rgba(255,255,255,0.015)", padding: "20px 24px", marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#FAFAFA", marginBottom: 8 }}>{rec.title}</div>
            <div style={{ fontSize: 12, color: "#A1A1AA", lineHeight: 1.5 }}>{rec.message}</div>
          </div>
        )) : <div style={{ fontSize: 12, color: "#52525B" }}>No hay consejos relevantes disponibles en este momento.</div>}
      </div>

      {/* Anomalies */}
      {data.anomalies && data.anomalies.length > 0 && (
        <div>
          <span className="lbl" style={{ display: "block", marginBottom: 16, color: "#F87171" }}>ANOMALÍAS DETECTADAS</span>
          <div style={{ border: "1px solid #1C1C1F", overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", padding: "12px 24px", borderBottom: "1px solid #1C1C1F", background: "rgba(255,255,255,0.015)" }}>
              <span className="lbl">ALERTA</span>
              <span className="lbl" style={{ textAlign: "right" }}>IMPACTO ESTIMADO</span>
            </div>
            {data.anomalies.map((ano: any, i: number) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", padding: "16px 24px", borderBottom: "1px solid rgba(28,28,31,0.6)", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: "#E4E4E7" }}>{ano.message}</span>
                <span className="mono" style={{ fontSize: 12, color: "#F87171", textAlign: "right" }}>−€{fmt(ano.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
