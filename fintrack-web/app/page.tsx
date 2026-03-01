"use client";
import React, { useState, useEffect, useRef } from "react";
import Chart from 'chart.js/auto';

export default function Home() {
  const TOKEN_TEMPORAL = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyIiwiZXhwIjoxNzcyNDA1OTMyfQ.3oIpWrxfwakI7cXj23gU05wf0iitoY5n10OS77lhCwY"; // 🔴 TU TOKEN

  // Estados
  const [time, setTime] = useState("--:--:--");
  const [analytics, setAnalytics] = useState({ patrimonio_neto: 0, flujo_caja_neto: 0, total_ingresos: 0, total_gastos: 0, tasa_ahorro_pct: 0 });
  const [loading, setLoading] = useState(true);

  // Referencias para los gráficos
  const lineChartRef = useRef(null);
  const donutChartRef = useRef(null);

  // Reloj
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString('es-ES', { hour12: false })), 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch a FastAPI
  useEffect(() => {
    fetch("http://127.0.0.1:8000/analytics/summary", {
      headers: { Authorization: `Bearer ${TOKEN_TEMPORAL}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.patrimonio_neto !== undefined) setAnalytics(data);
        setLoading(false);
      })
      .catch(err => console.error("Error API:", err));
  }, []);

  // Gráficos (Data de Placeholder)
  useEffect(() => {
    if (!lineChartRef.current || !donutChartRef.current) return;

    Chart.defaults.color = '#5a5a72';
    Chart.defaults.font.family = "'DM Mono', monospace";
    
    // Line Chart
    const lineChart = new Chart(lineChartRef.current, {
      type: 'line',
      data: {
        labels: ['Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic','Ene','Feb','Mar'],
        datasets: [
          { label: 'Ingresos', data: [2100,2300,2150,2800,2600,3000,2900,3100,2800,3200,3100,3200], borderColor: '#00D4AA', tension: 0.4 },
          { label: 'Gastos', data: [1800,2100,1900,2100,2200,2000,2100,2300,2000,1900,1916,1850], borderColor: '#FF3B5C', tension: 0.4 }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { display: false }, y: { display: false } } }
    });

    // Donut Chart
    const donutChart = new Chart(donutChartRef.current, {
      type: 'doughnut',
      data: {
        labels: ['Vivienda', 'Alimentación', 'Transporte', 'Ocio', 'Otros'],
        datasets: [{ data: [38, 22, 15, 14, 11], backgroundColor: ['#00D4AA', '#F0B429', '#3B82F6', '#8B5CF6', '#3a3a50'], borderWidth: 0 }]
      },
      options: { responsive: true, maintainAspectRatio: false, cutout: '75%', plugins: { legend: { display: false } } }
    });

    return () => { lineChart.destroy(); donutChart.destroy(); };
  }, []);

  // Datos Dummy Transacciones
  const txs = [
    { name: 'Supermercado Mercadona', cat: 'Alimentación', color: '#F0B429', acc: 'Débito ES', amt: -124.50 },
    { name: 'Nómina JP Morgan', cat: 'Nómina', color: '#00D4AA', acc: 'Principal', amt: 5000.00 },
  ];

  return (
    <>
      {/* Ticker Bar */}
      <div className="ticker-bar">
        <div className="ticker-inner">
          <div className="ticker-item"><span style={{color:'var(--muted)'}}>EURIBOR</span><span style={{color:'var(--green)'}}>3.847%</span></div>
          <div className="ticker-item"><span style={{color:'var(--muted)'}}>IBEX 35</span><span style={{color:'var(--green)'}}>11.234</span></div>
          <div className="ticker-item"><span style={{color:'var(--muted)'}}>BTC/EUR</span><span style={{color:'var(--green)'}}>84.210</span></div>
          <div className="ticker-item"><span style={{color:'var(--muted)'}}>EURIBOR</span><span style={{color:'var(--green)'}}>3.847%</span></div>
          <div className="ticker-item"><span style={{color:'var(--muted)'}}>IBEX 35</span><span style={{color:'var(--green)'}}>11.234</span></div>
          <div className="ticker-item"><span style={{color:'var(--muted)'}}>BTC/EUR</span><span style={{color:'var(--green)'}}>84.210</span></div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b" style={{ background: 'rgba(3,3,5,0.85)', backdropFilter: 'blur(24px)', borderColor: 'var(--border)' }}>
        <div style={{ padding: '0 24px', height: '65px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className={loading ? "w-2 h-2 rounded-full bg-yellow-500" : "status-dot"}></div>
              <span className="font-syne" style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '0.05em' }}>FIN<span style={{ color: 'var(--green)' }}>TRACK</span></span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ fontSize: '11px', color: 'var(--muted)', fontFamily: "'DM Mono', monospace" }}>{time} | MADRID</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '6px 12px', border: '1px solid var(--border)', borderRadius: '8px' }}>
              <span style={{ fontSize: '12px' }}>Santi Pérez</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar (Simplificado para React) */}
      <div className="fixed left-0 top-[97px] w-[220px] h-screen border-r border-white/10 p-6 hidden md:block" style={{ background: 'rgba(3,3,5,0.9)', backdropFilter: 'blur(20px)' }}>
        <div className="text-[9px] tracking-widest text-[#3a3a50] uppercase font-mono mb-4">Navegación</div>
        <div className="flex items-center gap-3 text-[#00D4AA] text-[13px] mb-4 bg-[#00D4AA]/10 p-2 rounded border-l-2 border-[#00D4AA]">Dashboard</div>
        <div className="flex items-center gap-3 text-[#5a5a72] text-[13px] mb-4 p-2 hover:text-white transition">Transacciones</div>
        <div className="flex items-center gap-3 text-[#5a5a72] text-[13px] mb-4 p-2 hover:text-white transition">Analytics</div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="fade-in d1" style={{ marginBottom: '32px' }}>
          <div style={{ fontSize: '11px', letterSpacing: '0.12em', color: 'var(--muted)', fontFamily: "'DM Mono', monospace" }}>Panel de Control</div>
          <h1 className="font-syne" style={{ fontSize: '28px', fontWeight: 700, marginTop: '4px' }}>Resumen Financiero</h1>
        </div>

        {/* KPIs (CONECTADOS A FASTAPI) */}
        <div className="fade-in d2" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          
          {/* Patrimonio Neto */}
          <div className="glow-card" style={{ padding: '24px' }}>
            <div style={{ fontSize: '9px', color: 'var(--muted)', fontFamily: "'DM Mono', monospace", marginBottom: '20px' }}>PATRIMONIO NETO</div>
            <div className="metric-value" style={{ fontSize: '32px', marginBottom: '12px' }}>
              {loading ? "..." : `€${analytics.patrimonio_neto.toLocaleString('es-ES')}`}
            </div>
            <span className="badge-up">REAL TIME DB</span>
          </div>

          {/* Flujo de Caja */}
          <div className="glow-card" style={{ padding: '24px' }}>
            <div style={{ fontSize: '9px', color: 'var(--muted)', fontFamily: "'DM Mono', monospace", marginBottom: '20px' }}>FLUJO DE CAJA NETO</div>
            <div className="metric-value" style={{ fontSize: '32px', color: 'var(--green)', marginBottom: '12px' }}>
              {loading ? "..." : `€${analytics.flujo_caja_neto.toLocaleString('es-ES')}`}
            </div>
            <div style={{ display: 'flex', gap: '12px', fontSize: '10px', color: 'var(--muted)', fontFamily: "'DM Mono', monospace" }}>
              <span><span style={{ color: 'var(--green)' }}>▲</span> €{analytics.total_ingresos}</span>
              <span><span style={{ color: 'var(--red)' }}>▼</span> €{analytics.total_gastos}</span>
            </div>
          </div>

          {/* Tasa de Ahorro */}
          <div className="glow-card" style={{ padding: '24px' }}>
            <div style={{ fontSize: '9px', color: 'var(--muted)', fontFamily: "'DM Mono', monospace", marginBottom: '20px' }}>TASA DE AHORRO</div>
            <div className="metric-value" style={{ fontSize: '32px', color: 'var(--gold)', marginBottom: '12px' }}>
              {loading ? "..." : `${analytics.tasa_ahorro_pct.toFixed(1)}%`}
            </div>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${analytics.tasa_ahorro_pct}%`, background: 'var(--gold)' }}></div></div>
          </div>

        </div>

        {/* Gráficos y Tabla */}
        <div className="fade-in d3" style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px', marginBottom: '24px' }}>
          <div className="glow-card" style={{ padding: '24px' }}>
            <h3 className="font-syne" style={{ fontSize: '14px', fontWeight: 600 }}>Evolución Patrimonial (Demo)</h3>
            <div style={{ height: '220px', marginTop: '16px' }}><canvas ref={lineChartRef}></canvas></div>
          </div>
          <div className="glow-card" style={{ padding: '24px' }}>
            <h3 className="font-syne" style={{ fontSize: '14px', fontWeight: 600 }}>Exposición (Demo)</h3>
            <div style={{ height: '160px', marginTop: '16px' }}><canvas ref={donutChartRef}></canvas></div>
          </div>
        </div>

        {/* Tabla Operaciones Placeholder */}
        <div className="fade-in d4 glow-card" style={{ padding: '24px' }}>
          <h3 className="font-syne" style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px' }}>Registro de Operaciones (Pronto conectada)</h3>
          <table className="data-table">
            <thead><tr><th>Concepto</th><th>Categoría</th><th style={{ textAlign: 'right' }}>Importe</th></tr></thead>
            <tbody>
              {txs.map((tx, i) => (
                <tr key={i}>
                  <td style={{ fontSize: '13px' }}>{tx.name}</td>
                  <td><span className="cat-dot" style={{ background: tx.color }}></span><span style={{fontSize:'11px', fontFamily:"'DM Mono', monospace", color:'var(--muted)'}}>{tx.cat}</span></td>
                  <td style={{ textAlign: 'right', fontFamily: "'DM Mono', monospace", color: tx.amt > 0 ? 'var(--green)' : 'var(--red)' }}>
                    {tx.amt > 0 ? '+' : ''}{tx.amt.toLocaleString('es-ES')} €
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </>
  );
}