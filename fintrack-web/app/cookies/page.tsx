"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CookiesPage() {
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
        <div className="mb-4 flex items-center gap-4">
          <div className="h-px w-5 bg-[#E8FF47]" />
          <span className="font-mono text-[9px] tracking-[0.42em] text-zinc-600">PRIVACY</span>
        </div>
        <h1
          className="mb-12 text-white"
          style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(48px, 8vw, 80px)", letterSpacing: "0.02em", lineHeight: 0.95 }}
        >
          POLÍTICA DE COOKIES
        </h1>

        <div className="space-y-10 text-sm font-light leading-relaxed text-zinc-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          <section>
            <h2 className="mb-4 font-mono text-[10px] tracking-[0.28em] text-zinc-300">1. ¿QUÉ SON LAS COOKIES?</h2>
            <p>
              Las cookies son pequeños archivos de texto que se almacenan en su dispositivo cuando visita un sitio web. Se utilizan ampliamente para hacer que los sitios web funcionen de manera más eficiente, así como para proporcionar información a los propietarios del sitio.
            </p>
          </section>

          <div className="h-px bg-zinc-800" />

          <section>
            <h2 className="mb-4 font-mono text-[10px] tracking-[0.28em] text-zinc-300">2. COOKIES QUE UTILIZAMOS</h2>
            <div className="overflow-hidden border border-zinc-800">
              <div className="grid grid-cols-3 border-b border-zinc-800 bg-zinc-900/50 px-5 py-3">
                <span className="font-mono text-[9px] tracking-[0.2em] text-zinc-600">TIPO</span>
                <span className="font-mono text-[9px] tracking-[0.2em] text-zinc-600">DURACIÓN</span>
                <span className="font-mono text-[9px] tracking-[0.2em] text-zinc-600">FINALIDAD</span>
              </div>
              {[
                { type: "SESIÓN", dur: "Sesión", desc: "Mantener su sesión activa mientras navega" },
                { type: "AUTENTICACIÓN", dur: "30 min", desc: "Almacenar token JWT para acceso seguro" },
                { type: "PREFERENCIAS", dur: "1 año", desc: "Recordar sus preferencias de interfaz" },
              ].map((c) => (
                <div key={c.type} className="grid grid-cols-3 border-b border-zinc-800/60 px-5 py-3.5 last:border-0">
                  <span className="font-mono text-[10px] text-zinc-300">{c.type}</span>
                  <span className="font-mono text-[10px] text-zinc-600">{c.dur}</span>
                  <span className="text-[12px] text-zinc-500">{c.desc}</span>
                </div>
              ))}
            </div>
          </section>

          <div className="h-px bg-zinc-800" />

          <section>
            <h2 className="mb-4 font-mono text-[10px] tracking-[0.28em] text-zinc-300">3. COOKIES DE TERCEROS</h2>
            <p>
              FinTrack no utiliza cookies de seguimiento de terceros, cookies publicitarias ni cookies analíticas de terceros. Respetamos su privacidad y no compartimos información de navegación con ningún proveedor externo.
            </p>
          </section>

          <div className="h-px bg-zinc-800" />

          <section>
            <h2 className="mb-4 font-mono text-[10px] tracking-[0.28em] text-zinc-300">4. GESTIÓN DE COOKIES</h2>
            <p>
              Puede configurar su navegador para rechazar cookies o para que le avise cuando se envíe una cookie. Sin embargo, si rechaza las cookies de sesión o autenticación, es posible que no pueda utilizar algunas funciones de la plataforma.
            </p>
            <div className="mt-4 border border-zinc-800 bg-zinc-900/30 p-5">
              <span className="font-mono text-[9px] tracking-[0.2em] text-zinc-600">NAVEGADORES COMPATIBLES</span>
              <div className="mt-3 flex flex-wrap gap-3">
                {["Chrome", "Firefox", "Safari", "Edge"].map((b) => (
                  <span key={b} className="border border-zinc-800 px-3 py-1.5 font-mono text-[10px] text-zinc-400">{b}</span>
                ))}
              </div>
            </div>
          </section>

          <div className="h-px bg-zinc-800" />

          <section>
            <h2 className="mb-4 font-mono text-[10px] tracking-[0.28em] text-zinc-300">5. ACTUALIZACIONES</h2>
            <p>
              Esta política de cookies puede ser actualizada periódicamente para reflejar cambios en nuestras prácticas o por motivos operativos, legales o regulatorios. Le recomendamos revisar esta página periódicamente.
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
            <Link href="/legal" className="font-mono text-[9px] tracking-[0.22em] text-zinc-700 transition-colors hover:text-zinc-400">LEGAL</Link>
            <Link href="/terms" className="font-mono text-[9px] tracking-[0.22em] text-zinc-700 transition-colors hover:text-zinc-400">TÉRMINOS</Link>
            <Link href="/cookies" className="font-mono text-[9px] tracking-[0.22em] text-zinc-400 transition-colors hover:text-zinc-200">COOKIES</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
