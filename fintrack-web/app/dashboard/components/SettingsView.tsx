"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";

export function SettingsView() {
  const router = useRouter();
  const { user, logout } = useAuth();
  
  const safeUser: any = user || {};

  const [nombre, setNombre] = useState(safeUser.nombre || "");
  const [apellidos, setApellidos] = useState(safeUser.apellidos || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  
  const [statusMsg, setStatusMsg] = useState({ text: "", type: "" });
  const [loading, setLoading] = useState(false);

  const API = process.env.NEXT_PUBLIC_API_URL || "/api";

  const showStatus = (text: string, type: "success" | "error") => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg({ text: "", type: "" }), 4000);
  };

  const handleUpdateName = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/usuarios/me/name`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ nombre, apellidos }),
      });
      if (!res.ok) throw new Error("Error updating name");
      
      showStatus("Nombre actualizado correctamente", "success");
    } catch (err) {
      showStatus("Error al actualizar perfil", "error");
    }
    setLoading(false);
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword) return showStatus("Completa ambos campos", "error");
    setLoading(true);
    try {
      const res = await fetch(`${API}/usuarios/me/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      if (!res.ok) throw new Error("Contraseña incorrecta");
      showStatus("Contraseña actualizada correctamente", "success");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      showStatus("Contraseña actual incorrecta", "error");
    }
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (!confirm("ESTA ACCIÓN ES IRREVERSIBLE. Se borrarán todas tus cuentas, transacciones y activos. ¿Estás absolutamente seguro de que deseas eliminar tu cuenta?")) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/usuarios/me`, { 
        method: "DELETE",
        credentials: "include" 
      });
      if (!res.ok) throw new Error("Error deleting account");
      alert("Cuenta eliminada permanentemente. Redirigiendo...");
      logout();
    } catch (err) {
      showStatus("Error al eliminar la cuenta", "error");
    }
    setLoading(false);
  };

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/subscriptions/create-portal-session`, {
        method: "POST",
        credentials: "include"
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 400 || (data.detail && data.detail.includes("cliente"))) {
          // Usuario posiblemente en Free Trial local sin ID de Stripe aún. Redirigir a los planes.
          router.push("/pricing");
          return;
        }
        throw new Error(data.detail || "Error al acceder al portal de suscripción");
      }
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err: any) {
      showStatus(err.message || "Error al acceder al portal", "error");
    }
    setLoading(false);
  };

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
    <div className="vu" style={{ padding: "44px 0", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ marginBottom: 32, display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "0 48px" }}>
        <div>
          <h2 style={{ fontSize: 26, fontWeight: 300, color: "#F4F4F5", letterSpacing: "-0.02em", marginBottom: 8 }}>Settings</h2>
          <span className="lbl">CONFIGURACIÓN DEL SISTEMA</span>
        </div>
        {statusMsg.text && (
          <span style={{ fontSize: 11, fontWeight: 500, color: statusMsg.type === "success" ? "#10B981" : "#F87171", padding: "6px 12px", background: statusMsg.type === "success" ? "rgba(16,185,129,0.1)" : "rgba(248,113,113,0.1)", borderRadius: 2 }}>
            {statusMsg.text}
          </span>
        )}
      </div>

      <Sec title="PERFIL DE USUARIO">
        <div style={{ display: "flex", alignItems: "center", gap: 24, padding: "24px", borderBottom: "1px solid rgba(28,28,31,0.6)" }}>
          <div style={{ width: 80, height: 80, borderRadius: "50%", background: "#27272A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 600, color: "#FAFAFA", flexShrink: 0 }}>
            {safeUser.nombre ? safeUser.nombre.charAt(0).toUpperCase() : "?"}
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 500, color: "#FAFAFA", marginBottom: 4 }}>{safeUser.nombre} {safeUser.apellidos}</div>
            <div style={{ fontSize: 12, color: "#A1A1AA", marginBottom: 12 }}>{safeUser.email}</div>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.09em", padding: "5px 10px", border: "1px solid", borderColor: safeUser.email_verificado ? "rgba(16,185,129,0.2)" : "rgba(251,191,36,0.3)", color: safeUser.email_verificado ? "#10B981" : "#FBBF24", background: safeUser.email_verificado ? "rgba(16,185,129,0.04)" : "rgba(251,191,36,0.04)" }}>{safeUser.email_verificado ? "VERIFICADO" : "PENDIENTE"}</span>
          </div>
        </div>

        <div style={{ padding: "24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
            <div>
              <label className="lbl" style={{ display: "block", marginBottom: 10 }}>Nombre</label>
              <input className="inp" value={nombre} onChange={e => setNombre(e.target.value)} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #27272A", transition: "border-color 0.2s" }} onFocus={e => e.target.style.borderColor = "#52525B"} onBlur={e => e.target.style.borderColor = "#27272A"} />
            </div>
            <div>
              <label className="lbl" style={{ display: "block", marginBottom: 10 }}>Apellidos</label>
              <input className="inp" value={apellidos} onChange={e => setApellidos(e.target.value)} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #27272A", transition: "border-color 0.2s" }} onFocus={e => e.target.style.borderColor = "#52525B"} onBlur={e => e.target.style.borderColor = "#27272A"} />
            </div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label className="lbl" style={{ display: "block", marginBottom: 10 }}>Correo Electrónico (Solo Lectura)</label>
            <input className="inp" value={safeUser.email || ""} disabled style={{ opacity: 0.5, cursor: "not-allowed", background: "rgba(255,255,255,0.01)" }} />
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <button onClick={handleUpdateName} disabled={loading} style={{ background: "#FAFAFA", color: "#09090B", border: "none", padding: "12px 24px", fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", cursor: loading ? "wait" : "pointer", transition: "opacity 0.2s, background 0.2s", borderRadius: 2 }} onMouseEnter={e => e.currentTarget.style.opacity = "0.9"} onMouseLeave={e => e.currentTarget.style.opacity = "1"}>GUARDAR CAMBIOS</button>
            <button onClick={handleManageSubscription} disabled={loading} style={{ background: "#E8FF47", color: "#09090B", border: "none", padding: "12px 24px", fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", cursor: loading ? "wait" : "pointer", transition: "opacity 0.2s, background 0.2s", borderRadius: 2 }} onMouseEnter={e => e.currentTarget.style.opacity = "0.9"} onMouseLeave={e => e.currentTarget.style.opacity = "1"}>GESTIONAR SUSCRIPCIÓN</button>
          </div>
        </div>
      </Sec>

      <Sec title="SEGURIDAD Y ACCESO">
        <Row label="Cifrado de sesión" desc="AES-256 activo"
          right={<span className="mono" style={{ fontSize: 10, color: "#10B981" }}>SECURE ✓</span>} />
        <div style={{ padding: "32px 24px", borderBottom: "1px solid rgba(28,28,31,0.6)" }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: "#E4E4E7", marginBottom: 20 }}>Cambiar Contraseña</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
            <div>
              <label className="lbl" style={{ display: "block", marginBottom: 10 }}>Contraseña Actual</label>
              <input type="password" className="inp" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #27272A", transition: "border-color 0.2s" }} onFocus={e => e.target.style.borderColor = "#52525B"} onBlur={e => e.target.style.borderColor = "#27272A"} />
            </div>
            <div>
              <label className="lbl" style={{ display: "block", marginBottom: 10 }}>Nueva Contraseña</label>
              <input type="password" className="inp" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #27272A", transition: "border-color 0.2s" }} onFocus={e => e.target.style.borderColor = "#52525B"} onBlur={e => e.target.style.borderColor = "#27272A"} />
            </div>
          </div>
          <button onClick={handleUpdatePassword} disabled={loading} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid #27272A", color: "white", padding: "12px 24px", fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", cursor: loading ? "wait" : "pointer", transition: "all 0.2s", borderRadius: 2 }} onMouseEnter={e => {e.currentTarget.style.background = "rgba(255,255,255,0.1)"; e.currentTarget.style.borderColor = "#3F3F46"}} onMouseLeave={e => {e.currentTarget.style.background = "rgba(255,255,255,0.05)"; e.currentTarget.style.borderColor = "#27272A"}}>ACTUALIZAR CONTRASEÑA</button>
        </div>
        <div style={{ padding: "16px 24px", display: "flex", justifyContent: "flex-end" }}>
          <button onClick={handleLogout} style={{ fontSize: 10, fontWeight: 600, color: "#FAFAFA", letterSpacing: "0.06em", border: "1px solid #3F3F46", padding: "10px 20px", background: "#18181B", cursor: "pointer", transition: "background 0.2s, border-color 0.2s", borderRadius: 2 }} onMouseEnter={e => {e.currentTarget.style.background="#27272A"; e.currentTarget.style.borderColor="#52525B"}} onMouseLeave={e => {e.currentTarget.style.background="#18181B"; e.currentTarget.style.borderColor="#3F3F46"}}>
            CERRAR SESIÓN
          </button>
        </div>
      </Sec>

      <div style={{ border: "1px solid rgba(220,38,38,0.4)", background: "linear-gradient(to bottom, rgba(220,38,38,0.05), rgba(220,38,38,0.01))", marginBottom: 16, borderRadius: 2, overflow: "hidden" }}>
        <div style={{ padding: "14px 24px", borderBottom: "1px solid rgba(220,38,38,0.2)", background: "rgba(220,38,38,0.05)" }}>
          <span className="lbl" style={{ color: "#EF4444" }}>DANGER ZONE</span>
        </div>
        <div style={{ padding: "32px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 500, color: "#FAFAFA", marginBottom: 6 }}>Eliminar Cuenta Permanentemente</div>
            <div style={{ fontSize: 12, color: "#A1A1AA", maxWidth: 450, lineHeight: 1.5 }}>Al eliminar tu cuenta, todos tus registros financieros, configuraciones y datos personales serán borrados permanentemente. Esta acción no se puede deshacer.</div>
          </div>
          <button onClick={handleDeleteAccount} disabled={loading} style={{ fontSize: 11, fontWeight: 600, color: "white", letterSpacing: "0.06em", border: "1px solid rgba(239,68,68,0.5)", padding: "12px 24px", background: "rgba(220,38,38,0.1)", cursor: loading ? "wait" : "pointer", transition: "all 0.2s", flexShrink: 0, borderRadius: 2 }} onMouseEnter={e => {e.currentTarget.style.background="rgba(220,38,38,0.2)"; e.currentTarget.style.borderColor="rgba(239,68,68,0.8)"}} onMouseLeave={e => {e.currentTarget.style.background="rgba(220,38,38,0.1)"; e.currentTarget.style.borderColor="rgba(239,68,68,0.5)"}}>
            ELIMINAR CUENTA
          </button>
        </div>
      </div>
    </div>
  );
}
