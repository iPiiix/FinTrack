"use client";

import { useState } from "react";
import {
  Download,
  Github,
  Monitor,
  ArrowRight,
  Plus,
  Minus,
  Check,
  Copy
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const GITHUB = "https://github.com/iPiiix/FinTrack";
const RELEASES = "https://github.com/iPiiix/FinTrack/releases";
const DL_ARM = "https://github.com/iPiiix/FinTrack/releases/latest/download/FinTrack-1.0.0-arm64.dmg";
const DL_X64 = "https://github.com/iPiiix/FinTrack/releases/latest/download/FinTrack-1.0.0.dmg";
const DL_WIN = "https://github.com/iPiiix/FinTrack/releases/latest/download/FinTrack.Setup.1.0.0.exe";

const FEATURES = [
  {
    num: "01",
    name: "Libro Mayor",
    desc: "Registra cada ingreso, gasto y transferencia. Múltiples cuentas y categorías personalizadas.",
  },
  {
    num: "02",
    name: "Flujo de Caja",
    desc: "Visualización limpia de entradas, salidas y tasa de ahorro mensual calculada en tiempo real.",
  },
  {
    num: "03",
    name: "Portfolio Global",
    desc: "Sigue tus acciones, ETFs, criptoactivos y efectivo consolidado en tu divisa principal.",
  },
  {
    num: "04",
    name: "Base de Datos SQLite",
    desc: "Los datos se almacenan de forma local en tu máquina. Sin nube, sin telemetría, privacidad absoluta.",
  },
  {
    num: "05",
    name: "Sin Suscripción",
    desc: "FinTrack es open-source bajo licencia MIT. Descárgalo y úsalo sin cuotas ni registros obligatorios.",
  },
  {
    num: "06",
    name: "AI Advisor Opcional",
    desc: "Conecta localmente tu clave de API de OpenAI o Anthropic para obtener análisis financieros privados.",
  },
];

const STEPS = [
  {
    number: "01",
    title: "Descarga",
    desc: "Elige tu sistema operativo y obtén el instalador ligero oficial.",
  },
  {
    number: "02",
    title: "Lanza",
    desc: "Instala en tu ordenador. La base de datos SQLite se crea en el primer inicio.",
  },
  {
    number: "03",
    title: "Controla",
    desc: "Crea tus cuentas bancarias y empieza a registrar tu patrimonio sin intermediarios.",
  },
];

const DOWNLOADS = [
  { label: "Windows x64 (.exe)", href: DL_WIN },
  { label: "macOS - Apple Silicon (.dmg)", href: DL_ARM },
  { label: "macOS - Intel x64 (.dmg)", href: DL_X64 },
];

const FAQ_ITEMS = [
  {
    q: "¿FinTrack es realmente gratuito y de código abierto?",
    a: "Sí, sin condiciones. FinTrack es un proyecto de código abierto publicado bajo la licencia MIT. No tiene versiones de pago ocultas, ni planes mensuales ni telemetría. Puedes inspeccionar y compilar el código fuente tú mismo.",
  },
  {
    q: "¿Cómo se garantiza la privacidad de mis datos financieros?",
    a: "A través del diseño 'local-first'. En lugar de alojar tu información en un servidor remoto de terceros, FinTrack crea un archivo de base de datos SQLite directamente en el almacenamiento persistente de tu dispositivo. La app funciona de forma offline y nunca comparte tus balances.",
  },
  {
    q: "¿En qué rutas locales se almacena mi base de datos?",
    a: "Tu archivo SQLite se denomina 'fintrack.db'. Se almacena en la ruta de datos de la aplicación: en Windows se localiza en '%APPDATA%/FinTrack/fintrack.db' y en macOS en '~/Library/Application Support/FinTrack/fintrack.db'. Puedes hacer copias de seguridad de este archivo copiándolo directamente.",
  },
  {
    q: "macOS Gatekeeper o Windows Defender SmartScreen bloquean la app, ¿es seguro?",
    a: "Es completamente seguro. Este bloqueo sucede porque no firmamos los binarios descargables con certificados de pago de Apple o Microsoft (que exigen cuotas anuales costosas). Para habilitarlo: en macOS, ve a Ajustes del Sistema -> Privacidad y Seguridad y haz clic en 'Abrir igualmente'. En Windows, haz clic en 'Más información' y después en 'Ejecutar de todas formas'.",
  },
  {
    q: "¿El AI Advisor envía todos mis registros de transacciones?",
    a: "No. El módulo de IA es totalmente opcional y requiere tu propia API Key. Al solicitar un informe, FinTrack agrega los balances del mes y las distribuciones de categorías en un prompt simplificado que se envía directamente a la API de OpenAI o Anthropic. No se transmiten transacciones individuales completas.",
  },
];

export default function Landing() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen text-zinc-100 font-sans flex flex-col selection:bg-zinc-800 selection:text-white">
      
      {/* ─── Nav ─────────────────────────────────────────────────────── */}
      <nav className="border-b border-zinc-900/60 sticky top-0 bg-[#050507]/90 backdrop-blur-md z-50">
        <div className="px-6 sm:px-12 md:px-24 xl:px-48 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded bg-zinc-100 flex items-center justify-center">
              <span className="text-zinc-950 text-[11px] font-bold">F</span>
            </div>
            <span className="font-mono text-[10.5px] tracking-[0.25em] text-zinc-300 font-medium select-none">FINTRACK</span>
          </div>

          <div className="hidden md:flex items-center gap-10">
            {[
              ["Funciones", "#features"],
              ["Instalación", "#install"],
              ["FAQ", "#faq-section"],
            ].map(([label, href]) => (
              <a
                key={label}
                href={href}
                className="font-mono text-[9px] tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors duration-200 uppercase"
              >
                {label}
              </a>
            ))}
            <Link
              href="/docs"
              className="font-mono text-[9px] tracking-widest text-zinc-500 hover:text-zinc-300 transition-colors duration-200 uppercase"
            >
              Documentación
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={GITHUB}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-800 rounded-full font-mono text-[9px] tracking-wider text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 transition-all duration-200 uppercase bg-zinc-950/40 active:scale-[0.98]"
            >
              <Github size={11} />
              GitHub
            </a>
          </div>
        </div>
      </nav>

      <main className="flex-1 relative z-10">

        {/* ─── Hero ─────────────────────────────────────────────────── */}
        <section className="relative min-h-[75dvh] flex flex-col justify-center px-6 sm:px-12 md:px-24 xl:px-48 py-20">
          <div className="max-w-3xl">
            {/* Eyebrow */}
            <motion.p
              initial={{ opacity: 0, filter: "blur(4px)", y: -8 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="text-zinc-500 font-mono text-[9.5px] tracking-[0.28em] uppercase mb-5"
            >
              // local-first &bull; open source core
            </motion.p>

            {/* H1 Heading (Asymmetric typographic contrast) */}
            <motion.h1
              initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-[-0.035em] leading-[1.1] mb-6 text-wrap-balance"
            >
              <span className="bg-gradient-to-b from-zinc-50 via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                Control financiero local.
              </span>
              <br />
              <span className="text-zinc-500 font-normal">
                Soberanía absoluta.
              </span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
              className="text-zinc-400 text-sm sm:text-base max-w-xl leading-relaxed mb-8 text-wrap-pretty"
            >
              Gestiona tus cuentas, transacciones y activos financieros en una base de datos local SQLite. Sin telemetría, sin servidores en la nube y sin suscripciones recurrentes.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              className="flex flex-wrap items-center gap-3.5"
            >
              <a
                href={DL_WIN}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-5.5 py-3 bg-zinc-100 text-zinc-950 rounded-lg text-xs font-semibold hover:bg-zinc-200 transition-all active:scale-[0.97] shadow-lg shadow-black/10"
              >
                <Download size={13.5} />
                Obtener FinTrack para Windows
              </a>

              <Link
                href="/docs"
                className="group inline-flex items-center gap-2.5 px-5.5 py-3 bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-lg text-xs font-medium hover:border-zinc-700 hover:text-white transition-all active:scale-[0.97]"
              >
                Documentación Técnica
                <ArrowRight size={13.5} className="text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </section>

        {/* ─── Features (Typographic Editorial Layout) ───────────────── */}
        <section id="features" className="px-6 sm:px-12 md:px-24 xl:px-48 py-28 border-t border-zinc-900/60 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            
            {/* Header Column */}
            <div className="lg:col-span-5">
              <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4">
                // ARQUITECTURA
              </h2>
              <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-100 leading-tight text-wrap-balance">
                Diseñado para profesionales que valoran su privacidad
              </h3>
              <p className="text-zinc-500 text-xs mt-4 leading-relaxed text-wrap-pretty max-w-sm">
                FinTrack prescinde de la arquitectura tradicional en la nube. Todo el procesamiento y almacenamiento se realiza en el hardware que posees.
              </p>
            </div>

            {/* Typographic Features List (Right Column) */}
            <div className="lg:col-span-7 flex flex-col border-t border-zinc-900/80">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.num}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.05 }}
                  className="grid grid-cols-1 sm:grid-cols-12 py-7 border-b border-zinc-900/80 items-start gap-4 sm:gap-2 hover:bg-zinc-900/10 transition-colors"
                >
                  <div className="sm:col-span-2 font-mono text-xs text-zinc-600">
                    {f.num}
                  </div>
                  <div className="sm:col-span-4 text-sm font-medium text-zinc-200">
                    {f.name}
                  </div>
                  <div className="sm:col-span-6 text-xs text-zinc-500 leading-relaxed text-wrap-pretty">
                    {f.desc}
                  </div>
                </motion.div>
              ))}
            </div>

          </div>
        </section>

        {/* ─── How it works ─────────────────────────────────────────── */}
        <section id="how" className="px-6 sm:px-12 md:px-24 xl:px-48 py-28 border-t border-zinc-900/60">
          <div className="mb-16 text-left">
            <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-100 max-w-lg leading-tight text-wrap-balance">
              De cero a control total en tres pasos
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: i * 0.08 }}
                className="pt-6 border-t border-zinc-900/80 flex flex-col text-left"
              >
                <span className="font-mono text-xs text-zinc-600 mb-3">{step.number}</span>
                <h4 className="text-zinc-200 text-sm font-semibold mb-2">{step.title}</h4>
                <p className="text-zinc-500 text-xs leading-relaxed max-w-[240px] text-wrap-pretty">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─── Install / Downloads (Minimalist design) ────────────────── */}
        <section id="install" className="px-6 sm:px-12 md:px-24 xl:px-48 py-28 border-t border-zinc-900/40 relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
            
            {/* Info Column */}
            <div className="lg:col-span-5">
              <h2 className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-4">
                // PLATAFORMAS
              </h2>
              <h3 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-100 leading-tight">
                Descarga e instalación
              </h3>
              <p className="text-zinc-500 text-xs mt-3 leading-relaxed text-wrap-pretty">
                Obtén el ejecutable empaquetado para tu sistema. No se requiere registro, conexión a internet obligatoria, ni configuración de base de datos externa.
              </p>
            </div>

            {/* Downloads List Column */}
            <div className="lg:col-span-7 font-mono">
              <span className="text-[9px] text-zinc-600 uppercase tracking-widest block mb-6">// BINARIOS DISPONIBLES</span>
              
              <div className="flex flex-col divide-y divide-zinc-900/60">
                {DOWNLOADS.map(({ label, href }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group flex items-center justify-between py-3.5 hover:text-zinc-200 transition-colors"
                  >
                    <span className="text-zinc-400 text-xs sm:text-[13px] group-hover:text-zinc-200 transition-colors">
                      {label}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9.5px] text-zinc-600 uppercase tracking-wider group-hover:text-zinc-400 transition-colors">Descargar</span>
                      <ArrowRight
                        size={11}
                        className="text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-transform shrink-0"
                      />
                    </div>
                  </a>
                ))}
              </div>

              <div className="mt-8 flex justify-between items-center text-[10px] text-zinc-600 font-mono">
                <span>* MIT Licensed</span>
                <a href={RELEASES} target="_blank" rel="noopener noreferrer" className="hover:text-zinc-400 underline underline-offset-2">
                  GitHub Releases
                </a>
              </div>
            </div>

          </div>
        </section>

        {/* ─── FAQ Section (ServicesFAQ Accordions) ────────────────────── */}
        <section id="faq-section" className="px-6 sm:px-12 md:px-24 xl:px-48 py-28 border-t border-zinc-900/40 relative">
          <div className="max-w-2xl mx-auto divide-y divide-zinc-900/60">
            {FAQ_ITEMS.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="py-5">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-start justify-between gap-4 text-left group select-none cursor-pointer"
                  >
                    <span className="text-zinc-200 font-medium text-sm sm:text-[14px] group-hover:text-zinc-100 transition-colors leading-snug">
                      {item.q}
                    </span>
                    <span className="shrink-0 mt-0.5 text-zinc-500 group-hover:text-zinc-300 transition-colors">
                      {isOpen ? <Minus className="w-4 h-4 text-zinc-300" /> : <Plus className="w-4 h-4" />}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="answer"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="pt-3 text-zinc-400 text-xs sm:text-[12.5px] leading-relaxed text-wrap-pretty">{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── CTA Banner ───────────────────────────────────────────── */}
        <section className="px-6 sm:px-12 md:px-24 xl:px-48 py-20 border-t border-zinc-900/40">
          <div className="rounded-xl border border-zinc-900 bg-zinc-950/20 p-12 sm:p-16 text-center">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-4 text-zinc-100">
              Toma el control absoluto de tu patrimonio
            </h2>
            <p className="text-zinc-500 text-xs sm:text-sm max-w-md mx-auto mb-8 leading-relaxed text-wrap-pretty">
              Comienza hoy mismo con una base de datos local y privada. Sin registros obligatorios y con total soberanía.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={DL_WIN}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2 bg-zinc-100 text-zinc-950 rounded text-xs font-semibold hover:bg-zinc-200 transition-all active:scale-[0.98]"
              >
                <Download size={13} />
                Descargar Windows
              </a>
              <a
                href={GITHUB}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2 border border-zinc-800 text-zinc-300 rounded text-xs font-medium hover:border-zinc-700 hover:text-white transition-all bg-zinc-950/40 active:scale-[0.98]"
              >
                <Github size={13} />
                GitHub
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* ─── Footer ─────────────────────────────────────────────────── */}
      <footer className="border-t border-zinc-900/40 relative z-10 bg-zinc-950/10">
        <div className="px-6 sm:px-12 md:px-24 xl:px-48 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-12">
            
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-5 h-5 rounded bg-zinc-100 flex items-center justify-center">
                  <span className="text-zinc-950 text-[10px] font-bold">F</span>
                </div>
                <span className="font-mono text-[10.5px] tracking-[0.2em] text-zinc-300 font-semibold select-none">FINTRACK</span>
              </div>
              <p className="text-zinc-600 text-xs leading-relaxed max-w-xs text-wrap-pretty">
                Soberanía de datos financieros. Código abierto, privacidad absoluta y base de datos local SQLite.
              </p>
            </div>

            {/* Links */}
            <div>
              <p className="font-mono text-[9px] tracking-widest text-zinc-500 uppercase mb-4">// PRODUCTO</p>
              <div className="flex flex-col gap-2.5">
                {[
                  ["Funciones", "#features"],
                  ["Instalación", "#install"],
                  ["Cómo funciona", "#how"],
                ].map(([label, href]) => (
                  <a key={label} href={href} className="text-zinc-500 text-xs hover:text-zinc-300 transition-colors">
                    {label}
                  </a>
                ))}
              </div>
            </div>

            {/* Resources */}
            <div>
              <p className="font-mono text-[9px] tracking-widest text-zinc-500 uppercase mb-4">// RECURSOS</p>
              <div className="flex flex-col gap-2.5">
                {[
                  ["Repositorio GitHub", GITHUB, true],
                  ["Releases oficiales", RELEASES, true],
                  ["Documentación Técnica", "/docs", false],
                ].map(([label, href, external]) => (
                  <a
                    key={label as string}
                    href={href as string}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="text-zinc-500 text-xs hover:text-zinc-300 transition-colors"
                  >
                    {label as string}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-zinc-900/40 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="font-mono text-[9px] tracking-widest text-zinc-700">
              © 2026 FINTRACK - MIT LICENSE
            </span>
            <span className="font-mono text-[9px] tracking-widest text-zinc-700 uppercase">
              HECHO CON CUIDADO - CÓDIGO ABIERTO
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
