"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsPage() {
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
            <img src="/unnamed.jpg" alt="FinTrack" className="h-5 w-5 object-contain" />
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
          <span className="font-mono text-[9px] tracking-[0.42em] text-zinc-600">ACUERDO</span>
        </div>
        <h1
          className="mb-12 text-white"
          style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(48px, 8vw, 80px)", letterSpacing: "0.02em", lineHeight: 0.95 }}
        >
          TÉRMINOS DE SERVICIO
        </h1>

        <div className="space-y-10 text-sm font-light leading-relaxed text-zinc-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          <section>
            <h2 className="mb-4 font-mono text-[10px] tracking-[0.28em] text-zinc-300">1. ACEPTACIÓN DE LOS TÉRMINOS</h2>
            <p>
              Al acceder y utilizar la plataforma FinTrack, usted acepta estar sujeto a estos Términos de Servicio. Si no está de acuerdo con alguno de estos términos, le rogamos que no utilice nuestros servicios. Nos reservamos el derecho de modificar estos términos en cualquier momento.
            </p>
          </section>

          <div className="h-px bg-zinc-800" />

          <section>
            <h2 className="mb-4 font-mono text-[10px] tracking-[0.28em] text-zinc-300">2. DESCRIPCIÓN DEL SERVICIO</h2>
            <p>
              FinTrack es una plataforma de gestión financiera personal que permite a los usuarios registrar transacciones, analizar flujos de caja, gestionar portfolios de inversión y visualizar su patrimonio neto. El servicio se proporciona «tal cual» y puede estar sujeto a modificaciones.
            </p>
            <div className="mt-4 border-l-2 border-[#E8FF47]/20 pl-5">
              <p className="text-[12px] text-zinc-400">
                FinTrack no es un asesor financiero. La información proporcionada en la plataforma es puramente informativa y no constituye recomendación de inversión.
              </p>
            </div>
          </section>

          <div className="h-px bg-zinc-800" />

          <section>
            <h2 className="mb-4 font-mono text-[10px] tracking-[0.28em] text-zinc-300">3. REGISTRO Y CUENTA</h2>
            <p>
              Para utilizar FinTrack, deberá crear una cuenta proporcionando información veraz y actualizada. Usted es responsable de mantener la confidencialidad de sus credenciales de acceso y de todas las actividades que ocurran bajo su cuenta.
            </p>
            <ul className="mt-4 space-y-2">
              {[
                "Debe ser mayor de 18 años para crear una cuenta",
                "Es responsable de la veracidad de sus datos",
                "No debe compartir sus credenciales con terceros",
                "Debe notificar inmediatamente cualquier uso no autorizado",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-1.5 h-1 w-1 flex-shrink-0 bg-zinc-700" />
                  <span className="text-[13px]">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <div className="h-px bg-zinc-800" />

          <section>
            <h2 className="mb-4 font-mono text-[10px] tracking-[0.28em] text-zinc-300">4. PRIVACIDAD Y SEGURIDAD DE DATOS</h2>
            <p>
              La seguridad de sus datos es nuestra máxima prioridad. Toda la información financiera se almacena utilizando cifrado AES-256. No vendemos, compartimos ni transferimos sus datos personales o financieros a terceros bajo ninguna circunstancia.
            </p>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[
                { label: "CIFRADO", value: "AES-256" },
                { label: "DATOS VENDIDOS", value: "CERO" },
                { label: "AUTENTICACIÓN", value: "JWT + 2FA" },
              ].map((s) => (
                <div key={s.label} className="border border-zinc-800 bg-zinc-900/30 p-4 text-center">
                  <div className="font-mono text-[9px] tracking-[0.2em] text-zinc-600">{s.label}</div>
                  <div className="mt-2 font-mono text-sm text-zinc-300">{s.value}</div>
                </div>
              ))}
            </div>
          </section>

          <div className="h-px bg-zinc-800" />

          <section>
            <h2 className="mb-4 font-mono text-[10px] tracking-[0.28em] text-zinc-300">5. USO ACEPTABLE</h2>
            <p>Queda prohibido utilizar FinTrack para:</p>
            <ul className="mt-3 space-y-2">
              {[
                "Actividades ilegales o fraudulentas",
                "Intentar acceder a cuentas de otros usuarios",
                "Realizar ingeniería inversa del software",
                "Sobrecargar la infraestructura con solicitudes automatizadas",
                "Compartir contenido malicioso o dañino",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-1.5 h-1 w-1 flex-shrink-0 bg-red-500/50" />
                  <span className="text-[13px]">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <div className="h-px bg-zinc-800" />

          <section>
            <h2 className="mb-4 font-mono text-[10px] tracking-[0.28em] text-zinc-300">6. LIMITACIÓN DE RESPONSABILIDAD</h2>
            <p>
              FinTrack no será responsable de ningún daño directo, indirecto, incidental o consecuente que resulte del uso o la imposibilidad de uso de la plataforma. No garantizamos la disponibilidad ininterrumpida del servicio.
            </p>
          </section>

          <div className="h-px bg-zinc-800" />

          <section>
            <h2 className="mb-4 font-mono text-[10px] tracking-[0.28em] text-zinc-300">7. CANCELACIÓN DE CUENTA</h2>
            <p>
              Puede cancelar su cuenta en cualquier momento desde la sección de Configuración. Al cancelar, todos sus datos serán eliminados de forma permanente e irreversible en un plazo máximo de 30 días naturales.
            </p>
          </section>

          <div className="h-px bg-zinc-800" />

          <section>
            <h2 className="mb-4 font-mono text-[10px] tracking-[0.28em] text-zinc-300">8. LEGISLACIÓN APLICABLE</h2>
            <p>
              Estos Términos de Servicio se regirán e interpretarán de acuerdo con la legislación española. Cualquier disputa será sometida a los Juzgados y Tribunales de Madrid, España.
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
            <img src="/unnamed.jpg" alt="FinTrack" className="h-4 w-4 object-contain" />
            <span className="font-mono text-[10px] tracking-[0.35em] text-zinc-600">FINTRACK</span>
          </div>
          <span className="font-mono text-[9px] tracking-[0.18em] text-zinc-800">
            © 2026 FINTRACK WEALTH OS · OWN YOUR FUTURE · KNOW YOUR NUMBERS
          </span>
          <div className="flex gap-8">
            <Link href="/legal" className="font-mono text-[9px] tracking-[0.22em] text-zinc-700 transition-colors hover:text-zinc-400">LEGAL</Link>
            <Link href="/terms" className="font-mono text-[9px] tracking-[0.22em] text-zinc-400 transition-colors hover:text-zinc-200">TÉRMINOS</Link>
            <Link href="/cookies" className="font-mono text-[9px] tracking-[0.22em] text-zinc-700 transition-colors hover:text-zinc-400">COOKIES</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
