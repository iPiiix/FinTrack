"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import {
  BarChart2,
  Shield,
  Zap,
  TrendingUp,
  Globe,
  Lock,
  Activity,
  ChevronRight,
} from "lucide-react";

/* ============================================================
   GLOBAL STYLES + FONTS
============================================================ */
function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@300;400;500&family=DM+Sans:ital,opsz,wght@0,9..40,100..900;1,9..40,300&display=swap');

      :root {
        --bg: #09090B;
        --white: #FAFAF9;
        --accent: #E8FF47;
      }

      html { scroll-behavior: smooth; }
      body { background: var(--bg); }

      /* ── Ticker ── */
      @keyframes ticker {
        0%   { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
      .ticker-track { display: inline-block; animation: ticker 44s linear infinite; white-space: nowrap; }

      /* ── Ambient gradient drift ── */
      @keyframes ambientDrift1 {
        0%   { transform: translate(0, 0) scale(1); }
        33%  { transform: translate(60px, -40px) scale(1.05); }
        66%  { transform: translate(-30px, 30px) scale(0.97); }
        100% { transform: translate(0, 0) scale(1); }
      }
      @keyframes ambientDrift2 {
        0%   { transform: translate(0, 0) scale(1); }
        33%  { transform: translate(-50px, 50px) scale(1.03); }
        66%  { transform: translate(40px, -20px) scale(0.96); }
        100% { transform: translate(0, 0) scale(1); }
      }

      /* ── Scanline ── */
      @keyframes scanDown {
        0%   { transform: translateY(-2px); opacity: .4; }
        100% { transform: translateY(100vh); opacity: 0; }
      }

      /* ── Hero char animation ── */
      .hero-char {
        display: inline-block;
        opacity: 0;
        transform: translateY(80px) skewX(-6deg);
        transition: opacity .9s cubic-bezier(.16,1,.3,1), transform .9s cubic-bezier(.16,1,.3,1);
      }
      .hero-char.in { opacity: 1; transform: translateY(0) skewX(0deg); }

      /* ── Slogan word animation ── */
      .slogan-word {
        display: inline-block;
        opacity: 0;
        transform: translateY(28px);
        transition: opacity .7s cubic-bezier(.16,1,.3,1), transform .7s cubic-bezier(.16,1,.3,1);
      }
      .slogan-word.in { opacity: 1; transform: translateY(0); }

      /* ── Generic reveal ── */
      .reveal-up {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity .8s cubic-bezier(.16,1,.3,1), transform .8s cubic-bezier(.16,1,.3,1);
      }
      .reveal-up.in { opacity: 1; transform: translateY(0); }

      /* ── Line grow ── */
      .line-grow {
        transform: scaleX(0);
        transform-origin: left;
        transition: transform 1.1s cubic-bezier(.16,1,.3,1);
      }
      .line-grow.in { transform: scaleX(1); }

      /* ── Scroll indicator ── */
      @keyframes scrollLine {
        0%   { transform: translateY(-100%); }
        100% { transform: translateY(220%); }
      }

      /* ── Pulse ── */
      @keyframes pls { 0%,100%{opacity:1} 50%{opacity:.25} }

      /* ── Grain ── */
      .grain::after {
        content: '';
        position: fixed; inset: -200%;
        width: 400%; height: 400%;
        pointer-events: none; z-index: 250;
        opacity: .018;
        background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.78' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        background-size: 180px 180px;
        animation: grn .45s steps(1) infinite;
      }
      @keyframes grn {
        0%,100%{transform:translate(0,0)} 10%{transform:translate(-2%,-3%)} 20%{transform:translate(3%,2%)}
        30%{transform:translate(-1%,4%)} 40%{transform:translate(4%,-1%)} 50%{transform:translate(-3%,3%)}
        60%{transform:translate(2%,-4%)} 70%{transform:translate(-4%,1%)} 80%{transform:translate(1%,2%)} 90%{transform:translate(3%,-2%)}
      }

      /* ── Marquee ── */
      @keyframes marquee { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
      .marquee-inner { animation: marquee 22s linear infinite; display: inline-flex; align-items: baseline; white-space: nowrap; }

      /* ── Bento hover ── */
      .bcard { transition: border-color .3s ease, background .3s ease; }
      .bcard:hover { border-color: rgba(232,255,71,.22) !important; }

      /* ── Terminal row ── */
      .trow { transition: background .18s ease; }
      .trow:hover { background: rgba(232,255,71,.022); }
      .trow:hover .tick-label { color: #FAFAF9 !important; }

      /* ── Subtle grid line across whole page ── */
      .page-grid {
        background-image:
          linear-gradient(rgba(255,255,255,.008) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,.008) 1px, transparent 1px);
        background-size: 80px 80px;
      }

      /* ── Scrollbar ── */
      ::-webkit-scrollbar { width: 3px; }
      ::-webkit-scrollbar-track { background: var(--bg); }
      ::-webkit-scrollbar-thumb { background: #27272A; }

      /* ── Terminal grid responsive ── */
      .terminal-grid { display: grid; grid-template-columns: 1fr 1fr 70px; }
      @media (min-width: 768px) { .terminal-grid { grid-template-columns: 1fr 1fr 80px 80px 120px; } }
      .terminal-hide-mobile { display: none; }
      @media (min-width: 768px) { .terminal-hide-mobile { display: block; } }
      @media (min-width: 768px) { .terminal-hide-mobile.terminal-hide-flex { display: flex; } }
    `}</style>
  );
}

/* ============================================================
   TICKER
============================================================ */
function TickerBar() {
  const seg = "OWN YOUR FUTURE  •  KNOW YOUR NUMBERS  •  SEGUIMIENTO PATRIMONIAL  •  ANÁLISIS DE FLUJO DE CAJA  •  ASIGNACIÓN DE ACTIVOS  •  CIFRADO AES-256  •  GESTIÓN DE PORTFOLIO  •  ";
  return (
    <div className="fixed top-0 left-0 right-0 z-50 overflow-hidden border-b border-zinc-800/80 bg-[#09090B]/90 backdrop-blur-md py-2">
      <div className="ticker-track font-mono text-[10px] tracking-[0.28em] text-zinc-600">
        {seg.repeat(7)}
      </div>
    </div>
  );
}

/* ============================================================
   NAV
============================================================ */
function Nav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
  return (
    <nav
      className="fixed left-0 right-0 z-40 transition-all duration-700"
      style={{
        top: 33,
        background: scrolled ? "rgba(9,9,11,0.96)" : "transparent",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom: scrolled ? "1px solid #27272A" : "1px solid transparent",
      }}
    >
      <div className="mx-auto flex max-w-screen-xl items-center justify-between px-8 py-5">
        <div className="flex items-center gap-3">
          <img src="/png.png" alt="FinTrack" className="h-5 w-5 object-contain" />
          <span className="font-mono text-[11px] tracking-[0.35em] text-[#FAFAF9]">FINTRACK</span>
        </div>
        <div className="hidden items-center gap-12 md:flex">
          {[
            { label: "Funciones", href: "#capabilities" },
            { label: "Mercado", href: "#market" },
            { label: "Portfolio", href: "/portfolio" },
            { label: "Seguridad", href: "#security" },
          ].map((item) => (
            <a key={item.label} href={item.href}
              className="font-mono text-[10px] tracking-[0.22em] text-zinc-600 transition-colors duration-200 hover:text-zinc-200">
              {item.label.toUpperCase()}
            </a>
          ))}
        </div>
        <span className="flex items-center gap-2 border border-zinc-800 px-5 py-2.5 font-mono text-[10px] tracking-[0.18em] text-zinc-600 cursor-default">
          PRÓXIMAMENTE
          <span className="h-1.5 w-1.5 rounded-full bg-[#E8FF47]/50" style={{ animation: "pls 2s ease-in-out infinite" }} />
        </span>
      </div>
    </nav>
  );
}

/* ============================================================
   AMBIENT BACKGROUND — premium gradient mesh
============================================================ */
function AmbientBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden
    >
      {/* Primary accent glow — top right */}
      <div
        style={{
          position: "absolute",
          top: "5%",
          right: "10%",
          width: 700,
          height: 700,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(232,255,71,.06) 0%, transparent 65%)",
          filter: "blur(80px)",
          animation: "ambientDrift1 18s ease-in-out infinite",
        }}
      />
      {/* Secondary cool glow — bottom left */}
      <div
        style={{
          position: "absolute",
          bottom: "10%",
          left: "5%",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(120,160,255,.04) 0%, transparent 65%)",
          filter: "blur(80px)",
          animation: "ambientDrift2 22s ease-in-out infinite",
        }}
      />
      {/* Subtle diagonal gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "linear-gradient(135deg, rgba(232,255,71,.015) 0%, transparent 40%, transparent 60%, rgba(120,160,255,.01) 100%)",
        }}
      />
    </div>
  );
}

/* ============================================================
   HERO
============================================================ */
function Hero() {
  const parallaxRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 120);
    const t2 = setTimeout(() => setPhase(2), 380);
    const t3 = setTimeout(() => setPhase(3), 900);
    const t4 = setTimeout(() => setPhase(4), 1350);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (phase >= 2) document.querySelectorAll(".hero-char").forEach((el, i) =>
      setTimeout(() => el.classList.add("in"), i * 52));
    if (phase >= 3) document.querySelectorAll(".slogan-word").forEach((el, i) =>
      setTimeout(() => el.classList.add("in"), i * 65));
    if (phase >= 1) document.querySelectorAll(".line-grow").forEach(el => el.classList.add("in"));
    if (phase >= 4) document.querySelectorAll(".reveal-up").forEach((el, i) =>
      setTimeout(() => el.classList.add("in"), i * 85));
  }, [phase]);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (!parallaxRef.current) return;
    const mx = (e.clientX / window.innerWidth - .5) * 20;
    const my = (e.clientY / window.innerHeight - .5) * 10;
    parallaxRef.current.style.transform = `translate(${mx * .25}px, ${my * .25}px)`;
  }, []);

  const splitChars = (txt: string) =>
    txt.split("").map((ch, i) => (
      <span key={i} className="hero-char" style={{ transitionDelay: `${i * 52}ms` }}>{ch}</span>
    ));

  const sloganWords = (line: string, base = 0) =>
    line.split(" ").map((w, i) => (
      <span key={i} className="slogan-word" style={{ transitionDelay: `${base + i * 65}ms` }}>
        {w}{i < line.split(" ").length - 1 ? "\u00A0" : ""}
      </span>
    ));

  return (
    <section
      onMouseMove={onMouseMove}
      className="relative flex min-h-screen flex-col justify-end overflow-hidden px-10 pb-20 pt-28"
    >

      {/* ── Ambient gradient background ── */}
      <AmbientBackground />

      {/* ── Blurred background logo watermark ── */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden" aria-hidden>
        <img src="/png.png" alt="" style={{
          width: 600, height: 600, objectFit: "contain",
          opacity: 0.03, filter: "blur(40px)",
        }} />
      </div>

      {/* ── Subtle page grid ── */}
      <div className="pointer-events-none absolute inset-0 page-grid opacity-60" />

      {/* ── Scanning beam ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div style={{
          position: "absolute", left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, transparent, rgba(232,255,71,.05), transparent)",
          animation: "scanDown 11s linear infinite",
        }} />
      </div>

      {/* ── Corner crosshairs ── */}
      {([
        { top: "14%", left: "5%" },
        { top: "14%", right: "5%" },
        { bottom: "20%", left: "5%" },
        { bottom: "20%", right: "5%" },
      ] as React.CSSProperties[]).map((pos, i) => (
        <div key={i} className="pointer-events-none absolute" style={pos}>
          <div className="relative h-8 w-8 opacity-25">
            <div className="absolute left-0 top-1/2 h-px w-full bg-zinc-600" />
            <div className="absolute left-1/2 top-0 h-full w-px bg-zinc-600" />
            <div className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 bg-[#E8FF47]" />
          </div>
        </div>
      ))}

      {/* ── Vertical side label ── */}
      <div
        className="pointer-events-none absolute bottom-1/2 left-6 origin-center -rotate-90 font-mono text-[8px] tracking-[0.5em] text-zinc-800"
        style={{ whiteSpace: "nowrap" }}
      >
        FINTRACK · WEALTH OS · 2026
      </div>

      {/* ── Ghost outline behind title ── */}
      <div
        className="pointer-events-none absolute inset-0 flex items-end overflow-hidden pb-10 pl-8 select-none"
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(130px, 22vw, 320px)",
          letterSpacing: "-0.04em",
          lineHeight: .86,
          color: "transparent",
          WebkitTextStroke: "1px rgba(255,255,255,.022)",
        }}
      >
        FINTRACK
      </div>

      {/* ── Parallax content group ── */}
      <div ref={parallaxRef} className="relative z-10" style={{ transition: "transform .08s linear" }}>

        {/* Pre-label */}
        <div className="mb-6 flex items-center gap-4 reveal-up" style={{ transitionDelay: "0ms" }}>
          <div className="line-grow h-px w-10 bg-[#E8FF47]" />
          <span className="font-mono text-[10px] tracking-[0.4em] text-zinc-500">
            PLATAFORMA DE GESTIÓN FINANCIERA — v1.0
          </span>
        </div>

        {/* FINTRACK — giant */}
        <div
          className="overflow-hidden leading-none"
          style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(100px, 19vw, 270px)",
            letterSpacing: "-0.035em",
            lineHeight: .86,
            color: "#FAFAF9",
          }}
        >
          {splitChars("FINTRACK")}
        </div>

        {/* Slogan */}
        <div className="mt-5 overflow-hidden">
          <div style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: "clamp(26px, 4vw, 58px)",
            letterSpacing: "0.06em",
            lineHeight: 1,
            color: "#E8FF47",
          }}>
            {sloganWords("OWN YOUR FUTURE. KNOW YOUR NUMBERS.", 0)}
          </div>
        </div>
      </div>

      {/* ── Bottom row ── */}
      <div className="relative z-10 mt-14 flex flex-col items-start gap-10 md:flex-row md:items-end md:justify-between">

        {/* Description */}
        <div className="max-w-sm reveal-up" style={{ transitionDelay: "0ms" }}>
          <p className="font-light leading-relaxed text-zinc-500" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14 }}>
            Control financiero de nivel institucional para el inversor moderno. Unifica tu flujo de caja, analiza tu asignación de activos y domina tu contabilidad con total privacidad.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col items-end gap-3">
          <div className="flex items-center gap-3 reveal-up" style={{ transitionDelay: "90ms" }}>
            <span className="flex items-center gap-2.5 bg-zinc-900 border border-zinc-700 px-7 py-4 font-mono text-[10px] tracking-[0.22em] text-zinc-500 cursor-default">
              PRÓXIMAMENTE
              <span className="h-1.5 w-1.5 rounded-full bg-[#E8FF47]" style={{ animation: "pls 2s ease-in-out infinite" }} />
            </span>
            <a href="#capabilities" className="border border-zinc-700 px-7 py-4 font-mono text-[10px] tracking-[0.22em] text-zinc-500 transition-all duration-200 hover:border-zinc-500 hover:text-zinc-200">
              VER FUNCIONES
            </a>
          </div>
          <span className="reveal-up font-mono text-[9px] tracking-[0.2em] text-zinc-700" style={{ transitionDelay: "180ms" }}>
            LANZAMIENTO EN BREVE · MANTENTE ATENTO
          </span>
        </div>
      </div>

      {/* ── Bottom accent line ── */}
      <div
        className="pointer-events-none absolute bottom-0 left-10 right-10 h-px"
        style={{ background: "linear-gradient(90deg, #E8FF47, transparent)", opacity: .15 }}
      />

      {/* ── Scroll indicator ── */}
      <div
        className="reveal-up absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
        style={{ transitionDelay: "270ms" }}
      >
        <div className="h-10 w-px overflow-hidden bg-zinc-800">
          <div className="h-full w-full bg-zinc-500" style={{ animation: "scrollLine 2.2s ease-in-out infinite" }} />
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   ANIMATED NUMBER
============================================================ */
function AnimatedNumber({ value, prefix = "", suffix = "" }: { value: string; prefix?: string; suffix?: string }) {
  const [display, setDisplay] = useState("0");
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      obs.disconnect();
      const target = parseFloat(value.replace(/,/g, ""));
      const dur = 1600, start = performance.now();
      const animate = (now: number) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 4);
        const cur = target * eased;
        setDisplay(value.includes(",") ? Math.floor(cur).toLocaleString("en-US") : cur.toFixed(2));
        if (p < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }, { threshold: .35 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [value]);
  return <span ref={ref}>{prefix}{display}{suffix}</span>;
}

/* ============================================================
   STAT BLOCK
============================================================ */
function StatBlock({ value, label, prefix = "", suffix = "" }: { value: string; label: string; prefix?: string; suffix?: string }) {
  return (
    <div className="border-l border-zinc-800 pl-8">
      <div className="font-black text-white" style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(2.4rem,4.5vw,4rem)", letterSpacing: "-.01em", lineHeight: 1 }}>
        {prefix}<AnimatedNumber value={value} />{suffix}
      </div>
      <div className="mt-2 font-mono text-[10px] tracking-[0.28em] text-zinc-600">{label}</div>
    </div>
  );
}

/* ============================================================
   TERMINAL DATA — live feed
============================================================ */
const TERMINAL_SYMBOLS = [
  { symbol: "^GSPC", ticker: "SPX", name: "S&P 500", bar: 72 },
  { symbol: "AAPL", ticker: "AAPL", name: "Apple Inc.", bar: 48 },
  { symbol: "BTC-USD", ticker: "BTC", name: "Bitcoin/USD", bar: 88 },
  { symbol: "VOO", ticker: "VOO", name: "Vanguard S&P", bar: 61 },
  { symbol: "TSLA", ticker: "TSLA", name: "Tesla Inc.", bar: 35 },
];

interface LiveQuote {
  symbol: string; price: number; changePercent: number;
}

function useTerminalData() {
  const [data, setData] = useState<Record<string, LiveQuote>>({});
  const [updated, setUpdated] = useState<Date | null>(null);

  const load = useCallback(async () => {
    try {
      const syms = TERMINAL_SYMBOLS.map(s => s.symbol).join(",");
      const res = await fetch(`/api/quote?symbols=${syms}`);
      const json = await res.json();
      const map: Record<string, LiveQuote> = {};
      for (const q of json.quotes ?? []) map[q.symbol] = q;
      setData(map);
      setUpdated(new Date());
    } catch { /* silently fail */ }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 30_000);
    return () => clearInterval(id);
  }, [load]);

  return { data, updated };
}

function TerminalRow({ sym, i, quote }: {
  sym: typeof TERMINAL_SYMBOLS[0]; i: number; quote?: LiveQuote;
}) {
  const [vis, setVis] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const prevPrice = useRef<number | null>(null);
  const [flash, setFlash] = useState<"up" | "down" | null>(null);

  useEffect(() => {
    const t = setTimeout(() => {
      const obs = new IntersectionObserver(([e]) => {
        if (e.isIntersecting) { setVis(true); obs.disconnect(); }
      }, { threshold: .1 });
      if (ref.current) obs.observe(ref.current);
      return () => obs.disconnect();
    }, i * 75);
    return () => clearTimeout(t);
  }, [i]);

  // Flash animation when price changes
  useEffect(() => {
    if (!quote?.price) return;
    if (prevPrice.current !== null && prevPrice.current !== quote.price) {
      setFlash(quote.price > prevPrice.current ? "up" : "down");
      const t = setTimeout(() => setFlash(null), 800);
      return () => clearTimeout(t);
    }
    prevPrice.current = quote.price;
  }, [quote?.price]);

  const price = quote?.price ?? 0;
  const pct = quote?.changePercent ?? 0;
  const pos = pct >= 0;

  const fmtPrice = price === 0 ? "—" :
    price < 10 ? price.toFixed(4) :
      price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const fmtChg = price === 0 ? "—" :
    `${pos ? "+" : ""}${pct.toFixed(2)}%`;

  // Bar = 52-week position (if available) or abs(pct) capped
  const barPct = sym.bar;

  return (
    <div ref={ref} className="trow terminal-grid items-center border-b border-zinc-800/50 px-4 md:px-6 py-4"
      style={{
        opacity: vis ? 1 : 0,
        transform: vis ? "none" : "translateX(-10px)",
        transition: `opacity .55s ease ${i * 65}ms, transform .55s cubic-bezier(.16,1,.3,1) ${i * 65}ms`,
        background: flash === "up" ? "rgba(232,255,71,.04)" : flash === "down" ? "rgba(255,87,87,.04)" : undefined,
      }}>
      <div>
        <div className="tick-label font-mono text-[11px] font-medium tracking-[0.15em] text-zinc-400 transition-colors duration-200">
          {sym.ticker}
        </div>
        <div className="mt-0.5 font-mono text-[9px] tracking-wider text-zinc-700">{sym.name}</div>
      </div>
      <div
        className="font-mono text-sm tabular-nums"
        style={{ color: flash ? (flash === "up" ? "#E8FF47" : "#FF5757") : "#FAFAF9", transition: "color .4s ease" }}
      >
        {fmtPrice}
      </div>
      <div className="font-mono text-[11px] tabular-nums" style={{ color: pos ? "#E8FF47" : "#FF5757" }}>
        {fmtChg}
      </div>
      <div className="terminal-hide-mobile font-mono text-[10px] text-zinc-600">
        {price > 0 ? "Live" : "…"}
      </div>
      <div className="terminal-hide-mobile terminal-hide-flex items-center pr-2">
        <div className="flex-1 rounded-sm" style={{ height: 2, background: "#1c1c1e" }}>
          <div style={{
            width: vis ? `${barPct}%` : "0%", height: "100%",
            background: pos ? "#E8FF47" : "#FF5757", opacity: .65,
            transition: `width 1.3s cubic-bezier(.16,1,.3,1) ${650 + i * 90}ms`, borderRadius: 1,
          }} />
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   BENTO CARD
============================================================ */
function FeatureCard({ icon: Icon, label, title, description, accent, className = "" }: {
  icon: React.ElementType; label: string; title: string; description: string; accent?: boolean; className?: string;
}) {
  return (
    <div className={`bcard group relative flex flex-col justify-between overflow-hidden border p-9 ${accent ? "border-[#E8FF47] bg-[#E8FF47]" : "border-zinc-800 bg-[#0d0d10]"} ${className}`}>
      <div className={`absolute right-0 top-0 h-px w-12 transition-all duration-500 group-hover:w-24 ${accent ? "bg-black/15" : "bg-[#E8FF47]/15"}`} />
      <div className={`absolute right-0 top-0 h-12 w-px transition-all duration-500 group-hover:h-24 ${accent ? "bg-black/15" : "bg-[#E8FF47]/15"}`} />
      <div>
        <div className="mb-7 flex items-center gap-3">
          <Icon size={14} className={accent ? "text-black/50" : "text-zinc-600"} strokeWidth={1.5} />
          <span className={`font-mono text-[9px] tracking-[0.32em] ${accent ? "text-black/45" : "text-zinc-700"}`}>{label}</span>
        </div>
        <h3 className={`mb-3 leading-tight ${accent ? "text-black" : "text-white"}`}
          style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(18px,1.8vw,26px)", letterSpacing: "0.03em" }}>
          {title}
        </h3>
        <p className={`text-sm font-light leading-relaxed ${accent ? "text-black/55" : "text-zinc-600"}`} style={{ fontFamily: "'DM Sans',sans-serif" }}>
          {description}
        </p>
      </div>
      <div className="mt-8">
        <div className={`h-px transition-all duration-500 ${accent ? "w-8 bg-black/15 group-hover:w-16 group-hover:bg-black/30" : "w-8 bg-zinc-800 group-hover:w-16 group-hover:bg-[#E8FF47]/30"}`} />
      </div>
    </div>
  );
}

/* ============================================================
   SECTION LABEL
============================================================ */
function SectionLabel({ children }: { children: string }) {
  return (
    <div className="mb-12 flex items-center gap-4">
      <div className="h-px w-5 bg-[#E8FF47]" />
      <span className="font-mono text-[9px] tracking-[0.42em] text-zinc-600">{children}</span>
    </div>
  );
}

/* ============================================================
   PAGE
============================================================ */
export default function FinTrackLanding() {
  const { data: liveQuotes, updated } = useTerminalData();
  return (
    <div className="grain min-h-screen bg-[#09090B] text-white antialiased" style={{ fontFamily: "'DM Sans',sans-serif" }}>
      <GlobalStyles />
      <TickerBar />
      <Nav />

      <Hero />

      {/* ── STATS BAND ── */}
      <section id="security" className="border-y border-zinc-800 px-10 py-20">
        <div className="mx-auto max-w-screen-xl">
          <div className="grid grid-cols-2 gap-12 md:grid-cols-4">
            <StatBlock value="100" label="PROPIEDAD DE DATOS" suffix="%" />
            <StatBlock value="256" label="CIFRADO AES" suffix="-BIT" />
            <div className="border-l border-zinc-800 pl-8">
              <div className="font-black text-white" style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(2.4rem,4.5vw,4rem)", letterSpacing: "-.01em", lineHeight: 1 }}>
                0
              </div>
              <div className="mt-2 font-mono text-[10px] tracking-[0.28em] text-zinc-600">DATOS VENDIDOS A TERCEROS</div>
            </div>
            <StatBlock value="1" label="FUENTE DE VERDAD" />
          </div>
        </div>
      </section>

      {/* ── SCROLLING SLOGAN DIVIDER ── */}
      <div className="overflow-hidden border-b border-zinc-800/60 py-10">
        <div className="marquee-inner gap-24">
          {Array(8).fill(null).map((_, i) => (
            <span key={i} style={{
              fontFamily: "'Bebas Neue',sans-serif",
              fontSize: "clamp(52px,7vw,96px)",
              letterSpacing: "0.04em",
              color: i % 2 === 0 ? "#FAFAF9" : "transparent",
              WebkitTextStroke: i % 2 !== 0 ? "1.5px #252528" : undefined,
              paddingRight: 96,
            }}>
              OWN YOUR FUTURE · KNOW YOUR NUMBERS
            </span>
          ))}
        </div>
      </div>

      {/* ── TERMINAL DATA ── */}
      <section id="market" className="px-10 py-32">
        <div className="mx-auto max-w-screen-xl">
          <div className="grid grid-cols-1 gap-20 lg:grid-cols-[260px_1fr]">
            <div>
              <SectionLabel>INTEGRACIÓN DE MERCADO</SectionLabel>
              <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(44px,5vw,68px)", letterSpacing: ".02em", lineHeight: .95, color: "#FAFAF9" }}>
                TU PATRIMONIO<br />FRENTE AL<br />MERCADO.
              </h2>
              <p className="mt-6 text-sm font-light leading-relaxed text-zinc-600">
                Sigue tu asignación de activos junto a datos en tiempo real de renta variable global, materias primas y activos digitales.
              </p>
              <div className="mt-8 flex items-center gap-3">
                <div className="h-1.5 w-1.5 rounded-full bg-[#E8FF47]" style={{ animation: "pls 2s ease-in-out infinite" }} />
                <span className="font-mono text-[9px] tracking-[0.3em] text-zinc-700">VISTA DEMO PORTFOLIO</span>
              </div>
            </div>
            <div className="border border-zinc-800 bg-zinc-950">
              <div className="terminal-grid border-b border-zinc-800 bg-zinc-900/30 px-4 md:px-6 py-3">
                <span className="font-mono text-[8px] tracking-[0.35em] text-zinc-700">ACTIVO</span>
                <span className="font-mono text-[8px] tracking-[0.35em] text-zinc-700">PRECIO</span>
                <span className="font-mono text-[8px] tracking-[0.35em] text-zinc-700">VAR</span>
                <span className="terminal-hide-mobile font-mono text-[8px] tracking-[0.35em] text-zinc-700">FEED</span>
                <span className="terminal-hide-mobile font-mono text-[8px] tracking-[0.35em] text-zinc-700">ASIGNACIÓN</span>
              </div>
              {TERMINAL_SYMBOLS.map((sym, i) => (
                <TerminalRow key={sym.symbol} sym={sym} i={i} quote={liveQuotes[sym.symbol]} />
              ))}
              <div className="border-t border-zinc-800/50 px-4 md:px-6 py-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
                <span className="font-mono text-[8px] md:text-[9px] tracking-[0.2em] text-zinc-800">YAHOO FINANCE · DATOS DE MERCADO</span>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-[#E8FF47]" style={{ animation: "pls 2s ease-in-out infinite" }} />
                  <span className="font-mono text-[9px] tracking-[0.16em] text-zinc-800">
                    {updated ? `UPDATED ${updated.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}` : "CONNECTING…"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BENTO FEATURES ── */}
      <section id="capabilities" className="px-10 py-24">
        <div className="mx-auto max-w-screen-xl">
          <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <SectionLabel>FUNCIONALIDADES</SectionLabel>
              <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(44px,5.5vw,80px)", color: "#FAFAF9", letterSpacing: ".02em", lineHeight: .92 }}>
                TU VERDAD FINANCIERA.<br />POR FIN UNIFICADA.
              </h2>
            </div>
            <p className="max-w-xs text-sm font-light leading-relaxed text-zinc-600 md:text-right">
              Todas las herramientas que necesitas para controlar tu flujo de caja, analizar tu portfolio y proteger tus datos.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-px bg-zinc-800 md:grid-cols-3">
            <FeatureCard icon={Activity} label="LIBRO MAYOR" title="La fuente de verdad definitiva"
              description="Registra cada ingreso y gasto con precisión absoluta. Categoriza transacciones, gestiona múltiples cuentas y mantén un historial financiero impecable."
              accent className="md:col-span-2 md:row-span-2" />
            <FeatureCard icon={BarChart2} label="FLUJO DE CAJA" title="Controla tu tasa de gasto"
              description="Visualiza el capital entrante frente a los gastos salientes. Sigue tu tasa de ahorro mensual para alcanzar cada objetivo." />
            <FeatureCard icon={Globe} label="PORTFOLIO" title="Seguimiento de asignación de activos"
              description="Gestiona acciones, crypto, inmuebles y liquidez en un solo dashboard. Mira exactamente dónde está desplegado tu patrimonio." />
            <FeatureCard icon={TrendingUp} label="PATRIMONIO NETO" title="Visualiza tu trayectoria"
              description="Observa cómo crece tu patrimonio con el tiempo. Los gráficos históricos comparan periodos actuales con anteriores de forma fluida." />
            <FeatureCard icon={Zap} label="ENTRADA DE DATOS" title="Actualizaciones sin fricción"
              description="Un cajón de entrada rápida te permite registrar transacciones en segundos. Sin menús complejos, directo al registro." />
            <FeatureCard icon={Lock} label="SEGURIDAD" title="Cifrado AES-256"
              description="Tus datos están cifrados, son privados y nunca se venden. Tratamos tu historial financiero con seguridad de nivel institucional." />
            <FeatureCard icon={Shield} label="ANALÍTICAS" title="Análisis profundo de gastos"
              description="Desglose automático de tus principales gastos y fuentes de ingreso. Entiende exactamente a dónde va tu dinero cada mes."
              className="md:col-span-3" />
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative border-t border-zinc-800 px-10 py-40 overflow-hidden">
        {/* Large centered background logo */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden>
          <img src="/png.png" alt="" style={{
            width: 1400, height: 1400, objectFit: "contain",
            opacity: 0.025, filter: "blur(6px)",
          }} />
        </div>
        <div className="mx-auto max-w-screen-xl">
          <div className="relative overflow-hidden">
            <div className="pointer-events-none absolute -right-8 -bottom-12 select-none leading-none text-transparent"
              style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "28vw", WebkitTextStroke: "1px #17171a" }}>
              FT
            </div>
            <div className="relative z-10 flex flex-col gap-14 md:flex-row md:items-end md:justify-between">
              <div>
                <SectionLabel>EMPIEZA YA</SectionLabel>
                <h2 className="leading-none text-white"
                  style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(56px,11vw,150px)", letterSpacing: "-.02em" }}>
                  TOMA EL CONTROL<br />
                  <span style={{ color: "#E8FF47" }}>DE TU CAPITAL.</span>
                </h2>
              </div>
              <div className="flex flex-col gap-4">
                <span className="flex items-center justify-center gap-3 border border-zinc-700 px-9 py-5 font-mono text-[10px] tracking-[0.22em] text-zinc-500 cursor-default">
                  PRÓXIMAMENTE
                  <span className="h-1.5 w-1.5 rounded-full bg-[#E8FF47]" style={{ animation: "pls 2s ease-in-out infinite" }} />
                </span>
                <p className="font-mono text-center text-[9px] tracking-[0.18em] text-zinc-700">TE AVISAREMOS CUANDO ESTEMOS LISTOS</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-zinc-800 px-10 py-10">
        <div className="mx-auto flex max-w-screen-xl flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-3">
            <img src="/png.png" alt="FinTrack" className="h-4 w-4 object-contain" />
            <span className="font-mono text-[10px] tracking-[0.35em] text-zinc-600">FINTRACK</span>
          </div>
          <span className="font-mono text-[9px] tracking-[0.18em] text-zinc-800">
            © 2026 FINTRACK WEALTH OS · OWN YOUR FUTURE · KNOW YOUR NUMBERS
          </span>
          <div className="flex gap-8">
            <Link href="/legal" className="font-mono text-[9px] tracking-[0.22em] text-zinc-700 transition-colors hover:text-zinc-400">LEGAL</Link>
            <Link href="/terms" className="font-mono text-[9px] tracking-[0.22em] text-zinc-700 transition-colors hover:text-zinc-400">TÉRMINOS</Link>
            <Link href="/cookies" className="font-mono text-[9px] tracking-[0.22em] text-zinc-700 transition-colors hover:text-zinc-400">COOKIES</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}