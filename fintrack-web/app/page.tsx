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
  Smartphone
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

      /* ── Floating particles ── */
      @keyframes floatUp1 {
        0%   { transform: translateY(100vh) translateX(0); opacity: 0; }
        10%  { opacity: 1; }
        90%  { opacity: 1; }
        100% { transform: translateY(-20vh) translateX(40px); opacity: 0; }
      }
      @keyframes floatUp2 {
        0%   { transform: translateY(100vh) translateX(0); opacity: 0; }
        10%  { opacity: .7; }
        90%  { opacity: .7; }
        100% { transform: translateY(-20vh) translateX(-30px); opacity: 0; }
      }
      @keyframes floatUp3 {
        0%   { transform: translateY(100vh) translateX(0); opacity: 0; }
        10%  { opacity: .5; }
        90%  { opacity: .5; }
        100% { transform: translateY(-20vh) translateX(20px); opacity: 0; }
      }

      /* ── Aurora blobs ── */
      @keyframes auroraBlob1 {
        0%,100% { transform: translate(0, 0) scale(1); border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%; }
        33%     { transform: translate(60px, -40px) scale(1.08); border-radius: 50% 40% 60% 50% / 60% 40% 50% 60%; }
        66%     { transform: translate(-30px, 30px) scale(.95); border-radius: 60% 50% 40% 60% / 50% 60% 40% 50%; }
      }
      @keyframes auroraBlob2 {
        0%,100% { transform: translate(0, 0) scale(1); border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
        33%     { transform: translate(-50px, 50px) scale(1.1); border-radius: 40% 60% 50% 40% / 50% 60% 40% 60%; }
        66%     { transform: translate(40px, -20px) scale(.92); border-radius: 50% 50% 60% 40% / 40% 50% 50% 60%; }
      }
      @keyframes auroraBlob3 {
        0%,100% { transform: translate(0, 0); border-radius: 50% 60% 40% 70% / 50% 40% 60% 50%; }
        50%     { transform: translate(-40px, 60px); border-radius: 40% 50% 60% 40% / 60% 50% 40% 50%; }
      }

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
            { label: "Manifiesto", href: "#manifesto" },
            { label: "Funciones", href: "#capabilities" },
            { label: "Mercado", href: "#market" },
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
      className="relative flex min-h-screen flex-col justify-end overflow-hidden px-5 pb-20 pt-28 md:px-10"
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

      {/* ── Floating particles ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {[
          { left: "12%", size: 3, dur: "18s", delay: "0s", anim: "floatUp1" },
          { left: "28%", size: 2, dur: "22s", delay: "4s", anim: "floatUp2" },
          { left: "45%", size: 2.5, dur: "20s", delay: "8s", anim: "floatUp3" },
          { left: "62%", size: 2, dur: "24s", delay: "2s", anim: "floatUp1" },
          { left: "78%", size: 3, dur: "19s", delay: "6s", anim: "floatUp2" },
          { left: "90%", size: 1.5, dur: "21s", delay: "10s", anim: "floatUp3" },
          { left: "5%", size: 1.5, dur: "25s", delay: "12s", anim: "floatUp1" },
          { left: "55%", size: 2, dur: "23s", delay: "14s", anim: "floatUp2" },
        ].map((p, i) => (
          <div key={i} style={{
            position: "absolute",
            left: p.left,
            bottom: 0,
            width: p.size,
            height: p.size,
            borderRadius: "50%",
            background: i % 3 === 0 ? "#E8FF47" : "rgba(250,250,249,.4)",
            animation: `${p.anim} ${p.dur} linear ${p.delay} infinite`,
          }} />
        ))}
      </div>

      {/* ── Aurora blobs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {/* Blob 1 — large accent, drifts right */}
        <div style={{
          position: "absolute",
          top: "20%", left: "55%",
          width: 700, height: 700,
          borderRadius: "40% 60% 70% 30% / 40% 50% 60% 50%",
          background: "radial-gradient(circle, rgba(232,255,71,.07) 0%, transparent 70%)",
          filter: "blur(80px)",
          animation: "auroraBlob1 20s ease-in-out infinite",
        }} />
        {/* Blob 2 — cool tone, drifts left */}
        <div style={{
          position: "absolute",
          top: "50%", left: "25%",
          width: 500, height: 500,
          borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
          background: "radial-gradient(circle, rgba(139,92,246,.05) 0%, transparent 70%)",
          filter: "blur(80px)",
          animation: "auroraBlob2 25s ease-in-out infinite",
        }} />
        {/* Blob 3 — small accent highlight */}
        <div style={{
          position: "absolute",
          top: "35%", left: "65%",
          width: 300, height: 300,
          borderRadius: "50% 60% 40% 70% / 50% 40% 60% 50%",
          background: "radial-gradient(circle, rgba(232,255,71,.04) 0%, transparent 70%)",
          filter: "blur(60px)",
          animation: "auroraBlob3 18s ease-in-out infinite",
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
        className="pointer-events-none absolute inset-0 flex items-end overflow-hidden pb-10 pl-5 select-none md:pl-8"
        style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "clamp(80px, 22vw, 320px)",
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
            fontSize: "clamp(70px, 19vw, 270px)",
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
            fontSize: "clamp(22px, 4vw, 58px)",
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
        className="pointer-events-none absolute bottom-0 left-5 right-5 h-px md:left-10 md:right-10"
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
   VIDEO MANIFESTO
============================================================ */
function ScrollManifesto() {
  const containerRef = useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      const { top, height } = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      const scrollableDistance = height - windowHeight;
      if (scrollableDistance <= 0) return;
      
      // Calculate progress between 0 and 1
      let progress = -top / scrollableDistance;
      progress = Math.max(0, Math.min(1, progress));
      
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Trigger once on mount to set initial state
    handleScroll();
    
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Progress logic for animations
  // Phase 1 (0 to 0.4): WASTE fades out and shrinks
  const wasteOpacity = Math.max(0, 1 - (scrollProgress / 0.4));
  const wasteScale = 1 - (scrollProgress * 0.15); // shrinks from 1 to 0.85
  
  // Phase 2 (0.3 to 0.8): WEALTH fades in and scales up
  const wealthOpacity = scrollProgress < 0.3 ? 0 : Math.min(1, (scrollProgress - 0.3) / 0.5);
  const wealthScale = scrollProgress < 0.3 ? 0.85 : 0.85 + ((scrollProgress - 0.3) / 0.5) * 0.15; // grows to 1.0
  
  // Phase 3 (0.7 to 1.0): Subtitle fades in
  const subtitleOpacity = scrollProgress < 0.7 ? 0 : Math.min(1, (scrollProgress - 0.7) / 0.3);

  return (
    <section 
      id="manifesto" 
      ref={containerRef}
      className="relative bg-[#09090B]"
      style={{ height: "300vh" }}
    >
      {/* Sticky container that stays in view while scrolling the 300vh section */}
      <div className="sticky top-0 flex h-screen w-full flex-col items-center justify-center overflow-hidden">
        
        {/* Subtle radial gradient background */}
        <div className="pointer-events-none absolute inset-0" style={{
          background: "radial-gradient(circle at center, rgba(39,39,42,0.4) 0%, rgba(9,9,11,1) 60%)",
        }} />

        {/* Pre-label */}
        <div className="absolute top-32 flex items-center justify-center gap-4 z-10 transition-opacity duration-75" 
             style={{ opacity: Math.max(0, 1 - scrollProgress * 5) }}>
          <div className="h-px w-10 bg-zinc-700" />
          <span className="font-mono text-[9px] tracking-[0.42em] text-zinc-600">MANIFIESTO</span>
          <div className="h-px w-10 bg-zinc-700" />
        </div>

        {/* Interactive Typography Centerpiece */}
        <div className="relative z-10 flex h-[400px] w-full items-center justify-center"
             style={{ fontFamily: "'Bebas Neue', sans-serif", lineHeight: 0.85, letterSpacing: "-0.01em" }}>
             
          {/* "WASTE" State */}
          <div className="absolute flex items-center justify-center w-full transition-transform duration-75 ease-out"
               style={{ 
                 opacity: wasteOpacity, 
                 transform: `scale(${wasteScale}) translateY(${scrollProgress * -30}px)` 
               }}>
            <span style={{
              fontSize: "clamp(60px, 22vw, 320px)",
              color: "transparent",
              WebkitTextStroke: "2px rgba(255,255,255,0.15)",
              textShadow: "0 10px 30px rgba(0,0,0,0.5)"
            }}>WASTE</span>
          </div>
          
          {/* "WEALTH" State */}
          <div className="absolute flex items-center justify-center w-full transition-transform duration-75 ease-out"
               style={{ 
                 opacity: wealthOpacity, 
                 transform: `scale(${wealthScale})`,
                 filter: `blur(${Math.max(0, (1 - wealthOpacity) * 8)}px)`
               }}>
            <span style={{
              fontSize: "clamp(60px, 22vw, 320px)",
              color: "#E8FF47",
              textShadow: `0 0 ${wealthOpacity * 60}px rgba(232, 255, 71, 0.4)`
            }}>WEALTH</span>
          </div>

        </div>

        {/* Final Conclusion / Subtitle */}
        <div className="absolute bottom-24 z-10 px-8 text-center transition-opacity duration-75 ease-out w-full"
             style={{ opacity: subtitleOpacity, transform: `translateY(${(1 - subtitleOpacity) * 30}px)` }}>
          <p className="mx-auto max-w-lg" style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: "clamp(15px, 1.5vw, 19px)",
            fontWeight: 300,
            lineHeight: 1.6,
            color: "#A1A1AA",
            letterSpacing: "0.01em",
          }}>
            Every transaction is a decision. <br className="hidden md:block" />
            <span className="text-white mt-1 inline-block">Every decision builds your future.</span>
          </p>
          
          {/* Accent line */}
          <div className="mx-auto mt-8" style={{
            width: 60 * subtitleOpacity,
            height: 1,
            background: "#E8FF47",
            opacity: 0.5,
          }} />
        </div>
        
      </div>
    </section>
  );
}

/* ============================================================
   HOW IT WORKS
============================================================ */
function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const steps = [
    { num: "01", icon: Activity, title: "REGISTRA", desc: "Añade tus cuentas, ingresos y gastos en segundos. Un cajón de entrada rápida diseñado para cero fricción." },
    { num: "02", icon: BarChart2, title: "ANALIZA", desc: "Visualiza tu flujo de caja, patrimonio neto y asignación de activos con gráficos en tiempo real." },
    { num: "03", icon: TrendingUp, title: "DOMINA", desc: "Toma decisiones financieras informadas con datos reales. Tu dinero, tu sistema, tu futuro." },
  ];

  return (
    <section ref={ref} className="border-t border-zinc-800 px-5 py-32 md:px-10">
      <div className="mx-auto max-w-screen-xl">
        <SectionLabel>CÓMO FUNCIONA</SectionLabel>
        <h2 className="mb-20" style={{
          fontFamily: "'Bebas Neue',sans-serif",
          fontSize: "clamp(40px,5vw,72px)",
          letterSpacing: ".02em",
          lineHeight: .92,
          color: "#FAFAF9",
        }}>
          TRES PASOS.<br />
          <span style={{ color: "#E8FF47" }}>SIN COMPLEJIDAD.</span>
        </h2>

        <div className="grid grid-cols-1 gap-px md:grid-cols-3" style={{ background: "#27272A" }}>
          {steps.map((step, i) => (
            <div key={step.num}
              className="bg-[#09090B] p-10 md:p-12"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "none" : "translateY(24px)",
                transition: `opacity 0.8s ease ${i * 150}ms, transform 0.8s cubic-bezier(.16,1,.3,1) ${i * 150}ms`,
              }}
            >
              <div className="mb-8 flex items-center gap-4">
                <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(44px,4vw,56px)", letterSpacing: "-0.02em", lineHeight: 1, color: "#27272A" }}>
                  {step.num}
                </span>
                <div className="h-px flex-1 bg-zinc-800" />
                <step.icon size={14} className="text-zinc-700" strokeWidth={1.5} />
              </div>
              <h3 className="mb-4" style={{
                fontFamily: "'Bebas Neue',sans-serif",
                fontSize: "clamp(22px,2vw,30px)",
                letterSpacing: "0.04em",
                color: i === 2 ? "#E8FF47" : "#FAFAF9",
              }}>
                {step.title}
              </h3>
              <p className="text-sm font-light leading-relaxed text-zinc-600" style={{ fontFamily: "'DM Sans',sans-serif" }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================
   EARLY ACCESS FORM
============================================================ */
function EarlyAccessForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) return;
    const existing = JSON.parse(localStorage.getItem("fintrack_waitlist") || "[]");
    existing.push({ email, date: new Date().toISOString() });
    localStorage.setItem("fintrack_waitlist", JSON.stringify(existing));
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 border border-[#E8FF47]/20 bg-[#E8FF47]/[0.03] px-9 py-6">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-[#E8FF47]" />
          <span className="font-mono text-[11px] tracking-[0.22em] text-[#E8FF47]">REGISTRADO</span>
        </div>
        <p className="font-mono text-center text-[9px] tracking-[0.18em] text-zinc-500">TE NOTIFICAREMOS EN EL LANZAMIENTO</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            className="flex-1 border border-zinc-700 border-r-0 bg-zinc-950 px-5 py-4 font-mono text-[11px] tracking-[0.1em] text-zinc-300 outline-none transition-colors placeholder:text-zinc-700 focus:border-zinc-500 md:min-w-[260px]"
          />
          <button
            type="submit"
            className="flex items-center gap-2 bg-[#E8FF47] px-7 py-4 font-mono text-[10px] font-bold tracking-[0.22em] text-black transition-all duration-200 hover:bg-[#d4eb3a] active:scale-[0.98]"
          >
            EARLY ACCESS
            <ChevronRight size={12} />
          </button>
        </div>
        <p className="font-mono text-center text-[9px] tracking-[0.18em] text-zinc-700">
          ACCESO ANTICIPADO · SIN SPAM · SOLO NOVEDADES
        </p>
      </form>
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
      <section id="security" className="border-y border-zinc-800 px-5 py-20 md:px-10">
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

      {/* ── SCROLL MANIFESTO ── */}
      <ScrollManifesto />

      {/* ── TERMINAL DATA ── */}
      <section id="market" className="px-5 py-32 md:px-10">
        <div className="mx-auto max-w-screen-xl">
          <div className="grid grid-cols-1 gap-20 lg:grid-cols-[260px_1fr]">
            <div>
              <SectionLabel>INTEGRACIÓN DE MERCADO</SectionLabel>
              <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(40px,5vw,68px)", letterSpacing: ".02em", lineHeight: .95, color: "#FAFAF9" }}>
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
            {/* Terminal Container - Scrollable on Mobile */}
            <div className="border border-zinc-800 bg-zinc-950 overflow-x-auto">
              <div className="min-w-[500px] md:min-w-0">
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
        </div>
      </section>

      {/* ── BENTO FEATURES ── */}
      <section id="capabilities" className="px-5 py-24 md:px-10">
        <div className="mx-auto max-w-screen-xl">
          <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <SectionLabel>FUNCIONALIDADES</SectionLabel>
              <h2 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(40px,5.5vw,80px)", color: "#FAFAF9", letterSpacing: ".02em", lineHeight: .92 }}>
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

      {/* ── HOW IT WORKS ── */}
      <HowItWorks />

      {/* ── CTA ── */}
      <section className="relative border-t border-zinc-800 px-5 py-40 overflow-hidden md:px-10">
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
              <div className="flex flex-col items-start gap-8 md:items-end">
                <EarlyAccessForm />
                
                {/* 
                  TODO: PWA Implementation Steps for the future:
                  1. Install `next-pwa` (npm i next-pwa)
                  2. Wrap your next.config.js with withPWA()
                  3. Generate a `manifest.json` in the /public folder (with icons, theme_color #09090B, name "FinTrack", etc.)
                  4. The browser will then automatically prompt users to "Install App" on iOS Safari / Android Chrome.
                */}
                <div className="flex items-center gap-3 rounded-full border border-zinc-800 bg-[#09090B] px-5 py-2.5 transition-colors hover:border-zinc-700">
                  <div className="flex items-center justify-center rounded-full bg-zinc-900 p-1.5">
                    <Smartphone size={14} className="text-zinc-400" />
                  </div>
                  <span className="font-mono text-[10px] tracking-[0.15em] text-zinc-400">
                    PRONTO EN iOS & ANDROID <span className="text-zinc-600">(PWA)</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-zinc-800 px-5 py-10 md:px-10">
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