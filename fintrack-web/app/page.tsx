"use client";
import React, { useState, useEffect } from "react";

export default function Home() {
  const TOKEN_TEMPORAL = ""; // Reemplaza con tu token real obtenido del backend

  const [analytics, setAnalytics] = useState({
    patrimonio_neto: 0,
    flujo_caja_neto: 0,
    total_ingresos: 0,
    total_gastos: 0,
    tasa_ahorro_pct: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Llamada real al motor backend en FastAPI
    fetch("http://127.0.0.1:8000/analytics/summary", {
      headers: {
        Authorization: `Bearer ${TOKEN_TEMPORAL}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.patrimonio_neto !== undefined) {
          setAnalytics(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error conectando al backend:", err);
        setLoading(false);
      });
  }, []);

  return (
    <main className="min-h-screen bg-black font-sans selection:bg-emerald-500/30">
      {/* Navegación Superior */}
      <nav className="border-b border-white/5 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${loading ? 'bg-yellow-500' : 'bg-emerald-500 animate-pulse'}`}></div>
            <span className="font-semibold tracking-wide text-sm text-white">FinTrack <span className="text-zinc-500 font-normal">Institutional</span></span>
          </div>
          <div className="flex items-center gap-6 text-xs font-medium text-zinc-400">
            <button className="text-white hover:text-emerald-400 transition-colors">Dashboard</button>
            <div className="h-4 w-px bg-zinc-800"></div>
            <button className="hover:text-white transition-colors flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-white border border-zinc-700">S</span>
              Santi Pérez
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-12">
        <header className="mb-10">
          <h1 className="text-3xl font-light text-white tracking-tight">Resumen Financiero</h1>
          <p className="text-sm text-zinc-500 mt-1">Conectado en tiempo real a PostgreSQL.</p>
        </header>

        {/* Grid de Métricas Conectadas a FastAPI */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {/* Card 1: Patrimonio */}
          <div className="glass-card p-6 rounded-xl relative overflow-hidden group hover:border-white/10 transition-all">
            <h3 className="text-zinc-500 text-xs font-medium uppercase tracking-widest mb-4">Patrimonio Neto</h3>
            <p className="text-4xl font-light text-white font-mono tracking-tight">
              {loading ? "..." : analytics.patrimonio_neto.toLocaleString("es-ES", { minimumFractionDigits: 2 })} <span className="text-zinc-500 text-2xl">EUR</span>
            </p>
          </div>

          {/* Card 2: Flujo de Caja */}
          <div className="glass-card p-6 rounded-xl relative overflow-hidden group hover:border-white/10 transition-all">
            <h3 className="text-zinc-500 text-xs font-medium uppercase tracking-widest mb-4">Flujo de Caja Neto</h3>
            <p className="text-4xl font-light text-white font-mono tracking-tight">
              {loading ? "..." : analytics.flujo_caja_neto.toLocaleString("es-ES", { minimumFractionDigits: 2 })} <span className="text-zinc-500 text-2xl">EUR</span>
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs">
              <span className="text-zinc-400">Ingresos: <span className="text-white font-mono">{analytics.total_ingresos.toLocaleString("es-ES")}€</span></span>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-400">Gastos: <span className="text-white font-mono">{analytics.total_gastos.toLocaleString("es-ES")}€</span></span>
            </div>
          </div>

          {/* Card 3: Tasa de Ahorro */}
          <div className="glass-card p-6 rounded-xl relative overflow-hidden group hover:border-white/10 transition-all">
            <h3 className="text-zinc-500 text-xs font-medium uppercase tracking-widest mb-4">Tasa de Ahorro</h3>
            <p className="text-4xl font-light text-white font-mono tracking-tight">
              {loading ? "..." : analytics.tasa_ahorro_pct.toFixed(1)} <span className="text-zinc-500 text-2xl">%</span>
            </p>
            <div className="w-full bg-zinc-900 h-1 mt-5 rounded-full overflow-hidden border border-white/5">
              <div 
                className="bg-emerald-500 h-full transition-all duration-1000 ease-out" 
                style={{ width: `${analytics.tasa_ahorro_pct}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Sección Inferior: Espacio para futuras transacciones reales */}
        <div className="glass-card rounded-xl border border-white/5 overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h2 className="text-sm font-medium text-white tracking-wide">Registro de Operaciones (Pronto en Vivo)</h2>
            <button className="text-xs text-zinc-500 hover:text-white transition-colors">Ver todas →</button>
          </div>
          <div className="p-8 text-center text-sm text-zinc-500">
            Conectaremos esta tabla a /transactions en la siguiente fase.
          </div>
        </div>

      </div>
    </main>
  );
}