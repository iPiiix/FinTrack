"use client";

import { Download, Github, FileCode2 } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import dynamic from "next/dynamic";
import ErrorBoundary from "../components/ErrorBoundary";

const ThreeBackground = dynamic(() => import("../components/ThreeBackground"), { ssr: false });

const GITHUB = "https://github.com/iPiiix/FinTrack";
const DL_ARM = "https://github.com/iPiiix/FinTrack/releases/latest/download/FinTrack-1.0.0-arm64.dmg";
const DL_X64 = "https://github.com/iPiiix/FinTrack/releases/latest/download/FinTrack-1.0.0.dmg";
const DL_WIN = "https://github.com/iPiiix/FinTrack/releases/latest/download/FinTrack-Setup-1.0.0.exe";

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

const DOWNLOADS = [
  { label: "Windows (.exe)", href: DL_WIN },
  { label: "macOS — Apple Silicon (.dmg)", href: DL_ARM },
  { label: "macOS — Intel (.dmg)", href: DL_X64 },
];

export default function Landing() {
  const { scrollYProgress } = useScroll();
  const yHero = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

  return (
    <>
      <ErrorBoundary fallback={null}>
        <ThreeBackground />
      </ErrorBoundary>

      <div className="min-h-screen text-zinc-50 font-sans flex flex-col selection:bg-[#E8FF47]/20 selection:text-white">

        {/* Nav */}
        <nav className="border-b border-zinc-900 sticky top-0 bg-zinc-950/80 backdrop-blur-xl z-50">
          <div className="px-6 sm:px-12 md:px-24 xl:px-48 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/png.png" alt="FinTrack" className="w-4 h-4 object-contain opacity-90" />
              <span className="font-mono text-[11px] tracking-widest text-zinc-400">FINTRACK</span>
            </div>

            <div className="hidden sm:flex items-center gap-10">
              {[["Funciones", "#features"], ["Instalar", "#install"]].map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  className="font-mono text-[10px] tracking-widest text-zinc-600 hover:text-zinc-300 transition-colors uppercase"
                >
                  {label}
                </a>
              ))}
            </div>

            <div className="flex items-center gap-6">
              <a
                href={`${GITHUB}/blob/main/AGENTS.md`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center gap-2 font-mono text-[10px] tracking-widest text-zinc-600 hover:text-zinc-300 transition-colors uppercase"
              >
                <FileCode2 size={13} />
                Arquitectura
              </a>
              <a
                href={GITHUB}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-zinc-600 hover:text-zinc-300 transition-colors uppercase"
              >
                <Github size={13} />
                GitHub
              </a>
            </div>
          </div>
        </nav>

        <main className="flex-1 relative z-10">

          {/* Hero */}
          <section className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-center px-6 sm:px-12 md:px-24 xl:px-48 py-20 overflow-hidden">
            <motion.div style={{ y: yHero, opacity: opacityHero }}>

              <motion.p
                initial={{ opacity: 0, filter: "blur(8px)", y: -10 }}
                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
                className="font-mono text-xs tracking-widest text-zinc-500 uppercase mb-6"
              >
                v1.0.0 · Open Source · MIT
              </motion.p>

              <motion.h1
                className="text-5xl sm:text-6xl md:text-7xl font-semibold tracking-[-0.035em] leading-[1.1] mb-8 max-w-4xl"
                initial={{ opacity: 0, y: 24, filter: "blur(12px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              >
                <span className="bg-gradient-to-b from-zinc-100 via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                  Own Your Future.
                </span>
                <br />
                <span className="bg-gradient-to-b from-[#E8FF47] via-[#cce040] to-[#a8b830] bg-clip-text text-transparent">
                  Know Your Numbers.
                </span>
              </motion.h1>

              <motion.p
                className="text-zinc-400 text-lg sm:text-xl max-w-xl leading-relaxed mb-10"
                initial={{ opacity: 0, y: 10, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
              >
                Registra ingresos y gastos, analiza tu flujo de caja y visualiza tu patrimonio.
                Una sola app, instalada en tu dispositivo, sin suscripciones ni rastreo.
              </motion.p>

              <motion.div
                className="flex flex-wrap items-center gap-3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
              >
                <a
                  href={DL_ARM}
                  download
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E8FF47] text-zinc-950 rounded-full text-sm font-medium hover:bg-[#d4eb3a] transition-[background-color,transform] active:scale-[0.97]"
                >
                  <Download size={14} />
                  macOS
                </a>
                <a
                  href={DL_WIN}
                  download
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-100 text-zinc-950 rounded-full text-sm font-medium hover:bg-zinc-300 transition-[background-color,transform] active:scale-[0.97]"
                >
                  <Download size={14} />
                  Windows
                </a>
                <a
                  href={GITHUB}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-zinc-800 text-zinc-400 rounded-full text-sm hover:border-zinc-600 hover:text-zinc-200 transition-colors"
                >
                  <Github size={14} />
                  GitHub
                </a>
              </motion.div>

              <motion.p
                className="font-mono text-[10px] tracking-widest text-zinc-600 mt-6 uppercase"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.8 }}
              >
                Apple Silicon · Intel · Windows · Gratis
              </motion.p>
            </motion.div>
          </section>

          {/* Features */}
          <section id="features" className="px-6 sm:px-12 md:px-24 xl:px-48 py-32 border-t border-zinc-900">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-mono text-xs tracking-widest text-zinc-500 uppercase mb-16"
            >
              Funcionalidades
            </motion.p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.name}
                  initial={{ opacity: 0, filter: "blur(4px)", y: 20 }}
                  whileInView={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: i * 0.07 }}
                  className="group bg-zinc-900/60 border border-zinc-800/50 rounded-sm p-6 hover:border-zinc-700 transition-colors"
                >
                  <h3 className="text-zinc-100 text-sm font-medium mb-2 group-hover:text-[#E8FF47] transition-colors">
                    {f.name}
                  </h3>
                  <p className="text-zinc-500 text-xs leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Install */}
          <section id="install" className="px-6 sm:px-12 md:px-24 xl:px-48 py-32 border-t border-zinc-900">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="font-mono text-xs tracking-widest text-zinc-500 uppercase mb-16"
            >
              Instalación
            </motion.p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">

              {/* Downloads */}
              <motion.div
                initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
                whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              >
                <p className="font-mono text-[10px] tracking-widest text-zinc-600 uppercase mb-8">
                  Descarga directa
                </p>
                <div className="flex flex-col">
                  {DOWNLOADS.map(({ label, href }) => (
                    <a
                      key={label}
                      href={href}
                      download
                      className="group flex items-center justify-between py-5 border-b border-zinc-900 hover:border-zinc-800 transition-colors last:border-0"
                    >
                      <span className="text-zinc-400 text-sm group-hover:text-zinc-100 transition-colors">
                        {label}
                      </span>
                      <Download
                        size={14}
                        className="text-zinc-700 group-hover:text-zinc-400 transition-colors shrink-0"
                      />
                    </a>
                  ))}
                </div>
              </motion.div>

              {/* Code */}
              <motion.div
                initial={{ opacity: 0, x: 20, filter: "blur(4px)" }}
                whileInView={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
              >
                <p className="font-mono text-[10px] tracking-widest text-zinc-600 uppercase mb-8">
                  Código fuente
                </p>
                <div className="bg-zinc-900/60 border border-zinc-800/50 rounded-sm p-6">
                  <div className="font-mono text-sm leading-loose text-zinc-400">
                    <div>
                      <span className="text-zinc-700 select-none">$ </span>
                      git clone https://github.com/iPiiix/FinTrack
                    </div>
                    <div>
                      <span className="text-zinc-700 select-none">$ </span>
                      cd FinTrack/fintrack-web
                    </div>
                    <div>
                      <span className="text-zinc-700 select-none">$ </span>
                      npm install && npm run dev
                    </div>
                    <div className="mt-5 text-xs text-[#E8FF47]">→ localhost:3000</div>
                  </div>
                </div>
                <p className="font-mono text-[10px] tracking-widest text-zinc-600 mt-5 uppercase">
                  Node.js 18+ requerido
                </p>
              </motion.div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="px-6 sm:px-12 md:px-24 xl:px-48 py-10 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3 opacity-50 hover:opacity-100 transition-opacity">
            <img src="/png.png" alt="" className="w-4 h-4 object-contain" />
            <span className="font-mono text-[10px] tracking-widest text-zinc-400">FINTRACK</span>
          </div>
          <span className="font-mono text-[10px] tracking-widest text-zinc-600">
            © 2026 · MIT License
          </span>
          <div className="flex items-center gap-8">
            <a
              href={`${GITHUB}/blob/main/AGENTS.md`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[10px] tracking-widest text-zinc-600 hover:text-[#E8FF47] transition-colors uppercase"
            >
              Arquitectura
            </a>
            <a
              href={GITHUB}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[10px] tracking-widest text-zinc-600 hover:text-zinc-300 transition-colors uppercase"
            >
              GitHub ↗
            </a>
          </div>
        </footer>
      </div>
    </>
  );
}
