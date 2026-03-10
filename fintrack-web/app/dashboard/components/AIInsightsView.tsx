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
