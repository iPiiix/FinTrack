"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

import { DashboardStyles } from "./components/ui/DashboardStyles";
import { TopBar } from "./components/TopBar";
import { Drawer } from "./components/Drawer";

import { OverviewView } from "./components/OverviewView";
import { TransactionsView } from "./components/TransactionsView";
import { PortfolioView } from "./components/PortfolioView";
import { SettingsView } from "./components/SettingsView";
import { AIInsightsView } from "./components/AIInsightsView";
import { CreateAccountDrawer } from "./components/CreateAccountDrawer";
import { CreateAssetDrawer } from "./components/CreateAssetDrawer";

export default function DashboardPage() {
  const router = useRouter();
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("OVERVIEW");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountDrawerOpen, setAccountDrawerOpen] = useState(false);
  const [assetDrawerOpen, setAssetDrawerOpen] = useState(false);
  const [toasts, setToasts] = useState<any[]>([]);
  
  const [analytics, setAnalytics] = useState({ patrimonio_neto: 0, flujo_caja_neto: 0, total_ingresos: 0, total_gastos: 0, tasa_ahorro_pct: 0, _cuentas: [] });
  const [transactions, setTransactions] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [activos, setActivos] = useState([]);

  const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

  function getToken() { return typeof window !== "undefined" ? localStorage.getItem("fintrack_token") : null; }
  function authHeaders() { return { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" }; }

  async function apiFetch(path: string) {
    const res = await fetch(`${API}${path}`, { headers: authHeaders() });
    if (res.status === 401) { localStorage.removeItem("fintrack_token"); window.location.href = "/auth"; return null; }
    if (!res.ok) throw new Error(`API error ${res.status}`);
    return res.json();
  }

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
      const [analyticsData, txData, cuentasData, catData, activosData] = await Promise.all([
        apiFetch("/analytics/summary"),
        apiFetch("/transactions/"),
        apiFetch("/cuentas/"),
        apiFetch("/categorias/"),
        apiFetch("/portfolio/")
      ]);
      if (analyticsData) setAnalytics({ ...analyticsData, _cuentas: cuentasData || [] });
      if (transactions) setTransactions(txData);
      if (cuentasData) setCuentas(cuentasData);
      if (catData) setCategorias(catData);
      if (activosData) setActivos(activosData);
    } catch { /* handled in apiFetch */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const addToast = useCallback((msg: string, type = "info") => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), 4000);
  }, []);

  const handleSave = () => { fetchAll(); addToast("Transacción registrada correctamente", "success"); };
  const handleAccountSave = () => { fetchAll(); addToast("Cuenta creada correctamente", "success"); };
  const handleAssetSave = () => { fetchAll(); addToast("Activo registrado en el portfolio", "success"); };

  const deleteAsset = async (id: number) => {
    if (!confirm("¿Deseas vender/eliminar este activo?")) return;
    try {
      const res = await fetch(`${API}/portfolio/${id}`, { method: "DELETE", headers: authHeaders() });
      if (!res.ok) throw new Error("API error");
      addToast("Activo vendido", "success");
      fetchAll();
    } catch { addToast("Error al eliminar activo", "error"); }
  };

  const deleteTransaction = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este registro?")) return;
    try {
      const res = await fetch(`${API}/transacciones/${id}`, { method: "DELETE", headers: authHeaders() });
      if (!res.ok) throw new Error("API error");
      addToast("Registro eliminado", "success");
      fetchAll();
    } catch { addToast("Error al eliminar registro", "error"); }
  };

  const views: Record<string, React.ReactNode> = {
    OVERVIEW: <OverviewView analytics={analytics} loading={loading} transactions={transactions} categorias={categorias} openAccountDrawer={() => setAccountDrawerOpen(true)} deleteTransaction={deleteTransaction} />,
    TRANSACTIONS: <TransactionsView transactions={transactions} categorias={categorias} cuentas={cuentas} deleteTransaction={deleteTransaction} />,
    PORTFOLIO: <PortfolioView activos={activos} deleteAsset={deleteAsset} openAssetDrawer={() => setAssetDrawerOpen(true)} />,
    "AI ADVISOR": <AIInsightsView />,
    SETTINGS: <SettingsView />,
  };

  return (
    <>
      <DashboardStyles />
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#09090B" }}>
        <TopBar time={time} tab={tab} setTab={setTab} loading={loading} openDrawer={() => setDrawerOpen(true)} />
        <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>{views[tab]}</main>
        <footer style={{ borderTop: "1px solid #1C1C1F", padding: "14px 32px", display: "flex", justifyContent: "space-between", background: "#0C0C0E" }}>
          <span className="lbl">FINTRACK CORE SYSTEM v2.1 · ALL SYSTEMS NOMINAL</span>
          <span className="mono" style={{ fontSize: 10, color: "#3F3F46" }}>SECURE · AES-256-GCM · TLS 1.3</span>
        </footer>
      </div>
      <Drawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} onSave={handleSave} cuentas={cuentas} categorias={categorias} />
      <CreateAccountDrawer isOpen={accountDrawerOpen} onClose={() => setAccountDrawerOpen(false)} onSave={handleAccountSave} />
      <CreateAssetDrawer isOpen={assetDrawerOpen} onClose={() => setAssetDrawerOpen(false)} onSave={handleAssetSave} />
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