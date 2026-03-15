"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Turnstile } from '@marsidev/react-turnstile';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nombre: "",
    apellidos: "",
    email: "",
    password: "",
    fecha_nacimiento: "",
  });
  
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.nombre || !formData.apellidos || !formData.email || !formData.password || !formData.fecha_nacimiento) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    if (formData.password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (!turnstileToken && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
      setError("Por favor, completa la verificación de seguridad.");
      return;
    }

    setIsLoading(true);

    try {
      const API_URL = "/api";
      
      if (!API_URL) throw new Error("La URL de la API no está configurada.");

      const payload = {
        nombre: formData.nombre,
        apellidos: formData.apellidos,
        email: formData.email,
        contrasena: formData.password,
        fecha_nacimiento: formData.fecha_nacimiento,
        turnstile_token: turnstileToken,
      };

      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Error en el registro");
      }

      setIsSuccess(true);
      
    } catch (err: any) {
      setError(err.message || "Error al registrar la cuenta");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#09090B] px-5 py-10">
        <div className="flex w-full max-w-[400px] flex-col items-center border border-[#10B981]/20 bg-[#10B981]/5 p-12 text-center">
          <CheckCircle2 className="mb-6 text-[#10B981]" size={48} strokeWidth={1.5} />
          <h2 className="mb-4" style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "36px", letterSpacing: ".02em", color: "#10B981" }}>
            REGISTRO COMPLETADO
          </h2>
          <p className="mb-8 text-sm font-light leading-relaxed text-zinc-400" style={{ fontFamily: "'DM Sans',sans-serif" }}>
            Hemos enviado un correo de confirmación a <strong className="text-zinc-200">{formData.email}</strong>.<br /><br />
            Por favor, revisa tu bandeja de entrada y verifica tu cuenta para poder iniciar sesión.
          </p>
          <button
            onClick={() => router.push("/auth/login")}
            className="w-full border border-zinc-700 bg-zinc-900 px-6 py-4 font-mono text-[11px] font-bold tracking-[0.2em] text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            VOLVER AL LOGIN
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#09090B] px-5 py-16 selection:bg-[#E8FF47]/20 selection:text-[#E8FF47]">
      <div className="w-full max-w-[440px]">
        
        {/* Logo */}
        <Link href="/" className="mb-12 flex items-center gap-3 transition-opacity hover:opacity-80">
          <img src="/png.png" alt="FinTrack" className="h-5 w-5 object-contain" />
          <span className="font-mono text-[11px] tracking-[0.35em] text-zinc-400">FINTRACK</span>
        </Link>

        {/* Header */}
        <div className="mb-10">
          <h1 className="mb-2" style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(36px,4.5vw,48px)", letterSpacing: ".02em", lineHeight: .92, color: "#FAFAF9" }}>
            CREAR <span style={{ color: "#E8FF47" }}>CUENTA</span>
          </h1>
          <p className="text-sm font-light text-zinc-500" style={{ fontFamily: "'DM Sans',sans-serif" }}>
            Únete a FinTrack y toma el control total de tu patrimonio.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 flex items-start gap-3 border border-red-500/20 bg-red-500/5 px-4 py-3">
            <AlertCircle className="mt-0.5 shrink-0 text-red-500" size={16} />
            <span className="text-xs leading-relaxed text-red-400 font-mono tracking-wide">{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] tracking-[0.1em] text-zinc-500">NOMBRE</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className="border border-zinc-800 bg-zinc-950 px-4 py-3.5 font-mono text-sm tracking-wide text-zinc-200 outline-none transition-colors placeholder:text-zinc-700 hover:border-zinc-700 focus:border-[#E8FF47]/50"
                placeholder="Ej. Juan"
                disabled={isLoading}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="font-mono text-[10px] tracking-[0.1em] text-zinc-500">APELLIDOS</label>
              <input
                type="text"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                className="border border-zinc-800 bg-zinc-950 px-4 py-3.5 font-mono text-sm tracking-wide text-zinc-200 outline-none transition-colors placeholder:text-zinc-700 hover:border-zinc-700 focus:border-[#E8FF47]/50"
                placeholder="Ej. Pérez"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] tracking-[0.1em] text-zinc-500">FECHA NACIMIENTO</label>
            <input
              type="date"
              name="fecha_nacimiento"
              value={formData.fecha_nacimiento}
              onChange={handleChange}
              className="border border-zinc-800 bg-zinc-950 px-4 py-3.5 font-mono text-sm tracking-wider text-zinc-200 outline-none transition-colors hover:border-zinc-700 focus:border-[#E8FF47]/50 [&::-webkit-calendar-picker-indicator]:invert"
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] tracking-[0.1em] text-zinc-500">EMAIL</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="border border-zinc-800 bg-zinc-950 px-4 py-3.5 font-mono text-sm tracking-wide text-zinc-200 outline-none transition-colors placeholder:text-zinc-700 hover:border-zinc-700 focus:border-[#E8FF47]/50"
              placeholder="tu@email.com"
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] tracking-[0.1em] text-zinc-500">CONTRASEÑA</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="border border-zinc-800 bg-zinc-950 px-4 py-3.5 font-mono text-sm tracking-wide text-zinc-200 outline-none transition-colors placeholder:text-zinc-700 hover:border-zinc-700 focus:border-[#E8FF47]/50"
              placeholder="Min. 8 caracteres"
              disabled={isLoading}
            />
          </div>

          {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY && (
            <div className="flex justify-center my-2">
              <Turnstile 
                siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} 
                onSuccess={(token) => setTurnstileToken(token)}
                options={{ theme: 'dark' }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="group mt-4 flex items-center justify-center gap-2 border border-[#E8FF47] bg-[#E8FF47] px-6 py-4 font-mono text-[11px] font-bold tracking-[0.2em] text-black transition-all hover:bg-transparent hover:text-[#E8FF47] disabled:opacity-50 disabled:hover:bg-[#E8FF47] disabled:hover:text-black"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={16} strokeWidth={2.5} />
            ) : (
              <>
                CREAR CUENTA
                <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-10 flex flex-col items-center gap-4">
          <div className="h-px w-full bg-zinc-900" />
          <p className="font-mono text-[10px] tracking-[0.15em] text-zinc-600">
            ¿YA TIENES CUENTA?{" "}
            <Link href="/auth/login" className="text-white transition-colors hover:text-zinc-300">
              INICIA SESIÓN
            </Link>
          </p>
        </div>
        
      </div>
    </div>
  );
}
