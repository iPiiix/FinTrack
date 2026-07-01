"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Download, Github, ArrowRight, Plus, Minus } from "lucide-react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { AnimatePresence, motion } from "framer-motion";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const GITHUB = "https://github.com/iPiiix/FinTrack";
const RELEASES = "https://github.com/iPiiix/FinTrack/releases";
const DL_WIN = "https://github.com/iPiiix/FinTrack/releases/latest/download/FinTrack-Setup-1.0.0.exe";
const DL_ARM = "https://github.com/iPiiix/FinTrack/releases/latest/download/FinTrack-1.0.0-arm64.dmg";
const DL_X64 = "https://github.com/iPiiix/FinTrack/releases/latest/download/FinTrack-1.0.0.dmg";

const FEATURES = [
  {
    title: "Libro Mayor",
    desc: "Múltiples cuentas y categorías personalizadas.",
    span: "md:col-span-2 md:row-span-2",
    img: "/assets/images/bento_ledger.png",
  },
  {
    title: "Flujo de Caja",
    desc: "Tasa de ahorro en tiempo real.",
    span: "md:col-span-1 md:row-span-1",
    img: "/assets/images/bento_cashflow.png",
  },
  {
    title: "Portfolio Global",
    desc: "Acciones, ETFs, criptoactivos y efectivo consolidado.",
    span: "md:col-span-1 md:row-span-2",
    img: "/assets/images/bento_portfolio.png",
  },
  {
    title: "SQLite",
    desc: "Datos locales. Privacidad absoluta.",
    span: "md:col-span-1 md:row-span-1",
    img: "/assets/images/bento_sqlite.png",
  },
];

const FAQ_ITEMS = [
  { q: "¿FinTrack es gratuito y open source?", a: "Totalmente. Sin planes de pago ni telemetría." },
  { q: "¿Privacidad de datos financieros?", a: "Diseño local-first. Todo vive en un SQLite en tu equipo." },
  { q: "¿Qué pasa con el AI Advisor?", a: "Opcional y requiere tu propia API Key. Solo manda saldos, nunca transacciones individuales completas." },
];

export default function Landing() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const textRevealRef = useRef<HTMLDivElement>(null);
  const bentoRef = useRef<HTMLDivElement>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useGSAP(() => {
    // Hero Animations
    gsap.fromTo(
      ".hero-text",
      { opacity: 0, y: 30, filter: "blur(10px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.2, stagger: 0.15, ease: "power3.out" }
    );
    
    // Scrubbing Text Reveal
    const textRevealWords = gsap.utils.toArray(".reveal-word");
    gsap.fromTo(
      textRevealWords,
      { opacity: 0.1 },
      {
        opacity: 1,
        stagger: 0.1,
        ease: "none",
        scrollTrigger: {
          trigger: textRevealRef.current,
          start: "top 70%",
          end: "bottom 50%",
          scrub: true,
        },
      }
    );

    // Bento Grid Image Scale & Fade
    const bentoCards = gsap.utils.toArray(".bento-card");
    bentoCards.forEach((card: any) => {
      gsap.fromTo(
        card,
        { opacity: 0, y: 50, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
          },
        }
      );
    });
  }, { scope: containerRef });

  return (
    <main ref={containerRef} className="overflow-x-hidden w-full max-w-full bg-[#030303] text-zinc-100 selection:bg-[#E8FF47] selection:text-black min-h-screen">
      
      {/* Cinematic Radial Wash */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{ background: "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.04) 0%, transparent 60%)" }} />

      {/* Modern Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 mix-blend-difference">
        <div className="flex items-center gap-8 bg-white/5 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 shadow-2xl">
          <Link href="/" className="flex items-center gap-2 hover:opacity-70 transition-opacity">
            <Image src="/favicon.png" alt="Logo" width={18} height={18} className="object-cover" />
            <span className="font-sans font-bold text-xs tracking-[0.2em] uppercase text-white">FinTrack</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-[10px] font-mono tracking-widest uppercase text-white/60 hover:text-white transition-colors">Características</a>
            <a href="#install" className="text-[10px] font-mono tracking-widest uppercase text-white/60 hover:text-white transition-colors">Instalación</a>
          </div>
        </div>
      </nav>

      <div className="relative z-10 w-full">
        
        {/* ATTENTION: HERO (Cinematic Center) */}
        <section ref={heroRef} className="min-h-[100dvh] flex flex-col justify-center items-center text-center px-6 pt-24 pb-12">
          <div className="max-w-6xl w-full mx-auto flex flex-col items-center">
            
            <h1 className="hero-text text-[clamp(2.5rem,6vw,5.5rem)] font-bold tracking-[-0.04em] leading-[1.05] text-wrap-balance text-white mb-8 w-full max-w-6xl">
              Soberanía financiera,{" "}
              <span className="inline-flex w-16 h-10 md:w-28 md:h-14 rounded-full align-middle bg-zinc-800 mx-2 shadow-2xl overflow-hidden relative items-center justify-center">
                <Image src="/assets/images/hero_wealth.png" alt="Wealth" fill className="object-cover opacity-80 mix-blend-luminosity filter grayscale contrast-125" />
              </span>{" "}
              ejecutada en tu hardware.
            </h1>
            
            <p className="hero-text text-zinc-400 text-sm md:text-base max-w-xl text-wrap-pretty font-light mb-12">
              Privacidad absoluta. Sin telemetría. Sin nube. Registra tus cuentas, transacciones y activos en un entorno SQLite local de alto rendimiento.
            </p>

            <div className="hero-text flex flex-wrap justify-center items-center gap-4">
              <a href={DL_WIN} className="group relative overflow-hidden flex items-center gap-2 px-8 py-4 bg-[#E8FF47] text-black rounded-lg text-xs font-bold uppercase tracking-widest hover:scale-105 transition-transform duration-500 ease-out">
                <span className="relative z-10 flex items-center gap-2">
                  <Download size={14} />
                  Descargar x64
                </span>
                <div className="absolute inset-0 bg-white translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out z-0" />
              </a>
              <a href={GITHUB} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-8 py-4 bg-transparent border border-white/20 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-white/10 hover:border-white/40 transition-all duration-500 ease-out">
                <Github size={14} />
                GitHub
              </a>
            </div>
          </div>
        </section>

        {/* DESIRE: SCRUBBING TEXT REVEAL */}
        <section className="py-32 md:py-48 px-6 flex justify-center">
          <div ref={textRevealRef} className="max-w-4xl text-center">
            <p className="text-[clamp(1.5rem,4vw,3.5rem)] font-medium leading-tight text-white tracking-tight flex flex-wrap justify-center gap-x-3 gap-y-1">
              {"El control de tu patrimonio no debería depender de los servidores de terceros.".split(" ").map((word, i) => (
                <span key={i} className="reveal-word inline-block">{word}</span>
              ))}
            </p>
          </div>
        </section>

        {/* INTEREST: GAPLESS BENTO GRID */}
        <section id="features" className="py-32 md:py-48 px-6 sm:px-12 md:px-24">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tighter text-white mb-16 text-center">Arquitectura de control.</h2>
            
            <div ref={bentoRef} className="grid grid-cols-1 md:grid-cols-4 auto-rows-[250px] md:auto-rows-[300px] grid-flow-dense gap-4">
              {FEATURES.map((feature, idx) => (
                <div key={idx} className={`bento-card relative group overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 ${feature.span}`}>
                  <Image 
                    src={feature.img} 
                    alt={feature.title} 
                    fill 
                    className="object-cover opacity-40 mix-blend-luminosity group-hover:opacity-70 group-hover:scale-105 transition-all duration-700 ease-out filter grayscale group-hover:grayscale-0"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />
                  <div className="absolute bottom-0 left-0 p-8 w-full z-10 flex flex-col justify-end h-full">
                    <h3 className="text-2xl font-bold text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-zinc-400 max-w-sm">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ (Horizontal Accordion Style) */}
        <section className="py-32 md:py-48 px-6 sm:px-12 max-w-4xl mx-auto">
          <div className="divide-y divide-zinc-800 border-t border-b border-zinc-800">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="py-8 group cursor-pointer" onClick={() => setOpenFaq(isOpen ? null : idx)}>
                  <div className="flex items-center justify-between gap-6">
                    <h4 className="text-xl md:text-2xl font-medium text-white group-hover:text-[#E8FF47] transition-colors">{item.q}</h4>
                    <span className="shrink-0 w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center group-hover:border-[#E8FF47] transition-colors text-white group-hover:text-[#E8FF47]">
                      {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                    </span>
                  </div>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="pt-6 text-zinc-400 text-sm md:text-base pr-12">{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* ACTION: MASSIVE CTA */}
        <section id="install" className="py-32 md:py-48 px-6 sm:px-12 flex justify-center">
          <div className="w-full max-w-7xl rounded-3xl bg-zinc-900 border border-zinc-800 p-12 md:p-24 text-center relative overflow-hidden group">
            <div className="absolute inset-0 opacity-20 bg-[url('https://picsum.photos/seed/texture13/1920/1080')] bg-cover mix-blend-overlay pointer-events-none filter grayscale group-hover:scale-105 transition-transform duration-1000" />
            
            <div className="relative z-10 flex flex-col items-center">
              <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-white mb-6 leading-none">Instalación local.</h2>
              <p className="text-zinc-400 max-w-lg mb-12 text-sm md:text-base">Sin cuentas, sin suscripciones. Ejecuta FinTrack hoy y toma control absoluto de tu información patrimonial.</p>
              
              <div className="flex flex-col md:flex-row items-center gap-4 w-full justify-center">
                <a href={DL_WIN} className="w-full md:w-auto px-8 py-5 bg-white text-black font-bold text-sm tracking-widest uppercase hover:bg-[#E8FF47] transition-colors rounded">
                  Windows (.exe)
                </a>
                <a href={DL_ARM} className="w-full md:w-auto px-8 py-5 bg-transparent border border-white/20 text-white font-bold text-sm tracking-widest uppercase hover:bg-white/10 transition-colors rounded">
                  Apple Silicon
                </a>
                <a href={DL_X64} className="w-full md:w-auto px-8 py-5 bg-transparent border border-white/20 text-white font-bold text-sm tracking-widest uppercase hover:bg-white/10 transition-colors rounded">
                  Intel x64
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Minimal Footer */}
        <footer className="py-12 border-t border-zinc-900 px-6 sm:px-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Image src="/favicon.png" alt="FinTrack" width={16} height={16} className="grayscale" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-600">FinTrack © 2026</span>
          </div>
          <div className="flex gap-6">
            <a href={GITHUB} className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 hover:text-white transition-colors">GitHub</a>
            <Link href="/docs" className="text-[10px] font-mono uppercase tracking-widest text-zinc-600 hover:text-white transition-colors">Documentación</Link>
          </div>
        </footer>

      </div>
    </main>
  );
}
