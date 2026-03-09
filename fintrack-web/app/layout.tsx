import type { Metadata } from "next";
import "./globals.css";

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
};

import { AuthProvider } from "../context/AuthContext";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}