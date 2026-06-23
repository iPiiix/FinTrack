"use client";

import { useEffect, useState, useRef } from "react";
import { Download, Github, FileCode2 } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import dynamic from "next/dynamic";
import ErrorBoundary from "../components/ErrorBoundary";

const ThreeBackground = dynamic(() => import("../components/ThreeBackground"), { ssr: false });

const GITHUB   = "https://github.com/iPiiix/FinTrack";
const DL_ARM   = "https://github.com/iPiiix/FinTrack/releases/latest/download/FinTrack-1.0.0-arm64.dmg";
const DL_X64   = "https://github.com/iPiiix/FinTrack/releases/latest/download/FinTrack-1.0.0.dmg";
const DL_WIN   = "https://github.com/iPiiix/FinTrack/releases/latest/download/FinTrack-Setup-1.0.0.exe";

const FEATURES = [
  {
    name: "Libro mayor",
    desc: "Registra cada ingreso y gasto con categorías personalizadas. Múltiples cuentas, historial completo.",
  },
  {
    name: "Flujo de caja",
    desc: "Capital entrante frente a gasto saliente. Tasa de ahorro mensual y análisis por categoría.",
  },
  {
    name: "Portfolio",
    desc: "Acciones, crypto, inmuebles y liquidez en un único dashboard. Patrimonio neto calculado al instante.",
  },
  {
    name: "100% local",
    desc: "SQLite en tu dispositivo. Sin servidores, sin cloud, sin telemetría. Tus datos no salen de tu equipo.",
  },
  {
    name: "Sin suscripción",
    desc: "Gratis sin límites. Descárgalo, úsalo. Sin registro en servicios externos, sin tarjeta.",
  },
  {
    name: "IA opcional",
    desc: "Conecta el LLM que quieras para obtener análisis y resúmenes. El modelo recibe solo lo que tú compartes.",
  },
];

export default function Landing() {
  const { scrollYProgress } = useScroll();
  const yHero = useTransform(scrollYProgress, [0, 1], [0, 400]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <>
      {/* 3D Background — isolated boundary so WebGL errors don't crash the page */}
      <ErrorBoundary fallback={null}>
        <ThreeBackground />
      </ErrorBoundary>

      <div className="min-h-screen text-zinc-50 font-sans flex flex-col selection:bg-[#E8FF47]/20 selection:text-white">
        
        {/* Nav with Glassmorphism */}
        <nav className="border-b border-white/5 sticky top-0 bg-[#09090B]/60 backdrop-blur-2xl z-50">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/png.png" alt="FinTrack" className="w-5 h-5 object-contain" />
              <span className="font-mono text-xs tracking-[0.4em] text-white">FINTRACK</span>
            </div>

            <div className="hidden sm:flex items-center gap-12">
              {[["Funciones", "#features"], ["Instalar", "#install"]].map(([label, href]) => (
                <a key={label} href={href} className="font-mono text-[10px] tracking-[0.25em] text-zinc-400 hover:text-white transition-colors uppercase">
                  {label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-8">
              <a href={`${GITHUB}/blob/main/AGENTS.md`} target="_blank" rel="noopener noreferrer" className="hidden md:flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] text-zinc-400 hover:text-[#E8FF47] transition-colors uppercase">
                <FileCode2 size={14} />
                ARQUITECTURA
              </a>
              <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-mono text-[10px] tracking-[0.25em] text-zinc-400 hover:text-white transition-colors uppercase">
                <Github size={14} />
                GITHUB
              </a>
            </div>
          </div>
        </nav>

        <main className="flex-1 relative z-10">
          {/* Hero Section with Parallax */}
          <section className="relative h-[90vh] flex flex-col justify-center max-w-7xl mx-auto px-6 sm:px-12">
            <motion.div style={{ y: yHero, opacity: opacityHero }}>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <span className="font-mono text-[11px] tracking-[0.4em] text-[#E8FF47] bg-[#E8FF47]/10 border border-[#E8FF47]/20 px-4 py-2 rounded-sm inline-block mb-12 backdrop-blur-md">
                  v1.0.0 · OPEN SOURCE · MIT LICENSE
                </span>
              </motion.div>

              <motion.h1 
                className="font-['Bebas_Neue'] text-[5rem] sm:text-[9rem] md:text-[12rem] leading-[0.85] tracking-tight mb-12 text-white"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              >
                OWN YOUR FUTURE.<br />
                <span className="text-[#E8FF47]">KNOW YOUR NUMBERS.</span>
              </motion.h1>

              <motion.p 
                className="text-zinc-300 text-base sm:text-lg leading-relaxed max-w-2xl mb-16 font-light"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.3 }}
              >
                Registra ingresos y gastos, analiza tu flujo de caja y visualiza tu patrimonio.
                Una sola app, instalada en tu dispositivo, sin suscripciones ni rastreo.
              </motion.p>

              <motion.div 
                className="flex flex-col sm:flex-row gap-6 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              >
                <a href={DL_WIN} download className="flex items-center justify-center gap-3 bg-white hover:bg-zinc-200 text-black px-8 py-5 font-mono text-xs font-medium tracking-[0.25em] transition-colors rounded-sm">
                  <Download size={16} />
                  WINDOWS
                </a>
                <a href={DL_ARM} download className="flex items-center justify-center gap-3 bg-[#E8FF47] hover:bg-[#d4eb3a] text-black px-8 py-5 font-mono text-xs font-medium tracking-[0.25em] transition-colors rounded-sm shadow-[0_0_30px_rgba(232,255,71,0.2)]">
                  <Download size={16} />
                  MACOS
                </a>
                <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 border border-white/20 hover:border-white/40 hover:bg-white/5 backdrop-blur-md text-white px-8 py-5 font-mono text-xs tracking-[0.25em] transition-all rounded-sm">
                  <Github size={16} />
                  GITHUB
                </a>
              </motion.div>

              <motion.p 
                className="font-mono text-[10px] tracking-[0.3em] text-zinc-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.6 }}
              >
                MACOS (APPLE SILICON & INTEL) · WINDOWS · GRATIS
              </motion.p>
            </motion.div>
          </section>

          {/* Features */}
          <section id="features" className="max-w-7xl mx-auto px-6 sm:px-12 py-40">
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="font-mono text-[11px] tracking-[0.5em] text-[#E8FF47] mb-24 border-l-2 border-[#E8FF47] pl-4"
            >
              FUNCIONALIDADES
            </motion.p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-24">
              {FEATURES.map((f, i) => (
                <motion.div 
                  key={f.name} 
                  className="group relative"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: i * 0.1 }}
                >
                  <div className="absolute -inset-6 bg-white/0 group-hover:bg-white/5 transition-colors rounded-lg -z-10" />
                  <div className="font-['Bebas_Neue'] text-3xl tracking-wide text-white group-hover:text-[#E8FF47] transition-colors mb-6">
                    {f.name.toUpperCase()}
                  </div>
                  <p className="text-base text-zinc-400 leading-loose group-hover:text-zinc-300 transition-colors">
                    {f.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>

          <div className="border-t border-white/5 w-full" />

          {/* Install */}
          <section id="install" className="max-w-7xl mx-auto px-6 sm:px-12 py-40">
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="font-mono text-[11px] tracking-[0.5em] text-[#E8FF47] mb-24 border-l-2 border-[#E8FF47] pl-4"
            >
              INSTALACIÓN
            </motion.p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">
              {/* Downloads */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <p className="font-mono text-[11px] tracking-[0.35em] text-zinc-400 mb-8">DESCARGA DIRECTA</p>
                <div className="flex flex-col gap-4">
                  <a href={DL_WIN} download className="flex items-center justify-between group border border-white/10 hover:border-white/30 bg-black/40 backdrop-blur-md px-8 py-6 transition-all rounded-sm">
                    <span className="font-mono text-xs tracking-[0.25em] text-zinc-300 group-hover:text-white">WINDOWS (.EXE)</span>
                    <Download size={16} className="text-zinc-600 group-hover:text-white" />
                  </a>
                  <a href={DL_ARM} download className="flex items-center justify-between group border border-white/10 hover:border-[#E8FF47]/50 bg-black/40 hover:bg-[#E8FF47]/5 backdrop-blur-md px-8 py-6 transition-all rounded-sm">
                    <span className="font-mono text-xs tracking-[0.25em] text-zinc-300 group-hover:text-[#E8FF47]">MACOS — APPLE SILICON</span>
                    <Download size={16} className="text-zinc-600 group-hover:text-[#E8FF47]" />
                  </a>
                  <a href={DL_X64} download className="flex items-center justify-between group border border-white/10 hover:border-white/30 bg-black/40 backdrop-blur-md px-8 py-6 transition-all rounded-sm">
                    <span className="font-mono text-xs tracking-[0.25em] text-zinc-300 group-hover:text-white">MACOS — INTEL (.DMG)</span>
                    <Download size={16} className="text-zinc-600 group-hover:text-white" />
                  </a>
                </div>
              </motion.div>

              {/* Terminal */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <p className="font-mono text-[11px] tracking-[0.35em] text-zinc-400 mb-8">CÓDIGO FUENTE</p>
                <div className="bg-black/60 backdrop-blur-xl border border-white/10 p-8 rounded-sm shadow-2xl">
                  <div className="font-mono text-sm leading-loose text-zinc-300">
                    <div><span className="text-zinc-600 select-none">$ </span>git clone https://github.com/iPiiix/FinTrack</div>
                    <div><span className="text-zinc-600 select-none">$ </span>cd FinTrack/fintrack-web</div>
                    <div><span className="text-zinc-600 select-none">$ </span>npm install && npm run dev</div>
                    <div className="mt-6 text-xs text-[#E8FF47]">→ localhost:3000</div>
                  </div>
                </div>
                <p className="font-mono text-[10px] tracking-[0.25em] text-zinc-500 mt-6">
                  Node.js 18+ REQUERIDO
                </p>
              </motion.div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <div className="border-t border-white/5 relative z-10 bg-[#09090B]/80 backdrop-blur-lg" />
        <footer className="max-w-7xl mx-auto w-full px-6 sm:px-12 py-12 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10 bg-[#09090B]/80 backdrop-blur-lg">
          <div className="flex items-center gap-4 opacity-60 hover:opacity-100 transition-opacity">
            <img src="/png.png" alt="" className="w-4 h-4 object-contain" />
            <span className="font-mono text-[11px] tracking-[0.4em] text-zinc-300">FINTRACK</span>
          </div>
          <span className="font-mono text-[10px] tracking-[0.3em] text-zinc-500">
            © 2026 · MIT LICENSE
          </span>
          <div className="flex items-center gap-8">
            <a href={`${GITHUB}/blob/main/AGENTS.md`} target="_blank" rel="noopener noreferrer" className="font-mono text-[10px] tracking-[0.3em] text-zinc-500 hover:text-[#E8FF47] transition-colors">
              ARQUITECTURA
            </a>
            <a href={GITHUB} target="_blank" rel="noopener noreferrer" className="font-mono text-[10px] tracking-[0.3em] text-zinc-500 hover:text-white transition-colors">
              GITHUB ↗
            </a>
          </div>
        </footer>
      </div>
    </>
  );
}
