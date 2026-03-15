"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronRight, Loader2, Zap, Shield, Sparkles } from "lucide-react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";

import { Suspense } from "react";

function PricingContent() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const isCanceled = searchParams.get("canceled");
  const { user } = useAuth();

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    
    setIsLoading(planId);
    try {
      const API = "/api";
      const token = localStorage.getItem("fintrack_token");
      
      const res = await fetch(`${API}/subscriptions/create-checkout-session`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ plan: planId })
      });
      
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.detail);
      
      // Redirect to Stripe Checkout
      window.location.href = data.url;
      
    } catch (err: any) {
      alert("Error iniciando pago: " + (err.message || "Intenta de nuevo más tarde"));
      setIsLoading(null);
    }
  };

  return (
    <div className="flex min-h-[100dvh] flex-col bg-[#09090B] font-sans selection:bg-[#E8FF47]/20 selection:text-[#E8FF47] items-center py-20 px-4">
      
      <Link href="/dashboard" className="mb-12 flex items-center gap-3 transition-opacity hover:opacity-80">
        <img src="/png.png" alt="FinTrack" className="h-5 w-5 object-contain" />
        <span className="font-mono text-[11px] tracking-[0.35em] text-zinc-400">FINTRACK</span>
      </Link>
      
      <div className="flex flex-col items-center mb-16 text-center max-w-2xl">
        {isCanceled && (
          <div className="mb-8 w-full border border-yellow-500/20 bg-yellow-500/10 px-4 py-3 text-yellow-400 font-mono text-xs text-center tracking-wide">
            PROCESO DE PAGO CANCELADO. PUEDES INTENTARLO CUANDO QUIERES.
          </div>
        )}
        <h1 className="mb-4" style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(48px, 6vw, 72px)", letterSpacing: ".02em", lineHeight: .9, color: "#FAFAF9" }}>
          ACTUALIZA TU <span style={{ color: "#E8FF47" }}>PLAN</span>
        </h1>
        <p className="text-zinc-400 font-light" style={{ fontFamily: "'DM Sans',sans-serif" }}>
          Desbloquea el verdadero poder analítico de FinTrack. Accede al AI Advisor, gestión de portfolio avanzada, y soporte técnico preferente.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 w-full max-w-[1000px] items-center justify-center">
        
        {/* Pro Plan */}
        <div className="flex w-full md:w-[450px] flex-col border border-zinc-800 bg-[#0C0C0E] p-8 hover:border-[#10B981]/50 transition-colors">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="text-[#10B981]" size={24} />
            <h2 className="font-mono tracking-[0.2em] text-[#10B981] font-bold text-sm">PRO</h2>
          </div>
          
          <div className="mb-6">
            <span className="text-4xl font-bold text-white tracking-tight">€4.99</span>
            <span className="text-zinc-500 font-mono text-xs ml-2">/MES</span>
          </div>
          
          <p className="text-zinc-400 text-sm mb-8 font-light leading-relaxed">
            Para individuos decididos a maximizar su patrimonio y optimizar cada céntimo.
          </p>
          
          <ul className="flex flex-col gap-4 mb-10">
            <li className="flex items-start gap-3 text-sm text-zinc-300">
              <Check size={16} className="text-[#10B981] shrink-0 mt-0.5" />
              <span>Transacciones y Cuentas Ilimitadas</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-zinc-300">
              <Check size={16} className="text-[#10B981] shrink-0 mt-0.5" />
              <span>Gestor de Portfolio Básico</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-zinc-300">
              <Check size={16} className="text-[#10B981] shrink-0 mt-0.5" />
              <span>Acceso al AI Advisor (Estándar)</span>
            </li>
          </ul>

          <button 
            onClick={() => handleSubscribe("pro")}
            disabled={!!isLoading}
            className="mt-auto w-full border border-zinc-700 bg-zinc-900 py-4 font-mono text-[11px] font-bold tracking-[0.2em] text-white transition-all hover:bg-zinc-800 disabled:opacity-50 flex items-center justify-center gap-2 group"
          >
            {isLoading === "pro" ? <Loader2 className="animate-spin" size={16} /> : "OBTENER PRO"}
            {!isLoading && <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </div>

        {/* Enterprise Plan */}
        <div className="flex w-full md:w-[450px] relative flex-col border border-[#E8FF47]/50 bg-[#E8FF47]/5 p-8 scale-100 md:scale-105 shadow-[0_0_40px_rgba(232,255,71,0.05)]">
          <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-[#E8FF47] px-3 py-1 font-mono text-[9px] font-bold tracking-[0.2em] text-black">
            RECOMENDADO
          </div>
          <div className="flex items-center gap-3 mb-6">
            <Sparkles className="text-[#E8FF47]" size={24} />
            <h2 className="font-mono tracking-[0.2em] text-[#E8FF47] font-bold text-sm">ENTERPRISE</h2>
          </div>
          
          <div className="mb-6">
            <span className="text-4xl font-bold text-white tracking-tight">€14.99</span>
            <span className="text-zinc-500 font-mono text-xs ml-2">/MES</span>
          </div>
          
          <p className="text-zinc-400 text-sm mb-8 font-light leading-relaxed">
            Potencia institucional para el inversor serio. Datos en tiempo real y asesoramiento AI ilimitado.
          </p>
          
          <ul className="flex flex-col gap-4 mb-10">
             <li className="flex items-start gap-3 text-sm text-zinc-300">
              <Check size={16} className="text-[#E8FF47] shrink-0 mt-0.5" />
              <span>Todo lo incluido en Pro</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-zinc-300">
              <Check size={16} className="text-[#E8FF47] shrink-0 mt-0.5" />
              <span>Portfolio Avanzado (Cripto, Acciones, Real Estate)</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-zinc-300">
              <Check size={16} className="text-[#E8FF47] shrink-0 mt-0.5" />
              <span>AI Advisor Modo Institucional Ilimitado</span>
            </li>
            <li className="flex items-start gap-3 text-sm text-zinc-300">
              <Check size={16} className="text-[#E8FF47] shrink-0 mt-0.5" />
              <span>Soporte Prioritario 24/7</span>
            </li>
          </ul>

          <button 
            onClick={() => handleSubscribe("enterprise")}
            disabled={!!isLoading}
            className="mt-auto w-full border border-[#E8FF47] bg-[#E8FF47] py-4 font-mono text-[11px] font-bold tracking-[0.2em] text-black transition-all hover:bg-transparent hover:text-[#E8FF47] disabled:opacity-50 flex items-center justify-center gap-2 group"
          >
            {isLoading === "enterprise" ? <Loader2 className="animate-spin" size={16} /> : "OBTENER ENTERPRISE"}
            {!isLoading && <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </div>

      </div>
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[100dvh] items-center justify-center bg-[#09090B] text-[#FAFAF9] font-mono text-sm tracking-widest">CARGANDO PLANES...</div>}>
      <PricingContent />
    </Suspense>
  );
}
