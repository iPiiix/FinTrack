import type { Metadata } from "next";
import "./globals.css";
import { Geist, DM_Mono } from "next/font/google";
import { AuthProvider } from "../context/AuthContext";
import ErrorBoundary from "../components/ErrorBoundary";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const dmMono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-dm-mono" });

export const metadata: Metadata = {
  title: "FinTrack — Control Financiero Inteligente | Own Your Future",
  description:
    "Plataforma de gestión financiera personal. Unifica tu flujo de caja, analiza tu portfolio y domina tu patrimonio con total privacidad. Cifrado AES-256.",
  keywords: [
    "finanzas personales",
    "gestión financiera",
    "control de gastos",
    "portfolio",
    "patrimonio neto",
    "flujo de caja",
    "inversiones",
    "ahorro",
  ],
  icons: {
    icon: "/png.png",
    shortcut: "/png.png",
    apple: "/png.png",
  },
  openGraph: {
    title: "FinTrack — Own Your Future. Know Your Numbers.",
    description:
      "Control financiero de nivel institucional para el inversor moderno. Unifica tu flujo de caja, analiza tu asignación de activos y domina tu contabilidad.",
    siteName: "FinTrack",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FinTrack — Own Your Future. Know Your Numbers.",
    description:
      "Plataforma de gestión financiera personal con cifrado AES-256. 100% privada.",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning className={`${geist.variable} ${dmMono.variable}`}>
      <head />
      <body className="antialiased font-sans">
        <ErrorBoundary>
          <AuthProvider>{children}</AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}