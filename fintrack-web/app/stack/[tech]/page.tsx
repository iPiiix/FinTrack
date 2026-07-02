import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface StackPageProps {
  params: Promise<{ tech: string }>;
}

const STACK_INFO: Record<string, { title: string; description: string; detail: string; meta: string }> = {
  ledger: {
    title: "Libro Mayor",
    description: "Partida doble sin compromisos. Cada asiento se valida en el motor local.",
    detail: "Implementamos un motor de partida doble escrito en TypeScript puro que valida las sumas de cada transaccion antes de guardarlas en disco. Todo se almacena en SQLite, permitiendo agregaciones inmediatas sin latencia de red. La privacidad es criptografica por diseño: tus cuentas no existen en internet.",
    meta: "Doble entrada · SQLite WAL · Agregacion instantanea",
  },
  cashflow: {
    title: "Flujo de Caja",
    description: "Analisis predictivo sin enviar un solo CSV a la nube.",
    detail: "El modulo de cashflow computa tasas de ahorro, run-rates mensuales y proyecciones de liquidez localmente. Funciona parseando el registro completo de transacciones cada vez que se carga, lo que es posible porque no hay I/O de red. Tu historial de ingresos es invisible para nosotros.",
    meta: "Run-rate local · Proyecciones offline · Zero-knowledge",
  },
  portfolio: {
    title: "Portfolio Global",
    description: "Consulta de cotizaciones sin ceder tu identidad.",
    detail: "El tracking de inversiones hace llamadas directas HTTPS a la API de Yahoo Finance desde tu propia maquina. FinTrack no actua como proxy, y por tanto, no sabemos que activos tienes, en que volumen ni con que broker. El calculo de rentabilidad (TWR) se procesa en cliente.",
    meta: "HTTPS directo · TWR local · Multidivisa",
  },
  sqlite: {
    title: "SQLite",
    description: "La capa de persistencia de grado industrial que vive en tu SSD.",
    detail: "FinTrack corre sobre un nodo de Node.js dentro de Electron, con la base de datos configurada en modo WAL (Write-Ahead Logging). Esto permite escrituras concurrentes y elimina corrupciones. Es el mismo motor que usan los navegadores y el sistema operativo de tu telefono. Tus finanzas no deberian depender de que nosotros paguemos la factura del servidor.",
    meta: "WAL Mode · Fichero portable · Cero dependencias",
  },
};

export default async function StackPage({ params }: StackPageProps) {
  const { tech } = await params;
  const info = STACK_INFO[tech as keyof typeof STACK_INFO];

  if (!info) {
    notFound();
  }

  return (
    <main className="w-full min-h-screen bg-[#08090A] text-[#E4E5E7] selection:bg-zinc-700 selection:text-white">
      {/* ═══ Nav Minimal ═══ */}
      <nav className="w-full border-b border-white/[0.04] p-5 sm:px-10 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-[11px] font-[var(--font-dm-mono)] uppercase tracking-widest"
        >
          <ArrowLeft size={14} />
          Volver al inicio
        </Link>
        <span className="text-[10px] font-[var(--font-dm-mono)] uppercase tracking-widest text-zinc-700">
          FinTrack Stack
        </span>
      </nav>

      {/* ═══ Content ═══ */}
      <div className="max-w-3xl mx-auto px-6 sm:px-10 py-24 md:py-32">
        <div className="space-y-10">
          <div className="space-y-4">
            <span className="text-[10px] font-[var(--font-dm-mono)] uppercase tracking-[0.15em] text-[#3B82F6]">
              {info.meta}
            </span>
            <h1 className="text-[clamp(2.4rem,5vw,4.2rem)] font-bold tracking-[-0.035em] text-white leading-[1.1]">
              {info.title}
            </h1>
          </div>

          <p className="text-xl md:text-[1.35rem] leading-snug tracking-[-0.01em] text-zinc-300 font-medium">
            {info.description}
          </p>

          {/* Double-bezel divider */}
          <div className="h-px w-full bg-white/[0.04] relative my-12">
            <div className="absolute top-0 left-0 w-12 h-px bg-white/20" />
          </div>

          <div className="prose prose-invert prose-zinc max-w-none">
            <p className="text-[15px] leading-relaxed text-zinc-400">
              {info.detail}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
