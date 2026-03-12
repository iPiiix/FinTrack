"use client";

import React, { useState, useMemo, useRef } from "react";
import { fmt } from "../../../lib/utils";
import { EmptyState } from "./ui/EmptyState";
import { useAuth } from "../../../context/AuthContext";

export function TransactionsView({ transactions, categorias, cuentas, deleteTransaction, refreshData }: any) {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const FILTERS = ["ALL", "ingreso", "gasto", "transferencia"];

  const filtered = useMemo(() => {
    let r = filter === "ALL" ? transactions : transactions.filter((t: any) => t.tipo === filter);
    if (search.trim()) r = r.filter((t: any) => t.nombre.toLowerCase().includes(search.toLowerCase()));
    return r;
  }, [transactions, filter, search]);

  const totals = useMemo(() => ({
    income: filtered.filter((t: any) => t.tipo === "ingreso").reduce((s: number, t: any) => s + Math.abs(t.cantidad), 0),
    expense: filtered.filter((t: any) => t.tipo === "gasto").reduce((s: number, t: any) => s + Math.abs(t.cantidad), 0),
  }), [filtered]);

  const handleCsvImport = () => {
    if (user?.subscription_tier !== "enterprise") {
      alert("✨ La importación de CSV es una función exclusiva del plan Enterprise. \n¡Súbete de nivel hoy para desbloquear el máximo poder de FinTrack!");
      return;
    }
    if (cuentas.length === 0) {
      alert("Debes crear al menos una cuenta donde importar las transacciones.");
      return;
    }
    fileInputRef.current?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      alert("El archivo debe tener extensión .csv");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    // Para simplificar, insertamos en la primera cuenta que tenga el usuario.
    formData.append("id_cuenta", cuentas[0].id_cuenta.toString());

    const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    const token = typeof window !== "undefined" ? localStorage.getItem("fintrack_token") : "";

    try {
      const res = await fetch(`${API}/transacciones/csv`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.detail || "Error en la importación");
      
      alert(`✅ Éxito: ${data.message}`);
      if (refreshData) refreshData();
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`);
    } finally {
      setIsUploading(false);
      // reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const COL = "100px 3fr 1.5fr 1.1fr 130px 100px 40px";
  return (
    <div className="vu" style={{ padding: "44px 48px" }}>
      <input type="file" ref={fileInputRef} onChange={onFileChange} style={{ display: 'none' }} accept=".csv" />
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 32 }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 300, color: "#F4F4F5", letterSpacing: "-0.02em", marginBottom: 8 }}>Historial de Transacciones</h2>
          <span className="lbl">{filtered.length} ENTRADAS ENCONTRADAS</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <button 
            onClick={handleCsvImport}
            disabled={isUploading}
            style={{ 
              display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.05)", 
              color: user?.subscription_tier === "enterprise" ? "#E8FF47" : "white", 
              fontWeight: 700, letterSpacing: "0.07em", fontSize: 9, padding: "8px 12px", 
              border: user?.subscription_tier === "enterprise" ? "1px solid rgba(232, 255, 71, 0.4)" : "1px solid #27272A", 
              cursor: isUploading ? "wait" : "pointer", borderRadius: 1 
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
            {isUploading ? "IMPORTANDO..." : "IMPORTAR CSV"}
          </button>
          
          <div style={{ width: 1, height: 16, background: "#1C1C1F", margin: "0 10px" }} />
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
          {["FECHA", "DESCRIPCIÓN", "CATEGORÍA", "CUENTA", "IMPORTE (EUR)", "ESTADO", ""].map((h, i) => (
            <span key={i} className="lbl" style={{ textAlign: i >= 4 && i < 6 ? "right" : "left" }}>{h}</span>
          ))}
        </div>
        <div style={{ maxHeight: "calc(100vh - 310px)", overflowY: "auto", minHeight: 200 }}>
          {filtered.length === 0 ? <div style={{ padding: "64px 0", textAlign: "center" }} className="lbl">Sin resultados. Añade tu primera entrada arriba o importa un CSV.</div> :
            filtered.map((tx: any) => {
              const pos = tx.tipo === "ingreso";
              const cat = categorias?.find((c: any) => c.id_categoria === tx.id_categoria);
              const cuenta = cuentas?.find((c: any) => c.id_cuenta === tx.id_cuenta);
              return (
                <div key={tx.id_transaccion} className="row" style={{ display: "grid", padding: "16px 24px", borderBottom: "1px solid rgba(28,28,31,0.6)", alignItems: "center", gridTemplateColumns: COL }}>
                  <span className="mono" style={{ fontSize: 10, color: "#52525B" }}>{tx.fecha ? new Date(tx.fecha).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "2-digit" }).toUpperCase() : "—"}</span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "#E4E4E7" }}>{tx.nombre}</span>
                  <span style={{ fontSize: 11, color: cat ? "#A1A1AA" : "#3F3F46" }}>{cat ? cat.nombre : "—"}</span>
                  <span style={{ fontSize: 10, color: "#52525B" }}>{cuenta ? cuenta.nombre : `Cuenta #${tx.id_cuenta}`}</span>
                  <span className="mono" style={{ fontSize: 12, fontWeight: 500, textAlign: "right", color: pos ? "#10B981" : "#D4D4D8" }}>{pos ? "+" : "−"}€{fmt(Math.abs(tx.cantidad))}</span>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: "0.07em", padding: "4px 8px", border: "1px solid", borderColor: tx.estado === "completada" ? "#1C1C1F" : "rgba(251,191,36,0.3)", color: tx.estado === "completada" ? "#3F3F46" : "#FBBF24", background: tx.estado === "pendiente" ? "rgba(251,191,36,0.04)" : "transparent", textTransform: "uppercase" }}>{tx.estado === "pendiente" ? "PENDIENTE" : tx.estado}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
                    <button onClick={() => deleteTransaction && deleteTransaction(tx.id_transaccion)} style={{ background: "transparent", border: "none", color: "#52525B", cursor: "pointer", fontSize: 16 }} title="Eliminar registro">×</button>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
