"use client";

import {
  BookOpen,
  Download,
  Monitor,
  Database,
  ArrowLeft,
  Github,
  ChevronRight,
  Terminal,
  Layers,
  Cpu,
  HardDrive,
  Sparkles,
  Settings,
  Info,
  ShieldAlert
} from "lucide-react";
import Link from "next/link";

const GITHUB = "https://github.com/iPiiix/FinTrack";

const SECTIONS = [
  { id: "install", label: "Instalación" },
  { id: "first-use", label: "Primer Uso" },
  { id: "features", label: "Funcionalidades" },
  { id: "portfolio", label: "Portfolio" },
  { id: "ai", label: "AI Advisor" },
  { id: "architecture", label: "Arquitectura" },
  { id: "development", label: "Desarrollo" },
  { id: "data", label: "Almacenamiento" },
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#050507] text-zinc-200 font-sans selection:bg-zinc-800 selection:text-white">

      {/* ─── Nav ─────────────────────────────────────────────────────── */}
      <nav className="border-b border-zinc-900/60 sticky top-0 bg-[#050507]/90 backdrop-blur-md z-50">
        <div className="px-6 sm:px-12 md:px-24 xl:px-48 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition-colors">
              <ArrowLeft size={13} />
              <span className="font-mono text-[9px] tracking-wider uppercase">Inicio</span>
            </Link>
            <span className="text-zinc-800 font-mono">/</span>
            <div className="flex items-center gap-2">
              <BookOpen size={13} className="text-zinc-400" />
              <span className="font-mono text-[10px] tracking-[0.2em] text-zinc-300 font-medium select-none">DOCS</span>
            </div>
          </div>
          <a
            href={GITHUB}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 border border-zinc-800 rounded-full font-mono text-[9px] tracking-wider text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 transition-all duration-200 uppercase bg-zinc-950/40"
          >
            <Github size={11} />
            GitHub
          </a>
        </div>
      </nav>

      {/* ─── Main Grid Layout ────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-6 sm:px-12 md:px-24 xl:px-48 flex gap-12">

        {/* ─── Sticky Sidebar (Left Panel) ───────────────────────────── */}
        <aside className="hidden lg:block w-64 shrink-0 sticky top-24 h-[calc(100vh-8rem)] overflow-y-auto py-4 pr-8 border-r border-zinc-900/60 select-none">
          <span className="font-mono text-[9px] text-zinc-600 uppercase tracking-widest block mb-5">// NAVEGACIÓN</span>
          <nav className="flex flex-col gap-1.5">
            {SECTIONS.map(({ id, label }) => (
              <a
                key={id}
                href={`#${id}`}
                className="font-mono text-[10.5px] text-zinc-500 hover:text-zinc-300 transition-colors py-1.5 block"
              >
                {label}
              </a>
            ))}
          </nav>
        </aside>

        {/* ─── Reading Content Area (Right Panel) ────────────────────── */}
        <main className="flex-1 min-w-0 py-12 max-w-2xl leading-relaxed">
          
          {/* Header */}
          <header className="mb-16 border-b border-zinc-900 pb-10">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-mono tracking-wider text-zinc-400 border border-zinc-800 bg-zinc-950/30 mb-4 select-none">
              DOCUMENTACIÓN OFICIAL
            </span>
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-zinc-100 mb-4">
              Manual Técnico de FinTrack
            </h1>
            <p className="text-zinc-500 text-sm text-wrap-pretty max-w-xl">
              Información de instalación, uso de bases de datos SQLite locales, arquitectura de ejecución y desarrollo del proyecto local-first.
            </p>
          </header>

          {/* ─── Instalación ──────────────────────────────────────────── */}
          <DocSection id="install" title="Instalación">
            <DocH3>macOS</DocH3>
            <DocP>
              Descarga el archivo <code>.dmg</code> adaptado a tu arquitectura:
            </DocP>
            <ul className="list-disc list-inside pl-2 space-y-1.5 text-xs text-zinc-500">
              <li>
                <strong>Apple Silicon (M1/M2/M3/M4):</strong>{" "}
                <DocLink href="https://github.com/iPiiix/FinTrack/releases/latest/download/FinTrack-1.0.0-arm64.dmg">FinTrack-1.0.0-arm64.dmg</DocLink>
              </li>
              <li>
                <strong>Intel x64:</strong>{" "}
                <DocLink href="https://github.com/iPiiix/FinTrack/releases/latest/download/FinTrack-1.0.0.dmg">FinTrack-1.0.0.dmg</DocLink>
              </li>
            </ul>
            <DocP>
              Arrastra FinTrack a la carpeta de <code>Aplicaciones</code>. Si macOS Gatekeeper bloquea el inicio: ve a <strong>Ajustes del Sistema &rarr; Privacidad y Seguridad</strong> y haz clic en <strong>"Abrir igualmente"</strong>.
            </DocP>

            <DocH3>Windows</DocH3>
            <DocP>
              Descarga el instalador ejecutable:{" "}
              <DocLink href="https://github.com/iPiiix/FinTrack/releases/latest/download/FinTrack.Setup.1.0.0.exe">FinTrack.Setup.1.0.0.exe</DocLink>
            </DocP>
            <DocP>
              Ejecuta el archivo. Si Windows Defender SmartScreen bloquea el arranque, pulsa en <strong>"Más información" &rarr; "Ejecutar de todas formas"</strong>.
            </DocP>
          </DocSection>

          {/* ─── Primer Uso ───────────────────────────────────────────── */}
          <DocSection id="first-use" title="Primer Uso">
            <DocP>
              En el primer arranque, la aplicación crea un fichero de base de datos SQLite vacío en tu disco de forma silenciosa y te redirige automáticamente a la pantalla de control, sin solicitar contraseñas ni perfiles externos.
            </DocP>
            <DocP>
              <strong>Configuración inicial recomendada:</strong>
            </DocP>
            <ol className="list-decimal list-inside pl-1 space-y-2 text-xs text-zinc-500">
              <li>Ve a <strong>Overview</strong> y crea una cuenta bancaria (ej. Corriente, Ahorro).</li>
              <li>Registra tus primeros ingresos o gastos con el botón <code>Nueva Transacción</code>.</li>
              <li>Añade activos a tu Portfolio si tienes inversiones (ej. acciones, criptoactivos).</li>
            </ol>
          </DocSection>

          {/* ─── Funcionalidades ──────────────────────────────────────── */}
          <DocSection id="features" title="Funcionalidades">
            <DocH3>Libro Mayor</DocH3>
            <DocP>
              Permite la categorización de cobros y gastos, transferencias internas entre cuentas y búsquedas por término en un historial tabular simple. Puedes exportar todos tus movimientos a formato CSV.
            </DocP>

            <DocH3>Flujo de Caja</DocH3>
            <DocP>
              Un resumen de métricas clave que calcula tu patrimonio neto sumando todos los balances, y computa tu tasa de ahorro del mes según tus ingresos y gastos registrados.
            </DocP>
          </DocSection>

          {/* ─── Portfolio ────────────────────────────────────────────── */}
          <DocSection id="portfolio" title="Portfolio">
            <DocP>
              Gestiona activos de inversión introduciendo el ticker de cotización de Yahoo Finance (ej. <code>AAPL</code>, <code>BTC-USD</code>).
            </DocP>
            <DocP>
              La aplicación consulta las cotizaciones cada 30 segundos en segundo plano mediante llamadas HTTPS directas. Las inversiones cotizadas en divisas extranjeras (USD) se convierten automáticamente a Euros usando el tipo de cambio oficial al instante.
            </DocP>
          </DocSection>

          {/* ─── AI Advisor ───────────────────────────────────────────── */}
          <DocSection id="ai" title="AI Advisor">
            <DocP>
              La integración de IA analiza tus tendencias financieras basándose en agregados monetarios. Esta función es totalmente opcional y requiere tu propia API Key.
            </DocP>
            <DocCallout type="info">
              Por razones de privacidad, FinTrack nunca envía nombres descriptivos ni identificadores individuales de tus transacciones. Únicamente transmite sumas de categorías y balances de activos.
            </DocCallout>
          </DocSection>

          {/* ─── Arquitectura ─────────────────────────────────────────── */}
          <DocSection id="architecture" title="Arquitectura">
            <DocP>
              La aplicación está estructurada como un contenedor Electron que ejecuta Next.js en modo Standalone como un subproceso hijo en local.
            </DocP>
            <DocTable
              headers={["Capa", "Tecnología", "Versión"]}
              rows={[
                ["Shell de Escritorio", "Electron", "v42"],
                ["Framework Web", "Next.js", "v16 (Turbopack)"],
                ["Base de Datos", "SQLite (better-sqlite3)", "v12"],
                ["Librería Visual", "React", "v19"],
                ["Animación", "Framer Motion", "v12"],
              ]}
            />
          </DocSection>

          {/* ─── Desarrollo ───────────────────────────────────────────── */}
          <DocSection id="development" title="Desarrollo">
            <DocP>
              Clona el código e inicia el entorno de pruebas local en tu máquina:
            </DocP>
            <DocCode>{`# Clonar el proyecto
git clone https://github.com/iPiiix/FinTrack

# Acceder y compilar en desarrollo
cd FinTrack/fintrack-web
npm install
npm run dev:electron`}</DocCode>
          </DocSection>

          {/* ─── Almacenamiento y Datos ───────────────────────────────── */}
          <DocSection id="data" title="Almacenamiento">
            <DocP>
              Tus finanzas se escriben en un fichero SQLite denominado <code>fintrack.db</code>. Las rutas absolutas predeterminadas en tu almacenamiento local son las siguientes:
            </DocP>
            <DocTable
              headers={["Sistema Operativo", "Ruta de Archivo"]}
              rows={[
                ["Windows", "%APPDATA%\\FinTrack\\fintrack.db"],
                ["macOS", "~/Library/Application Support/FinTrack/fintrack.db"],
              ]}
            />
            <DocCallout type="warning">
              <strong>Copia de Seguridad:</strong> Al no tener sincronización en la nube por privacidad, eres el único responsable de tus datos. Si reinstalas el sistema operativo sin guardar una copia de tu fichero <code>fintrack.db</code>, perderás tu historial de forma irreversible.
            </DocCallout>
          </DocSection>

          {/* Bottom CTA */}
          <footer className="mt-24 pt-8 border-t border-zinc-900 flex justify-between items-center text-xs text-zinc-500 font-mono">
            <span>FinTrack v1.0.0</span>
            <a
              href={`${GITHUB}/issues`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-zinc-300 underline underline-offset-2"
            >
              Reportar problema en GitHub
            </a>
          </footer>

        </main>
      </div>
    </div>
  );
}

/* ─── Internal Subcomponents ─────────────────────────────────────────────── */

function DocSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-16 scroll-mt-20">
      <div className="flex items-baseline border-b border-zinc-900/60 pb-3 mb-6">
        <h2 className="text-xl font-semibold tracking-tight text-zinc-100">{title}</h2>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function DocH3({ children }: { children: React.ReactNode }) {
  return <h3 className="text-zinc-300 text-xs font-semibold uppercase tracking-wider mt-6 mb-2 font-mono">{children}</h3>;
}

function DocP({ children }: { children: React.ReactNode }) {
  return <p className="text-zinc-400 text-xs sm:text-[13px] leading-relaxed max-w-[65ch] text-wrap-pretty">{children}</p>;
}

function DocLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-zinc-300 hover:text-white underline underline-offset-2 transition-colors">
      {children}
    </a>
  );
}

function DocTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto my-5 border border-zinc-900/80 rounded-lg">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="border-b border-zinc-900 bg-zinc-950/20">
            {headers.map((h) => (
              <th key={h} className="py-2.5 px-3 text-zinc-500 font-mono text-[9px] uppercase tracking-wider">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-900/60">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-zinc-900/5 transition-colors">
              {row.map((cell, j) => (
                <td key={j} className={`py-2.5 px-3 text-zinc-400 ${j === 0 ? "font-mono font-medium text-[11px]" : ""}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function DocCode({ children }: { children: string }) {
  return (
    <div className="my-5 bg-[#09090b] border border-zinc-900 rounded-lg p-5 overflow-x-auto font-mono text-[11.5px] text-zinc-300 leading-relaxed">
      <pre>{children}</pre>
    </div>
  );
}

function DocCallout({ type, children }: { type: "info" | "warning"; children: React.ReactNode }) {
  const borderClass = type === "warning" ? "border-zinc-700/80" : "border-zinc-800/80";
  return (
    <div className={`my-5 border-l-2 ${borderClass} bg-zinc-900/10 p-4.5 rounded-r-lg flex items-start gap-2.5`}>
      {type === "warning" ? (
        <ShieldAlert size={14} className="text-zinc-400 shrink-0 mt-0.5" />
      ) : (
        <Info size={14} className="text-zinc-500 shrink-0 mt-0.5" />
      )}
      <div className="text-zinc-400 text-xs leading-relaxed max-w-[62ch] text-wrap-pretty">{children}</div>
    </div>
  );
}

// Minimal placeholder component to satisfy TypeScript
function WalletIcon(props: any) {
  return <Layers {...props} />;
}
