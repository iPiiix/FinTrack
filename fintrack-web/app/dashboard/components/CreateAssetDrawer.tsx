import React, { useState } from "react";
import { DashboardStyles } from "./ui/DashboardStyles";

interface CreateAssetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
}

export function CreateAssetDrawer({ isOpen, onClose, onSave }: CreateAssetDrawerProps) {
  const [ticker, setTicker] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [precioCompra, setPrecioCompra] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API = "/api";

  if (!isOpen) return null;

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!ticker || !cantidad || !precioCompra) { setError("Todos los campos son obligatorios"); return; }
    
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API}/portfolio/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          ticker: ticker.toUpperCase(),
          cantidad: parseFloat(cantidad),
          precio_compra: parseFloat(precioCompra)
        })
      });
      if (!res.ok) throw new Error("Error al registrar activo");
      
      setTicker(""); setCantidad(""); setPrecioCompra("");
      onSave();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", zIndex: 50 }} onClick={onClose} />
      <div className="drawer" style={{ position: "fixed", top: 0, right: 0, bottom: 0, width: 460, background: "#0C0C0E", borderLeft: "1px solid #1C1C1F", zIndex: 50, display: "flex", flexDirection: "column" }}>
        
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "28px 32px", borderBottom: "1px solid #1C1C1F" }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500, color: "white", marginBottom: 4 }}>Nuevo Activo</div>
            <div style={{ fontSize: 11, color: "#52525B" }}>Registro en portfolio WealthTech</div>
          </div>
          <button onClick={onClose} style={{ width: 30, height: 30, border: "1px solid #27272A", color: "#71717A", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, background: "transparent" }}>×</button>
        </div>
        
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px", display: "flex", flexDirection: "column", gap: 24 }}>
          <div>
            <label className="lbl" style={{ display: "block", marginBottom: 8 }}>TICKER / SÍMBOLO</label>
            <input 
              type="text" 
              value={ticker} 
              onChange={e => setTicker(e.target.value)} 
              placeholder="Ej. AAPL, BTC-USD, MSFT" 
              className="inp" 
            />
          </div>
          
          <div>
            <label className="lbl" style={{ display: "block", marginBottom: 8 }}>CANTIDAD COMPRADA</label>
            <input 
              type="number" 
              step="0.000001" 
              min="0" 
              value={cantidad} 
              onChange={e => setCantidad(e.target.value)} 
              placeholder="0.00" 
              className="inp" 
            />
          </div>

          <div>
            <label className="lbl" style={{ display: "block", marginBottom: 8 }}>PRECIO DE COMPRA (UNITARIO)</label>
            <input 
              type="number" 
              step="0.01" 
              min="0" 
              value={precioCompra} 
              onChange={e => setPrecioCompra(e.target.value)} 
              placeholder="0.00" 
              className="inp" 
            />
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
            onClick={() => handleSubmit()} 
            disabled={loading}
            style={{ flex: 2, padding: "12px 0", background: "#E8FF47", color: "black", fontWeight: 700, fontSize: 11, letterSpacing: "0.08em", border: "none", cursor: "pointer", opacity: loading ? 0.5 : 1 }}>
            {loading ? "PROCESANDO..." : "COMMIT ASSET"}
          </button>
        </div>
      </div>
    </>
  );
}
