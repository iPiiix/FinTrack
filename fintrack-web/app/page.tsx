"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Github, ArrowRight, Plus, Minus, ChevronRight } from "lucide-react";
import Link from "next/link";
import { AnimatePresence, motion, useInView } from "framer-motion";
import Grainient from "@/components/Grainient";

/*
  Design tokens — FinTrack landing
  Palette: cold-neutral off-black + single blue accent (#3B82F6).
  Type: Outfit (display) · Geist (body) · DM Mono (data).
  Signature: double-bezel product window in hero.
*/

const GITHUB = "https://github.com/iPiiix/FinTrack";
const DL_WIN =
  "https://github.com/iPiiix/FinTrack/releases/latest/download/FinTrack-Setup-1.0.0.exe";
const DL_ARM =
  "https://github.com/iPiiix/FinTrack/releases/latest/download/FinTrack-1.0.0-arm64.dmg";
const DL_X64 =
  "https://github.com/iPiiix/FinTrack/releases/latest/download/FinTrack-1.0.0.dmg";

const TICKERS = [
  "AAPL", "MSFT", "NVDA", "BTC-USD", "ETH-USD",
  "GOOGL", "META", "AMZN", "TSLA", "SPY",
];

const FEATURES = [
  {
    slug: "ledger",
    title: "Libro Mayor",
    body: "Partida doble con cuentas ilimitadas. Cada movimiento se reconcilia al centimo.",
    span: "md:col-span-2 md:row-span-2",
    img: "/assets/images/bento_ledger.png",
  },
  {
    slug: "cashflow",
    title: "Flujo de Caja",
    body: "Ingresos y gastos mes a mes. Tasa de ahorro calculada sin formulas manuales.",
    span: "md:col-span-1 md:row-span-1",
    img: "/assets/images/bento_cashflow.png",
  },
  {
    slug: "portfolio",
    title: "Portfolio",
    body: "Acciones, ETFs y cripto valorados en tiempo real via Yahoo Finance.",
    span: "md:col-span-1 md:row-span-2",
    img: "/assets/images/bento_portfolio.png",
  },
  {
    slug: "sqlite",
    title: "SQLite",
    body: "WAL mode. Un fichero. Tu disco. Consultable con cualquier herramienta SQL.",
    span: "md:col-span-1 md:row-span-1",
    img: "/assets/images/bento_sqlite.png",
  },
];

const FAQ = [
  {
    q: "Es gratuito?",
    a: "Completamente. Codigo abierto bajo MIT. Sin planes de pago, sin telemetria, sin monetizacion de ningun tipo.",
  },
  {
    q: "Donde se almacenan mis datos?",
    a: "En un fichero SQLite en tu disco duro. Ningun dato abandona tu maquina. La unica conexion externa es la consulta opcional de cotizaciones a Yahoo Finance.",
  },
  {
    q: "En que plataformas funciona?",
    a: "Windows x64 y macOS (Apple Silicon + Intel). Ejecutable nativo empaquetado con Electron, sin dependencias externas.",
  },
  {
    q: "Puedo exportar mis datos?",
    a: "CSV completo en un click. El fichero SQLite tambien es portable y legible con DB Browser, DBeaver o cualquier cliente SQL.",
  },
];

/* ─── Live Ticker ─── */

function LiveTicker() {
  const [quotes, setQuotes] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/quote?symbols=${TICKERS.join(",")}`)
      .then((r) => r.json())
      .then((d) => d.quotes && setQuotes(d.quotes))
      .catch(() => {});
  }, []);

  if (!quotes.length) return null;
  const doubled = [...quotes, ...quotes];

  return (
    <div
      className="w-full overflow-hidden border-y border-white/[0.03] py-3"
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 5%, black 95%, transparent)",
      }}
    >
      <style>{`@keyframes ticker{0%{transform:translateX(0)}100%{transform:translateX(-50%)}}`}</style>
      <div
        className="flex gap-10 whitespace-nowrap"
        style={{ animation: "ticker 55s linear infinite" }}
      >
        {doubled.map((q, i) => (
          <span
            key={`${q.symbol}-${i}`}
            className="inline-flex items-center gap-2 font-[var(--font-dm-mono)] text-[11px] tracking-wide shrink-0"
          >
            <span className="text-zinc-600">{q.symbol}</span>
            <span className="text-zinc-400 tabular-nums">
              ${q.price?.toFixed(2)}
            </span>
            <span
              className={`tabular-nums ${q.change >= 0 ? "text-emerald-500/70" : "text-red-400/70"}`}
            >
              {q.change >= 0 ? "+" : ""}
              {q.changePercent?.toFixed(2)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Scroll reveal (used on 3 sections only, not every element) ─── */

function Reveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Page ─── */

export default function Landing() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  return (
    <main className="w-full bg-[#08090A] text-[#E4E5E7] min-h-screen">

      {/* ═══ Nav ═══ */}
      <nav className="fixed top-5 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-6 bg-[#08090A]/70 backdrop-blur-xl border border-white/[0.06] rounded-full px-5 py-2.5 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image src="/favicon.png" alt="FinTrack" width={18} height={18} />
            <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-white">
              FinTrack
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-5">
            <a href="#producto" className="text-[10px] font-[var(--font-dm-mono)] tracking-widest uppercase text-zinc-500 hover:text-zinc-200 transition-colors duration-300">
              Producto
            </a>
            <a href="#install" className="text-[10px] font-[var(--font-dm-mono)] tracking-widest uppercase text-zinc-500 hover:text-zinc-200 transition-colors duration-300">
              Descargar
            </a>
            <Link href="/docs" className="text-[10px] font-[var(--font-dm-mono)] tracking-widest uppercase text-zinc-500 hover:text-zinc-200 transition-colors duration-300">
              Docs
            </Link>
            <a href={GITHUB} target="_blank" rel="noreferrer" className="text-zinc-600 hover:text-zinc-300 transition-colors" aria-label="GitHub">
              <Github size={14} />
            </a>
          </div>
        </div>
      </nav>

      {/* ═══ Hero — asymmetric split ═══ */}
      <section className="relative min-h-[100dvh] flex items-center px-6 sm:px-10 lg:px-20 pt-24 pb-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0 opacity-40">
          <Grainient
            color1="#08090A"
            color2="#1e3a8a"
            color3="#0F172A"
            timeSpeed={0.15}
            warpStrength={0.5}
            warpAmplitude={30}
            grainAmount={0.08}
            zoom={0.8}
          />
          {/* Top/bottom vignette to fade it into the solid bg smoothly */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#08090A] via-transparent to-[#08090A]" />
        </div>

        <div className="relative z-10 max-w-[960px] mx-auto w-full flex flex-col items-center text-center">

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-[10px] font-[var(--font-dm-mono)] tracking-[0.2em] uppercase text-zinc-400 mb-8"
          >
            Open source, local-first
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-[clamp(2.8rem,6vw,5.5rem)] font-bold tracking-[-0.04em] leading-[1.05] text-white mb-8"
          >
            Contabilidad personal
            <br />
            que no necesita internet.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-zinc-400 text-[clamp(15px,2vw,18px)] leading-relaxed max-w-[640px] mb-12"
          >
            Registra gastos, gestiona inversiones y consulta tu patrimonio en un motor SQLite sobre tu propio disco. Sin cuentas, sin servidores.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <a
              href="#install"
              className="group inline-flex items-center gap-2 px-7 py-4 bg-white text-[#08090A] rounded-full text-[12px] font-bold tracking-[0.06em] uppercase hover:bg-zinc-200 active:scale-[0.97] transition-all duration-300"
            >
              Descargar
              <span className="w-6 h-6 rounded-full bg-[#08090A]/[0.07] flex items-center justify-center group-hover:bg-[#08090A]/10 transition-colors">
                <ArrowRight size={13} />
              </span>
            </a>
            <a
              href={GITHUB}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-7 py-4 border border-white/[0.12] text-zinc-300 rounded-full text-[12px] font-bold tracking-[0.06em] uppercase hover:bg-white/[0.05] hover:text-white active:scale-[0.97] transition-all duration-300 backdrop-blur-sm"
            >
              <Github size={14} />
              Codigo fuente
            </a>
          </motion.div>
        </div>
      </section>

      {/* ═══ Ticker ═══ */}
      <LiveTicker />

      {/* ═══ Bento features ═══ */}
      <section id="producto" className="py-36 md:py-48 px-6 sm:px-10 lg:px-20">
        <div className="max-w-[1360px] mx-auto">
          <Reveal>
            <h2 className="text-[clamp(1.6rem,3.2vw,2.6rem)] font-bold tracking-[-0.03em] text-white leading-tight mb-3">
              Cuatro modulos, un fichero.
            </h2>
            <p className="text-zinc-500 text-[14px] max-w-md leading-relaxed mb-16">
              Todo lo que necesitas para gestionar tu dinero sin enviar un solo byte fuera de tu equipo.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-4 auto-rows-[200px] md:auto-rows-[240px] grid-flow-dense gap-2">
            {FEATURES.map((f) => (
              <Link
                key={f.slug}
                href={`/stack/${f.slug}`}
                className={`group relative block h-full overflow-hidden rounded-xl border border-white/[0.04] hover:border-white/[0.08] transition-colors duration-500 ${f.span}`}
              >
                <Image
                  src={f.img}
                  alt={f.title}
                  fill
                  className="object-cover opacity-20 group-hover:opacity-35 group-hover:scale-[1.02] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#08090A] via-[#08090A]/40 to-transparent" />
                <div className="absolute bottom-0 left-0 p-5 md:p-6 z-10">
                  <h3 className="text-[14px] font-bold text-white mb-1 flex items-center gap-1.5">
                    {f.title}
                    <ChevronRight
                      size={12}
                      className="text-zinc-700 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all duration-300"
                    />
                  </h3>
                  <p className="text-[12px] text-zinc-600 leading-relaxed max-w-[260px]">
                    {f.body}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Privacy block — full-width statement, no image ═══ */}
      <section className="py-36 md:py-48 px-6 sm:px-10 lg:px-20">
        <Reveal>
          <div className="max-w-[1360px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-16 items-start">
            <div>
              <h2 className="text-[clamp(1.6rem,3.2vw,2.6rem)] font-bold tracking-[-0.03em] text-white leading-tight">
                Tu informacion financiera
                <br />
                no es un producto.
              </h2>
            </div>
            <div className="space-y-6 text-zinc-500 text-[14px] leading-relaxed">
              <p>
                FinTrack empaqueta un servidor Next.js dentro de Electron. La base de datos SQLite vive en tu disco con WAL mode activado. La app arranca y funciona offline. No hay login, no hay onboarding, no hay telemetria.
              </p>
              <p>
                La unica conexion de red es la consulta de cotizaciones a Yahoo Finance, que ocurre por HTTPS directo sin intermediarios. Acciones, ETFs y cripto se valoran al precio de mercado. La conversion USD/EUR se resuelve localmente.
              </p>
              <p>
                El AI Advisor es opcional y requiere tu propia API Key de OpenAI. Solo transmite sumas por categoria, nunca transacciones individuales.
              </p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══ FAQ ═══ */}
      <section className="py-36 md:py-48 px-6 sm:px-10 lg:px-20">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl font-bold tracking-[-0.02em] text-white mb-10">
            Preguntas frecuentes
          </h2>
          <div className="divide-y divide-white/[0.04]">
            {FAQ.map((item, idx) => {
              const open = faqOpen === idx;
              return (
                <div
                  key={idx}
                  className="py-5 cursor-pointer group"
                  onClick={() => setFaqOpen(open ? null : idx)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <h4 className="text-[14px] font-medium text-zinc-400 group-hover:text-white transition-colors">
                      {item.q}
                    </h4>
                    <span className="shrink-0 w-6 h-6 rounded-full border border-white/[0.06] flex items-center justify-center text-zinc-700 group-hover:text-zinc-400 transition-colors">
                      {open ? <Minus size={11} /> : <Plus size={11} />}
                    </span>
                  </div>
                  <AnimatePresence>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <p className="pt-3 text-zinc-600 text-[13px] leading-relaxed pr-8">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ Install ═══ */}
      <section id="install" className="py-36 md:py-48 px-6 sm:px-10 lg:px-20">
        <Reveal>
          <div className="max-w-[1360px] mx-auto p-1.5 rounded-[1.25rem] bg-white/[0.02] ring-1 ring-white/[0.04]">
            <div className="rounded-[calc(1.25rem-6px)] bg-[#0C0D0F] p-10 md:p-16 lg:p-20 relative overflow-hidden">
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-[clamp(1.6rem,3vw,2.4rem)] font-bold tracking-[-0.03em] text-white mb-4 leading-tight">
                    Descarga e instala
                    <br />
                    en menos de un minuto.
                  </h2>
                  <p className="text-zinc-500 text-[14px] leading-relaxed mb-10">
                    Sin formularios, sin tarjeta de credito. Un ejecutable que funciona el dia que dejan de existir los servidores.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <a
                      href={DL_WIN}
                      className="px-6 py-3.5 bg-white text-[#08090A] font-bold text-[11px] tracking-[0.06em] uppercase rounded-lg hover:bg-zinc-200 active:scale-[0.97] transition-all duration-300 text-center"
                    >
                      Windows
                    </a>
                    <a
                      href={DL_ARM}
                      className="px-6 py-3.5 border border-white/[0.06] text-zinc-500 font-bold text-[11px] tracking-[0.06em] uppercase rounded-lg hover:bg-white/[0.03] active:scale-[0.97] transition-all duration-300 text-center"
                    >
                      Apple Silicon
                    </a>
                    <a
                      href={DL_X64}
                      className="px-6 py-3.5 border border-white/[0.06] text-zinc-500 font-bold text-[11px] tracking-[0.06em] uppercase rounded-lg hover:bg-white/[0.03] active:scale-[0.97] transition-all duration-300 text-center"
                    >
                      Intel Mac
                    </a>
                  </div>
                </div>

                <div className="hidden lg:block rounded-xl overflow-hidden border border-white/[0.04]">
                  <Image
                    src="/assets/images/bento_portfolio.png"
                    alt="Vista del portfolio en FinTrack"
                    width={640}
                    height={400}
                    className="w-full h-auto opacity-50"
                  />
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ═══ Docs link ═══ */}
      <section className="pb-36 px-6 sm:px-10 lg:px-20">
        <div className="max-w-[1360px] mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-7 border-t border-white/[0.04]">
          <div>
            <h3 className="text-base font-bold text-white mb-0.5">Documentacion</h3>
            <p className="text-zinc-700 text-[13px]">Arquitectura, almacenamiento local y desarrollo.</p>
          </div>
          <Link
            href="/docs"
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-white text-[11px] font-[var(--font-dm-mono)] tracking-wider uppercase transition-colors duration-300"
          >
            Leer docs
            <ArrowRight size={12} />
          </Link>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="py-7 border-t border-white/[0.03] px-6 sm:px-10 lg:px-20">
        <div className="max-w-[1360px] mx-auto flex flex-col md:flex-row justify-between items-center gap-3">
          <span className="text-[10px] font-[var(--font-dm-mono)] uppercase tracking-widest text-zinc-800">
            FinTrack {new Date().getFullYear()}
          </span>
          <div className="flex gap-5">
            <a href={GITHUB} target="_blank" rel="noreferrer" className="text-[10px] font-[var(--font-dm-mono)] uppercase tracking-widest text-zinc-800 hover:text-zinc-500 transition-colors">
              GitHub
            </a>
            <Link href="/docs" className="text-[10px] font-[var(--font-dm-mono)] uppercase tracking-widest text-zinc-800 hover:text-zinc-500 transition-colors">
              Docs
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
