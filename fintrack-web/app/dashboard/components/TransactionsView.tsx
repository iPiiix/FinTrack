"use client";

import React, { useState, useMemo, useRef } from "react";
import { fmt } from "../../../lib/utils";
import { EmptyState } from "./ui/EmptyState";
import { useAuth } from "../../../context/AuthContext";
import { Search, X, Upload, Filter } from "lucide-react";

export function TransactionsView({ transactions, categorias, cuentas, deleteTransaction, refreshData, addToast }: any) {
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

  const notify = (msg: string, type = "info") => {
    if (addToast) addToast(msg, type);
  };

  const handleCsvImport = () => {
    if (user?.subscription_tier !== "enterprise") {
      notify("La importación CSV es una función exclusiva del plan Enterprise.", "error");
      return;
    }
    if (cuentas.length === 0) {
      notify("Crea al menos una cuenta antes de importar transacciones.", "error");
      return;
    }
    fileInputRef.current?.click();
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      notify("El archivo debe tener extensión .csv", "error");
      return;
    }

    setIsUploading(true);
    const API = "/api";
    const formData = new FormData();
    formData.append("file", file);
    formData.append("id_cuenta", cuentas[0].id_cuenta.toString());

    try {
      const res = await fetch(`${API}/transactions/csv`, {
        method: "POST",
        body: formData,
        credentials: "include"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Error en la importación");
      notify(data.message || "CSV importado correctamente", "success");
      if (refreshData) refreshData();
    } catch (err: any) {
      notify(err.message || "Error al importar el CSV", "error");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="vu flex flex-col gap-6">
      <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" accept=".csv" />
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-[26px] font-light text-[#F4F4F5] tracking-tight mb-2">Historial de Transacciones</h2>
          <span className="lbl">{filtered.length} ENTRADAS ENCONTRADAS</span>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 md:gap-5">
          <button 
            onClick={handleCsvImport}
            disabled={isUploading}
            className={`flex items-center gap-2 bg-white/5 font-bold tracking-[0.07em] text-[9px] px-3 py-2 border rounded-sm transition-all hover:bg-white/10 ${user?.subscription_tier === 'enterprise' ? 'text-[#E8FF47] border-[#E8FF47]/40' : 'text-zinc-400 border-zinc-800'}`}
          >
            <Upload size={12} />
            {isUploading ? "IMPORTANDO..." : "IMPORTAR CSV"}
          </button>
          
          <div className="hidden sm:block w-px h-4 bg-[#1C1C1F] mx-2" />
          
          <div className="flex items-center gap-4">
            <span className="mono text-[11px] text-[#10B981] whitespace-nowrap">INGRESOS +€{fmt(totals.income, 0)}</span>
            <div className="w-px h-4 bg-[#1C1C1F]" />
            <span className="mono text-[11px] text-[#F87171] whitespace-nowrap">GASTOS −€{fmt(totals.expense, 0)}</span>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6">
        <div className="w-full lg:w-96 flex items-center gap-3 bg-[#0D0D0F] border border-[#1C1C1F] px-4 h-10 transition-colors focus-within:border-zinc-700 rounded-sm">
          <Search size={14} className="text-[#3F3F46]" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Buscar por descripción…"
            className="bg-transparent border-none outline-none text-[12px] text-[#E4E4E7] flex-1 font-mono placeholder:text-zinc-800"
          />
          {search && <button onClick={() => setSearch("")} className="text-[#52525B] hover:text-white p-1"><X size={14}/></button>}
        </div>
        
        <div 
          className="flex border border-[#1C1C1F] bg-[#0D0D0F] overflow-hidden rounded-sm no-scrollbar shrink-0"
          style={{ display: "flex", flexDirection: "row", flexShrink: 0 }}
        >
          {(() => {
            const FILTER_LABELS: Record<string, string> = {
              ALL: "TODOS",
              ingreso: "INGRESOS",
              gasto: "GASTOS",
              transferencia: "TRANSFERENCIAS"
            };
            return FILTERS.map((f, i) => (
              <button 
                key={f} 
                onClick={() => setFilter(f)}
                className={`px-4 text-[10px] font-semibold tracking-wider h-10 border-none transition-colors whitespace-nowrap uppercase shrink-0 ${filter === f ? "bg-zinc-800 text-[#F4F4F5]" : "bg-transparent text-[#52525B] hover:text-zinc-400"} ${i < FILTERS.length - 1 ? "border-r border-[#1C1C1F]" : ""}`}
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", height: "40px" }}
              >
                {FILTER_LABELS[f] || f}
              </button>
            ));
          })()}
        </div>
      </div>

      {/* Table - Horizontally scrollable on mobile */}
      <div className="border border-[#1C1C1F] rounded-sm overflow-hidden bg-[#09090B]">
        <div className="overflow-x-auto no-scrollbar">
          <div className="min-w-[800px] md:min-w-0">
            {/* Table Header */}
            <div className="grid grid-cols-[100px_3fr_1.5fr_1.1fr_130px_100px_40px] px-6 py-3 border-b border-[#1C1C1F] bg-white/[0.015]">
              {["FECHA", "DESCRIPCIÓN", "CATEGORÍA", "CUENTA", "IMPORTE (EUR)", "ESTADO", ""].map((h, i) => (
                <span key={i} className={`lbl ${i >= 4 && i < 6 ? "text-right" : "text-left"}`}>{h}</span>
              ))}
            </div>

            {/* Table Body */}
            <div className="max-h-[calc(100vh-360px)] overflow-y-auto min-h-[200px]">
              {filtered.length === 0 ? (
                <div className="py-16 text-center lbl opacity-40">Sin resultados. Añade tu primera entrada arriba o importa un CSV.</div>
              ) : (
                filtered.map((tx: any) => {
                  const pos = tx.tipo === "ingreso";
                  const cat = categorias?.find((c: any) => c.id_categoria === tx.id_categoria);
                  const cuenta = cuentas?.find((c: any) => c.id_cuenta === tx.id_cuenta);
                  return (
                    <div 
                      key={tx.id_transaccion} 
                      className="grid grid-cols-[100px_3fr_1.5fr_1.1fr_130px_100px_40px] px-6 py-4 items-center border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                    >
                      <span className="mono text-[10px] text-[#52525B]">{tx.fecha ? new Date(tx.fecha).toLocaleDateString("es-ES", { day: "2-digit", month: "short" }).toUpperCase() : "—"}</span>
                      <span className="text-[12px] font-medium text-[#E4E4E7] truncate pr-4">{tx.nombre}</span>
                      <span className="text-[11px] text-zinc-500 truncate">{cat ? cat.nombre : "—"}</span>
                      <span className="text-[10px] text-zinc-600 truncate">{cuenta ? cuenta.nombre : `Cuenta #${tx.id_cuenta}`}</span>
                      <span className={`mono text-[12px] font-medium text-right ${pos ? "text-[#10B981]" : "text-zinc-300"}`}>
                        {pos ? "+" : "−"}€{fmt(Math.abs(tx.cantidad))}
                      </span>
                      <div className="flex justify-end pr-2">
                        <span className={`text-[9px] font-bold tracking-widest px-2 py-0.5 border rounded-xs uppercase ${tx.estado === 'pendiente' ? 'border-[#FBBF24]/30 text-[#FBBF24] bg-[#FBBF24]/5' : 'border-zinc-800 text-zinc-500'}`}>
                          {tx.estado}
                        </span>
                      </div>
                      <div className="flex justify-end items-center">
                        <button 
                          onClick={() => deleteTransaction && deleteTransaction(tx.id_transaccion)} 
                          className="text-zinc-600 hover:text-red-400 p-1 opacity-40 hover:opacity-100 transition-all text-lg"
                        >×</button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
