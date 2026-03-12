import React, { useRef, useMemo, useEffect } from "react";
import { fmt, groupByMonth, groupByCategory, loadChart } from "../../../lib/utils";
import { EmptyState } from "./ui/EmptyState";

const DONUT_COLORS = ["#E8FF47", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B", "#64748B", "#A1A1AA"];

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
    { label: "PATRIMONIO TOTAL", unit: "EUR", value: loading ? "——" : `€ ${fmt(analytics?.patrimonio_neto || 0, 0)}`, bright: !loading, extra: <div style={{ marginTop: 10, height: 16, borderBottom: "1px solid", borderImage: "linear-gradient(to right, rgba(255,255,255,0.2), transparent) 1" }} /> },
    { label: "BALANCE MENSUAL", unit: "EUR", value: loading ? "——" : `${(analytics?.flujo_caja_neto || 0) >= 0 ? "+" : "−"}€ ${fmt(analytics?.flujo_caja_neto || 0, 0)}`, bright: !loading, sub: (analytics?.flujo_caja_neto || 0) >= 0 ? "POSITIVO" : "NEGATIVO", subPos: (analytics?.flujo_caja_neto || 0) >= 0 },
    { label: "INGRESOS TOTALES", unit: "EUR", value: loading ? "——" : `€ ${fmt(analytics?.total_ingresos || 0, 0)}`, bright: !loading, extra: <div style={{ marginTop: 10, height: 16 }} /> },
    { label: "TASA DE AHORRO", unit: "%", value: loading ? "——" : `${savingsRate >= 0 ? "+" : "−"}${fmt(Math.abs(savingsRate), 1)}%`, bright: !loading, sub: savingsRate >= 20 ? "EXCELENTE" : savingsRate >= 0 ? "PUEDE MEJORAR" : "CRÍTICO (DEUDA)", subPos: savingsRate >= 20,
      extra: <div style={{ marginTop: 14, height: 2, background: "#1C1C1F", overflow: "hidden", borderRadius: 1 }}><div style={{ height: "100%", background: savingsRate >= 0 ? "rgba(255,255,255,0.35)" : "rgba(239, 68, 68, 0.4)", width: `${Math.min(Math.max(savingsRate, 0), 100)}%`, transition: "width 1.2s cubic-bezier(0.16,1,0.3,1)", borderRadius: 1 }} /></div> },
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
            {flows.length > 0 && flows.some((f: number) => f !== 0) ? (
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${labels.length}, 1fr)`, gap: 5 }}>
                {flows.map((f: number, i: number) => {
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
            <button 
              onClick={openAccountDrawer}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.05)", color: "white", fontWeight: 700, letterSpacing: "0.07em", fontSize: 9, padding: "6px 10px", border: "1px solid #27272A", cursor: "pointer", borderRadius: 1, float: "right", marginTop: "-30px" }}
            >+ ACCOUNT</button>
            {analytics?._cuentas && analytics._cuentas.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {analytics._cuentas.map((c: any, i: number) => (
                  <div key={c.id_cuenta} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: ["#FAFAFA","#71717A","#3F3F46","#27272A"][i % 4], flexShrink: 0 }} />
                      <span className="lbl">{c.nombre}</span>
                    </div>
                    <span className="mono" style={{ fontSize: 10, color: c.balance < 0 ? "rgba(248,113,113,0.8)" : "#71717A" }}>{c.balance < 0 ? "-" : ""}€{fmt(c.balance, 0)}</span>
                  </div>
                ))}
              </div>
            ) : <div className="lbl" style={{ color: "#3F3F46" }}>Crea tu primera cuenta</div>}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 28px", borderBottom: "1px solid #1C1C1F" }}>
              <span className="lbl">MOVIMIENTOS RECIENTES</span>
            </div>
            {transactions.length === 0 ? <EmptyState title="Sin transacciones" desc="Añade tu primera entrada con el botón + NUEVO REGISTRO" /> :
              transactions.slice(0, 6).map((tx: any) => {
                const pos = tx.tipo === "ingreso";
                return (
                  <div key={tx.id_transaccion} className="row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 28px", borderBottom: "1px solid rgba(28,28,31,0.8)" }}>
                    <div style={{ flex: 1, minWidth: 0, paddingRight: 14 }}>
                      <div style={{ fontSize: 12, fontWeight: 500, color: "#E4E4E7", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 4 }}>{tx.nombre}</div>
                      <div className="lbl">{tx.fecha ? new Date(tx.fecha).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "2-digit" }).toUpperCase() : ""}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div className="mono" style={{ fontSize: 12, color: pos ? "#10B981" : "#A1A1AA" }}>{pos ? "+" : "−"}€{fmt(Math.abs(tx.cantidad))}</div>
                        {tx.estado === "pendiente" && <span style={{ fontSize: 9, fontWeight: 600, color: "#FBBF24", letterSpacing: "0.06em", display: "block", marginTop: 4 }}>PENDIENTE</span>}
                      </div>
                      <button onClick={() => deleteTransaction && deleteTransaction(tx.id_transaccion)} style={{ background: "transparent", border: "none", color: "#52525B", cursor: "pointer", fontSize: 16 }} title="Eliminar registro">×</button>
                    </div>
                  </div>
                );
              })
            }
          </div>
        </div>
      </div>
      
      <div style={{ display: "flex", borderTop: "1px solid #1C1C1F" }}>
        <div style={{ flex: 1, borderRight: "1px solid #1C1C1F", padding: "32px 36px 36px" }}>
          <span className="lbl" style={{ display: "block", marginBottom: 24 }}>DISTRIBUCIÓN DE GASTOS</span>
          <div style={{ display: "flex", gap: 60, alignItems: "center" }}>
            <div style={{ width: 220, height: 220, flexShrink: 0 }}>
              {catData.length === 0 ? <EmptyState title="Sin gastos" desc="Registra gastos para ver la distribución" /> : <canvas ref={donutRef} />}
            </div>
            {catData.length > 0 && (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
                {catDetails.map((cat: any, i: number) => {
                  const totalExp = catData.reduce((a:number,b:number)=>a+b, 0);
                  const pct = totalExp > 0 ? (cat.total / totalExp) * 100 : 0;
                  return (
                    <div key={cat.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 14, borderBottom: "1px solid #1C1C1F" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                        <span className="lbl">{cat.name}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                        <span className="mono" style={{ fontSize: 10, color: "#71717A", width: 40, textAlign: "right" }}>{fmt(pct, 1)}%</span>
                        <span className="mono" style={{ fontSize: 11, color: "#D4D4D8", width: 70, textAlign: "right" }}>€{fmt(cat.total, 0)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <div style={{ width: 320, padding: "32px 36px" }}>
           <span className="lbl" style={{ display: "block", marginBottom: 14, color: "#71717A" }}>INFORMACIÓN Y CONSEJOS</span>
           <p style={{ fontSize: 11, color: "#71717A", lineHeight: 1.6, marginBottom: 32 }}>Las categorías te permiten entender de forma sencilla en qué áreas se concentra tu mayor salida de dinero. Mantén un registro limpio para ayudar a proyectar tus ahorros a futuro.</p>
           
           {/* Pro Teaser: AI Advisor */}
           <div className="relative overflow-hidden rounded-md border border-zinc-800/60 bg-gradient-to-br from-zinc-900/50 to-black p-5 transition-colors hover:border-[#E8FF47]/30">
             {/* Subtle gradient background effect */}
             <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-[#E8FF47]/5 opacity-50 blur-xl"></div>
             
             <div className="mb-4 flex items-center justify-between">
               <span className="flex items-center gap-1.5 rounded-sm bg-[#E8FF47]/10 px-2.5 py-1 text-[10px] font-bold tracking-widest text-[#E8FF47] shadow-[0_0_10px_rgba(232,255,71,0.1)]">
                 <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                 AI ADVISOR
               </span>
             </div>
             
             <h4 className="mb-2" style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, color: "#FAFAF9", letterSpacing: "0.03em", lineHeight: 1 }}>
               INTELIGENCIA ARTIFICIAL
             </h4>
             
             <p className="mb-6" style={{ fontSize: 11, color: "#A1A1AA", lineHeight: 1.6 }}>
               Desbloquea simulaciones tácticas y recomendaciones automáticas de ahorro basadas en tu patrimonio real.
             </p>
             
             <button 
               onClick={() => window.location.href = "/pricing"} 
               className="group relative flex w-full items-center justify-between overflow-hidden rounded-sm bg-zinc-800/50 px-4 py-2.5 border border-zinc-700/50 transition-all hover:bg-[#E8FF47]/10 hover:border-[#E8FF47]/40 text-[#FAFAF9] hover:text-[#E8FF47]"
             >
               <span className="relative z-10 text-[10px] font-bold tracking-[0.15em]">EXPLORAR PLAN PRO</span>
               <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-1"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
             </button>
           </div>
        </div>
      </div>
    </div>
  );
}
