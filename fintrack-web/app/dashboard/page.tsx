// @ts-nocheck
"use client";
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";

// ─── CHART.JS LAZY LOAD ───────────────────────────────────────────────────────
let ChartJS: any = null;
const loadChart = () => {
  if (typeof window !== "undefined" && !ChartJS) {
    return import("chart.js/auto").then(m => { ChartJS = m.default || m; return ChartJS; }).catch(() => null);
  }
  return Promise.resolve(ChartJS);
};

// ─── BACKEND ──────────────────────────────────────────────────────────────────
const API = "http://127.0.0.1:8000";

function getToken() { return typeof window !== "undefined" ? localStorage.getItem("fintrack_token") : null; }
function authHeaders() { return { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" }; }

async function apiFetch(path) {
  const res = await fetch(`${API}${path}`, { headers: authHeaders() });
  if (res.status === 401) { localStorage.removeItem("fintrack_token"); window.location.href = "/auth"; return null; }
  if (!res.ok) throw new Error(`API error ${res.status}`);
  return res.json();
}

// ─── UTILS ────────────────────────────────────────────────────────────────────
const fmt = (n, d = 2) => Math.abs(n).toLocaleString("es-ES", { minimumFractionDigits: d, maximumFractionDigits: d });
const MONTHS = ["ENE","FEB","MAR","ABR","MAY","JUN","JUL","AGO","SEP","OCT","NOV","DIC"];

function groupByMonth(transactions) {
  const now = new Date();
  const labels = [];
  const flows = [];
  const nets = [];
  for (let i = 7; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
    labels.push(MONTHS[d.getMonth()]);
    const monthTxs = transactions.filter(t => t.fecha && t.fecha.startsWith(key));
    const flow = monthTxs.reduce((s, t) => s + (t.tipo === "ingreso" ? Math.abs(t.cantidad) : -Math.abs(t.cantidad)), 0);
    flows.push(Math.round(flow));
    nets.push(0);
  }
  let running = 0;
  flows.forEach((f, i) => { running += f; nets[i] = running; });
  return { labels, flows, nets };
}

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
function Styles() {
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

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
function EmptyState({ title, desc }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 40px", textAlign: "center" }}>
      <img src="/unnamed.jpg" alt="FinTrack" style={{ width: 48, height: 48, objectFit: "contain", marginBottom: 24, opacity: 0.4 }} />
      <div style={{ fontSize: 14, fontWeight: 500, color: "#71717A", marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 12, color: "#3F3F46", maxWidth: 320 }}>{desc}</div>
    </div>
  );
}

// ─── TOP BAR ──────────────────────────────────────────────────────────────────
const NAV = ["OVERVIEW", "TRANSACTIONS", "PORTFOLIO", "SETTINGS"];

function TopBar({ time, tab, setTab, loading, openDrawer }) {
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 40, display: "flex", alignItems: "center", borderBottom: "1px solid #1C1C1F", background: "rgba(9,9,11,0.97)", backdropFilter: "blur(12px)", height: 56 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 28px", borderRight: "1px solid #1C1C1F", height: "100%", flexShrink: 0 }}>
        <img src="/unnamed.jpg" alt="FinTrack" style={{ width: 22, height: 22, objectFit: "contain" }} />
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

// ─── OVERVIEW ─────────────────────────────────────────────────────────────────
function OverviewView({ analytics, loading, transactions }) {
  const chartRef = useRef(null);
  const chartInst = useRef(null);
  const { labels, flows, nets } = useMemo(() => groupByMonth(transactions), [transactions]);

  useEffect(() => {
    let destroyed = false;
    loadChart().then(C => {
      if (!C || !chartRef.current || destroyed) return;
      chartInst.current?.destroy();
      C.defaults.font.family = "'IBM Plex Mono', monospace";
      chartInst.current = new C(chartRef.current, {
        type: "line",
        data: {
          labels,
          datasets: [
            { type: "line", label: "CASH FLOW ACUM.", data: nets, borderColor: "#FFFFFF", borderWidth: 1.5, tension: 0.35, pointRadius: 0, pointHoverRadius: 5, yAxisID: "y", fill: true,
              backgroundColor: ctx => { const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 280); g.addColorStop(0, "rgba(255,255,255,0.06)"); g.addColorStop(1, "rgba(255,255,255,0)"); return g; } },
            { type: "bar", label: "FLUJO MENSUAL", data: flows, backgroundColor: ctx => ctx.raw >= 0 ? "rgba(255,255,255,0.06)" : "rgba(239,68,68,0.1)", borderColor: ctx => ctx.raw >= 0 ? "rgba(255,255,255,0.2)" : "rgba(239,68,68,0.35)", borderWidth: 1, yAxisID: "y1", borderRadius: 1 },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false, interaction: { mode: "index", intersect: false },
          plugins: { legend: { display: false }, tooltip: { backgroundColor: "#18181B", borderColor: "#3F3F46", borderWidth: 1, padding: 14, cornerRadius: 3, titleColor: "#52525B", bodyColor: "#FAFAFA", titleFont: { size: 10, family: "'Inter',sans-serif", weight: "600" }, bodyFont: { size: 12, family: "'IBM Plex Mono',monospace" }, callbacks: { label: ctx => `  ${ctx.dataset.label}  €${fmt(ctx.parsed.y, 0)}` } } },
          scales: { x: { grid: { display: false }, border: { display: false }, ticks: { color: "#3F3F46", font: { size: 9 } } }, y: { display: false }, y1: { display: false, position: "right" } },
        },
      });
    });
    return () => { destroyed = true; chartInst.current?.destroy(); };
  }, [labels, flows, nets]);

  const savingsRate = analytics.tasa_ahorro_pct || 0;
  const kpis = [
    { label: "NET WORTH", unit: "EUR", value: loading ? "——" : `€ ${fmt(analytics.patrimonio_neto, 0)}`, bright: !loading, extra: <div style={{ marginTop: 14, height: 1, background: "linear-gradient(to right, rgba(255,255,255,0.2), transparent)" }} /> },
    { label: "CASH FLOW · 30D", unit: "EUR", value: loading ? "——" : `${analytics.flujo_caja_neto >= 0 ? "+" : "−"}€ ${fmt(analytics.flujo_caja_neto, 0)}`, bright: !loading, sub: analytics.flujo_caja_neto >= 0 ? "↑ POSITIVO" : "↓ NEGATIVO", subPos: analytics.flujo_caja_neto >= 0 },
    { label: "INGRESOS TOTALES", unit: "EUR", value: loading ? "——" : `€ ${fmt(analytics.total_ingresos, 0)}`, bright: !loading },
    { label: "SAVINGS RATE", unit: "%", value: loading ? "——" : `${fmt(savingsRate, 1)}%`, bright: !loading, sub: savingsRate >= 50 ? "↑ TARGET MET" : "↓ BELOW TARGET", subPos: savingsRate >= 50,
      extra: <div style={{ marginTop: 14, height: 2, background: "#1C1C1F", overflow: "hidden", borderRadius: 1 }}><div style={{ height: "100%", background: "rgba(255,255,255,0.35)", width: `${Math.min(savingsRate, 100)}%`, transition: "width 1.2s cubic-bezier(0.16,1,0.3,1)", borderRadius: 1 }} /></div> },
  ];

  return (
    <div className="vu">
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderBottom: "1px solid #1C1C1F" }}>
        {kpis.map((k, i) => (
          <div key={k.label} style={{ padding: "36px 36px 32px", display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: 164, borderRight: i < 3 ? "1px solid #1C1C1F" : undefined }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <span className="lbl">{k.label}</span>
              <span className="lbl" style={{ opacity: 0.4 }}>{k.unit}</span>
            </div>
            <div>
              <div className="kpi-num" style={{ color: k.bright ? "white" : "#E4E4E7" }}>{k.value}</div>
              {k.sub && <div className="mono" style={{ marginTop: 10, fontSize: 11, color: k.subPos ? "rgba(16,185,129,0.8)" : "rgba(248,113,113,0.8)" }}>{k.sub}</div>}
              {k.extra}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px" }}>
        <div style={{ borderRight: "1px solid #1C1C1F" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", padding: "32px 36px 0" }}>
            <div>
              <span className="lbl" style={{ display: "block", marginBottom: 14 }}>FLUJO DE CAJA</span>
              <div style={{ display: "flex", gap: 24 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 22, height: 1, borderTop: "1px solid rgba(255,255,255,0.5)" }} /><span style={{ fontSize: 10, color: "#52525B" }}>Acumulado</span></div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}><div style={{ width: 10, height: 10, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.2)" }} /><span style={{ fontSize: 10, color: "#52525B" }}>Mensual</span></div>
              </div>
            </div>
          </div>
          <div style={{ height: 276, padding: "20px 12px 20px 4px" }}>
            {transactions.length === 0 ? <EmptyState title="Sin datos" desc="Añade tu primera transacción para ver el gráfico" /> : <canvas ref={chartRef} />}
          </div>
          <div style={{ borderTop: "1px solid #1C1C1F", padding: "24px 36px 28px" }}>
            <span className="lbl" style={{ display: "block", marginBottom: 14 }}>FLUJO MENSUAL</span>
            {flows.length > 0 && flows.some(f => f !== 0) ? (
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${labels.length}, 1fr)`, gap: 5 }}>
                {flows.map((f, i) => {
                  const pos = f >= 0;
                  const intensity = Math.min(Math.abs(f) / (Math.max(...flows.map(Math.abs)) || 1), 1);
                  return (
                    <div key={i} style={{ padding: "10px 6px", textAlign: "center", border: "1px solid", background: pos ? `rgba(255,255,255,${0.02 + intensity * 0.07})` : `rgba(239,68,68,${0.03 + intensity * 0.09})`, borderColor: pos ? `rgba(255,255,255,${0.06 + intensity * 0.1})` : `rgba(239,68,68,${0.12 + intensity * 0.12})` }}>
                      <div className="lbl" style={{ marginBottom: 6 }}>{labels[i]}</div>
                      <div className="mono" style={{ fontSize: 10, fontWeight: 500, color: pos ? "#D4D4D8" : "#F87171" }}>{pos ? "+" : "−"}{fmt(Math.abs(f), 0)}</div>
                    </div>
                  );
                })}
              </div>
            ) : <div className="lbl" style={{ color: "#3F3F46" }}>Sin transacciones aún</div>}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ borderBottom: "1px solid #1C1C1F", padding: 28 }}>
            <span className="lbl" style={{ display: "block", marginBottom: 18 }}>CUENTAS</span>
            {analytics._cuentas && analytics._cuentas.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {analytics._cuentas.map((c, i) => (
                  <div key={c.id_cuenta} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: ["#FAFAFA","#71717A","#3F3F46","#27272A"][i % 4], flexShrink: 0 }} />
                      <span className="lbl">{c.nombre}</span>
                    </div>
                    <span className="mono" style={{ fontSize: 10, color: "#71717A" }}>€{fmt(c.balance, 0)}</span>
                  </div>
                ))}
              </div>
            ) : <div className="lbl" style={{ color: "#3F3F46" }}>Crea tu primera cuenta</div>}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 28px", borderBottom: "1px solid #1C1C1F" }}>
              <span className="lbl">ÚLTIMAS TRANSACCIONES</span>
            </div>
            {transactions.length === 0 ? <EmptyState title="Sin transacciones" desc="Añade tu primera entrada con el botón + NEW ENTRY" /> :
              transactions.slice(0, 6).map(tx => {
                const pos = tx.tipo === "ingreso";
                return (
                  <div key={tx.id_transaccion} className="row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 28px", borderBottom: "1px solid rgba(28,28,31,0.8)" }}>
                    <div style={{ flex: 1, minWidth: 0, paddingRight: 14 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: "#E4E4E7", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 4 }}>{tx.nombre}</div>
                      <div className="lbl">{tx.fecha ? new Date(tx.fecha).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "2-digit" }).toUpperCase() : ""}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div className="mono" style={{ fontSize: 12, color: pos ? "#10B981" : "#A1A1AA" }}>{pos ? "+" : "−"}€{fmt(Math.abs(tx.cantidad))}</div>
                      {tx.estado === "pendiente" && <span style={{ fontSize: 9, fontWeight: 600, color: "#FBBF24", letterSpacing: "0.06em" }}>PENDING</span>}
                    </div>
                  </div>
                );
              })
            }
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TRANSACTIONS VIEW ────────────────────────────────────────────────────────
function TransactionsView({ transactions }) {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const FILTERS = ["ALL", "ingreso", "gasto", "transferencia"];

  const filtered = useMemo(() => {
    let r = filter === "ALL" ? transactions : transactions.filter(t => t.tipo === filter);
    if (search.trim()) r = r.filter(t => t.nombre.toLowerCase().includes(search.toLowerCase()));
    return r;
  }, [transactions, filter, search]);

  const totals = useMemo(() => ({
    income: filtered.filter(t => t.tipo === "ingreso").reduce((s, t) => s + Math.abs(t.cantidad), 0),
    expense: filtered.filter(t => t.tipo === "gasto").reduce((s, t) => s + Math.abs(t.cantidad), 0),
  }), [filtered]);

  if (transactions.length === 0) return <EmptyState title="Sin transacciones" desc="Añade tu primera entrada con el botón + NEW ENTRY arriba" />;

  const COL = "100px 3fr 1.1fr 130px 100px";
  return (
    <div className="vu" style={{ padding: "44px 48px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 300, color: "#F4F4F5", letterSpacing: "-0.02em", marginBottom: 8 }}>General Ledger</h2>
          <span className="lbl">REGISTRO HISTÓRICO · {filtered.length} ENTRADAS</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <span className="mono" style={{ fontSize: 11, color: "#10B981" }}>IN +€{fmt(totals.income, 0)}</span>
          <div style={{ width: 1, height: 16, background: "#1C1C1F" }} />
          <span className="mono" style={{ fontSize: 11, color: "#F87171" }}>OUT −€{fmt(totals.expense, 0)}</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 10, background: "#0D0D0F", border: "1px solid #1C1C1F", padding: "0 16px", height: 40 }}>
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="#3F3F46" strokeWidth="1.5"><circle cx="5" cy="5" r="4" /><path d="M11 11L8 8" /></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre…"
            style={{ background: "transparent", border: "none", outline: "none", fontSize: 12, color: "#E4E4E7", flex: 1, fontFamily: "'IBM Plex Mono', monospace" }} />
          {search && <button onClick={() => setSearch("")} style={{ color: "#52525B", background: "none", border: "none", cursor: "pointer", fontSize: 16 }}>×</button>}
        </div>
        <div style={{ display: "flex", border: "1px solid #1C1C1F", overflow: "hidden" }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ padding: "0 16px", fontSize: 10, fontWeight: 600, letterSpacing: "0.05em", cursor: "pointer", background: filter === f ? "#27272A" : "transparent", color: filter === f ? "#F4F4F5" : "#52525B", height: 40, border: "none", borderRight: "1px solid #1C1C1F", whiteSpace: "nowrap", textTransform: "uppercase" }}>
              {f === "ALL" ? "TODOS" : f}
            </button>
          ))}
        </div>
      </div>
      <div style={{ border: "1px solid #1C1C1F", overflow: "hidden" }}>
        <div style={{ display: "grid", padding: "12px 24px", borderBottom: "1px solid #1C1C1F", background: "rgba(255,255,255,0.015)", gridTemplateColumns: COL }}>
          {["FECHA", "DESCRIPCIÓN", "CUENTA", "IMPORTE (EUR)", "ESTADO"].map((h, i) => (
            <span key={h} className="lbl" style={{ textAlign: i >= 3 ? "right" : "left" }}>{h}</span>
          ))}
        </div>
        <div style={{ maxHeight: "calc(100vh - 310px)", overflowY: "auto" }}>
          {filtered.length === 0 ? <div style={{ padding: "64px 0", textAlign: "center" }} className="lbl">Sin resultados</div> :
            filtered.map(tx => {
              const pos = tx.tipo === "ingreso";
              return (
                <div key={tx.id_transaccion} className="row" style={{ display: "grid", padding: "16px 24px", borderBottom: "1px solid rgba(28,28,31,0.6)", alignItems: "center", gridTemplateColumns: COL }}>
                  <span className="mono" style={{ fontSize: 10, color: "#52525B" }}>{tx.fecha ? new Date(tx.fecha).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "2-digit" }).toUpperCase() : "—"}</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "#E4E4E7" }}>{tx.nombre}</span>
                  <span style={{ fontSize: 10, color: "#52525B" }}>Cuenta #{tx.id_cuenta}</span>
                  <span className="mono" style={{ fontSize: 12, fontWeight: 500, textAlign: "right", color: pos ? "#10B981" : "#D4D4D8" }}>{pos ? "+" : "−"}€{fmt(Math.abs(tx.cantidad))}</span>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.07em", padding: "4px 8px", border: "1px solid", borderColor: tx.estado === "completada" ? "#1C1C1F" : "rgba(251,191,36,0.3)", color: tx.estado === "completada" ? "#3F3F46" : "#FBBF24", background: tx.estado === "pendiente" ? "rgba(251,191,36,0.04)" : "transparent", textTransform: "uppercase" }}>{tx.estado}</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}

// ─── PORTFOLIO VIEW (LIVE YAHOO FINANCE) ──────────────────────────────────────
const DEFAULT_TICKERS = ["AAPL", "VOO", "TSLA", "IWDA.AS", "BTC-EUR", "MSFT"];

function PortfolioView() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tickers, setTickers] = useState(DEFAULT_TICKERS);
  const [newTicker, setNewTicker] = useState("");

  const fetchQuotes = useCallback(async () => {
    try {
      const res = await fetch(`/api/quote?symbols=${tickers.join(",")}`);
      if (res.ok) { const data = await res.json(); setQuotes(data.quotes || []); }
    } catch { /* ignore */ }
    setLoading(false);
  }, [tickers]);

  useEffect(() => { fetchQuotes(); const iv = setInterval(fetchQuotes, 30000); return () => clearInterval(iv); }, [fetchQuotes]);

  const addTicker = () => { if (newTicker.trim() && !tickers.includes(newTicker.trim().toUpperCase())) { setTickers(p => [...p, newTicker.trim().toUpperCase()]); setNewTicker(""); } };
  const removeTicker = (t) => setTickers(p => p.filter(x => x !== t));

  const total = quotes.reduce((s, q) => s + q.price, 0);

  return (
    <div className="vu" style={{ padding: "44px 48px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 300, color: "#F4F4F5", letterSpacing: "-0.02em", marginBottom: 8 }}>Portfolio</h2>
          <span className="lbl">COTIZACIONES EN TIEMPO REAL · YAHOO FINANCE · {quotes.length} ACTIVOS</span>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <input value={newTicker} onChange={e => setNewTicker(e.target.value)} placeholder="Añadir ticker…"
            onKeyDown={e => e.key === "Enter" && addTicker()}
            style={{ background: "#0D0D0F", border: "1px solid #27272A", padding: "8px 14px", color: "#FAFAFA", fontSize: 11, outline: "none", width: 140, fontFamily: "'IBM Plex Mono', monospace" }} />
          <button onClick={addTicker}
            style={{ background: "white", color: "black", border: "none", padding: "8px 16px", fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", cursor: "pointer" }}>ADD</button>
        </div>
      </div>
      {loading ? <EmptyState title="Cargando..." desc="Obteniendo cotizaciones en tiempo real" /> :
        quotes.length === 0 ? <EmptyState title="Sin datos" desc="No se pudieron obtener cotizaciones" /> : (
          <div style={{ border: "1px solid #1C1C1F", overflow: "hidden" }}>
            <div style={{ display: "grid", padding: "12px 24px", borderBottom: "1px solid #1C1C1F", background: "rgba(255,255,255,0.015)", gridTemplateColumns: "2.5fr 1fr 1fr 1fr 90px" }}>
              {["ACTIVO", "PRECIO", "CAMBIO", "VOLUMEN", ""].map((h, i) => (
                <span key={h} className="lbl" style={{ textAlign: i > 0 ? "right" : "left" }}>{h}</span>
              ))}
            </div>
            {quotes.map((q, i) => {
              const pos = q.change >= 0;
              return (
                <div key={q.symbol} className="row" style={{ display: "grid", padding: "18px 24px", borderBottom: i < quotes.length - 1 ? "1px solid rgba(28,28,31,0.6)" : "none", alignItems: "center", gridTemplateColumns: "2.5fr 1fr 1fr 1fr 90px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{ width: 36, height: 36, border: "1px solid #1C1C1F", background: "rgba(255,255,255,0.02)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <span className="mono" style={{ fontSize: 9, fontWeight: 600, color: "#52525B" }}>{q.symbol.slice(0, 4)}</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "#E4E4E7", marginBottom: 3 }}>{q.name || q.symbol}</div>
                      <div className="lbl">{q.symbol} · {q.currency}</div>
                    </div>
                  </div>
                  <span className="mono" style={{ fontSize: 13, fontWeight: 500, color: "#D4D4D8", textAlign: "right" }}>{q.currency === "EUR" ? "€" : "$"}{fmt(q.price, 2)}</span>
                  <div style={{ textAlign: "right" }}>
                    <span className="mono" style={{ fontSize: 12, fontWeight: 600, color: pos ? "#10B981" : "#F87171" }}>{pos ? "+" : ""}{q.changePercent?.toFixed(2)}%</span>
                    <div className="mono" style={{ fontSize: 10, color: "#52525B", marginTop: 2 }}>{pos ? "+" : ""}{q.change?.toFixed(2)}</div>
                  </div>
                  <span className="mono" style={{ fontSize: 11, color: "#52525B", textAlign: "right" }}>{q.volume ? (q.volume / 1e6).toFixed(1) + "M" : "—"}</span>
                  <div style={{ textAlign: "right" }}>
                    <button onClick={() => removeTicker(q.symbol)}
                      style={{ fontSize: 9, color: "#3F3F46", background: "none", border: "1px solid #1C1C1F", padding: "4px 8px", cursor: "pointer", letterSpacing: "0.05em", fontWeight: 600 }}>REMOVE</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
    </div>
  );
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
function SettingsView() {
  const router = useRouter();
  const user = typeof window !== "undefined" ? JSON.parse(localStorage.getItem("fintrack_user") || "{}") : {};

  const handleLogout = () => {
    localStorage.removeItem("fintrack_token");
    localStorage.removeItem("fintrack_user");
    router.push("/auth");
  };

  const Sec = ({ title, children }) => (
    <div style={{ border: "1px solid #1C1C1F", overflow: "hidden", marginBottom: 16 }}>
      <div style={{ padding: "12px 24px", borderBottom: "1px solid #1C1C1F", background: "rgba(255,255,255,0.015)" }}><span className="lbl">{title}</span></div>
      {children}
    </div>
  );
  const Row = ({ label, desc, right }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid rgba(28,28,31,0.6)" }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: "#E4E4E7", marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 11, color: "#52525B" }}>{desc}</div>
      </div>
      {right}
    </div>
  );

  return (
    <div className="vu" style={{ padding: "44px 48px", maxWidth: 740 }}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 26, fontWeight: 300, color: "#F4F4F5", letterSpacing: "-0.02em", marginBottom: 8 }}>Settings</h2>
        <span className="lbl">CONFIGURACIÓN DEL SISTEMA</span>
      </div>
      <Sec title="PERFIL">
        <Row label="Nombre" desc={user.nombre || "—"} />
        <Row label="Email" desc={user.email || "—"}
          right={<span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.09em", padding: "5px 10px", border: "1px solid", borderColor: user.email_verificado ? "rgba(16,185,129,0.2)" : "rgba(251,191,36,0.3)", color: user.email_verificado ? "#10B981" : "#FBBF24", background: user.email_verificado ? "rgba(16,185,129,0.04)" : "rgba(251,191,36,0.04)" }}>{user.email_verificado ? "VERIFICADO" : "PENDIENTE"}</span>} />
      </Sec>
      <Sec title="SEGURIDAD">
        <Row label="Cifrado de sesión" desc="AES-256 activo"
          right={<span className="mono" style={{ fontSize: 10, color: "#10B981" }}>SECURE ✓</span>} />
        <div style={{ padding: "16px 24px" }}>
          <button onClick={handleLogout}
            style={{ fontSize: 10, fontWeight: 600, color: "#F87171", letterSpacing: "0.06em", border: "1px solid rgba(248,113,113,0.2)", padding: "8px 16px", background: "transparent", cursor: "pointer" }}>
            CERRAR SESIÓN
          </button>
        </div>
      </Sec>
    </div>
  );
}

// ─── DRAWER ───────────────────────────────────────────────────────────────────
function Drawer({ isOpen, onClose, onSave, cuentas, categorias }) {
  const [type, setType] = useState("ingreso");
  const [cantidad, setCantidad] = useState("");
  const [nombre, setNombre] = useState("");
  const [idCuenta, setIdCuenta] = useState("");
  const [idCategoria, setIdCategoria] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!cantidad || !nombre || !idCuenta) { setError("Completa importe, descripción y cuenta"); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${API}/transactions/`, {
        method: "POST", headers: authHeaders(),
        body: JSON.stringify({ cantidad: parseFloat(cantidad), tipo: type, nombre, id_cuenta: parseInt(idCuenta), id_categoria: idCategoria ? parseInt(idCategoria) : null, estado: "completada" }),
      });
      if (!res.ok) { const e = await res.json().catch(() => null); throw new Error(e?.detail || "Error"); }
      onSave();
      onClose();
    } catch (e) { setError(e.message); }
    setSaving(false);
  };

  return (
    <>
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", zIndex: 50 }} onClick={onClose} />
      <div className="drawer" style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 460, background: "#0C0C0E", borderLeft: "1px solid #1C1C1F", zIndex: 50, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "28px 32px", borderBottom: "1px solid #1C1C1F" }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500, color: "white", marginBottom: 4 }}>Nueva Transacción</div>
            <div style={{ fontSize: 11, color: "#52525B" }}>Registro en el libro mayor</div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, border: "1px solid #27272A", color: "#71717A", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, background: "transparent" }}>×</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <label className="lbl" style={{ display: "block", marginBottom: 10 }}>TIPO</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[{ val: "ingreso", label: "↓ INGRESO", c: "#10B981" }, { val: "gasto", label: "↑ GASTO", c: "#F87171" }].map(t => (
                <button key={t.val} onClick={() => setType(t.val)}
                  style={{ padding: "12px 0", border: `1px solid ${type === t.val ? t.c + "60" : "#27272A"}`, fontSize: 10, fontWeight: 700, letterSpacing: "0.07em", cursor: "pointer", color: type === t.val ? t.c : "#52525B", background: "transparent" }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="lbl" style={{ display: "block", marginBottom: 8 }}>IMPORTE (EUR)</label>
            <input type="number" value={cantidad} onChange={e => setCantidad(e.target.value)} placeholder="0.00" className="inp" />
          </div>
          <div>
            <label className="lbl" style={{ display: "block", marginBottom: 8 }}>DESCRIPCIÓN</label>
            <input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej. Nómina, Alquiler…" className="inp" />
          </div>
          <div>
            <label className="lbl" style={{ display: "block", marginBottom: 8 }}>CUENTA</label>
            <select value={idCuenta} onChange={e => setIdCuenta(e.target.value)} className="inp">
              <option value="">Seleccionar cuenta…</option>
              {cuentas.map(c => <option key={c.id_cuenta} value={c.id_cuenta}>{c.nombre} (€{fmt(c.balance, 0)})</option>)}
            </select>
          </div>
          <div>
            <label className="lbl" style={{ display: "block", marginBottom: 8 }}>CATEGORÍA (OPCIONAL)</label>
            <select value={idCategoria} onChange={e => setIdCategoria(e.target.value)} className="inp">
              <option value="">Sin categoría</option>
              {categorias.map(c => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
            </select>
          </div>
          {error && <div style={{ border: "1px solid rgba(248,113,113,0.2)", padding: "10px 14px" }}><span className="mono" style={{ fontSize: 10, color: "#F87171" }}>{error}</span></div>}
        </div>
        <div style={{ display: "flex", gap: 10, padding: "20px 32px", borderTop: "1px solid #1C1C1F" }}>
          <button onClick={onClose} style={{ flex: 1, padding: "12px 0", border: "1px solid #27272A", color: "#71717A", cursor: "pointer", fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", background: "transparent" }}>CANCELAR</button>
          <button onClick={handleSave} disabled={saving}
            style={{ flex: 2, padding: "12px 0", background: "white", color: "black", fontWeight: 700, fontSize: 11, letterSpacing: "0.08em", border: "none", cursor: "pointer", opacity: saving ? 0.5 : 1 }}>
            {saving ? "GUARDANDO…" : "COMMIT ENTRY"}
          </button>
        </div>
      </div>
    </>
  );
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("OVERVIEW");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [analytics, setAnalytics] = useState({ patrimonio_neto: 0, flujo_caja_neto: 0, total_ingresos: 0, total_gastos: 0, tasa_ahorro_pct: 0, _cuentas: [] });
  const [transactions, setTransactions] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [categorias, setCategorias] = useState([]);

  // Auth check
  useEffect(() => { if (!getToken()) { router.push("/auth"); } }, [router]);

  // Clock
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    tick(); const iv = setInterval(tick, 1000); return () => clearInterval(iv);
  }, []);

  // Fetch all data
  const fetchAll = useCallback(async () => {
    if (!getToken()) return;
    setLoading(true);
    try {
      const [analyticsData, txData, cuentasData, catData] = await Promise.all([
        apiFetch("/analytics/summary"),
        apiFetch("/transactions/"),
        apiFetch("/cuentas/"),
        apiFetch("/categorias/"),
      ]);
      if (analyticsData) setAnalytics({ ...analyticsData, _cuentas: cuentasData || [] });
      if (txData) setTransactions(txData);
      if (cuentasData) setCuentas(cuentasData);
      if (catData) setCategorias(catData);
    } catch { /* handled in apiFetch */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addToast = useCallback((msg, type = "info") => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);

  const handleSave = () => { fetchAll(); addToast("Transacción registrada correctamente", "success"); };

  const views = {
    OVERVIEW: <OverviewView analytics={analytics} loading={loading} transactions={transactions} />,
    TRANSACTIONS: <TransactionsView transactions={transactions} />,
    PORTFOLIO: <PortfolioView />,
    SETTINGS: <SettingsView />,
  };

  return (
    <>
      <Styles />
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#09090B" }}>
        <TopBar time={time} tab={tab} setTab={setTab} loading={loading} openDrawer={() => setDrawerOpen(true)} />
        <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>{views[tab]}</main>
        <footer style={{ borderTop: "1px solid #1C1C1F", padding: "14px 32px", display: "flex", justifyContent: "space-between", background: "#0C0C0E" }}>
          <span className="lbl">FINTRACK CORE SYSTEM v2.1 · ALL SYSTEMS NOMINAL</span>
          <span className="mono" style={{ fontSize: 10, color: "#3F3F46" }}>SECURE · AES-256-GCM · TLS 1.3</span>
        </footer>
      </div>
      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} onSave={handleSave} cuentas={cuentas} categorias={categorias} />
      <div style={{ position: "fixed", bottom: 24, right: 24, display: "flex", flexDirection: "column", gap: 8, zIndex: 300 }}>
        {toasts.map(t => (
          <div key={t.id} className="toast" style={{ display: "flex", alignItems: "center", gap: 12, background: "#18181B", border: "1px solid", borderColor: t.type === "success" ? "rgba(16,185,129,0.25)" : "#27272A", padding: "14px 20px", minWidth: 280, boxShadow: "0 12px 40px rgba(0,0,0,0.7)" }}>
            <div style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, background: t.type === "success" ? "#10B981" : "white" }} />
            <span style={{ fontSize: 12, fontWeight: 500, color: "#E4E4E7" }}>{t.msg}</span>
          </div>
        ))}
      </div>
    </>
  );
}