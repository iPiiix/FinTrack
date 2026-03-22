"use client";

import React, { useState } from "react";

const API = "/api";

export function CreateAccountDrawer({ isOpen, onClose, onSave }: any) {
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState("debito");
  const [balance, setBalance] = useState("0");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!nombre || !tipo) { 
      setError("Completa el nombre y el tipo de cuenta"); 
      return; 
    }
    
    setSaving(true);
    setError("");
    
    try {
      const res = await fetch(`${API}/cuentas/`, {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
          nombre: nombre.trim(), 
          tipo: tipo, 
          balance: balance === "" ? 0 : parseFloat(balance),
          divisa: "EUR"
        }),
      });
      
      if (!res.ok) { 
        const e = await res.json().catch(() => null); 
        throw new Error(e?.detail || "Error al crear la cuenta"); 
      }
      
      onSave(); // Trigger dashboard refresh
      onClose(); // Close the drawer
      setNombre(""); // Reset state
      setTipo("debito");
      setBalance("0");
    } catch (e: any) { 
      setError(e.message); 
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", zIndex: 50 }} onClick={onClose} />
      <div className="drawer" style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 460, background: "#0C0C0E", borderLeft: "1px solid #1C1C1F", zIndex: 50, display: "flex", flexDirection: "column" }}>
        
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "28px 32px", borderBottom: "1px solid #1C1C1F" }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500, color: "white", marginBottom: 4 }}>Nueva Cuenta</div>
            <div style={{ fontSize: 11, color: "#52525B" }}>Registro de activo financiero</div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, border: "1px solid #27272A", color: "#71717A", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, background: "transparent" }}>×</button>
        </div>
        
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <label className="lbl" style={{ display: "block", marginBottom: 8 }}>NOMBRE DE LA CUENTA</label>
            <input 
              value={nombre} 
              onChange={e => setNombre(e.target.value)} 
              placeholder="Ej. Cuenta Santander, Tarjeta N26, Efectivo..." 
              className="inp" 
              maxLength={200}
            />
          </div>

          <div>
            <label className="lbl" style={{ display: "block", marginBottom: 10 }}>TIPO DE CUENTA</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[
                { val: "debito", label: "DÉBITO" }, 
                { val: "credito", label: "CRÉDITO" },
                { val: "ahorros", label: "AHORROS" },
                { val: "inversion", label: "INVERSIÓN" }
              ].map(t => (
                <button 
                  key={t.val} 
                  onClick={() => setTipo(t.val)}
                  style={{ 
                    padding: "12px 0", 
                    border: `1px solid ${tipo === t.val ? "rgba(232,255,71,0.6)" : "#27272A"}`, 
                    fontSize: 10, 
                    fontWeight: 700, 
                    letterSpacing: "0.07em", 
                    cursor: "pointer", 
                    color: tipo === t.val ? "#E8FF47" : "#52525B", 
                    background: tipo === t.val ? "rgba(232, 255, 71, 0.05)" : "transparent" 
                  }}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="lbl" style={{ display: "block", marginBottom: 8 }}>BALANCE INICIAL (EUR) - OPCIONAL</label>
            <input 
              type="number" 
              value={balance} 
              onChange={e => setBalance(e.target.value)} 
              placeholder="0.00" 
              className="inp" 
              step="0.01"
            />
            <span style={{ fontSize: 10, color: "#52525B", marginTop: 6, display: "block" }}>
              ¿Cuánto dinero hay ya en esta cuenta?
            </span>
          </div>
          
          {error && (
            <div style={{ border: "1px solid rgba(248,113,113,0.2)", padding: "10px 14px", background: "rgba(248,113,113,0.05)" }}>
              <span className="mono" style={{ fontSize: 10, color: "#F87171" }}>{error}</span>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 10, padding: "20px 32px", borderTop: "1px solid #1C1C1F" }}>
          <button 
            onClick={onClose} 
            style={{ flex: 1, padding: "12px 0", border: "1px solid #27272A", color: "#71717A", cursor: "pointer", fontSize: 11, fontWeight: 600, letterSpacing: "0.07em", background: "transparent" }}>
            CANCELAR
          </button>
          <button 
            onClick={handleSave} 
            disabled={saving}
            style={{ flex: 2, padding: "12px 0", background: "#E8FF47", color: "black", fontWeight: 700, fontSize: 11, letterSpacing: "0.08em", border: "none", cursor: "pointer", opacity: saving ? 0.5 : 1 }}>
            {saving ? "CREANDO..." : "COMMIT ACCOUNT"}
          </button>
        </div>
      </div>
    </>
  );
}
