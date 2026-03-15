"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../context/AuthContext";
import { ChevronRight, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Turnstile } from '@marsidev/react-turnstile';

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Por favor, introduce tu email y contraseña.");
      return;
    }

    if (!turnstileToken && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) {
      setError("Por favor, completa la verificación de seguridad.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);
      if (turnstileToken) {
        formData.append("turnstile_token", turnstileToken);
      }

      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData,
        credentials: "include" // Important for cookies
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "Credenciales incorrectas");
      }

      // No need to setToken manually anymore
      login(data.usuario);
      
    } catch (err: any) {
      setError(err.message || "Error al iniciar sesión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#09090B] px-5 py-10 selection:bg-[#E8FF47]/20 selection:text-[#E8FF47]">
      <div className="w-full max-w-[400px]">
        
        <Link href="/" className="mb-12 flex items-center gap-3 transition-opacity hover:opacity-80">
          <img src="/png.png" alt="FinTrack" className="h-5 w-5 object-contain" />
          <span className="font-mono text-[11px] tracking-[0.35em] text-zinc-400">FINTRACK</span>
        </Link>

        <div className="mb-10">
          <h1 className="mb-2" style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: "clamp(40px,5vw,56px)", letterSpacing: ".02em", lineHeight: .92, color: "#FAFAF9" }}>
            ACCEDER AL <span style={{ color: "#E8FF47" }}>SISTEMA</span>
          </h1>
          <p className="text-sm font-light text-zinc-500" style={{ fontFamily: "'DM Sans',sans-serif" }}>
            Introduce tus credenciales para continuar al dashboard.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-3 border border-red-500/20 bg-red-500/5 px-4 py-3">
            <AlertCircle className="mt-0.5 shrink-0 text-red-500" size={16} />
            <span className="text-xs leading-relaxed text-red-400 font-mono tracking-wide">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] tracking-[0.1em] text-zinc-500">EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border border-zinc-800 bg-zinc-950 px-4 py-3.5 font-mono text-sm tracking-wide text-zinc-200 outline-none transition-colors placeholder:text-zinc-700 hover:border-zinc-700 focus:border-[#E8FF47]/50"
              placeholder="tu@email.com"
              autoComplete="email"
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="font-mono text-[10px] tracking-[0.1em] text-zinc-500">CONTRASEÑA</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border border-zinc-800 bg-zinc-950 px-4 py-3.5 font-mono text-sm tracking-wide text-zinc-200 outline-none transition-colors placeholder:text-zinc-700 hover:border-zinc-700 focus:border-[#E8FF47]/50"
              placeholder="••••••••"
              autoComplete="current-password"
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
            className="group mt-4 flex items-center justify-center gap-2 border border-zinc-700 bg-white px-6 py-4 font-mono text-[11px] font-bold tracking-[0.2em] text-black transition-all hover:bg-zinc-200 disabled:opacity-50 disabled:hover:bg-white"
          >
            {isLoading ? (
              <Loader2 className="animate-spin text-black" size={16} strokeWidth={2.5} />
            ) : (
              <>
                INICIAR SESIÓN
                <ChevronRight size={14} className="transition-transform group-hover:translate-x-1" strokeWidth={2.5} />
              </>
            )}
          </button>
        </form>

        <div className="mt-10 flex flex-col items-center gap-4">
          <div className="h-px w-full bg-zinc-900" />
          <p className="font-mono text-[10px] tracking-[0.15em] text-zinc-600">
            ¿NO TIENES CUENTA?{" "}
            <Link href="/auth/register" className="text-[#E8FF47] transition-colors hover:text-[#d4eb3a]">
              REGÍSTRATE AQUÍ
            </Link>
          </p>
        </div>
        
      </div>
    </div>
  );
}
