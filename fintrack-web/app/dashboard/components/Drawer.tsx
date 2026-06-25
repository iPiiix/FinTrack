"use client";

import React, { useState } from "react";
import { X } from "lucide-react";

export function Drawer({ isOpen, onClose, onSave, cuentas, categorias }: any) {
  const [type, setType] = useState("ingreso");
  const [cantidad, setCantidad] = useState("");
  const [nombre, setNombre] = useState("");
  const [idCuenta, setIdCuenta] = useState("");
  const [idCategoria, setIdCategoria] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const API = "/api";

  const handleSave = async () => {
    const val = parseFloat(cantidad);
    if (!cantidad || isNaN(val) || val === 0 || !nombre || !idCuenta) { 
      setError("Importe válido (>0), descripción y cuenta obligatorios."); 
      return; 
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${API}/transactions/`, {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ 
            cantidad: val, 
            tipo: type, 
            nombre, 
            id_cuenta: parseInt(idCuenta), 
            id_categoria: idCategoria ? parseInt(idCategoria) : null, 
            estado: "completada" 
        }),
      });
      if (!res.ok) { 
          const e = await res.json().catch(() => ({})); 
          throw new Error(e?.detail || "Error al registrar transacción"); 
      }
      
      setType("ingreso");
      setCantidad("");
      setNombre("");
      setIdCuenta("");
      setIdCategoria("");
      onSave();
      onClose();
    } catch (e: any) { setError(e.message); }
    setSaving(false);
  };

  const handleClose = () => {
    setError("");
    setType("ingreso");
    setCantidad("");
    setNombre("");
    setIdCuenta("");
    setIdCategoria("");
    onClose();
  };

  const fmtBalance = (n: number) => Math.abs(n).toLocaleString("es-ES", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 transition-opacity" 
        onClick={handleClose} 
      />
      
      {/* Sidebar / Drawer */}
      <div 
        className="fixed top-0 right-0 bottom-0 w-full sm:w-[460px] bg-[#0C0C0E] border-l border-[#1C1C1F] z-[51] flex flex-col shadow-2xl transition-transform duration-300 transform translate-x-0"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 md:p-8 border-b border-[#1C1C1F]">
          <div>
            <div className="text-lg font-medium text-white mb-1">Nueva Transacción</div>
            <div className="text-[11px] text-[#52525B] uppercase tracking-wider">REGISTRO EN EL LIBRO MAYOR</div>
          </div>
          <button 
            onClick={handleClose} 
            className="w-9 h-9 border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-600 transition-colors flex items-center justify-center rounded-sm bg-transparent"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 flex flex-col gap-7">
          {/* Type Selector */}
          <div>
            <label className="lbl block mb-3 text-zinc-500">TIPO DE OPERACIÓN</label>
            <div className="grid grid-cols-2 gap-2.5">
              {[
                { val: "ingreso", label: "↓ INGRESO", color: "text-[#10B981]", activeBorder: "border-[#10B981]/50", activeBg: "bg-[#10B981]/5" }, 
                { val: "gasto", label: "↑ GASTO", color: "text-[#F87171]", activeBorder: "border-[#F87171]/50", activeBg: "bg-[#F87171]/5" }
              ].map(t => (
                <button 
                    key={t.val} 
                    onClick={() => setType(t.val)}
                    className={`py-3.5 border text-[10px] font-bold tracking-[0.1em] transition-all rounded-sm ${type === t.val ? `${t.color} ${t.activeBorder} ${t.activeBg}` : "border-zinc-800 text-zinc-600 hover:border-zinc-700 bg-transparent"}`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="lbl block mb-2 text-zinc-500">IMPORTE (EUR)</label>
            <input 
                type="number" 
                value={cantidad} 
                onChange={e => setCantidad(e.target.value)} 
                onFocus={e => e.target.select()} 
                placeholder="0.00" 
                className="inp w-full" 
            />
          </div>

          {/* Description */}
          <div>
            <label className="lbl block mb-2 text-zinc-500">DESCRIPCIÓN</label>
            <input 
                value={nombre} 
                onChange={e => setNombre(e.target.value)} 
                placeholder="Ej. Nómina, Alquiler, Restaurante…" 
                className="inp w-full" 
            />
          </div>

          {/* Account */}
          <div>
            <label className="lbl block mb-2 text-zinc-500">CUENTA DE ORIGEN/DESTINO</label>
            <select 
                value={idCuenta} 
                onChange={e => setIdCuenta(e.target.value)} 
                className="inp w-full"
            >
              <option value="">Seleccionar cuenta…</option>
              {cuentas.map((c: any) => (
                <option key={c.id_cuenta} value={c.id_cuenta}>
                  {c.nombre} (€{fmtBalance(c.balance)})
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div>
            <label className="lbl block mb-2 text-zinc-500">CATEGORÍA (OPCIONAL)</label>
            <select 
                value={idCategoria} 
                onChange={e => setIdCategoria(e.target.value)} 
                className="inp w-full"
            >
              <option value="">Sin categoría</option>
              {categorias.map((c: any) => (
                <option key={c.id_categoria} value={c.id_categoria}>{c.nombre}</option>
              ))}
            </select>
          </div>

          {error && (
            <div className="border border-red-500/20 bg-red-500/5 p-4 rounded-sm">
                <span className="mono text-[11px] text-red-400">{error}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 p-6 md:p-8 border-t border-[#1C1C1F] bg-[#09090B]">
          <button 
            onClick={handleClose} 
            className="flex-1 py-4 border border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-700 transition-all text-[11px] font-bold tracking-[0.1em] bg-transparent rounded-sm"
          >
            CANCELAR
          </button>
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="flex-[2] py-4 bg-white text-black font-bold text-[11px] tracking-[0.15em] transition-all hover:bg-zinc-200 active:scale-[0.98] disabled:opacity-50 rounded-sm"
          >
            {saving ? "GUARDANDO…" : "REGISTRAR"}
          </button>
        </div>
      </div>
    </>
  );
}
