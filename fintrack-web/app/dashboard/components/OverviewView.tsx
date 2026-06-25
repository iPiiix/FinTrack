import React, { useRef, useMemo, useEffect } from "react";
import { fmt, groupByMonth, groupByCategory, loadChart } from "../../../lib/utils";
import { DONUT_COLORS } from "../../../lib/constants";
import { EmptyState } from "./ui/EmptyState";
import { Trash2 } from "lucide-react";

export function OverviewView({ analytics, loading, transactions, categorias, openAccountDrawer, deleteTransaction }: any) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInst = useRef<any>(null);
  const donutRef = useRef<HTMLCanvasElement>(null);
  const donutInst = useRef<any>(null);

  const { labels, flows, nets } = useMemo(() => groupByMonth(transactions), [transactions]);
  const { catLabels, catData, catDetails } = useMemo(() => groupByCategory(transactions, categorias || []), [transactions, categorias]);

  useEffect(() => {
    let destroyed = false;
    loadChart().then((C: any) => {
      if (!C || !chartRef.current || destroyed) return;
      chartInst.current?.destroy();
      C.defaults.font.family = "'IBM Plex Mono', monospace";
      chartInst.current = new C(chartRef.current, {
        type: "line",
        data: {
          labels,
          datasets: [
            { type: "line", label: "CASH FLOW ACUM.", data: nets, borderColor: "#FFFFFF", borderWidth: 1.5, tension: 0.35, pointRadius: 0, pointHoverRadius: 5, yAxisID: "y", fill: true,
              backgroundColor: (ctx: any) => { const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 280); g.addColorStop(0, "rgba(255,255,255,0.06)"); g.addColorStop(1, "rgba(255,255,255,0)"); return g; } },
            { type: "bar", label: "FLUJO MENSUAL", data: flows, backgroundColor: (ctx: any) => ctx.raw >= 0 ? "rgba(255,255,255,0.06)" : "rgba(239,68,68,0.1)", borderColor: (ctx: any) => ctx.raw >= 0 ? "rgba(255,255,255,0.2)" : "rgba(239,68,68,0.35)", borderWidth: 1, yAxisID: "y1", borderRadius: 1 },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false, interaction: { mode: "index", intersect: false },
          plugins: { legend: { display: false }, tooltip: { backgroundColor: "#18181B", borderColor: "#3F3F46", borderWidth: 1, padding: 14, cornerRadius: 3, titleColor: "#52525B", bodyColor: "#FAFAFA", titleFont: { size: 10, family: "'Inter',sans-serif", weight: "600" }, bodyFont: { size: 12, family: "'IBM Plex Mono',monospace" }, callbacks: { label: (ctx: any) => `  ${ctx.dataset.label}  €${fmt(ctx.parsed.y, 0)}` } } },
          scales: { x: { grid: { display: false }, border: { display: false }, ticks: { color: "#3F3F46", font: { size: 9 } } }, y: { display: false }, y1: { display: false, position: "right" } },
        },
      });
    });
    return () => { destroyed = true; chartInst.current?.destroy(); };
  }, [labels, flows, nets]);

  useEffect(() => {
    let destroyed = false;
    loadChart().then((C: any) => {
      if (!C || !donutRef.current || destroyed || catData.length === 0) return;
      donutInst.current?.destroy();
      donutInst.current = new C(donutRef.current, {
        type: "doughnut",
        data: {
          labels: catLabels,
          datasets: [{ data: catData, backgroundColor: DONUT_COLORS, borderWidth: 0, hoverOffset: 4 }]
        },
        options: {
          responsive: true, maintainAspectRatio: false, cutout: "75%",
          plugins: { 
            legend: { display: false }, 
            tooltip: { backgroundColor: "#18181B", borderColor: "#3F3F46", borderWidth: 1, padding: 12, cornerRadius: 2, titleColor: "#52525B", bodyColor: "#FAFAFA", bodyFont: { size: 12, family: "'IBM Plex Mono',monospace" }, callbacks: { label: (ctx: any) => `  €${fmt(ctx.parsed, 2)}` } }
          }
        }
      });
    });
    return () => { destroyed = true; donutInst.current?.destroy(); };
  }, [catLabels, catData]);

  const savingsRate = analytics?.tasa_ahorro_pct || 0;
  const kpis = [
    { label: "PATRIMONIO TOTAL", unit: "EUR", value: loading ? "——" : `${fmt(analytics?.patrimonio_neto || 0, 0)}`, bright: !loading, extra: <div style={{ marginTop: 10, height: 16, borderBottom: "1px solid", borderImage: "linear-gradient(to right, rgba(255,255,255,0.2), transparent) 1" }} /> },
    { label: "BALANCE MENSUAL", unit: "EUR", value: loading ? "——" : `${(analytics?.flujo_caja_neto || 0) >= 0 ? "+" : "−"}${fmt(Math.abs(analytics?.flujo_caja_neto || 0), 0)}`, bright: !loading, sub: (analytics?.flujo_caja_neto || 0) >= 0 ? "POSITIVO" : "NEGATIVO", subPos: (analytics?.flujo_caja_neto || 0) >= 0 },
    { label: "INGRESOS (MES)", unit: "EUR", value: loading ? "——" : `${fmt(analytics?.total_ingresos || 0, 0)}`, bright: !loading, extra: <div style={{ marginTop: 10, height: 16 }} /> },
    { label: "TASA DE AHORRO", unit: "%", value: loading ? "——" : `${savingsRate >= 0 ? "+" : "−"}${fmt(Math.abs(savingsRate), 1)}`, bright: !loading, sub: savingsRate >= 20 ? "EXCELENTE" : savingsRate >= 0 ? "PUEDE MEJORAR" : "CRÍTICO (DEUDA)", subPos: savingsRate >= 20,
      extra: <div style={{ marginTop: 14, height: 2, background: "#1C1C1F", overflow: "hidden", borderRadius: 1 }}><div style={{ height: "100%", background: savingsRate >= 0 ? "rgba(255,255,255,0.35)" : "rgba(239, 68, 68, 0.4)", width: `${Math.min(Math.max(savingsRate, 0), 100)}%`, transition: "width 1.2s cubic-bezier(0.16,1,0.3,1)", borderRadius: 1 }} /></div> },
  ];

  return (
    <div className="vu flex flex-col gap-6">
      {/* KPI Grid - Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((k) => (
          <div key={k.label} className="fintrack-card-outer">
            <div className="fintrack-card-inner min-h-[140px] md:min-h-[164px]">
              <div className="flex justify-between items-start">
                <span className="lbl">{k.label}</span>
                <span className="lbl opacity-40">{k.unit}</span>
              </div>
              <div className="mt-4">
                <div className="kpi-num text-2xl md:text-[32px]" style={{ color: k.bright ? "white" : "#E4E4E7" }}>{k.value}</div>
                {k.sub && <div className="mono mt-2.5 text-[11px]" style={{ color: k.subPos ? "rgba(16,185,129,0.8)" : "rgba(248,113,113,0.8)" }}>{k.sub}</div>}
                {k.extra}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts area - Stacks on mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 w-full">
        {/* Left Column: Flujo de caja Chart */}
        <div className="flex flex-col gap-6">
          <div className="fintrack-card-outer">
            <div className="fintrack-card-inner">
              <div className="flex items-start justify-between pb-4">
                <div>
                  <span className="lbl block mb-3.5">FLUJO DE CAJA</span>
                  <div className="flex gap-6">
                    <div className="flex items-center gap-2"><div className="w-5 h-px border-t border-white/50" /><span className="text-[10px] text-[#52525B]">Acumulado</span></div>
                    <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 bg-white/15 border border-white/20" /><span className="text-[10px] text-[#52525B]">Mensual</span></div>
                  </div>
                </div>
              </div>
              <div className="h-[240px] md:h-[276px]">
                {transactions.length === 0 ? <EmptyState title="Sin datos" desc="Añade tu primera transacción para ver el gráfico" /> : <canvas ref={chartRef} />}
              </div>
            </div>
          </div>

          <div className="fintrack-card-outer">
            <div className="fintrack-card-inner">
              <span className="lbl block mb-4">FLUJO MENSUAL</span>
              {flows.length > 0 && flows.some((f: number) => f !== 0) ? (
                <div className="flex md:grid md:grid-cols-6 lg:grid-cols-12 gap-1.5 min-w-max md:min-w-0 overflow-x-auto no-scrollbar pb-1">
                  {flows.map((f: number, i: number) => {
                    const pos = f >= 0;
                    const intensity = Math.min(Math.abs(f) / (Math.max(...flows.map(Math.abs)) || 1), 1);
                    return (
                      <div key={i} className="p-2.5 md:p-1.5 text-center border transition-colors min-w-[70px] md:min-w-0" style={{ background: pos ? `rgba(255,255,255,${0.02 + intensity * 0.07})` : `rgba(239,68,68,${0.03 + intensity * 0.09})`, borderColor: pos ? `rgba(255,255,255,${0.06 + intensity * 0.1})` : `rgba(239,68,68,${0.12 + intensity * 0.12})`, borderRadius: '4px' }}>
                        <div className="lbl mb-1.5 truncate">{labels[i]}</div>
                        <div className="mono text-[10px] font-medium" style={{ color: pos ? "#D4D4D8" : "#F87171" }}>{pos ? "+" : "−"}{fmt(Math.abs(f), 0)}</div>
                      </div>
                    );
                  })}
                </div>
              ) : <div className="lbl text-[#3F3F46]">Sin transacciones aún</div>}
            </div>
          </div>
        </div>

        {/* Right Column: Cuentas + Recientes Card */}
        <div className="fintrack-card-outer">
          <div className="fintrack-card-inner flex flex-col justify-start gap-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="lbl">CUENTAS</span>
                <button 
                  onClick={openAccountDrawer}
                  className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 text-zinc-300 font-semibold tracking-wider text-[10.5px] px-3 py-1.5 rounded-md hover:border-zinc-700 hover:text-white transition-all active:scale-[0.97] hover:bg-zinc-800/80"
                >+ Añadir Cuenta</button>
              </div>
              {analytics?._cuentas && analytics._cuentas.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {analytics._cuentas.map((c: any, i: number) => (
                    <div key={c.id_cuenta} className="flex items-center justify-between py-2 px-3 bg-white/[0.015] border border-white/[0.03] rounded-md hover:bg-white/[0.03] transition-colors">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: ["#FAFAFA","#71717A","#3F3F46","#27272A"][i % 4] }} />
                        <span className="text-[12px] font-medium text-zinc-300 truncate">{c.nombre}</span>
                      </div>
                      <span className="mono text-[11px] font-semibold shrink-0" style={{ color: c.balance < 0 ? "#F87171" : "#E4E4E7" }}>{c.balance < 0 ? "−" : ""}€{fmt(Math.abs(c.balance), 0)}</span>
                    </div>
                  ))}
                </div>
              ) : <div className="lbl text-[#3F3F46] py-2">Crea tu primera cuenta</div>}
            </div>

            <div className="flex-1 flex flex-col justify-start">
              <span className="lbl block mb-4 border-t border-[#1C1C1F]/60 pt-6">MOVIMIENTOS RECIENTES</span>
              <div className="flex flex-col gap-1 overflow-y-auto max-h-[300px] no-scrollbar">
                {transactions.length === 0 ? <EmptyState title="Sin transacciones" desc="Añade tu primera entrada" /> :
                  transactions.slice(0, 6).map((tx: any) => {
                    const pos = tx.tipo === "ingreso";
                    return (
                      <div key={tx.id_transaccion} className="group flex items-center justify-between py-3 px-1 border-b border-white/[0.02] last:border-b-0 hover:bg-white/[0.02] transition-colors rounded-sm">
                        <div className="flex-1 min-w-0 pr-3.5">
                          <div className="text-[12px] font-medium text-[#E4E4E7] truncate mb-1">{tx.nombre}</div>
                          <div className="lbl">{tx.fecha ? new Date(tx.fecha).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "2-digit" }).toUpperCase() : ""}</div>
                        </div>
                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-right">
                            <div className="mono text-[12px]" style={{ color: pos ? "#10B981" : "#A1A1AA" }}>{pos ? "+" : "−"}€{fmt(Math.abs(tx.cantidad))}</div>
                            {tx.estado === "pendiente" && <span className="text-[9px] font-semibold text-[#FBBF24] tracking-wider block mt-1">PENDIENTE</span>}
                          </div>
                          <button 
                            onClick={() => deleteTransaction && deleteTransaction(tx.id_transaccion)} 
                            className="text-[#52525B] hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                            title="Eliminar transacción"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })
                }
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Distribution & AI Advisor Section */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 w-full">
        {/* Left Column: Gastos Distribution */}
        <div className="fintrack-card-outer">
          <div className="fintrack-card-inner">
            <span className="lbl block mb-6">DISTRIBUCIÓN DE GASTOS</span>
            <div className="flex flex-col md:flex-row gap-8 md:gap-14 items-center justify-between">
              <div className="w-[180px] h-[180px] md:w-[220px] md:h-[220px] shrink-0">
                {catData.length === 0 ? <EmptyState title="Sin gastos" desc="Registra gastos para ver la distribución" /> : <canvas ref={donutRef} />}
              </div>
              {catData.length > 0 ? (
                <div className="flex-1 w-full flex flex-col gap-3.5">
                  {catDetails.map((cat: any, i: number) => {
                    const totalExp = catData.reduce((a:number,b:number)=>a+b, 0);
                    const pct = totalExp > 0 ? (cat.total / totalExp) * 100 : 0;
                    return (
                      <div key={cat.id} className="flex items-center justify-between pb-3.5 border-b border-[#1C1C1F]/60 last:border-none">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                          <span className="lbl">{cat.name}</span>
                        </div>
                        <div className="flex items-center gap-6">
                          <span className="mono text-[10px] text-[#71717A] w-10 text-right">{fmt(pct, 1)}%</span>
                          <span className="mono text-[11px] text-[#D4D4D8] w-16 md:w-[70px] text-right">€{fmt(cat.total, 0)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : <div className="lbl text-[#3F3F46] flex-1 text-center py-6">Registra gastos para ver la distribución</div>}
            </div>
          </div>
        </div>

        {/* Right Column: AI Advisor Promo Card */}
        <div className="fintrack-card-outer">
          <div className="fintrack-card-inner flex flex-col justify-between gap-6">
            <div>
              <span className="lbl block mb-3.5 text-[#71717A]">INFORMACIÓN Y CONSEJOS</span>
              <p className="text-[11px] text-[#71717A] leading-relaxed mb-4">Las categorías te permiten entender de forma sencilla en qué áreas se concentra tu mayor salida de dinero. Mantén un registro limpio para ayudar a proyectar tus ahorros a futuro.</p>
            </div>
            
            <div className="relative overflow-hidden rounded-md border border-zinc-800/60 bg-gradient-to-br from-zinc-900/50 to-black p-5 transition-colors hover:border-[#E8FF47]/30">
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#E8FF47]/5 opacity-50 blur-xl"></div>
              <div className="mb-4 flex items-center justify-between">
                <span className="flex items-center gap-1.5 rounded-sm bg-[#E8FF47]/10 px-2.5 py-1 text-[10px] font-bold tracking-widest text-[#E8FF47] shadow-[0_0_10px_rgba(232,255,71,0.1)]">
                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                  AI ADVISOR
                </span>
              </div>
              <h4 className="mb-2 font-['Bebas_Neue'] text-2xl text-[#FAFAF9] tracking-wider leading-none">INTELIGENCIA ARTIFICIAL</h4>
              <p className="mb-6 text-[11px] text-[#A1A1AA] leading-relaxed">Desbloquea simulaciones tácticas y recomendaciones automáticas de ahorro basadas en tu patrimonio real.</p>
              <button onClick={() => window.location.href = "/pricing"} className="group relative flex w-full items-center justify-between overflow-hidden rounded-sm bg-zinc-800/50 px-4 py-2.5 border border-zinc-700/50 transition-all hover:bg-[#E8FF47]/10 hover:border-[#E8FF47]/40 text-[#FAFAF9] hover:text-[#E8FF47]">
                <span className="relative z-10 text-[10px] font-bold tracking-[0.15em]">EXPLORAR PLAN PRO</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
