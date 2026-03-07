"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";

const API = "http://127.0.0.1:8000";

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) { setStatus("error"); setMessage("Token no proporcionado"); return; }

    fetch(`${API}/auth/verify-email?token=${token}`)
      .then(async res => {
        const data = await res.json();
        if (res.ok) { setStatus("success"); setMessage(data.message); }
        else { setStatus("error"); setMessage(data.detail || "Error al verificar"); }
      })
      .catch(() => { setStatus("error"); setMessage("No se pudo conectar con el servidor"); });
  }, [token]);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      <div style={{
        width: 64, height: 64, borderRadius: "50%",
        border: `2px solid ${status === "success" ? "#10B981" : status === "error" ? "#F87171" : "#3F3F46"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: status === "success" ? "rgba(16,185,129,0.05)" : status === "error" ? "rgba(248,113,113,0.05)" : "transparent",
      }}>
        <span style={{ fontSize: 28 }}>
          {status === "loading" ? "⏳" : status === "success" ? "✓" : "✗"}
        </span>
      </div>

      <h1 style={{
        fontFamily: "'Bebas Neue', sans-serif", fontSize: 40, letterSpacing: "0.02em",
        color: status === "success" ? "#10B981" : status === "error" ? "#F87171" : "#71717A",
      }}>
        {status === "loading" ? "VERIFICANDO..." : status === "success" ? "EMAIL VERIFICADO" : "ERROR"}
      </h1>

      <p style={{ fontSize: 14, color: "#71717A", textAlign: "center", maxWidth: 360 }}>
        {message || "Verificando tu email..."}
      </p>

      {status !== "loading" && (
        <Link href={status === "success" ? "/auth" : "/"}
          style={{
            display: "inline-block", background: "#E8FF47", color: "#000", padding: "14px 32px",
            textDecoration: "none", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em",
            marginTop: 12, transition: "background 0.15s",
          }}>
          {status === "success" ? "INICIAR SESIÓN" : "VOLVER AL INICIO"}
        </Link>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div style={{
      minHeight: "100vh", background: "#09090B", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif", color: "white",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,100..900;1,9..40,300&display=swap');
      `}</style>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 48 }}>
        <img src="/png.png" alt="FinTrack" style={{ width: 24, height: 24, objectFit: "contain" }} />
        <span style={{ fontFamily: "monospace", fontSize: 12, letterSpacing: "0.35em" }}>FINTRACK</span>
      </div>

      <Suspense fallback={<p style={{ color: "#71717A" }}>Cargando...</p>}>
        <VerifyContent />
      </Suspense>
    </div>
  );
}
