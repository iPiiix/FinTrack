"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { fmt } from "../../../lib/utils";

interface MonteCarloChartProps {
  className?: string;
}

export function MonteCarloChart({ className }: MonteCarloChartProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [horizon, setHorizon] = useState(12);

  const API = "/api";

  const fetchSimulation = useCallback(async (months: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/analytics/ai/monte-carlo?months=${months}`, {
        credentials: "include",
      });
      if (res.status === 402) {
        setError("Función exclusiva del plan Pro. Actualiza tu suscripción para acceder.");
        setData(null);
        return;
      }
      if (!res.ok) throw new Error("Error al obtener proyección");
      const json = await res.json();
      if (json.error) {
        setError(json.message || "Datos insuficientes");
        setData(null);
      } else {
        setData(json);
      }
    } catch (err: any) {
      setError(err.message || "Error de conexión");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSimulation(horizon);
  }, [horizon]);

  const chartData = useMemo(() => {
    if (!data?.paths || !data?.labels) return [];
    return data.labels.map((label: string, i: number) => ({
      month: label,
      p10: Math.round(data.paths.p10[i]),
      p25: Math.round(data.paths.p25[i]),
      p50: Math.round(data.paths.p50[i]),
      p75: Math.round(data.paths.p75[i]),
      p90: Math.round(data.paths.p90[i]),
    }));
  }, [data]);

  if (loading) {
    return (
      <div className={className} style={{ padding: "32px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24 }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#E8FF47", animation: "pulse 1.5s infinite" }} />
          <span className="lbl">CALCULANDO PROYECCIÓN MONTE CARLO...</span>
        </div>
        <div style={{ height: 280, background: "rgba(255,255,255,0.02)", borderRadius: 4, border: "1px solid #1C1C1F" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={className} style={{ padding: "32px 0" }}>
        <div style={{ border: "1px solid rgba(251,191,36,0.2)", padding: "16px 20px", background: "rgba(251,191,36,0.05)", borderRadius: 4 }}>
          <span className="lbl" style={{ color: "#FBBF24" }}>⚠ {error}</span>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const summary = data.summary || {};

  return (
    <div className={className} style={{ padding: "32px 0" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24 }}>
        <div>
          <h3 style={{ fontSize: 18, fontWeight: 300, color: "#F4F4F5", letterSpacing: "-0.02em", marginBottom: 6 }}>
            Proyección Patrimonial
          </h3>
          <span className="lbl">SIMULACIÓN MONTE CARLO · {summary.months_projected || horizon} MESES</span>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {[12, 24, 36].map((m) => (
            <button
              key={m}
              onClick={() => setHorizon(m)}
              style={{
                padding: "6px 14px",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: "0.06em",
                border: horizon === m ? "1px solid #E8FF47" : "1px solid #27272A",
                background: horizon === m ? "rgba(232,255,71,0.08)" : "transparent",
                color: horizon === m ? "#E8FF47" : "#71717A",
                cursor: "pointer",
                borderRadius: 2,
                transition: "all 0.2s",
              }}
            >
              {m}M
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 24 }}>
        <div style={{ border: "1px solid #1C1C1F", padding: "14px 16px", background: "rgba(255,255,255,0.01)" }}>
          <span className="lbl" style={{ marginBottom: 6, display: "block" }}>ESCENARIO OPTIMISTA (P90)</span>
          <span className="mono" style={{ fontSize: 18, color: "#10B981", fontWeight: 600 }}>€{fmt(summary.best_case || 0)}</span>
        </div>
        <div style={{ border: "1px solid #1C1C1F", padding: "14px 16px", background: "rgba(255,255,255,0.01)" }}>
          <span className="lbl" style={{ marginBottom: 6, display: "block" }}>MEDIANA ESPERADA (P50)</span>
          <span className="mono" style={{ fontSize: 18, color: "#E8FF47", fontWeight: 600 }}>€{fmt(summary.median_final || 0)}</span>
        </div>
        <div style={{ border: "1px solid #1C1C1F", padding: "14px 16px", background: "rgba(255,255,255,0.01)" }}>
          <span className="lbl" style={{ marginBottom: 6, display: "block" }}>ESCENARIO PESIMISTA (P10)</span>
          <span className="mono" style={{ fontSize: 18, color: "#F87171", fontWeight: 600 }}>€{fmt(summary.worst_case || 0)}</span>
        </div>
      </div>

      {/* High variability warning */}
      {summary.high_variability && (
        <div style={{ border: "1px solid rgba(251,191,36,0.2)", padding: "10px 14px", background: "rgba(251,191,36,0.04)", borderRadius: 2, marginBottom: 16 }}>
          <span style={{ fontSize: 11, color: "#FBBF24" }}>⚠ Alta variabilidad detectada — los resultados pueden ser menos fiables.</span>
        </div>
      )}

      {/* Chart */}
      <div style={{ height: 300, marginBottom: 16 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="mc-p90" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#10B981" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="mc-p75" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#E8FF47" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#E8FF47" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="month" tick={{ fill: "#52525B", fontSize: 9 }} axisLine={{ stroke: "#1C1C1F" }} tickLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fill: "#52525B", fontSize: 9 }} axisLine={{ stroke: "#1C1C1F" }} tickLine={false} tickFormatter={(v: number) => `€${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              contentStyle={{ background: "#09090B", border: "1px solid #27272A", borderRadius: 4, fontSize: 11 }}
              labelStyle={{ color: "#71717A", fontSize: 10 }}
              formatter={(val: number, name: string) => [`€${fmt(val)}`, name.toUpperCase()]}
            />
            <Area type="monotone" dataKey="p90" stroke="transparent" fill="url(#mc-p90)" />
            <Area type="monotone" dataKey="p75" stroke="transparent" fill="url(#mc-p75)" />
            <Area type="monotone" dataKey="p50" stroke="#E8FF47" strokeWidth={2} fill="none" dot={false} />
            <Area type="monotone" dataKey="p25" stroke="#52525B" strokeWidth={1} strokeDasharray="4 4" fill="none" dot={false} />
            <Area type="monotone" dataKey="p10" stroke="#F87171" strokeWidth={1} strokeDasharray="4 4" fill="none" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Disclaimer */}
      <div style={{ fontSize: 10, color: "#3F3F46", lineHeight: 1.5, maxWidth: 600 }}>
        * Esta proyección se basa en la volatilidad histórica de tus flujos financieros y no constituye asesoramiento financiero.
        Los resultados pasados no garantizan rendimientos futuros. Flujo medio mensual: €{fmt(summary.mean_monthly_flow || 0)}.
      </div>
    </div>
  );
}
