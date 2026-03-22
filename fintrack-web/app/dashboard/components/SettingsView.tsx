"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { Shield, User, LogOut, Trash2, CreditCard, Lock } from "lucide-react";

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

  const API = "/api";

  const showStatus = (text: string, type: "success" | "error") => {
    setStatusMsg({ text, type });
    setTimeout(() => setStatusMsg({ text: "", type: "" }), 5000);
  };

  const handleUpdateName = async () => {
    if (!nombre.trim() || !apellidos.trim()) return showStatus("Nombre y apellidos son requeridos", "error");
    setLoading(true);
    try {
      const res = await fetch(`${API}/usuarios/me/name`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ nombre: nombre.trim(), apellidos: apellidos.trim() }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Error al actualizar");
      }
      showStatus("Nombre actualizado correctamente", "success");
    } catch (err: any) {
      showStatus(err.message || "Error al actualizar perfil", "error");
    }
    setLoading(false);
  };

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword) return showStatus("Completa ambos campos de contraseña", "error");
    if (newPassword.length < 8) return showStatus("La nueva contraseña debe tener al menos 8 caracteres", "error");
    setLoading(true);
    try {
      const res = await fetch(`${API}/usuarios/me/password`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Contraseña actual incorrecta");
      }
      showStatus("Contraseña actualizada correctamente", "success");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      showStatus(err.message || "Contraseña actual incorrecta", "error");
    }
    setLoading(false);
  };

  const handleDeleteAccount = async () => {
    if (!confirm("⚠️ ESTA ACCIÓN ES IRREVERSIBLE.\n\nSe borrarán todas tus cuentas, transacciones y activos.\n\n¿Estás absolutamente seguro?")) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/usuarios/me`, { 
        method: "DELETE",
        credentials: "include" 
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Error al eliminar cuenta");
      }
      alert("Cuenta eliminada permanentemente. Redirigiendo...");
      logout();
    } catch (err: any) {
      showStatus(err.message || "Error al eliminar la cuenta", "error");
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
          router.push("/pricing");
          return;
        }
        throw new Error(data.detail || "Error al acceder al portal");
      }
      if (data.url) window.location.href = data.url;
    } catch (err: any) {
      showStatus(err.message || "Error al acceder al portal", "error");
    }
    setLoading(false);
  };

  const initials = safeUser.nombre ? safeUser.nombre.charAt(0).toUpperCase() : "?";

  return (
    <div className="vu" style={{ padding: "48px 24px", maxWidth: 720, margin: "0 auto", width: "100%" }}>
      
      {/* Header */}
      <div style={{ marginBottom: 40, textAlign: "center" }}>
        <h2 style={{ fontSize: 28, fontWeight: 300, color: "#F4F4F5", letterSpacing: "-0.02em", marginBottom: 8 }}>Ajustes</h2>
        <span className="lbl">CONFIGURACIÓN DE TU CUENTA</span>
        {statusMsg.text && (
          <div style={{ marginTop: 16 }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: statusMsg.type === "success" ? "#10B981" : "#F87171", padding: "8px 16px", background: statusMsg.type === "success" ? "rgba(16,185,129,0.08)" : "rgba(248,113,113,0.08)", borderRadius: 4, border: `1px solid ${statusMsg.type === "success" ? "rgba(16,185,129,0.2)" : "rgba(248,113,113,0.2)"}` }}>
              {statusMsg.text}
            </span>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div style={{ border: "1px solid #1C1C1F", borderRadius: 6, overflow: "hidden", marginBottom: 24 }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #1C1C1F", background: "rgba(255,255,255,0.015)", display: "flex", alignItems: "center", gap: 10 }}>
          <User size={14} className="text-zinc-500" />
          <span className="lbl">PERFIL DE USUARIO</span>
        </div>
        
        {/* Avatar + Info */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "28px 24px", borderBottom: "1px solid rgba(28,28,31,0.6)" }}>
          <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg, #27272A, #3F3F46)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 600, color: "#FAFAFA", flexShrink: 0 }}>
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 17, fontWeight: 500, color: "#FAFAFA", marginBottom: 4 }}>{safeUser.nombre} {safeUser.apellidos}</div>
            <div style={{ fontSize: 12, color: "#A1A1AA", marginBottom: 8 }}>{safeUser.email}</div>
            <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.09em", padding: "4px 10px", borderRadius: 3, border: "1px solid", borderColor: safeUser.email_verificado ? "rgba(16,185,129,0.25)" : "rgba(251,191,36,0.3)", color: safeUser.email_verificado ? "#10B981" : "#FBBF24", background: safeUser.email_verificado ? "rgba(16,185,129,0.06)" : "rgba(251,191,36,0.06)" }}>{safeUser.email_verificado ? "VERIFICADO" : "PENDIENTE"}</span>
          </div>
        </div>

        {/* Name fields */}
        <div style={{ padding: "24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div>
              <label className="lbl" style={{ display: "block", marginBottom: 8 }}>Nombre</label>
              <input className="inp" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Tu nombre" />
            </div>
            <div>
              <label className="lbl" style={{ display: "block", marginBottom: 8 }}>Apellidos</label>
              <input className="inp" value={apellidos} onChange={e => setApellidos(e.target.value)} placeholder="Tus apellidos" />
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label className="lbl" style={{ display: "block", marginBottom: 8 }}>Correo Electrónico</label>
            <input className="inp" value={safeUser.email || ""} disabled style={{ opacity: 0.4, cursor: "not-allowed" }} />
          </div>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <button onClick={handleUpdateName} disabled={loading} className="settings-btn primary">GUARDAR CAMBIOS</button>
            <button onClick={handleManageSubscription} disabled={loading} className="settings-btn accent">
              <CreditCard size={12} />
              GESTIONAR SUSCRIPCIÓN
            </button>
          </div>
        </div>
      </div>

      {/* Security Card */}
      <div style={{ border: "1px solid #1C1C1F", borderRadius: 6, overflow: "hidden", marginBottom: 24 }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #1C1C1F", background: "rgba(255,255,255,0.015)", display: "flex", alignItems: "center", gap: 10 }}>
          <Shield size={14} className="text-zinc-500" />
          <span className="lbl">SEGURIDAD Y ACCESO</span>
        </div>
        
        <div style={{ padding: "12px 24px", borderBottom: "1px solid rgba(28,28,31,0.6)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: "#E4E4E7" }}>Cifrado de sesión</div>
            <div style={{ fontSize: 11, color: "#52525B" }}>AES-256 activo · TLS 1.3</div>
          </div>
          <span className="mono" style={{ fontSize: 10, color: "#10B981" }}>SECURE ✓</span>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleUpdatePassword(); }} style={{ padding: "24px" }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: "#E4E4E7", marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <Lock size={14} className="text-zinc-500" />
            Cambiar Contraseña
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
            <div>
              <label className="lbl" style={{ display: "block", marginBottom: 8 }}>Contraseña Actual</label>
              <input type="password" className="inp" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
            </div>
            <div>
              <label className="lbl" style={{ display: "block", marginBottom: 8 }}>Nueva Contraseña</label>
              <input type="password" className="inp" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Mínimo 8 caracteres" autoComplete="new-password" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="settings-btn ghost">ACTUALIZAR CONTRASEÑA</button>
        </form>

        <div style={{ padding: "16px 24px", borderTop: "1px solid rgba(28,28,31,0.6)", display: "flex", justifyContent: "flex-end" }}>
          <button onClick={() => logout()} className="settings-btn ghost">
            <LogOut size={12} />
            CERRAR SESIÓN
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div style={{ border: "1px solid rgba(220,38,38,0.3)", borderRadius: 6, overflow: "hidden" }}>
        <div style={{ padding: "14px 24px", borderBottom: "1px solid rgba(220,38,38,0.2)", background: "rgba(220,38,38,0.04)", display: "flex", alignItems: "center", gap: 10 }}>
          <Trash2 size={14} className="text-red-500/70" />
          <span className="lbl" style={{ color: "#EF4444" }}>DANGER ZONE</span>
        </div>
        <div style={{ padding: "28px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: "#FAFAFA", marginBottom: 6 }}>Eliminar Cuenta</div>
            <div style={{ fontSize: 12, color: "#71717A", lineHeight: 1.5 }}>Todos tus registros financieros y datos personales serán borrados permanentemente.</div>
          </div>
          <button onClick={handleDeleteAccount} disabled={loading} className="settings-btn danger">ELIMINAR CUENTA</button>
        </div>
      </div>

      <style>{`
        .settings-btn {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 10px; font-weight: 600; letter-spacing: 0.06em;
          padding: 10px 20px; border-radius: 4px; border: none;
          cursor: pointer; transition: all 0.2s; white-space: nowrap;
        }
        .settings-btn:disabled { opacity: 0.5; cursor: wait; }
        .settings-btn.primary { background: #FAFAFA; color: #09090B; }
        .settings-btn.primary:hover:not(:disabled) { background: #E4E4E7; }
        .settings-btn.accent { background: #E8FF47; color: #09090B; }
        .settings-btn.accent:hover:not(:disabled) { background: #d4ed36; }
        .settings-btn.ghost { background: rgba(255,255,255,0.04); color: #A1A1AA; border: 1px solid #27272A; }
        .settings-btn.ghost:hover:not(:disabled) { background: rgba(255,255,255,0.08); color: #FAFAFA; border-color: #3F3F46; }
        .settings-btn.danger { background: rgba(220,38,38,0.1); color: #FCA5A5; border: 1px solid rgba(239,68,68,0.3); flex-shrink: 0; }
        .settings-btn.danger:hover:not(:disabled) { background: rgba(220,38,38,0.2); border-color: rgba(239,68,68,0.6); color: white; }
      `}</style>
    </div>
  );
}
