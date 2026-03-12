"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export function TutorialModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const router = useRouter();

  useEffect(() => {
    // Solo mostramos si no se ha completado antes
    const hasSeenTutorial = localStorage.getItem("fintrack_tutorial");
    if (!hasSeenTutorial) {
      setIsOpen(true);
    }
  }, []);

  if (!isOpen) return null;

  const steps = [
    {
      title: "BIENVENIDO A FINTRACK",
      desc: "Estás a un paso de tomar el control total de tus finanzas personales. Este breve recorrido te enseñará a utilizar la plataforma.",
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E8FF47" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
    },
    {
      title: "1. CREA TU CUENTA",
      desc: "En FinTrack, todo gira en torno a tus 'Cuentas' (banco local, efectivo, ahorros). Añade una en el Dashboard para empezar a registrar movimientos.",
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E8FF47" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>
    },
    {
      title: "2. REGISTRA TRANSACCIONES",
      desc: "Usa el botón superior '+ NEW ENTRY' para añadir tus ingresos, gastos o realizar transferencias entre tus distintas cuentas. Mantén el registro al día.",
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E8FF47" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="12" x2="12" y1="8" y2="16"/><line x1="8" x2="16" y1="12" y2="12"/></svg>
    },
    {
      title: "3. ANALIZA TU PROGRESO",
      desc: "Con tus datos ingresados, el Dashboard calculará tu Patrimonio, Flujo Mensual y Tasa de Ahorro. Si tienes la versión PRO, nuestro AI Advisor te dará métricas personalizadas.",
      icon: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E8FF47" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>
    }
  ];

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  };

  const handleClose = () => {
    localStorage.setItem("fintrack_tutorial", "true");
    setIsOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <div className="w-full max-w-md bg-[#09090B] border border-zinc-800 rounded-lg overflow-hidden shadow-2xl">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-[#E8FF47]/10 flex items-center justify-center border border-[#E8FF47]/20">
              {steps[step].icon}
            </div>
          </div>
          <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, color: "#FAFAF9", letterSpacing: "0.03em", textAlign: "center", marginBottom: 12 }}>
            {steps[step].title}
          </h2>
          <p className="text-zinc-400 text-sm leading-relaxed text-center mb-8 h-20">
            {steps[step].desc}
          </p>
          
          <div className="flex gap-1 justify-center mb-8">
            {steps.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? "bg-[#E8FF47] w-6" : "bg-zinc-800 w-2"}`} />
            ))}
          </div>

          <div className="flex gap-3">
            <button 
              onClick={handleClose} 
              className="flex-1 py-3 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              SALTAR
            </button>
            <button 
              onClick={handleNext} 
              className="flex-[2] py-3 bg-[#E8FF47] text-black font-bold text-[11px] tracking-wider rounded-sm hover:bg-white transition-colors"
            >
              {step === steps.length - 1 ? "COMENZAR" : "SIGUIENTE"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
