"use client";

import React, { useState } from "react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

function getToken() { 
  return typeof window !== "undefined" ? localStorage.getItem("fintrack_token") : null; 
}
function authHeaders() { 
  return { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" }; 
}

const fmt = (n: number, d = 2) => Math.abs(n).toLocaleString("es-ES", { minimumFractionDigits: d, maximumFractionDigits: d });

export function Drawer({ isOpen, onClose, onSave, cuentas, categorias }: any) {
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
    } catch (e: any) { setError(e.message); }
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
              {cuentas.map((c: any) => <option key={c.id_cuenta} value={c.id_cuenta}>{c.nombre} (€{fmt(c.balance, 0)})</option>)}
            </select>
          </div>
          <div>
            <label className="lbl" style={{ display: "block", marginBottom: 8 }}>CATEGORÍA (OPCIONAL)</label>
            <select value={idCategoria} onChange={e => setIdCategoria(e.target.value)} className="inp">
              <option value="">Sin categoría</option>
              {categorias.map((c: any) => <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>)}
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
