"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LegalPage() {
  return (
    <div className="grain min-h-screen bg-[#09090B] text-white antialiased" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@300;400;500&family=DM+Sans:ital,opsz,wght@0,9..40,100..900;1,9..40,300&display=swap');
        .grain::after {
          content: ''; position: fixed; inset: -200%; width: 400%; height: 400%;
          pointer-events: none; z-index: 250; opacity: .018;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.78' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 180px 180px;
        }
      `}</style>

      {/* Top bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800 bg-[#09090B]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-8 py-5">
          <Link href="/" className="flex items-center gap-3">
            <img src="/png.png" alt="FinTrack" className="h-5 w-5 object-contain" />
            <span className="font-mono text-[11px] tracking-[0.35em] text-[#FAFAF9]">FINTRACK</span>
          </Link>
          <Link href="/" className="group flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] text-zinc-600 transition-colors hover:text-zinc-200">
            <ArrowLeft size={11} className="transition-transform group-hover:-translate-x-0.5" />
            VOLVER
          </Link>
        </div>
      </nav>

      {/* Content */}
      <main className="mx-auto max-w-screen-md px-8 pb-32 pt-32">
        {/* Header */}
        <div className="mb-4 flex items-center gap-4">
          <div className="h-px w-5 bg-[#E8FF47]" />
          <span className="font-mono text-[9px] tracking-[0.42em] text-zinc-600">LEGAL</span>
        </div>
        <h1
          className="mb-12 text-white"
          style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(48px, 8vw, 80px)", letterSpacing: "0.02em", lineHeight: 0.95 }}
        >
          AVISO LEGAL
        </h1>

        <div className="space-y-10 text-sm font-light leading-relaxed text-zinc-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          <section>
            <h2 className="mb-4 font-mono text-[10px] tracking-[0.28em] text-zinc-300">1. INFORMACIÓN GENERAL</h2>
            <p>
              En cumplimiento de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y de Comercio Electrónico (LSSI-CE), le informamos que este sitio web es propiedad de FinTrack. El acceso a este sitio web y el uso de sus contenidos están sujetos a los términos y condiciones aquí descritos.
            </p>
          </section>

          <div className="h-px bg-zinc-800" />

          <section>
            <h2 className="mb-4 font-mono text-[10px] tracking-[0.28em] text-zinc-300">2. PROPIEDAD INTELECTUAL</h2>
            <p>
              Todos los contenidos de este sitio web, incluyendo textos, gráficos, imágenes, su diseño y los derechos de propiedad intelectual que pudieran corresponder, son propiedad de FinTrack o de terceros que han autorizado su uso. Queda prohibida su reproducción, distribución, comunicación pública o transformación sin la autorización expresa del titular.
            </p>
          </section>

          <div className="h-px bg-zinc-800" />

          <section>
            <h2 className="mb-4 font-mono text-[10px] tracking-[0.28em] text-zinc-300">3. LIMITACIÓN DE RESPONSABILIDAD</h2>
            <p>
              FinTrack no se hace responsable de los daños y perjuicios de cualquier naturaleza que pudieran derivarse de la utilización de este sitio web, incluyendo errores u omisiones en los contenidos, falta de disponibilidad del portal o la transmisión de virus o programas maliciosos.
            </p>
          </section>

          <div className="h-px bg-zinc-800" />

          <section>
            <h2 className="mb-4 font-mono text-[10px] tracking-[0.28em] text-zinc-300">4. PROTECCIÓN DE DATOS</h2>
            <p>
              De conformidad con lo dispuesto en el Reglamento (UE) 2016/679 del Parlamento Europeo y del Consejo (RGPD) y en la Ley Orgánica 3/2018 de Protección de Datos y Garantía de los Derechos Digitales (LOPDGDD), le informamos que los datos personales proporcionados a través de los formularios de este sitio web serán tratados con absoluta confidencialidad.
            </p>
            <p className="mt-3">
              Sus datos están protegidos mediante cifrado AES-256 y no son compartidos ni vendidos a terceros bajo ninguna circunstancia.
            </p>
          </section>

          <div className="h-px bg-zinc-800" />

          <section>
            <h2 className="mb-4 font-mono text-[10px] tracking-[0.28em] text-zinc-300">5. LEGISLACIÓN APLICABLE</h2>
            <p>
              Para la resolución de cualquier controversia que pudiera surgir en relación con el acceso o uso de este sitio web, se aplicará la legislación española, siendo competentes los Juzgados y Tribunales de Madrid.
            </p>
          </section>

          <div className="h-px bg-zinc-800" />

          <p className="font-mono text-[10px] tracking-[0.18em] text-zinc-700">
            ÚLTIMA ACTUALIZACIÓN · MARZO 2026
          </p>
        </div>
      </main>

      {/* Footer */}
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
            <Link href="/legal" className="font-mono text-[9px] tracking-[0.22em] text-zinc-400 transition-colors hover:text-zinc-200">LEGAL</Link>
            <Link href="/terms" className="font-mono text-[9px] tracking-[0.22em] text-zinc-700 transition-colors hover:text-zinc-400">TÉRMINOS</Link>
            <Link href="/cookies" className="font-mono text-[9px] tracking-[0.22em] text-zinc-700 transition-colors hover:text-zinc-400">COOKIES</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
