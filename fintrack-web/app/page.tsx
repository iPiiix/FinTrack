"use client";
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import Chart from "chart.js/auto";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const API_URL = "http://127.0.0.1:8000/analytics/summary";
const TOKEN   = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwiZXhwIjoxNzcyNDA1OTMyfQ.3oIpWrxfwakI7cXj23gU05wf0iitoY5n10OS77lhCwY";

const P = {
  bg:           "#09090B",
  surface:      "#18181B",
  surfaceHover: "#27272A",
  border:       "#27272A",
  borderLight:  "#3F3F46",
  textPrimary:  "#FAFAFA",
  textSecondary:"#A1A1AA",
  textMuted:    "#71717A",
  textDark:     "#52525B",
  accent:       "#FFFFFF",
  positive:     "#10B981",
  positiveLight:"#34D399",
  negative:     "#EF4444",
  negativeLight:"#F87171",
  warning:      "#F59E0B",
  blue:         "#3B82F6",
  blueDim:      "rgba(59,130,246,0.08)",
};

const CHART_LABELS = ["AGO", "SEP", "OCT", "NOV", "DIC", "ENE", "FEB", "MAR"];
const CHART_NET    = [46200, 47800, 49100, 50400, 49900, 52100, 53600, 54750];
const CHART_PREV   = [44000, 45500, 47000, 48200, 47800, 49500, 51000, 52300];
const CHART_FLOW   = [420, 680, 350, 500, -180, 820, 380, 280];

const TRANSACTIONS = [
  { id:"TX-901", name:"Nómina JP Morgan",    category:"INCOME",     account:"Principal", amount: 5000.00, date:"01 MAR 26", status:"SETTLED" },
  { id:"TX-902", name:"Vanguard S&P 500",    category:"INVESTMENT", account:"Inversión", amount:-1000.00, date:"28 FEB 26", status:"SETTLED" },
  { id:"TX-903", name:"AWS Cloud Hosting",   category:"SOFTWARE",   account:"Tarjeta",   amount:  -45.00, date:"25 FEB 26", status:"SETTLED" },
  { id:"TX-904", name:"Dividendo Apple",     category:"INCOME",     account:"Principal", amount:   18.40, date:"20 FEB 26", status:"SETTLED" },
  { id:"TX-905", name:"Alquiler Despacho",   category:"EXPENSE",    account:"Tarjeta",   amount: -320.00, date:"15 FEB 26", status:"SETTLED" },
  { id:"TX-906", name:"Suscripción Stripe",  category:"SOFTWARE",   account:"Tarjeta",   amount:  -29.00, date:"12 FEB 26", status:"SETTLED" },
  { id:"TX-907", name:"Consultoría Alpha",   category:"INCOME",     account:"Principal", amount: 2400.00, date:"05 FEB 26", status:"SETTLED" },
  { id:"TX-908", name:"Bonos Tesoro ES",     category:"INVESTMENT", account:"Inversión", amount:-5000.00, date:"02 FEB 26", status:"SETTLED" },
  { id:"TX-909", name:"Cena Directivos",     category:"EXPENSE",    account:"Tarjeta",   amount: -180.50, date:"28 ENE 26", status:"SETTLED" },
  { id:"TX-910", name:"Intereses Cuenta",    category:"INCOME",     account:"Principal", amount:    4.20, date:"15 ENE 26", status:"PENDING" },
  { id:"TX-911", name:"Adobe Creative",      category:"SOFTWARE",   account:"Tarjeta",   amount:  -54.99, date:"10 ENE 26", status:"SETTLED" },
  { id:"TX-912", name:"ETF MSCI World",      category:"INVESTMENT", account:"Inversión", amount:-2500.00, date:"05 ENE 26", status:"SETTLED" },
  { id:"TX-913", name:"Consultoría Beta",    category:"INCOME",     account:"Principal", amount: 3200.00, date:"28 DIC 25", status:"SETTLED" },
  { id:"TX-914", name:"Seguro Médico",       category:"EXPENSE",    account:"Tarjeta",   amount: -189.00, date:"01 DIC 25", status:"SETTLED" },
];

const TICKERS = [
  { label:"IBEX 35", value:"11.234", change:"+1.2%", positive:true  },
  { label:"S&P 500", value:"5.120",  change:"+0.8%", positive:true  },
  { label:"NASDAQ",  value:"18.340", change:"+1.1%", positive:true  },
  { label:"BTC/EUR", value:"62.410", change:"−0.5%", positive:false },
  { label:"EURIBOR", value:"3.84%",  change:"0.0%",  positive:null  },
  { label:"EUR/USD", value:"1.085",  change:"+0.1%", positive:true  },
  { label:"GOLD",    value:"2.312",  change:"+0.3%", positive:true  },
  { label:"WTI OIL", value:"79.40",  change:"−0.7%", positive:false },
  { label:"DAX",     value:"17.890", change:"+0.5%", positive:true  },
];

const ALLOCATION = [
  { label:"RENTA VARIABLE", pct:58, value:31755, color: P.accent        },
  { label:"LIQUIDEZ",       pct:24, value:13140, color: P.textSecondary },
  { label:"RENTA FIJA",     pct:12, value: 6570, color: P.textMuted     },
  { label:"CRYPTO",         pct: 6, value: 3285, color: P.textDark      },
];

const PORTFOLIO = [
  { name:"Apple Inc.",  ticker:"AAPL",   shares:12,   price:178.50, value:2142,  gain:+18.4 },
  { name:"Vanguard S&P",ticker:"VOO",    shares:8,    price:412.30, value:3298,  gain:+22.1 },
  { name:"Tesla Inc.",  ticker:"TSLA",   shares:5,    price:185.20, value: 926,  gain: -8.3 },
  { name:"MSCI World",  ticker:"IWDA",   shares:25,   price: 98.40, value:2460,  gain:+14.2 },
  { name:"Bitcoin",     ticker:"BTC",    shares:0.05, price:62410,  value:3121,  gain: -2.1 },
  { name:"Bonos ES 10Y",ticker:"BONO10", shares:50,   price: 95.20, value:4760,  gain: +1.8 },
];

// ─── UTILITIES ─────────────────────────────────────────────────────────────────
const fmt = (n: number, d = 2) => Math.abs(n).toLocaleString("es-ES", { minimumFractionDigits: d, maximumFractionDigits: d });

// ─── TICKER BAR ─────────────────────────────────────────────────────────────────
function TickerBar() {
  const items = [...TICKERS, ...TICKERS, ...TICKERS];
  return (
    <div style={{ background: P.surfaceHover, borderBottom: `1px solid ${P.border}`, height: 28, overflow: "hidden", display: "flex", alignItems: "center", position: "relative" }}>
      <style>{`
        @keyframes tickerMove { from{transform:translateX(0)} to{transform:translateX(-33.33%)} }
        .t-scroll { display:flex; gap:0; animation:tickerMove 60s linear infinite; white-space:nowrap; }
        .t-item { display:flex; align-items:center; gap:10px; padding:0 28px; border-right:1px solid ${P.border}; height:28px; }
      `}</style>
      <div style={{ position:"absolute", left:0, top:0, bottom:0, width:60, background:`linear-gradient(to right, ${P.surfaceHover}, transparent)`, zIndex:2, pointerEvents:"none" }}/>
      <div style={{ position:"absolute", right:0, top:0, bottom:0, width:60, background:`linear-gradient(to left, ${P.surfaceHover}, transparent)`, zIndex:2, pointerEvents:"none" }}/>
      <div className="t-scroll">
        {items.map((t, i) => (
          <div key={i} className="t-item">
            <span style={{ color:P.textDark, fontFamily:"'Inter',sans-serif", fontWeight:600, fontSize:10, letterSpacing:"0.08em" }}>{t.label}</span>
            <span style={{ color:P.textPrimary, fontFamily:"'IBM Plex Mono',monospace", fontWeight:600, fontSize:11 }}>{t.value}</span>
            <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, fontWeight:500, color: t.positive === true ? P.positiveLight : t.positive === false ? P.negativeLight : P.textMuted }}>{t.change}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TOP BAR ────────────────────────────────────────────────────────────────────
function TopBar({ time, activeTab, setActiveTab, loading, toggleDrawer }: any) {
  const NAV = ["OVERVIEW", "TRANSACTIONS", "PORTFOLIO", "ANALYTICS", "SETTINGS"];
  return (
    <header style={{ background:P.surface, borderBottom:`1px solid ${P.border}`, height:56, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 0 0 32px", position:"sticky", top:0, zIndex:40 }}>
      {/* Brand */}
      <div style={{ display:"flex", alignItems:"center", gap:20, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:20, height:20, border:`1px solid ${P.textMuted}`, display:"flex", alignItems:"center", justifyContent:"center", borderRadius:2 }}>
            <div style={{ width:8, height:8, background:P.accent }}/>
          </div>
          <span style={{ fontFamily:"'Inter',sans-serif", fontSize:14, fontWeight:700, letterSpacing:"0.1em", color:P.accent }}>FINTRACK</span>
        </div>
        <div style={{ width:1, height:24, background:P.border }}/>
        <span style={{ fontFamily:"'Inter',sans-serif", fontSize:10, color:P.textMuted, letterSpacing:"0.1em", fontWeight:500 }}>INSTITUTIONAL</span>
      </div>

      {/* Nav */}
      <nav style={{ display:"flex", height:"100%", marginLeft:32 }}>
        {NAV.map((item, i) => (
          <button key={item} onClick={() => setActiveTab(item)}
            style={{ background: item === activeTab ? P.bg : "transparent", border:"none", borderLeft:`1px solid ${P.border}`, borderRight: i === NAV.length-1 ? `1px solid ${P.border}` : "none", padding:"0 22px", height:"100%", color: item === activeTab ? P.accent : P.textMuted, fontFamily:"'Inter',sans-serif", fontSize:11, fontWeight: item === activeTab ? 600 : 500, letterSpacing:"0.05em", cursor:"pointer", transition:"all 0.15s", whiteSpace:"nowrap" }}
            onMouseEnter={e => { if (item !== activeTab) (e.currentTarget as HTMLElement).style.color = P.textSecondary; }}
            onMouseLeave={e => { if (item !== activeTab) (e.currentTarget as HTMLElement).style.color = P.textMuted; }}
          >{item}</button>
        ))}
      </nav>

      {/* Actions */}
      <div style={{ display:"flex", alignItems:"center", gap:20, padding:"0 24px", marginLeft:"auto", flexShrink:0 }}>
        <button onClick={toggleDrawer} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", background:P.accent, color:P.bg, border:"none", borderRadius:3, fontFamily:"'Inter',sans-serif", fontSize:11, fontWeight:700, letterSpacing:"0.06em", cursor:"pointer" }}>
          + NEW ENTRY
        </button>
        <div style={{ display:"flex", alignItems:"center", gap:7 }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background: loading ? P.warning : P.positive, boxShadow: loading ? "none" : `0 0 6px ${P.positive}` }}/>
          <span style={{ fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:500, color:P.textMuted, letterSpacing:"0.05em" }}>{loading ? "SYNCING..." : "LIVE DATAFEED"}</span>
        </div>
        <div style={{ width:1, height:24, background:P.border }}/>
        <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:P.textSecondary, letterSpacing:"0.05em" }}>{time} CET</span>
      </div>
    </header>
  );
}

// ─── OVERVIEW ───────────────────────────────────────────────────────────────────
function OverviewView({ analytics, loading, transactions }: any) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInst = useRef<any>(null);
  const [period, setPeriod] = useState("3M");
  const PERIODS = ["1M","3M","6M","YTD","ALL"];

  useEffect(() => {
    if (!chartRef.current) return;
    if (chartInst.current) chartInst.current.destroy();
    Chart.defaults.color = "#333330";
    Chart.defaults.color = P.textMuted;
    Chart.defaults.font.family = "'IBM Plex Mono', monospace";
    if (chartInst.current) chartInst.current.destroy();
    chartInst.current = new Chart(chartRef.current, {
      type: "line",
      data: {
        labels: CHART_LABELS,
        datasets: [
          {
            type: "line" as any, label: "NET WORTH", data: CHART_NET,
            borderColor: P.accent, borderWidth: 1.5, tension: 0,
            pointRadius: 0, pointHoverRadius: 5, pointBackgroundColor: P.accent,
            pointHoverBorderColor: P.bg, pointHoverBorderWidth: 2,
            yAxisID: "y", fill: true,
            backgroundColor: (ctx: any) => {
              const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 300);
              gradient.addColorStop(0, "rgba(255,255,255,0.06)");
              gradient.addColorStop(1, "rgba(255,255,255,0)");
              return gradient;
            },
          },
          {
            type: "line" as any, label: "PREV PERIOD", data: CHART_PREV,
            borderColor: P.textDark, borderWidth: 1, tension: 0,
            borderDash: [4,4], pointRadius: 0, yAxisID: "y",
          },
          {
            type: "bar" as any, label: "CASH FLOW", data: CHART_FLOW,
            backgroundColor: (ctx: any) => (ctx.raw as number) >= 0 ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)",
            borderColor: (ctx: any) => (ctx.raw as number) >= 0 ? P.positive : P.negative,
            borderWidth: 1, borderRadius: 2, yAxisID: "y1",
          },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: P.surfaceHover, borderColor: P.borderLight, borderWidth: 1,
            padding: 14, cornerRadius: 4, displayColors: true, boxPadding: 6,
            titleColor: P.textMuted, bodyColor: P.textPrimary,
            titleFont: { size: 10, family: "'Inter',sans-serif", weight: "600" },
            bodyFont: { size: 13, family: "'IBM Plex Mono',monospace" },
            callbacks: {
              title: (i: any) => i[0]?.label ?? "",
              label: (ctx: any) => ` ${ctx.dataset.label}  €${fmt(ctx.parsed.y, 0)}`,
            },
          },
        },
        scales: {
          x: { grid:{ display:false }, border:{ display:false }, ticks:{ color:P.textDark, font:{ size:10 }, letterSpacing:"0.05em" } },
          y: { display:false, min: 44000 },
          y1:{ display:false, position:"right", min:-800, max:3000 },
        },
      },
    });
    return () => { chartInst.current?.destroy(); };
  }, []);

  const savingsRate = analytics.tasa_ahorro_pct || 0;
  const totalPortfolio = PORTFOLIO.reduce((s,a) => s + a.value, 0);

  return (
    <div className="fade-up">
      {/* ── KPI Row ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr 1fr", borderBottom:`1px solid ${P.border}` }}>
        {[
          {
            label:"TOTAL BALANCE", unit:"EUR",
            value: loading ? "——" : `€ ${fmt(analytics.patrimonio_neto, 0)}`,
            color: loading ? P.textDark : P.accent,
            sub: "↑ 13.6% YTD", subColor: P.positiveLight,
            extra: (
              <div style={{ marginTop:8, height:"1px", background:`linear-gradient(to right, ${P.accent}, transparent)` }}/>
            ),
          },
          {
            label:"CASH FLOW (30D)", unit:"EUR",
            value: loading ? "——" : `+ € ${fmt(analytics.flujo_caja_neto, 0)}`,
            color: loading ? P.textDark : P.positiveLight,
            sub: `IN ${fmt(analytics.total_ingresos,0)} · OUT ${fmt(analytics.total_gastos,0)}`,
            subColor: P.textMuted,
          },
          {
            label:"SAVINGS RATE", unit:"PCT",
            value: loading ? "——" : `${savingsRate.toFixed(1)}%`,
            color: loading ? P.textDark : P.textSecondary,
            sub: savingsRate >= 50 ? "↑ TARGET MET" : "↓ BELOW TARGET",
            subColor: savingsRate >= 50 ? P.positiveLight : P.negativeLight,
            extra: (
              <div style={{ marginTop:12, height:2, background:P.surfaceHover, borderRadius:1, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${Math.min(savingsRate,100)}%`, background: savingsRate >= 50 ? P.positive : P.warning, transition:"width 1s ease", borderRadius:1 }}/>
              </div>
            ),
          },
          {
            label:"PORTFOLIO VALUE", unit:"EUR",
            value: `€ ${fmt(totalPortfolio, 0)}`,
            color: P.textSecondary,
            sub: "↑ 14.2% rentab. media",
            subColor: P.positiveLight,
          },
        ].map((kpi, i) => (
          <div key={kpi.label} style={{ padding:32, borderRight: i < 3 ? `1px solid ${P.border}` : "none", display:"flex", flexDirection:"column", justifyContent:"space-between", minHeight:160 }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <span className="corp-label">{kpi.label}</span>
              <span style={{ color:P.textDark, fontSize:10, fontFamily:"'Inter',sans-serif", fontWeight:500 }}>{kpi.unit}</span>
            </div>
            <div>
              <div className="kpi-value" style={{ color: kpi.color }}>{kpi.value}</div>
              <div style={{ marginTop:8, fontSize:11, color:kpi.subColor, fontFamily:"'Inter',sans-serif", fontWeight:500 }}>{kpi.sub}</div>
              {kpi.extra}
            </div>
          </div>
        ))}
      </div>

      {/* ── Chart + Allocation + Transactions ── */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 320px" }}>

        {/* Chart */}
        <div style={{ borderRight:`1px solid ${P.border}` }}>
          <div style={{ padding:"28px 32px 0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <span className="corp-label">PATRIMONIO & FLUJO DE CAJA</span>
              <div style={{ marginTop:6, display:"flex", gap:20 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <div style={{ width:20, height:1, background:P.accent }}/>
                  <span style={{ fontFamily:"'Inter',sans-serif", fontSize:10, color:P.textMuted }}>Net Worth</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <div style={{ width:20, height:1, background:P.textDark, borderTop:"1px dashed" }}/>
                  <span style={{ fontFamily:"'Inter',sans-serif", fontSize:10, color:P.textMuted }}>Prev. Period</span>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <div style={{ width:10, height:10, background:"rgba(16,185,129,0.3)", border:`1px solid ${P.positive}` }}/>
                  <span style={{ fontFamily:"'Inter',sans-serif", fontSize:10, color:P.textMuted }}>Cash Flow</span>
                </div>
              </div>
            </div>
            <div style={{ display:"flex", gap:3 }}>
              {PERIODS.map(p => (
                <button key={p} onClick={() => setPeriod(p)}
                  className={period === p ? "tab-active" : "tab-inactive"}>{p}</button>
              ))}
            </div>
          </div>
          <div style={{ height:300, padding:"16px 16px 16px 0" }}>
            <canvas ref={chartRef}/>
          </div>

          {/* Monthly heatmap strip */}
          <div style={{ borderTop:`1px solid ${P.border}`, padding:"20px 32px" }}>
            <span className="corp-label" style={{ display:"block", marginBottom:12 }}>FLUJO MENSUAL · INTENSIDAD</span>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(8,1fr)", gap:4 }}>
              {CHART_FLOW.map((f, i) => {
                const isPos = f >= 0;
                const intensity = Math.min(Math.abs(f) / 900, 1);
                return (
                  <div key={i} style={{ borderRadius:3, padding:"8px 6px", textAlign:"center", background: isPos ? `rgba(16,185,129,${0.04 + intensity*0.22})` : `rgba(239,68,68,${0.04 + intensity*0.18})`, border:`1px solid ${isPos ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)"}` }}>
                    <div style={{ fontFamily:"'Inter',sans-serif", fontSize:9, color:P.textDark, marginBottom:4 }}>{CHART_LABELS[i]}</div>
                    <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, fontWeight:600, color: isPos ? P.positiveLight : P.negativeLight }}>
                      {isPos?"+":"-"}{fmt(Math.abs(f),0)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right panel: Allocation + Recent Tx */}
        <div style={{ display:"flex", flexDirection:"column" }}>

          {/* Asset Allocation */}
          <div style={{ padding:"28px 28px 24px", borderBottom:`1px solid ${P.border}` }}>
            <span className="corp-label" style={{ display:"block", marginBottom:16 }}>ASSET ALLOCATION</span>
            {/* Segmented bar */}
            <div style={{ display:"flex", height:6, gap:2, marginBottom:18, borderRadius:2, overflow:"hidden" }}>
              {ALLOCATION.map(a => <div key={a.label} style={{ flex:a.pct, background:a.color, opacity: a.color === P.textDark ? 1 : 0.9 }}/>)}
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:11 }}>
              {ALLOCATION.map(a => (
                <div key={a.label} style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:8, height:8, borderRadius:2, background:a.color }}/>
                    <span style={{ fontFamily:"'Inter',sans-serif", fontSize:11, color:P.textMuted, fontWeight:500 }}>{a.label}</span>
                  </div>
                  <div style={{ display:"flex", gap:14, alignItems:"center" }}>
                    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:P.textDark }}>{a.pct}%</span>
                    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:P.textSecondary }}>€{fmt(a.value,0)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Settlements */}
          <div>
            <div style={{ padding:"20px 28px 12px", display:"flex", justifyContent:"space-between", alignItems:"center", borderBottom:`1px solid ${P.border}` }}>
              <span className="corp-label">RECENT SETTLEMENTS</span>
              <button className="btn-text" style={{ fontSize:10 }}>ALL →</button>
            </div>
            <div>
              {transactions.slice(0,5).map((tx: any, i: number) => {
                const isPos = tx.amount > 0;
                return (
                  <div key={tx.id} className="row-hover" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 28px", borderBottom:`1px solid ${P.border}` }}>
                    <div style={{ display:"flex", flexDirection:"column", gap:3, flex:1, minWidth:0 }}>
                      <span style={{ fontFamily:"'Inter',sans-serif", fontWeight:500, fontSize:12, color:P.textPrimary, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{tx.name}</span>
                      <span className="data-dim" style={{ fontFamily:"'Inter',sans-serif", fontSize:10, color:P.textDark }}>{tx.date} · {tx.category}</span>
                    </div>
                    <div style={{ textAlign:"right", flexShrink:0, marginLeft:12 }}>
                      <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color: isPos ? P.positiveLight : P.textPrimary }}>
                        {isPos ? "+" : "−"}€{fmt(Math.abs(tx.amount))}
                      </div>
                      {tx.status === "PENDING" && (
                        <span style={{ fontSize:9, fontFamily:"'Inter',sans-serif", fontWeight:600, color:P.warning, letterSpacing:"0.06em" }}>PENDING</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TRANSACTIONS ────────────────────────────────────────────────────────────────
function TransactionsView({ transactions }: any) {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const FILTERS = ["ALL","INCOME","EXPENSE","INVESTMENT","SOFTWARE"];

  const filtered = useMemo(() => {
    let r = filter === "ALL" ? transactions : transactions.filter((t: any) => t.category === filter);
    if (search.trim()) r = r.filter((t: any) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase())
    );
    return r;
  }, [transactions, filter, search]);

  const totals = useMemo(() => ({
    income:  filtered.filter((t:any) => t.amount > 0).reduce((s:number,t:any) => s+t.amount, 0),
    expense: filtered.filter((t:any) => t.amount < 0).reduce((s:number,t:any) => s+t.amount, 0),
  }), [filtered]);

  return (
    <div className="fade-up" style={{ padding:40 }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:28 }}>
        <div>
          <h2 style={{ fontFamily:"'Inter',sans-serif", fontSize:22, fontWeight:600, color:P.textPrimary, letterSpacing:"-0.02em", marginBottom:6 }}>General Ledger</h2>
          <span className="corp-label">REGISTRO HISTÓRICO COMPLETO · {filtered.length} ENTRADAS</span>
        </div>
        <div style={{ display:"flex", gap:12, alignItems:"center" }}>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:P.positiveLight }}>IN +€{fmt(totals.income,0)}</div>
          <div style={{ width:1, height:16, background:P.border }}/>
          <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:P.negativeLight }}>OUT −€{fmt(Math.abs(totals.expense),0)}</div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display:"flex", gap:12, marginBottom:20, alignItems:"center" }}>
        {/* Search */}
        <div style={{ flex:1, display:"flex", alignItems:"center", gap:8, background:P.surfaceHover, border:`1px solid ${P.border}`, borderRadius:4, padding:"8px 14px" }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke={P.textDark} strokeWidth="1.5"><circle cx="5" cy="5" r="4"/><path d="M11 11L8 8"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre o ID..."
            style={{ background:"transparent", border:"none", outline:"none", fontFamily:"'Inter',sans-serif", fontSize:12, color:P.textPrimary, flex:1, caretColor:P.accent }}/>
          {search && <button onClick={() => setSearch("")} style={{ background:"transparent", border:"none", color:P.textDark, cursor:"pointer", fontSize:14, lineHeight:1 }}>×</button>}
        </div>
        {/* Filter pills */}
        <div style={{ display:"flex", border:`1px solid ${P.border}`, borderRadius:4, overflow:"hidden" }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{ background: filter===f ? P.borderLight : "transparent", color: filter===f ? P.accent : P.textMuted, border:"none", padding:"8px 16px", fontFamily:"'Inter',sans-serif", fontWeight:600, fontSize:11, cursor:"pointer", letterSpacing:"0.04em", borderRight:`1px solid ${P.border}`, transition:"all 0.15s" }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={{ border:`1px solid ${P.border}`, borderRadius:6, overflow:"hidden" }}>
        <div style={{ display:"grid", gridTemplateColumns:"100px 90px 3fr 1.3fr 1.2fr 130px 110px", padding:"13px 24px", borderBottom:`1px solid ${P.border}`, background:P.surface }}>
          {["FECHA","TX ID","DESCRIPCIÓN","CATEGORÍA","CUENTA","IMPORTE (EUR)","ESTADO"].map((h, i) => (
            <span key={h} className="corp-label" style={{ textAlign: i >= 5 ? "right" : "left" }}>{h}</span>
          ))}
        </div>
        <div style={{ maxHeight:"calc(100vh - 320px)", overflowY:"auto", background:P.bg }}>
          {filtered.length === 0 ? (
            <div style={{ padding:48, textAlign:"center", fontFamily:"'Inter',sans-serif", fontSize:13, color:P.textDark }}>
              No se encontraron transacciones
            </div>
          ) : filtered.map((tx: any) => {
            const isPos = tx.amount > 0;
            return (
              <div key={tx.id} className="row-hover" style={{ display:"grid", gridTemplateColumns:"100px 90px 3fr 1.3fr 1.2fr 130px 110px", padding:"15px 24px", borderBottom:`1px solid ${P.border}`, alignItems:"center" }}>
                <span className="data-dim" style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:P.textMuted }}>{tx.date}</span>
                <span className="data-dim" style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:P.textDark }}>{tx.id}</span>
                <span style={{ fontFamily:"'Inter',sans-serif", fontSize:13, fontWeight:500, color:P.textPrimary }}>{tx.name}</span>
                <span className="data-dim" style={{ fontFamily:"'Inter',sans-serif", fontSize:11, color:P.textSecondary }}>{tx.category}</span>
                <span className="data-dim" style={{ fontFamily:"'Inter',sans-serif", fontSize:11, color:P.textSecondary }}>{tx.account}</span>
                <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:13, textAlign:"right", fontWeight:500, color: isPos ? P.positiveLight : P.textPrimary }}>
                  {isPos ? "+" : "−"}€{fmt(Math.abs(tx.amount))}
                </span>
                <div style={{ display:"flex", justifyContent:"flex-end" }}>
                  <span style={{ display:"inline-block", padding:"3px 8px", borderRadius:3, background: tx.status==="SETTLED" ? P.surfaceHover : "rgba(245,158,11,0.1)", color: tx.status==="SETTLED" ? P.textMuted : P.warning, fontFamily:"'Inter',sans-serif", fontWeight:600, fontSize:9, letterSpacing:"0.08em", border: tx.status==="PENDING" ? `1px solid rgba(245,158,11,0.3)` : `1px solid ${P.border}` }}>
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

// ─── PORTFOLIO ───────────────────────────────────────────────────────────────────
function PortfolioView() {
  const total = PORTFOLIO.reduce((s,a) => s+a.value, 0);
  const totalGain = 4240;

  return (
    <div className="fade-up" style={{ padding:40 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end", marginBottom:28 }}>
        <div>
          <h2 style={{ fontFamily:"'Inter',sans-serif", fontSize:22, fontWeight:600, color:P.textPrimary, letterSpacing:"-0.02em", marginBottom:6 }}>Portfolio</h2>
          <span className="corp-label">POSICIONES ABIERTAS · {PORTFOLIO.length} ACTIVOS</span>
        </div>
        <div style={{ display:"flex", gap:28 }}>
          {[
            { l:"VALOR TOTAL",   v:`€ ${fmt(total,0)}`,    c:P.textSecondary },
            { l:"GANANCIA NO REALIZADA", v:`+€ ${fmt(totalGain,0)}`, c:P.positiveLight },
            { l:"RENTAB. MEDIA", v:`+14.2%`,               c:P.positiveLight },
          ].map(k => (
            <div key={k.l} style={{ textAlign:"right" }}>
              <div className="corp-label" style={{ marginBottom:6 }}>{k.l}</div>
              <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:20, color:k.c }}>{k.v}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ border:`1px solid ${P.border}`, borderRadius:6, overflow:"hidden" }}>
        <div style={{ display:"grid", gridTemplateColumns:"2.5fr 80px 1fr 1fr 1fr 100px", padding:"13px 24px", borderBottom:`1px solid ${P.border}`, background:P.surface }}>
          {["ACTIVO","TICKER","PRECIO","VALOR","% CARTERA","RENTAB."].map((h, i) => (
            <span key={h} className="corp-label" style={{ textAlign: i > 0 ? "right" : "left" }}>{h}</span>
          ))}
        </div>
        <div style={{ background:P.bg }}>
          {PORTFOLIO.map((a, i) => {
            const isPos = a.gain > 0;
            const pct = (a.value / total * 100).toFixed(1);
            return (
              <div key={a.ticker} className="row-hover" style={{ display:"grid", gridTemplateColumns:"2.5fr 80px 1fr 1fr 1fr 100px", padding:"18px 24px", borderBottom: i < PORTFOLIO.length-1 ? `1px solid ${P.border}` : "none", alignItems:"center" }}>
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <div style={{ width:34, height:34, borderRadius:4, background:P.surfaceHover, border:`1px solid ${P.border}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:9, fontWeight:700, color:P.textMuted }}>{a.ticker.slice(0,3)}</span>
                  </div>
                  <div>
                    <div style={{ fontFamily:"'Inter',sans-serif", fontSize:13, fontWeight:500, color:P.textPrimary }}>{a.name}</div>
                    <div style={{ fontFamily:"'Inter',sans-serif", fontSize:10, color:P.textDark, marginTop:2 }}>{a.shares} {a.shares < 1 ? "BTC" : "uds"}</div>
                  </div>
                </div>
                <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color:P.textSecondary, textAlign:"right" }}>€{fmt(a.price,2)}</span>
                <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:13, fontWeight:500, color:P.textPrimary, textAlign:"right" }}>€{fmt(a.value,0)}</span>
                <div style={{ textAlign:"right" }}>
                  <div style={{ height:4, background:P.surfaceHover, borderRadius:2, overflow:"hidden", marginBottom:4 }}>
                    <div style={{ height:"100%", width:`${pct}%`, background:P.textDark, borderRadius:2 }}/>
                  </div>
                  <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:P.textMuted }}>{pct}%</span>
                </div>
                <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:13, fontWeight:600, textAlign:"right", color: isPos ? P.positiveLight : P.negativeLight }}>
                  {isPos?"+":""}{a.gain}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── ANALYTICS ───────────────────────────────────────────────────────────────────
function AnalyticsView() {
  const catBarRef = useRef<HTMLCanvasElement>(null);
  const catBarInst = useRef<any>(null);

  const catData = useMemo(() => {
    const map: Record<string, { income:number; expense:number }> = {};
    TRANSACTIONS.forEach(t => {
      if (!map[t.category]) map[t.category] = { income:0, expense:0 };
      if (t.amount > 0) map[t.category].income += t.amount;
      else map[t.category].expense += Math.abs(t.amount);
    });
    return map;
  }, []);

  useEffect(() => {
    if (!catBarRef.current) return;
    if (catBarInst.current) catBarInst.current.destroy();
    const cats = Object.keys(catData);
    catBarInst.current = new Chart(catBarRef.current, {
      type:"bar",
      data:{
        labels: cats,
        datasets:[
          { label:"INGRESOS", data: cats.map(c => catData[c].income), backgroundColor:"rgba(16,185,129,0.2)", borderColor:P.positive, borderWidth:1, borderRadius:2 },
          { label:"GASTOS",   data: cats.map(c => catData[c].expense), backgroundColor:"rgba(239,68,68,0.15)", borderColor:P.negative, borderWidth:1, borderRadius:2 },
        ],
      },
      options:{
        responsive:true, maintainAspectRatio:false,
        plugins:{ legend:{ display:false }, tooltip:{ backgroundColor:P.surfaceHover, borderColor:P.borderLight, borderWidth:1, titleColor:P.textMuted, bodyColor:P.textPrimary, padding:12, cornerRadius:4, titleFont:{ size:10, family:"'Inter',sans-serif" }, bodyFont:{ size:13, family:"'IBM Plex Mono',monospace" } } },
        scales:{
          x:{ grid:{ display:false }, border:{ display:false }, ticks:{ color:P.textDark, font:{ size:10 } } },
          y:{ grid:{ color:P.border }, border:{ display:false }, ticks:{ color:P.textDark, font:{ size:10 }, callback:(v:any) => `€${(v/1000).toFixed(0)}K` } },
        },
      },
    });
    return () => { catBarInst.current?.destroy(); };
  }, []);

  return (
    <div className="fade-up" style={{ padding:40 }}>
      <div style={{ marginBottom:28 }}>
        <h2 style={{ fontFamily:"'Inter',sans-serif", fontSize:22, fontWeight:600, color:P.textPrimary, letterSpacing:"-0.02em", marginBottom:6 }}>Analytics</h2>
        <span className="corp-label">ANÁLISIS FINANCIERO DETALLADO</span>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:20, marginBottom:20 }}>
        {/* Category breakdown */}
        <div style={{ border:`1px solid ${P.border}`, borderRadius:6, padding:28, background:P.bg }}>
          <span className="corp-label" style={{ display:"block", marginBottom:20 }}>INGRESOS VS GASTOS POR CATEGORÍA</span>
          <div style={{ display:"flex", gap:16, marginBottom:16 }}>
            {[{ l:"INGRESOS", c:P.positive }, { l:"GASTOS", c:P.negative }].map(l => (
              <div key={l.l} style={{ display:"flex", alignItems:"center", gap:6 }}>
                <div style={{ width:12, height:3, background:l.c, borderRadius:1 }}/>
                <span style={{ fontFamily:"'Inter',sans-serif", fontSize:10, color:P.textMuted }}>{l.l}</span>
              </div>
            ))}
          </div>
          <div style={{ height:220 }}><canvas ref={catBarRef}/></div>
        </div>

        {/* Top expenses */}
        <div style={{ border:`1px solid ${P.border}`, borderRadius:6, padding:28, background:P.bg }}>
          <span className="corp-label" style={{ display:"block", marginBottom:20 }}>MAYORES MOVIMIENTOS</span>
          <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
            {[...TRANSACTIONS].sort((a,b) => Math.abs(b.amount)-Math.abs(a.amount)).slice(0,6).map((tx, i) => {
              const isPos = tx.amount > 0;
              const maxAmt = Math.abs(TRANSACTIONS.reduce((m,t) => Math.abs(t.amount) > m ? Math.abs(t.amount) : m, 0));
              const barW = (Math.abs(tx.amount) / maxAmt * 100).toFixed(1);
              return (
                <div key={tx.id} style={{ padding:"11px 0", borderBottom: i<5 ? `1px solid ${P.border}` : "none" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                    <span style={{ fontFamily:"'Inter',sans-serif", fontSize:12, color:P.textPrimary }}>{tx.name}</span>
                    <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:12, color: isPos ? P.positiveLight : P.negativeLight }}>
                      {isPos?"+":"−"}€{fmt(Math.abs(tx.amount),0)}
                    </span>
                  </div>
                  <div style={{ height:2, background:P.surfaceHover, borderRadius:1, overflow:"hidden" }}>
                    <div style={{ height:"100%", width:`${barW}%`, background: isPos ? P.positive : P.negative, borderRadius:1, opacity:0.6 }}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Monthly summary grid */}
      <div style={{ border:`1px solid ${P.border}`, borderRadius:6, padding:28, background:P.bg }}>
        <span className="corp-label" style={{ display:"block", marginBottom:20 }}>RESUMEN MENSUAL · AGO 25 – MAR 26</span>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(8,1fr)", gap:8 }}>
          {CHART_LABELS.map((label, i) => {
            const flow = CHART_FLOW[i];
            const net = CHART_NET[i];
            const isPos = flow >= 0;
            return (
              <div key={label} style={{ border:`1px solid ${P.border}`, borderRadius:4, padding:14, background:P.surface }}>
                <div style={{ fontFamily:"'Inter',sans-serif", fontSize:9, color:P.textDark, letterSpacing:"0.08em", marginBottom:10 }}>{label}</div>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:14, fontWeight:600, color:P.textSecondary, marginBottom:6 }}>€{(net/1000).toFixed(1)}K</div>
                <div style={{ height:1, background:P.border, marginBottom:6 }}/>
                <div style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color: isPos ? P.positiveLight : P.negativeLight }}>
                  {isPos?"+":"−"}€{fmt(Math.abs(flow),0)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── SETTINGS ────────────────────────────────────────────────────────────────────
function SettingsView() {
  const [notif, setNotif] = useState(true);
  const [twofa, setTwofa] = useState(true);
  const [sync,  setSync]  = useState(false);

  const Toggle = ({ val, set }: { val:boolean; set:(v:boolean)=>void }) => (
    <div onClick={() => set(!val)} style={{ width:36, height:20, borderRadius:10, background: val ? P.positive : P.border, cursor:"pointer", transition:"background 0.2s", position:"relative", flexShrink:0 }}>
      <div style={{ position:"absolute", top:3, left: val ? 19 : 3, width:14, height:14, borderRadius:"50%", background:P.accent, transition:"left 0.2s" }}/>
    </div>
  );

  const Section = ({ title, children }: any) => (
    <div style={{ border:`1px solid ${P.border}`, borderRadius:6, overflow:"hidden", marginBottom:16 }}>
      <div style={{ padding:"12px 24px", borderBottom:`1px solid ${P.border}`, background:P.surface }}>
        <span className="corp-label">{title}</span>
      </div>
      {children}
    </div>
  );

  const Row = ({ label, desc, right }: any) => (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"18px 24px", borderBottom:`1px solid ${P.border}` }}>
      <div>
        <div style={{ fontFamily:"'Inter',sans-serif", fontSize:13, fontWeight:500, color:P.textPrimary }}>{label}</div>
        <div style={{ fontFamily:"'Inter',sans-serif", fontSize:11, color:P.textMuted, marginTop:3 }}>{desc}</div>
      </div>
      {right}
    </div>
  );

  return (
    <div className="fade-up" style={{ padding:40, maxWidth:720 }}>
      <div style={{ marginBottom:28 }}>
        <h2 style={{ fontFamily:"'Inter',sans-serif", fontSize:22, fontWeight:600, color:P.textPrimary, letterSpacing:"-0.02em", marginBottom:6 }}>Settings</h2>
        <span className="corp-label">CONFIGURACIÓN DEL SISTEMA</span>
      </div>

      <Section title="CUENTA">
        <Row label="Nombre completo" desc="Jorge Martínez García" right={<span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:P.textDark }}>EDIT</span>}/>
        <Row label="Email institucional" desc="j.martinez@jpmorgan.com" right={<span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:P.textDark }}>EDIT</span>}/>
        <Row label="Plan activo" desc="Institutional Pro — todos los módulos activos" right={<span style={{ padding:"3px 10px", borderRadius:3, background:"rgba(16,185,129,0.1)", border:`1px solid rgba(16,185,129,0.2)`, fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:600, color:P.positiveLight }}>ACTIVO</span>}/>
      </Section>

      <Section title="SEGURIDAD">
        <Row label="Autenticación 2FA" desc="Capa adicional de seguridad mediante app autenticadora" right={<Toggle val={twofa} set={setTwofa}/>}/>
        <Row label="Cifrado de sesión" desc="AES-256 activo en todas las conexiones" right={<span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:11, color:P.positiveLight }}>SECURE ✓</span>}/>
        <div style={{ padding:"18px 24px" }}>
          <button style={{ fontFamily:"'Inter',sans-serif", fontSize:11, fontWeight:600, color:P.negativeLight, background:"transparent", border:`1px solid rgba(239,68,68,0.2)`, borderRadius:3, padding:"7px 14px", cursor:"pointer", letterSpacing:"0.05em" }}>CERRAR TODAS LAS SESIONES</button>
        </div>
      </Section>

      <Section title="SISTEMA">
        <Row label="Notificaciones push" desc="Alertas de movimientos, límites y alertas de precio" right={<Toggle val={notif} set={setNotif}/>}/>
        <Row label="Sincronización automática" desc="Actualizar datos cada 5 minutos" right={<Toggle val={sync} set={setSync}/>}/>
        <Row label="Zona horaria" desc="Europe/Madrid (CET/CEST)" right={null}/>
        <Row label="Divisa base" desc="EUR · Euro" right={null}/>
        <div style={{ borderTop:`1px solid ${P.border}` }}/>
      </Section>
    </div>
  );
}

// ─── DRAWER ──────────────────────────────────────────────────────────────────────
function Drawer({ isOpen, onClose, addToast }: any) {
  const [type, setType] = useState("INFLOW");

  if (!isOpen) return null;

  const handleSubmit = () => {
    onClose();
    addToast("Transacción registrada correctamente", "success");
  };

  return (
    <>
      <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.65)", backdropFilter:"blur(4px)", zIndex:200 }} onClick={onClose}/>
      <div className="drawer-slide" style={{ position:"fixed", top:0, right:0, bottom:0, width:460, background:P.surface, borderLeft:`1px solid ${P.border}`, zIndex:201, display:"flex", flexDirection:"column" }}>
        
        <div style={{ padding:"28px 32px", borderBottom:`1px solid ${P.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <span style={{ fontFamily:"'Inter',sans-serif", fontSize:16, fontWeight:600, color:P.accent }}>Record New Entry</span>
            <div style={{ fontFamily:"'Inter',sans-serif", fontSize:11, color:P.textMuted, marginTop:4 }}>Añadir al libro mayor</div>
          </div>
          <button onClick={onClose} style={{ background:"transparent", border:`1px solid ${P.border}`, borderRadius:3, width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", color:P.textMuted, cursor:"pointer", fontSize:14 }}>×</button>
        </div>

        <div style={{ flex:1, overflowY:"auto", padding:"28px 32px", display:"flex", flexDirection:"column", gap:22 }}>
          
          {/* Type */}
          <div>
            <label className="form-label">TIPO DE OPERACIÓN</label>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8, marginTop:8 }}>
              {[
                { val:"INFLOW",  label:"↓ ENTRADA", color:P.positiveLight },
                { val:"OUTFLOW", label:"↑ SALIDA",  color:P.negativeLight },
              ].map(t => (
                <button key={t.val} onClick={() => setType(t.val)}
                  style={{ padding:"11px", border:`1px solid ${type===t.val ? t.color : P.border}`, borderRadius:4, background: type===t.val ? "transparent" : "transparent", color: type===t.val ? t.color : P.textMuted, fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:11, cursor:"pointer", letterSpacing:"0.06em", transition:"all 0.15s" }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="form-label">IMPORTE (EUR)</label>
            <input type="number" step="0.01" placeholder="0.00" className="input-inst" style={{ marginTop:8 }}/>
          </div>

          {/* Description */}
          <div>
            <label className="form-label">DESCRIPCIÓN</label>
            <input type="text" placeholder="Ej. Factura cliente..." className="input-inst" style={{ marginTop:8 }}/>
          </div>

          {/* Category */}
          <div>
            <label className="form-label">CATEGORÍA</label>
            <select className="input-inst" style={{ marginTop:8 }}>
              <option value="" disabled>Seleccionar...</option>
              {["INCOME","EXPENSE","INVESTMENT","SOFTWARE"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Account */}
          <div>
            <label className="form-label">CUENTA</label>
            <select className="input-inst" style={{ marginTop:8 }}>
              <option value="" disabled>Seleccionar...</option>
              {["Principal","Tarjeta","Inversión"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="form-label">FECHA DE LIQUIDACIÓN</label>
            <input type="date" className="input-inst" defaultValue={new Date().toISOString().split("T")[0]} style={{ marginTop:8 }}/>
          </div>

          {/* Notes */}
          <div>
            <label className="form-label">NOTAS (OPCIONAL)</label>
            <textarea placeholder="Observaciones adicionales..." className="input-inst" style={{ marginTop:8, resize:"vertical", minHeight:72 }}/>
          </div>
        </div>

        <div style={{ padding:"24px 32px", borderTop:`1px solid ${P.border}`, display:"flex", gap:12, background:P.bg }}>
          <button onClick={onClose} style={{ flex:1, padding:"11px", background:"transparent", border:`1px solid ${P.border}`, borderRadius:4, color:P.textSecondary, fontFamily:"'Inter',sans-serif", fontWeight:600, fontSize:12, cursor:"pointer", letterSpacing:"0.05em" }}>CANCELAR</button>
          <button onClick={handleSubmit} style={{ flex:2, padding:"11px", background:P.accent, border:"none", borderRadius:4, color:P.bg, fontFamily:"'Inter',sans-serif", fontWeight:700, fontSize:12, cursor:"pointer", letterSpacing:"0.06em" }}>COMMIT ENTRY</button>
        </div>
      </div>
    </>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────────
export default function FinTrackInstitutional() {
  const [time, setTime]         = useState("--:--:--");
  const [loading, setLoading]   = useState(true);
  const [activeTab, setActiveTab] = useState("OVERVIEW");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toasts, setToasts]     = useState<any[]>([]);
  const [analytics, setAnalytics] = useState({
    patrimonio_neto:0, flujo_caja_neto:0, total_ingresos:0, total_gastos:0, tasa_ahorro_pct:0,
  });

  useEffect(() => {
    const id = setInterval(() => setTime(new Date().toLocaleTimeString("es-ES", { hour12:false })), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    fetch(API_URL, { headers:{ Authorization:`Bearer ${TOKEN}` } })
      .then(r => r.json())
      .then(data => { if (data.patrimonio_neto !== undefined) setAnalytics(data); setLoading(false); })
      .catch(() => {
        setTimeout(() => {
          setAnalytics({ patrimonio_neto:54750.20, flujo_caja_neto:5420.00, total_ingresos:8400.00, total_gastos:2980.00, tasa_ahorro_pct:64.5 });
          setLoading(false);
        }, 900);
      });
  }, []);

  const addToast = useCallback((msg: string, type = "info") => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);

  const VIEWS: Record<string, React.ReactNode> = {
    OVERVIEW:     <OverviewView analytics={analytics} loading={loading} transactions={TRANSACTIONS}/>,
    TRANSACTIONS: <TransactionsView transactions={TRANSACTIONS}/>,
    PORTFOLIO:    <PortfolioView/>,
    ANALYTICS:    <AnalyticsView/>,
    SETTINGS:     <SettingsView/>,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        body { background:${P.bg}; color:${P.textSecondary}; font-family:'Inter',sans-serif; -webkit-font-smoothing:antialiased; min-height:100vh; }
        input, select, textarea, button { font-family:inherit; }
        select option { background:${P.surface}; }

        .corp-label { font-family:'Inter',sans-serif; font-size:10px; font-weight:600; color:${P.textMuted}; letter-spacing:0.07em; text-transform:uppercase; }
        .kpi-value  { font-family:'IBM Plex Mono',monospace; font-size:36px; font-weight:400; letter-spacing:-0.02em; line-height:1; transition:color 0.4s; }
        .form-label { font-family:'Inter',sans-serif; font-size:10px; font-weight:600; color:${P.textMuted}; letter-spacing:0.07em; text-transform:uppercase; }

        .row-hover { transition:background 0.15s; cursor:pointer; }
        .row-hover:hover { background:${P.surfaceHover}; }
        .row-hover:hover .data-dim { color:${P.textSecondary} !important; }
        .data-dim { transition:color 0.15s; }

        .tab-active  { background:${P.borderLight}; color:${P.textPrimary}; border:1px solid transparent; font-family:'Inter',sans-serif; font-weight:600; font-size:11px; padding:5px 13px; cursor:default; border-radius:3px; }
        .tab-inactive{ background:transparent; color:${P.textMuted}; border:1px solid transparent; font-family:'Inter',sans-serif; font-weight:500; font-size:11px; padding:5px 13px; cursor:pointer; transition:all 0.15s; border-radius:3px; }
        .tab-inactive:hover { color:${P.textPrimary}; background:${P.surfaceHover}; }

        .btn-text { background:transparent; border:none; color:${P.textDark}; font-family:'Inter',sans-serif; font-weight:600; font-size:11px; letter-spacing:0.05em; cursor:pointer; transition:color 0.15s; }
        .btn-text:hover { color:${P.textPrimary}; }

        .input-inst { width:100%; background:${P.bg}; border:1px solid ${P.borderLight}; padding:11px 14px; color:${P.textPrimary}; font-size:13px; outline:none; transition:border-color 0.15s; border-radius:4px; display:block; }
        .input-inst:focus { border-color:${P.textSecondary}; }
        .input-inst::placeholder { color:${P.textDark}; }

        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        .fade-up { animation:fadeUp 0.35s cubic-bezier(0.16,1,0.3,1) both; }

        @keyframes slideInRight { from{transform:translateX(100%)} to{transform:translateX(0)} }
        .drawer-slide { animation:slideInRight 0.3s cubic-bezier(0.16,1,0.3,1); }

        @keyframes toastIn { from{opacity:0;transform:translateX(16px)} to{opacity:1;transform:translateX(0)} }
        .toast-in { animation:toastIn 0.3s cubic-bezier(0.16,1,0.3,1); }

        ::-webkit-scrollbar { width:5px; height:5px; }
        ::-webkit-scrollbar-track { background:${P.bg}; }
        ::-webkit-scrollbar-thumb { background:${P.borderLight}; border-radius:3px; }
        ::-webkit-scrollbar-thumb:hover { background:${P.textMuted}; }
      `}</style>

      <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column" }}>
        <TickerBar/>
        <TopBar time={time} activeTab={activeTab} setActiveTab={setActiveTab} loading={loading} toggleDrawer={() => setDrawerOpen(true)}/>
        <main style={{ flex:1, display:"flex", flexDirection:"column" }}>
          {VIEWS[activeTab]}
        </main>
        <footer style={{ borderTop:`1px solid ${P.border}`, padding:"16px 32px", display:"flex", justifyContent:"space-between", background:P.surface }}>
          <span style={{ fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:500, color:P.textDark, letterSpacing:"0.06em" }}>FINTRACK CORE SYSTEM v2.1 · ALL SYSTEMS NOMINAL</span>
          <span style={{ fontFamily:"'IBM Plex Mono',monospace", fontSize:10, color:P.textDark }}>SECURE CONNECTION · AES-256-GCM · TLS 1.3</span>
        </footer>
      </div>

      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} addToast={addToast}/>

      <div style={{ position:"fixed", bottom:24, right:24, display:"flex", flexDirection:"column", gap:8, zIndex:300 }}>
        {toasts.map(t => (
          <div key={t.id} className="toast-in" style={{ background:P.surface, border:`1px solid ${t.type==="success" ? "rgba(16,185,129,0.3)" : P.borderLight}`, borderRadius:4, padding:"14px 20px", display:"flex", alignItems:"center", gap:10, boxShadow:"0 10px 40px rgba(0,0,0,0.6)", minWidth:260 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background: t.type==="success" ? P.positive : P.blue, flexShrink:0 }}/>
            <span style={{ fontFamily:"'Inter',sans-serif", fontWeight:500, fontSize:12, color:P.textPrimary }}>{t.msg}</span>
          </div>
        ))}
      </div>
    </>
  );
}