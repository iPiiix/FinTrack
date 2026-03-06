"use client";
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Chart from "chart.js/auto";

// ─── BACKEND ──────────────────────────────────────────────────────────────────
const API_URL = "http://127.0.0.1:8000/analytics/summary";
const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwiZXhwIjoxNzcyNDA1OTMyfQ.3oIpWrxfwakI7cXj23gU05wf0iitoY5n10OS77lhCwY";

// ─── STATIC DATA ──────────────────────────────────────────────────────────────
const CHART_LABELS = ["AGO", "SEP", "OCT", "NOV", "DIC", "ENE", "FEB", "MAR"];
const CHART_NET = [46200, 47800, 49100, 50400, 49900, 52100, 53600, 54750];
const CHART_PREV = [44000, 45500, 47000, 48200, 47800, 49500, 51000, 52300];
const CHART_FLOW = [420, 680, 350, 500, -180, 820, 380, 280];

const TRANSACTIONS = [
  { id: "TX-901", name: "Nómina JP Morgan", category: "INCOME", account: "Principal", amount: 5000.00, date: "01 MAR 26", status: "SETTLED" },
  { id: "TX-902", name: "Vanguard S&P 500", category: "INVESTMENT", account: "Inversión", amount: -1000.00, date: "28 FEB 26", status: "SETTLED" },
  { id: "TX-903", name: "AWS Cloud Hosting", category: "SOFTWARE", account: "Tarjeta", amount: -45.00, date: "25 FEB 26", status: "SETTLED" },
  { id: "TX-904", name: "Dividendo Apple", category: "INCOME", account: "Principal", amount: 18.40, date: "20 FEB 26", status: "SETTLED" },
  { id: "TX-905", name: "Alquiler Despacho", category: "EXPENSE", account: "Tarjeta", amount: -320.00, date: "15 FEB 26", status: "SETTLED" },
  { id: "TX-906", name: "Suscripción Stripe", category: "SOFTWARE", account: "Tarjeta", amount: -29.00, date: "12 FEB 26", status: "SETTLED" },
  { id: "TX-907", name: "Consultoría Alpha", category: "INCOME", account: "Principal", amount: 2400.00, date: "05 FEB 26", status: "SETTLED" },
  { id: "TX-908", name: "Bonos Tesoro ES", category: "INVESTMENT", account: "Inversión", amount: -5000.00, date: "02 FEB 26", status: "SETTLED" },
  { id: "TX-909", name: "Cena Directivos", category: "EXPENSE", account: "Tarjeta", amount: -180.50, date: "28 ENE 26", status: "SETTLED" },
  { id: "TX-910", name: "Intereses Cuenta", category: "INCOME", account: "Principal", amount: 4.20, date: "15 ENE 26", status: "PENDING" },
  { id: "TX-911", name: "Adobe Creative", category: "SOFTWARE", account: "Tarjeta", amount: -54.99, date: "10 ENE 26", status: "SETTLED" },
  { id: "TX-912", name: "ETF MSCI World", category: "INVESTMENT", account: "Inversión", amount: -2500.00, date: "05 ENE 26", status: "SETTLED" },
  { id: "TX-913", name: "Consultoría Beta", category: "INCOME", account: "Principal", amount: 3200.00, date: "28 DIC 25", status: "SETTLED" },
  { id: "TX-914", name: "Seguro Médico", category: "EXPENSE", account: "Tarjeta", amount: -189.00, date: "01 DIC 25", status: "SETTLED" },
];

const PORTFOLIO = [
  { name: "Apple Inc.", ticker: "AAPL", shares: 12, price: 178.50, value: 2142, gain: +18.4 },
  { name: "Vanguard S&P", ticker: "VOO", shares: 8, price: 412.30, value: 3298, gain: +22.1 },
  { name: "Tesla Inc.", ticker: "TSLA", shares: 5, price: 185.20, value: 926, gain: -8.3 },
  { name: "MSCI World", ticker: "IWDA", shares: 25, price: 98.40, value: 2460, gain: +14.2 },
  { name: "Bitcoin", ticker: "BTC", shares: 0.05, price: 62410, value: 3121, gain: -2.1 },
  { name: "Bonos ES 10Y", ticker: "BONO10", shares: 50, price: 95.20, value: 4760, gain: +1.8 },
];

const ALLOCATION = [
  { label: "RENTA VARIABLE", pct: 58, value: 31755 },
  { label: "LIQUIDEZ", pct: 24, value: 13140 },
  { label: "RENTA FIJA", pct: 12, value: 6570 },
  { label: "CRYPTO", pct: 6, value: 3285 },
];

const TICKERS = [
  { label: "IBEX 35", value: "11.234", change: "+1.2%", pos: true },
  { label: "S&P 500", value: "5.120", change: "+0.8%", pos: true },
  { label: "NASDAQ", value: "18.340", change: "+1.1%", pos: true },
  { label: "BTC/EUR", value: "62.410", change: "−0.5%", pos: false },
  { label: "EURIBOR", value: "3.84%", change: "0.0%", pos: null },
  { label: "EUR/USD", value: "1.085", change: "+0.1%", pos: true },
  { label: "GOLD", value: "2.312", change: "+0.3%", pos: true },
  { label: "WTI OIL", value: "79.40", change: "−0.7%", pos: false },
  { label: "DAX", value: "17.890", change: "+0.5%", pos: true },
];

// ─── UTILS ────────────────────────────────────────────────────────────────────
const fmt = (n: number, d = 2) =>
  Math.abs(n).toLocaleString("es-ES", { minimumFractionDigits: d, maximumFractionDigits: d });

// ─── GLOBAL STYLES ────────────────────────────────────────────────────────────
function Styles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600&family=Inter:wght@300;400;500;600;700&display=swap');
      *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
      html { font-size: 16px; }
      body { background: #09090B; color: #A1A1AA; font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; }
      input, select, textarea, button { font-family: inherit; }
      select option { background: #18181B; }

      .mono { font-family: 'IBM Plex Mono', monospace; }
      .lbl  { font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #52525B; }

      /* KPI number */
      .kpi-num { font-family: 'IBM Plex Mono', monospace; font-size: 30px; font-weight: 300; letter-spacing: -0.03em; line-height: 1; color: #FAFAFA; transition: color 0.4s; }

      /* Hover rows */
      .row { transition: background 0.12s; }
      .row:hover { background: #18181B; }

      /* Period tab */
      .ptab { font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 500; letter-spacing: 0.06em; padding: 4px 10px; border: 1px solid transparent; cursor: pointer; transition: all 0.15s; color: #52525B; background: transparent; }
      .ptab:hover { color: #A1A1AA; }
      .ptab.on { color: #FAFAFA; border-color: #3F3F46; background: #27272A; }

      /* Nav tab */
      .ntab { height: 100%; padding: 0 20px; border: none; border-left: 1px solid #27272A; background: transparent; font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 500; letter-spacing: 0.07em; cursor: pointer; transition: all 0.15s; color: #52525B; white-space: nowrap; }
      .ntab:hover { color: #A1A1AA; }
      .ntab.on { background: #09090B; color: #FAFAFA; font-weight: 600; }

      /* Input */
      .inp { width: 100%; background: #09090B; border: 1px solid #27272A; padding: 10px 14px; color: #FAFAFA; font-size: 12px; outline: none; transition: border-color 0.15s; display: block; }
      .inp:focus { border-color: #71717A; }
      .inp::placeholder { color: #3F3F46; }

      /* Allocation bar segment */
      .alloc-bar > div { transition: opacity 0.2s; }
      .alloc-bar:hover > div { opacity: 0.35; }
      .alloc-bar > div:hover { opacity: 1 !important; }

      /* Animate in */
      @keyframes fadeUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
      .vu { animation: fadeUp 0.3s cubic-bezier(0.16,1,0.3,1) both; }

      @keyframes slideRight { from { transform:translateX(100%); } to { transform:translateX(0); } }
      .drawer { animation: slideRight 0.28s cubic-bezier(0.16,1,0.3,1); }

      @keyframes toastIn { from { opacity:0; transform:translateX(12px); } to { opacity:1; transform:translateX(0); } }
      .toast { animation: toastIn 0.25s cubic-bezier(0.16,1,0.3,1); }

      @keyframes ticker { from { transform:translateX(0); } to { transform:translateX(-33.333%); } }
      .tk { display:flex; animation:ticker 60s linear infinite; white-space:nowrap; }

      ::-webkit-scrollbar { width:4px; height:4px; }
      ::-webkit-scrollbar-track { background:#09090B; }
      ::-webkit-scrollbar-thumb { background:#27272A; }
      ::-webkit-scrollbar-thumb:hover { background:#3F3F46; }
    `}</style>
  );
}

// ─── TICKER BAR ───────────────────────────────────────────────────────────────
function TickerBar() {
  const items = [...TICKERS, ...TICKERS, ...TICKERS];
  return (
    <div className="overflow-hidden border-b border-zinc-800 bg-zinc-950" style={{ height: 26 }}>
      <div className="tk h-full items-center" style={{ display: "flex" }}>
        {items.map((t, i) => (
          <div key={i} className="flex items-center gap-2.5 border-r border-zinc-800 px-6 h-full" style={{ flexShrink: 0 }}>
            <span className="lbl">{t.label}</span>
            <span className="mono text-[11px] font-medium text-zinc-200 tabular-nums">{t.value}</span>
            <span className={`mono text-[10px] tabular-nums ${t.pos === true ? "text-emerald-500" : t.pos === false ? "text-red-400" : "text-zinc-600"}`}>
              {t.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TOP BAR ──────────────────────────────────────────────────────────────────
const NAV = ["OVERVIEW", "TRANSACTIONS", "PORTFOLIO", "ANALYTICS", "SETTINGS"];

function TopBar({ time, tab, setTab, loading, openDrawer }: {
  time: string; tab: string; setTab: (t: string) => void; loading: boolean; openDrawer: () => void;
}) {
  return (
    <header className="sticky top-0 z-40 flex items-center border-b border-zinc-800 bg-zinc-950" style={{ height: 52 }}>
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-6 border-r border-zinc-800 h-full flex-shrink-0">
        <div className="w-4 h-4 border border-zinc-600 flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-white" />
        </div>
        <span className="font-bold text-[11px] tracking-[0.12em] text-white">FINTRACK</span>
        <span className="text-[9px] tracking-[0.1em] text-zinc-700 font-medium ml-1">INSTITUTIONAL</span>
      </div>

      {/* Nav */}
      <nav className="flex h-full">
        {NAV.map((item, i) => (
          <button key={item} onClick={() => setTab(item)}
            className={`ntab ${tab === item ? "on" : ""}`}
            style={{ borderRight: i === NAV.length - 1 ? "1px solid #27272A" : undefined }}>
            {item}
          </button>
        ))}
      </nav>

      {/* Right */}
      <div className="ml-auto flex items-center gap-5 px-6 flex-shrink-0">
        <button onClick={openDrawer}
          className="flex items-center gap-1.5 bg-white text-black font-semibold tracking-[0.06em] text-[10px] px-4 py-2 hover:bg-zinc-200 transition-colors">
          + NEW ENTRY
        </button>
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${loading ? "bg-amber-400" : "bg-emerald-500"}`}
            style={loading ? {} : { boxShadow: "0 0 5px #10B981" }} />
          <span className="lbl">{loading ? "SYNCING…" : "LIVE"}</span>
        </div>
        <div className="w-px h-5 bg-zinc-800" />
        <span className="mono text-[11px] text-zinc-500 tabular-nums">{time} CET</span>
      </div>
    </header>
  );
}

// ─── OVERVIEW ─────────────────────────────────────────────────────────────────
function OverviewView({ analytics, loading, transactions }: any) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInst = useRef<any>(null);
  const [period, setPeriod] = useState("3M");
  const PERIODS = ["1M", "3M", "6M", "YTD", "ALL"];

  useEffect(() => {
    if (!chartRef.current) return;
    chartInst.current?.destroy();
    Chart.defaults.font.family = "'IBM Plex Mono', monospace";
    chartInst.current = new Chart(chartRef.current, {
      type: "line",
      data: {
        labels: CHART_LABELS,
        datasets: [
          {
            type: "line" as any, label: "NET WORTH", data: CHART_NET,
            borderColor: "#FFFFFF", borderWidth: 1, tension: 0.3,
            pointRadius: 0, pointHoverRadius: 4,
            pointBackgroundColor: "#FFFFFF", yAxisID: "y", fill: true,
            backgroundColor: (ctx: any) => {
              const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 280);
              g.addColorStop(0, "rgba(255,255,255,0.05)");
              g.addColorStop(1, "rgba(255,255,255,0)");
              return g;
            },
          },
          {
            type: "line" as any, label: "PREV PERIOD", data: CHART_PREV,
            borderColor: "#3F3F46", borderWidth: 1, tension: 0.3,
            borderDash: [3, 4], pointRadius: 0, yAxisID: "y",
          },
          {
            type: "bar" as any, label: "CASH FLOW", data: CHART_FLOW,
            backgroundColor: (ctx: any) =>
              (ctx.raw as number) >= 0 ? "rgba(255,255,255,0.07)" : "rgba(239,68,68,0.12)",
            borderColor: (ctx: any) =>
              (ctx.raw as number) >= 0 ? "rgba(255,255,255,0.25)" : "rgba(239,68,68,0.4)",
            borderWidth: 1, yAxisID: "y1",
          },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: "#18181B", borderColor: "#3F3F46", borderWidth: 1,
            padding: 12, cornerRadius: 2, displayColors: true, boxPadding: 5,
            titleColor: "#52525B", bodyColor: "#FAFAFA",
            titleFont: { size: 10, family: "'Inter',sans-serif", weight: "600" as any },
            bodyFont: { size: 12, family: "'IBM Plex Mono',monospace" },
            callbacks: {
              title: (i: any) => i[0]?.label ?? "",
              label: (ctx: any) => `  ${ctx.dataset.label}  €${fmt(ctx.parsed.y, 0)}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false }, border: { display: false },
            ticks: { color: "#3F3F46", font: { size: 9 }, letterSpacing: "0.05em" as any }
          },
          y: { display: false, min: 44000 },
          y1: { display: false, position: "right", min: -800, max: 3000 },
        },
      },
    });
    return () => { chartInst.current?.destroy(); };
  }, []);

  const savingsRate = analytics.tasa_ahorro_pct || 0;
  const totalPortfolio = PORTFOLIO.reduce((s, a) => s + a.value, 0);

  const kpis = [
    {
      label: "NET WORTH", unit: "EUR",
      value: loading ? "——" : `€ ${fmt(analytics.patrimonio_neto, 0)}`,
      bright: !loading,
      sub: "↑ 13.6% YTD", subPos: true,
      extra: <div className="mt-3 h-px bg-gradient-to-r from-white/20 to-transparent" />,
    },
    {
      label: "CASH FLOW · 30D", unit: "EUR",
      value: loading ? "——" : `+ € ${fmt(analytics.flujo_caja_neto, 0)}`,
      bright: false,
      sub: loading ? "" : `IN ${fmt(analytics.total_ingresos, 0)} · OUT ${fmt(analytics.total_gastos, 0)}`,
      subPos: true,
    },
    {
      label: "SAVINGS RATE", unit: "PCT",
      value: loading ? "——" : `${savingsRate.toFixed(1)}%`,
      bright: false,
      sub: savingsRate >= 50 ? "↑ TARGET MET" : "↓ BELOW TARGET",
      subPos: savingsRate >= 50,
      extra: (
        <div className="mt-3 h-0.5 bg-zinc-800 overflow-hidden">
          <div className="h-full bg-white/40 transition-all duration-1000"
            style={{ width: `${Math.min(savingsRate, 100)}%` }} />
        </div>
      ),
    },
    {
      label: "PORTFOLIO VALUE", unit: "EUR",
      value: `€ ${fmt(totalPortfolio, 0)}`,
      bright: false,
      sub: "↑ 14.2% rentab. media", subPos: true,
    },
  ];

  return (
    <div className="vu">
      {/* KPI strip */}
      <div className="grid grid-cols-4 border-b border-zinc-800">
        {kpis.map((k, i) => (
          <div key={k.label} className={`p-8 flex flex-col justify-between min-h-[152px] ${i < 3 ? "border-r border-zinc-800" : ""}`}>
            <div className="flex justify-between items-start">
              <span className="lbl">{k.label}</span>
              <span className="lbl opacity-50">{k.unit}</span>
            </div>
            <div>
              <div className={`kpi-num ${k.bright ? "!text-white" : "!text-zinc-200"}`}>{k.value}</div>
              {k.sub && (
                <div className={`mt-2 text-[11px] mono ${k.subPos ? "text-emerald-500/80" : "text-red-400/80"}`}>
                  {k.sub}
                </div>
              )}
              {k.extra}
            </div>
          </div>
        ))}
      </div>

      {/* Main grid */}
      <div className="grid" style={{ gridTemplateColumns: "1fr 300px" }}>
        {/* Chart panel */}
        <div className="border-r border-zinc-800">
          <div className="flex items-center justify-between px-8 pt-7 pb-0">
            <div>
              <span className="lbl block mb-3">PATRIMONIO & FLUJO DE CAJA</span>
              <div className="flex gap-5">
                {[
                  { label: "Net Worth", line: "bg-white" },
                  { label: "Prev. Period", line: "bg-zinc-700", dashed: true },
                  { label: "Cash Flow", line: "bg-white/20" },
                ].map(l => (
                  <div key={l.label} className="flex items-center gap-2">
                    <div className={`w-5 h-px ${l.line}`}
                      style={l.dashed ? { borderTop: "1px dashed #3F3F46", background: "none" } : {}} />
                    <span className="text-[10px] text-zinc-600">{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex gap-1">
              {PERIODS.map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={`ptab ${period === p ? "on" : ""}`}>{p}</button>
              ))}
            </div>
          </div>
          <div style={{ height: 264, padding: "16px 8px 16px 0" }}>
            <canvas ref={chartRef} />
          </div>

          {/* Monthly heatmap */}
          <div className="border-t border-zinc-800 px-8 py-5">
            <span className="lbl block mb-3">FLUJO MENSUAL</span>
            <div className="grid grid-cols-8 gap-1">
              {CHART_FLOW.map((f, i) => {
                const pos = f >= 0;
                const intensity = Math.min(Math.abs(f) / 900, 1);
                return (
                  <div key={i} className="py-2 px-1.5 text-center border"
                    style={{
                      background: pos ? `rgba(255,255,255,${0.02 + intensity * 0.08})` : `rgba(239,68,68,${0.03 + intensity * 0.1})`,
                      borderColor: pos ? `rgba(255,255,255,${0.06 + intensity * 0.1})` : `rgba(239,68,68,${0.12 + intensity * 0.12})`,
                    }}>
                    <div className="lbl mb-1">{CHART_LABELS[i]}</div>
                    <div className={`mono text-[10px] font-medium tabular-nums ${pos ? "text-zinc-300" : "text-red-400"}`}>
                      {pos ? "+" : "−"}{fmt(Math.abs(f), 0)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex flex-col">
          {/* Allocation */}
          <div className="border-b border-zinc-800 p-7">
            <span className="lbl block mb-4">ASSET ALLOCATION</span>
            {/* Segmented bar */}
            <div className="alloc-bar flex h-1 gap-0.5 mb-5 overflow-hidden">
              {ALLOCATION.map((a, i) => (
                <div key={a.label} className="h-full rounded-none transition-opacity"
                  style={{
                    flex: a.pct,
                    background: i === 0 ? "#FAFAFA" : i === 1 ? "#71717A" : i === 2 ? "#3F3F46" : "#27272A",
                  }} />
              ))}
            </div>
            <div className="flex flex-col gap-3">
              {ALLOCATION.map((a, i) => {
                const clr = i === 0 ? "#FAFAFA" : i === 1 ? "#71717A" : i === 2 ? "#3F3F46" : "#27272A";
                return (
                  <div key={a.label} className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: clr }} />
                      <span className="lbl">{a.label}</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="mono text-[10px] text-zinc-700 tabular-nums">{a.pct}%</span>
                      <span className="mono text-[10px] text-zinc-400 tabular-nums">€{fmt(a.value, 0)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent */}
          <div className="flex-1">
            <div className="flex items-center justify-between px-7 py-4 border-b border-zinc-800">
              <span className="lbl">RECENT SETTLEMENTS</span>
              <button className="lbl hover:text-zinc-300 transition-colors">ALL →</button>
            </div>
            {transactions.slice(0, 5).map((tx: any) => {
              const pos = tx.amount > 0;
              return (
                <div key={tx.id} className="row flex items-center justify-between px-7 py-3.5 border-b border-zinc-800/60">
                  <div className="flex flex-col gap-1 flex-1 min-w-0 pr-3">
                    <span className="text-[12px] font-medium text-zinc-200 truncate">{tx.name}</span>
                    <span className="lbl">{tx.date} · {tx.category}</span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className={`mono text-[12px] tabular-nums ${pos ? "text-emerald-500" : "text-zinc-300"}`}>
                      {pos ? "+" : "−"}€{fmt(Math.abs(tx.amount))}
                    </div>
                    {tx.status === "PENDING" && (
                      <span className="text-[9px] font-semibold text-amber-400 tracking-[0.06em]">PENDING</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TRANSACTIONS ─────────────────────────────────────────────────────────────
function TransactionsView({ transactions }: any) {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const FILTERS = ["ALL", "INCOME", "EXPENSE", "INVESTMENT", "SOFTWARE"];

  const filtered = useMemo(() => {
    let r = filter === "ALL" ? transactions : transactions.filter((t: any) => t.category === filter);
    if (search.trim()) r = r.filter((t: any) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase())
    );
    return r;
  }, [transactions, filter, search]);

  const totals = useMemo(() => ({
    income: filtered.filter((t: any) => t.amount > 0).reduce((s: number, t: any) => s + t.amount, 0),
    expense: filtered.filter((t: any) => t.amount < 0).reduce((s: number, t: any) => s + t.amount, 0),
  }), [filtered]);

  const COL = "100px 88px 3fr 1.2fr 1.1fr 130px 100px";

  return (
    <div className="vu p-10">
      <div className="flex items-end justify-between mb-7">
        <div>
          <h2 className="text-2xl font-light text-zinc-100 tracking-tight mb-1.5">General Ledger</h2>
          <span className="lbl">REGISTRO HISTÓRICO · {filtered.length} ENTRADAS</span>
        </div>
        <div className="flex items-center gap-5">
          <span className="mono text-[11px] text-emerald-500 tabular-nums">IN +€{fmt(totals.income, 0)}</span>
          <div className="w-px h-4 bg-zinc-800" />
          <span className="mono text-[11px] text-red-400 tabular-nums">OUT −€{fmt(Math.abs(totals.expense), 0)}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3 mb-5">
        <div className="flex-1 flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-4 py-2.5">
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="#52525B" strokeWidth="1.5">
            <circle cx="5" cy="5" r="4" /><path d="M11 11L8 8" />
          </svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o ID…"
            className="bg-transparent border-none outline-none text-[12px] text-zinc-200 flex-1 placeholder-zinc-700 mono" />
          {search && <button onClick={() => setSearch("")} className="text-zinc-700 hover:text-zinc-400 text-sm">×</button>}
        </div>
        <div className="flex border border-zinc-800 overflow-hidden">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 text-[10px] font-semibold tracking-[0.05em] border-r border-zinc-800 last:border-r-0 transition-colors ${filter === f ? "bg-zinc-800 text-zinc-100" : "text-zinc-600 hover:text-zinc-300"}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="border border-zinc-800 overflow-hidden">
        <div className="grid px-6 py-3 border-b border-zinc-800 bg-zinc-900/50" style={{ gridTemplateColumns: COL }}>
          {["FECHA", "TX ID", "DESCRIPCIÓN", "CATEGORÍA", "CUENTA", "IMPORTE (EUR)", "ESTADO"].map((h, i) => (
            <span key={h} className="lbl" style={{ textAlign: i >= 5 ? "right" : "left" }}>{h}</span>
          ))}
        </div>
        <div style={{ maxHeight: "calc(100vh - 310px)", overflowY: "auto" }}>
          {filtered.length === 0 ? (
            <div className="py-16 text-center lbl">Sin resultados</div>
          ) : filtered.map((tx: any) => {
            const pos = tx.amount > 0;
            return (
              <div key={tx.id} className="row grid px-6 py-4 border-b border-zinc-800/60 items-center"
                style={{ gridTemplateColumns: COL }}>
                <span className="mono text-[10px] text-zinc-600 tabular-nums">{tx.date}</span>
                <span className="mono text-[9px] text-zinc-700">{tx.id}</span>
                <span className="text-[12px] font-medium text-zinc-200">{tx.name}</span>
                <span className="text-[10px] text-zinc-600 uppercase tracking-wider">{tx.category}</span>
                <span className="text-[10px] text-zinc-600">{tx.account}</span>
                <span className={`mono text-[12px] tabular-nums font-medium text-right ${pos ? "text-emerald-500" : "text-zinc-200"}`}>
                  {pos ? "+" : "−"}€{fmt(Math.abs(tx.amount))}
                </span>
                <div className="flex justify-end">
                  <span className={`text-[9px] font-semibold tracking-[0.07em] px-2 py-1 border
                    ${tx.status === "SETTLED" ? "border-zinc-800 text-zinc-700" : "border-amber-400/30 text-amber-400 bg-amber-400/5"}`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── PORTFOLIO ────────────────────────────────────────────────────────────────
function PortfolioView() {
  const total = PORTFOLIO.reduce((s, a) => s + a.value, 0);
  const totalGain = 4240;
  const COL = "2.5fr 70px 1fr 1fr 1fr 90px";

  return (
    <div className="vu p-10">
      <div className="flex items-end justify-between mb-7">
        <div>
          <h2 className="text-2xl font-light text-zinc-100 tracking-tight mb-1.5">Portfolio</h2>
          <span className="lbl">POSICIONES ABIERTAS · {PORTFOLIO.length} ACTIVOS</span>
        </div>
        <div className="flex gap-8">
          {[
            { l: "VALOR TOTAL", v: `€ ${fmt(total, 0)}`, c: "text-zinc-300" },
            { l: "GANANCIA NO REALIZADA", v: `+€ ${fmt(totalGain, 0)}`, c: "text-emerald-500" },
            { l: "RENTAB. MEDIA", v: "+14.2%", c: "text-emerald-500" },
          ].map(k => (
            <div key={k.l} className="text-right">
              <div className="lbl mb-1.5">{k.l}</div>
              <div className={`mono text-xl ${k.c} tabular-nums`}>{k.v}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-zinc-800 overflow-hidden">
        <div className="grid px-6 py-3 border-b border-zinc-800 bg-zinc-900/50" style={{ gridTemplateColumns: COL }}>
          {["ACTIVO", "TICKER", "PRECIO", "VALOR", "% CARTERA", "RENTAB."].map((h, i) => (
            <span key={h} className="lbl" style={{ textAlign: i > 0 ? "right" : "left" }}>{h}</span>
          ))}
        </div>
        <div>
          {PORTFOLIO.map((a, i) => {
            const pos = a.gain > 0;
            const pct = (a.value / total * 100).toFixed(1);
            return (
              <div key={a.ticker} className="row grid px-6 py-4 border-b border-zinc-800/60 items-center"
                style={{ gridTemplateColumns: COL, borderBottom: i < PORTFOLIO.length - 1 ? undefined : "none" }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 border border-zinc-800 bg-zinc-900 flex items-center justify-center flex-shrink-0">
                    <span className="mono text-[9px] font-semibold text-zinc-500">{a.ticker.slice(0, 3)}</span>
                  </div>
                  <div>
                    <div className="text-[12px] font-medium text-zinc-200">{a.name}</div>
                    <div className="lbl mt-0.5">{a.shares} {a.shares < 1 ? "BTC" : "uds"}</div>
                  </div>
                </div>
                <span className="mono text-[11px] text-zinc-500 tabular-nums text-right">€{fmt(a.price, 2)}</span>
                <span className="mono text-[13px] font-medium text-zinc-200 tabular-nums text-right">€{fmt(a.value, 0)}</span>
                <div className="text-right">
                  <div className="h-0.5 bg-zinc-800 overflow-hidden mb-1.5">
                    <div className="h-full bg-zinc-600" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="mono text-[10px] text-zinc-600 tabular-nums">{pct}%</span>
                </div>
                <span className={`mono text-[13px] font-semibold tabular-nums text-right ${pos ? "text-emerald-500" : "text-red-400"}`}>
                  {pos ? "+" : ""}{a.gain}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── ANALYTICS ────────────────────────────────────────────────────────────────
function AnalyticsView() {
  const barRef = useRef<HTMLCanvasElement>(null);
  const barInst = useRef<any>(null);

  const catData = useMemo(() => {
    const map: Record<string, { income: number; expense: number }> = {};
    TRANSACTIONS.forEach(t => {
      if (!map[t.category]) map[t.category] = { income: 0, expense: 0 };
      if (t.amount > 0) map[t.category].income += t.amount;
      else map[t.category].expense += Math.abs(t.amount);
    });
    return map;
  }, []);

  useEffect(() => {
    if (!barRef.current) return;
    barInst.current?.destroy();
    const cats = Object.keys(catData);
    barInst.current = new Chart(barRef.current, {
      type: "bar",
      data: {
        labels: cats,
        datasets: [
          {
            label: "INGRESOS", data: cats.map(c => catData[c].income),
            backgroundColor: "rgba(255,255,255,0.07)", borderColor: "rgba(255,255,255,0.2)", borderWidth: 1
          },
          {
            label: "GASTOS", data: cats.map(c => catData[c].expense),
            backgroundColor: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.3)", borderWidth: 1
          },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false }, tooltip: {
            backgroundColor: "#18181B", borderColor: "#3F3F46", borderWidth: 1,
            padding: 12, cornerRadius: 2, titleColor: "#52525B", bodyColor: "#FAFAFA",
            titleFont: { size: 10, family: "'Inter',sans-serif", weight: "600" as any },
            bodyFont: { size: 12, family: "'IBM Plex Mono',monospace" },
          }
        },
        scales: {
          x: { grid: { display: false }, border: { display: false }, ticks: { color: "#3F3F46", font: { size: 9 } } },
          y: {
            grid: { color: "rgba(63,63,70,0.4)" }, border: { display: false },
            ticks: { color: "#3F3F46", font: { size: 9 }, callback: (v: any) => `€${(v / 1000).toFixed(0)}K` }
          },
        },
      },
    });
    return () => { barInst.current?.destroy(); };
  }, [catData]);

  const sorted = [...TRANSACTIONS].sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount)).slice(0, 6);
  const maxAmt = Math.abs(sorted[0]?.amount ?? 1);

  return (
    <div className="vu p-10">
      <div className="mb-7">
        <h2 className="text-2xl font-light text-zinc-100 tracking-tight mb-1.5">Analytics</h2>
        <span className="lbl">ANÁLISIS FINANCIERO DETALLADO</span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Bar chart */}
        <div className="border border-zinc-800 p-7">
          <span className="lbl block mb-4">INGRESOS VS GASTOS POR CATEGORÍA</span>
          <div className="flex gap-5 mb-4">
            {[{ l: "INGRESOS", c: "bg-white/30" }, { l: "GASTOS", c: "bg-red-500/30" }].map(x => (
              <div key={x.l} className="flex items-center gap-2">
                <div className={`w-5 h-0.5 ${x.c}`} />
                <span className="text-[10px] text-zinc-600">{x.l}</span>
              </div>
            ))}
          </div>
          <div style={{ height: 200 }}><canvas ref={barRef} /></div>
        </div>

        {/* Top movements */}
        <div className="border border-zinc-800 p-7">
          <span className="lbl block mb-4">MAYORES MOVIMIENTOS</span>
          <div className="flex flex-col gap-0">
            {sorted.map((tx, i) => {
              const pos = tx.amount > 0;
              const barW = (Math.abs(tx.amount) / maxAmt * 100).toFixed(1);
              return (
                <div key={tx.id} className="py-2.5 border-b border-zinc-800/60 last:border-0">
                  <div className="flex justify-between mb-2">
                    <span className="text-[12px] text-zinc-300">{tx.name}</span>
                    <span className={`mono text-[11px] tabular-nums ${pos ? "text-emerald-500" : "text-red-400"}`}>
                      {pos ? "+" : "−"}€{fmt(Math.abs(tx.amount), 0)}
                    </span>
                  </div>
                  <div className="h-px bg-zinc-800 overflow-hidden">
                    <div className="h-full" style={{ width: `${barW}%`, background: pos ? "rgba(255,255,255,0.2)" : "rgba(239,68,68,0.3)" }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Monthly grid */}
      <div className="border border-zinc-800 p-7">
        <span className="lbl block mb-4">RESUMEN MENSUAL · AGO 25 – MAR 26</span>
        <div className="grid grid-cols-8 gap-2">
          {CHART_LABELS.map((label, i) => {
            const flow = CHART_FLOW[i], net = CHART_NET[i], pos = flow >= 0;
            return (
              <div key={label} className="border border-zinc-800 bg-zinc-900/40 p-3.5">
                <div className="lbl mb-2.5">{label}</div>
                <div className="mono text-[14px] font-medium text-zinc-300 tabular-nums mb-2">
                  €{(net / 1000).toFixed(1)}K
                </div>
                <div className="h-px bg-zinc-800 mb-2" />
                <div className={`mono text-[10px] tabular-nums ${pos ? "text-emerald-500/70" : "text-red-400/70"}`}>
                  {pos ? "+" : "−"}€{fmt(Math.abs(flow), 0)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── SETTINGS ─────────────────────────────────────────────────────────────────
function SettingsView() {
  const [notif, setNotif] = useState(true);
  const [twofa, setTwofa] = useState(true);
  const [sync, setSync] = useState(false);

  const Toggle = ({ val, set }: { val: boolean; set: (v: boolean) => void }) => (
    <div onClick={() => set(!val)}
      className="w-9 h-5 cursor-pointer rounded-full relative transition-colors flex-shrink-0"
      style={{ background: val ? "#FAFAFA" : "#27272A" }}>
      <div className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
        style={{ left: val ? "calc(100% - 18px)" : "2px", background: val ? "#09090B" : "#71717A" }} />
    </div>
  );

  const Sec = ({ title, children }: any) => (
    <div className="border border-zinc-800 overflow-hidden mb-4">
      <div className="px-6 py-3 border-b border-zinc-800 bg-zinc-900/50">
        <span className="lbl">{title}</span>
      </div>
      {children}
    </div>
  );

  const Row = ({ label, desc, right }: any) => (
    <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/60 last:border-0">
      <div>
        <div className="text-[13px] font-medium text-zinc-200">{label}</div>
        <div className="text-[11px] text-zinc-600 mt-0.5">{desc}</div>
      </div>
      {right}
    </div>
  );

  return (
    <div className="vu p-10" style={{ maxWidth: 720 }}>
      <div className="mb-7">
        <h2 className="text-2xl font-light text-zinc-100 tracking-tight mb-1.5">Settings</h2>
        <span className="lbl">CONFIGURACIÓN DEL SISTEMA</span>
      </div>

      <Sec title="CUENTA">
        <Row label="Nombre completo" desc="Jorge Martínez García"
          right={<span className="lbl hover:text-zinc-300 cursor-pointer transition-colors">EDIT</span>} />
        <Row label="Email institucional" desc="j.martinez@jpmorgan.com"
          right={<span className="lbl hover:text-zinc-300 cursor-pointer transition-colors">EDIT</span>} />
        <Row label="Plan activo" desc="Institutional Pro — todos los módulos activos"
          right={<span className="text-[9px] font-semibold tracking-[0.08em] px-2.5 py-1 border border-emerald-500/20 text-emerald-500 bg-emerald-500/5">ACTIVO</span>} />
      </Sec>

      <Sec title="SEGURIDAD">
        <Row label="Autenticación 2FA" desc="Capa adicional de seguridad mediante app autenticadora"
          right={<Toggle val={twofa} set={setTwofa} />} />
        <Row label="Cifrado de sesión" desc="AES-256 activo en todas las conexiones"
          right={<span className="mono text-[10px] text-emerald-500">SECURE ✓</span>} />
        <div className="px-6 py-4">
          <button className="text-[10px] font-semibold text-red-400 tracking-[0.06em] border border-red-400/20 px-4 py-2 hover:bg-red-400/5 transition-colors">
            CERRAR TODAS LAS SESIONES
          </button>
        </div>
      </Sec>

      <Sec title="SISTEMA">
        <Row label="Notificaciones push" desc="Alertas de movimientos y límites de precio"
          right={<Toggle val={notif} set={setNotif} />} />
        <Row label="Sincronización automática" desc="Actualizar datos cada 5 minutos"
          right={<Toggle val={sync} set={setSync} />} />
        <Row label="Zona horaria" desc="Europe/Madrid (CET/CEST)" right={null} />
        <Row label="Divisa base" desc="EUR · Euro" right={null} />
      </Sec>
    </div>
  );
}

// ─── DRAWER ───────────────────────────────────────────────────────────────────
function Drawer({ isOpen, onClose, addToast }: any) {
  const [type, setType] = useState("INFLOW");
  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="drawer fixed top-0 right-0 bottom-0 w-[440px] bg-zinc-950 border-l border-zinc-800 z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-800">
          <div>
            <div className="text-base font-medium text-white tracking-tight">Record New Entry</div>
            <div className="text-[11px] text-zinc-600 mt-0.5">Añadir al libro mayor</div>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 border border-zinc-800 text-zinc-500 hover:text-zinc-200 hover:border-zinc-600 transition-colors flex items-center justify-center text-sm">
            ×
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
          {/* Type */}
          <div>
            <label className="lbl block mb-2.5">TIPO DE OPERACIÓN</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { val: "INFLOW", label: "↓ ENTRADA", c: "text-emerald-500 border-emerald-500/40" },
                { val: "OUTFLOW", label: "↑ SALIDA", c: "text-red-400 border-red-400/40" },
              ].map(t => (
                <button key={t.val} onClick={() => setType(t.val)}
                  className={`py-3 border text-[10px] font-bold tracking-[0.06em] transition-all ${type === t.val ? t.c + " bg-transparent" : "border-zinc-800 text-zinc-600 hover:border-zinc-600"
                    }`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {[
            { label: "IMPORTE (EUR)", type: "number", placeholder: "0.00", step: "0.01" },
            { label: "DESCRIPCIÓN", type: "text", placeholder: "Ej. Factura cliente…" },
          ].map(f => (
            <div key={f.label}>
              <label className="lbl block mb-2">{f.label}</label>
              <input type={f.type} placeholder={f.placeholder} step={(f as any).step}
                className="inp" />
            </div>
          ))}

          {[
            { label: "CATEGORÍA", opts: ["INCOME", "EXPENSE", "INVESTMENT", "SOFTWARE"] },
            { label: "CUENTA", opts: ["Principal", "Tarjeta", "Inversión"] },
          ].map(f => (
            <div key={f.label}>
              <label className="lbl block mb-2">{f.label}</label>
              <select className="inp">
                <option value="" disabled>Seleccionar…</option>
                {f.opts.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
          ))}

          <div>
            <label className="lbl block mb-2">FECHA</label>
            <input type="date" className="inp" defaultValue={new Date().toISOString().split("T")[0]} />
          </div>

          <div>
            <label className="lbl block mb-2">NOTAS (OPCIONAL)</label>
            <textarea placeholder="Observaciones adicionales…" className="inp" style={{ resize: "vertical", minHeight: 68 }} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-8 py-5 border-t border-zinc-800 bg-zinc-950">
          <button onClick={onClose}
            className="flex-1 py-3 border border-zinc-800 text-zinc-500 hover:text-zinc-200 hover:border-zinc-600 text-[11px] font-semibold tracking-[0.06em] transition-all">
            CANCELAR
          </button>
          <button onClick={() => { onClose(); addToast("Transacción registrada correctamente", "success"); }}
            className="flex-[2] py-3 bg-white text-black font-bold text-[11px] tracking-[0.07em] hover:bg-zinc-200 transition-colors">
            COMMIT ENTRY
          </button>
        </div>
      </div>
    </>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function FinTrackInstitutional() {
  const [time, setTime] = useState("--:--:--");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("OVERVIEW");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toasts, setToasts] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState({
    patrimonio_neto: 0, flujo_caja_neto: 0, total_ingresos: 0, total_gastos: 0, tasa_ahorro_pct: 0,
  });

  useEffect(() => {
    const id = setInterval(() =>
      setTime(new Date().toLocaleTimeString("es-ES", { hour12: false })), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    fetch(API_URL, { headers: { Authorization: `Bearer ${TOKEN}` } })
      .then(r => r.json())
      .then(data => { if (data.patrimonio_neto !== undefined) setAnalytics(data); setLoading(false); })
      .catch(() => {
        setTimeout(() => {
          setAnalytics({ patrimonio_neto: 54750.20, flujo_caja_neto: 5420.00, total_ingresos: 8400.00, total_gastos: 2980.00, tasa_ahorro_pct: 64.5 });
          setLoading(false);
        }, 900);
      });
  }, []);

  const addToast = useCallback((msg: string, type = "info") => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);

  const views: Record<string, React.ReactNode> = {
    OVERVIEW: <OverviewView analytics={analytics} loading={loading} transactions={TRANSACTIONS} />,
    TRANSACTIONS: <TransactionsView transactions={TRANSACTIONS} />,
    PORTFOLIO: <PortfolioView />,
    ANALYTICS: <AnalyticsView />,
    SETTINGS: <SettingsView />,
  };

  return (
    <>
      <Styles />
      <div className="min-h-screen flex flex-col" style={{ background: "#09090B" }}>
        <TickerBar />
        <TopBar time={time} tab={tab} setTab={setTab} loading={loading} openDrawer={() => setDrawerOpen(true)} />
        <main className="flex-1 flex flex-col">
          {views[tab]}
        </main>
        <footer className="border-t border-zinc-800 px-8 py-3.5 flex justify-between bg-zinc-950">
          <span className="lbl">FINTRACK CORE SYSTEM v2.1 · ALL SYSTEMS NOMINAL</span>
          <span className="mono text-[10px] text-zinc-700">SECURE CONNECTION · AES-256-GCM · TLS 1.3</span>
        </footer>
      </div>

      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} addToast={addToast} />

      {/* Toasts */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-[300]">
        {toasts.map(t => (
          <div key={t.id} className="toast flex items-center gap-3 bg-zinc-900 border border-zinc-800 px-5 py-3.5 min-w-[260px]"
            style={{ borderColor: t.type === "success" ? "rgba(16,185,129,0.3)" : undefined, boxShadow: "0 8px 32px rgba(0,0,0,0.6)" }}>
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${t.type === "success" ? "bg-emerald-500" : "bg-white"}`} />
            <span className="text-[12px] font-medium text-zinc-200">{t.msg}</span>
          </div>
        ))}
      </div>
    </>
  );
}
