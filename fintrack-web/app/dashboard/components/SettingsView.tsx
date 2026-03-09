"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";

export function SettingsView() {
  const router = useRouter();
  const { user, logout } = useAuth(); // Using the robust context instead of localStorage parsing directly

  // Fallback to local storage if context fails (it shouldn't)
  const safeUser = user || (typeof window !== "undefined" ? JSON.parse(localStorage.getItem("fintrack_user") || "{}") : {});

  const handleLogout = () => {
    logout();
  };

  const Sec = ({ title, children }: any) => (
    <div style={{ border: "1px solid #1C1C1F", overflow: "hidden", marginBottom: 16 }}>
      <div style={{ padding: "12px 24px", borderBottom: "1px solid #1C1C1F", background: "rgba(255,255,255,0.015)" }}><span className="lbl">{title}</span></div>
      {children}
    </div>
  );
  
  const Row = ({ label, desc, right }: any) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid rgba(28,28,31,0.6)" }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, color: "#E4E4E7", marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 11, color: "#52525B" }}>{desc}</div>
      </div>
      {right}
    </div>
  );

  return (
    <div className="vu" style={{ padding: "44px 48px", maxWidth: 740 }}>
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 26, fontWeight: 300, color: "#F4F4F5", letterSpacing: "-0.02em", marginBottom: 8 }}>Settings</h2>
        <span className="lbl">CONFIGURACIÓN DEL SISTEMA</span>
      </div>
      <Sec title="PERFIL">
        <Row label="Nombre" desc={safeUser.nombre || "—"} />
        <Row label="Email" desc={safeUser.email || "—"}
          right={<span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.09em", padding: "5px 10px", border: "1px solid", borderColor: safeUser.email_verificado ? "rgba(16,185,129,0.2)" : "rgba(251,191,36,0.3)", color: safeUser.email_verificado ? "#10B981" : "#FBBF24", background: safeUser.email_verificado ? "rgba(16,185,129,0.04)" : "rgba(251,191,36,0.04)" }}>{safeUser.email_verificado ? "VERIFICADO" : "PENDIENTE"}</span>} />
      </Sec>
      <Sec title="SEGURIDAD">
        <Row label="Cifrado de sesión" desc="AES-256 activo"
          right={<span className="mono" style={{ fontSize: 10, color: "#10B981" }}>SECURE ✓</span>} />
        <div style={{ padding: "16px 24px" }}>
          <button onClick={handleLogout}
            style={{ fontSize: 10, fontWeight: 600, color: "#F87171", letterSpacing: "0.06em", border: "1px solid rgba(248,113,113,0.2)", padding: "8px 16px", background: "transparent", cursor: "pointer" }}>
            CERRAR SESIÓN
          </button>
        </div>
      </Sec>
    </div>
  );
}
