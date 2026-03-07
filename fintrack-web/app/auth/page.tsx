"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, ArrowLeft, Loader2 } from "lucide-react";

const API = "http://127.0.0.1:8000";

type Step = "email" | "login" | "register";

export default function AuthPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");

  const emailRef = useRef<HTMLInputElement>(null);
  const passRef = useRef<HTMLInputElement>(null);
  const nombreRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (step === "email") emailRef.current?.focus();
    else if (step === "login") passRef.current?.focus();
    else if (step === "register") nombreRef.current?.focus();
  }, [step]);

  /* ─── Check email ─── */
  const handleCheckEmail = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/auth/check-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("Error al verificar el email");
      const data = await res.json();
      setStep(data.exists ? "login" : "register");
    } catch {
      setError("No se pudo conectar con el servidor. Verifica que el backend está activo.");
    } finally {
      setLoading(false);
    }
  };

  /* ─── Login ─── */
  const handleLogin = async () => {
    if (!password.trim()) return;
    setLoading(true);
    setError("");
    try {
      const body = new URLSearchParams();
      body.append("username", email);
      body.append("password", password);

      const res = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || "Credenciales incorrectas");
      }

      const data = await res.json();
      localStorage.setItem("fintrack_token", data.access_token);
      localStorage.setItem("fintrack_user", JSON.stringify(data.usuario));
      router.push("/dashboard");
    } catch (e: any) {
      setError(e.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  /* ─── Register ─── */
  const handleRegister = async () => {
    if (!nombre.trim() || !apellidos.trim() || !fechaNacimiento || !password.trim()) {
      setError("Todos los campos son obligatorios");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre,
          apellidos,
          email,
          fecha_nacimiento: fechaNacimiento,
          contrasena: password,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.detail || "Error al crear cuenta");
      }

      // Auto-login after registration
      const loginBody = new URLSearchParams();
      loginBody.append("username", email);
      loginBody.append("password", password);

      const loginRes = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: loginBody.toString(),
      });

      if (loginRes.ok) {
        const data = await loginRes.json();
        localStorage.setItem("fintrack_token", data.access_token);
        localStorage.setItem("fintrack_user", JSON.stringify(data.usuario));
      }

      router.push("/dashboard");
    } catch (e: any) {
      setError(e.message || "Error al registrarse");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === "email") handleCheckEmail();
    else if (step === "login") handleLogin();
    else handleRegister();
  };

  const inputClass =
    "w-full bg-transparent border border-zinc-800 px-5 py-4 font-mono text-[12px] tracking-[0.08em] text-[#FAFAF9] placeholder-zinc-700 outline-none transition-all duration-200 focus:border-[#E8FF47]/40 focus:bg-zinc-900/30";

  return (
    <div className="grain relative flex min-h-screen flex-col bg-[#09090B] text-white antialiased" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@300;400;500&family=DM+Sans:ital,opsz,wght@0,9..40,100..900;1,9..40,300&display=swap');
        .grain::after {
          content: ''; position: fixed; inset: -200%; width: 400%; height: 400%;
          pointer-events: none; z-index: 250; opacity: .018;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.78' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 180px 180px;
        }
        @keyframes orbPulse {
          0% { transform: scale(1); opacity: .12; }
          50% { transform: scale(1.08); opacity: .06; }
          100% { transform: scale(1); opacity: .12; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp .6s cubic-bezier(.16,1,.3,1) both; }
        .fade-up-1 { animation-delay: .1s; }
        .fade-up-2 { animation-delay: .2s; }
        .fade-up-3 { animation-delay: .3s; }
        .fade-up-4 { animation-delay: .35s; }
        .fade-up-5 { animation-delay: .4s; }
        .fade-up-6 { animation-delay: .45s; }
      `}</style>

      {/* Background orb */}
      <div className="pointer-events-none fixed inset-0 flex items-center justify-center overflow-hidden" aria-hidden>
        <div
          style={{
            width: 700, height: 700, borderRadius: "50%",
            background: "radial-gradient(ellipse at center, rgba(232,255,71,.06) 0%, transparent 68%)",
            filter: "blur(50px)",
            animation: "orbPulse 8s ease-in-out infinite",
          }}
        />
      </div>

      {/* Top bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800 bg-[#09090B]/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-8 py-5">
          <Link href="/" className="flex items-center gap-3">
            <img src="/unnamed.jpg" alt="FinTrack" className="h-5 w-5 object-contain" />
            <span className="font-mono text-[11px] tracking-[0.35em] text-[#FAFAF9]">FINTRACK</span>
          </Link>
          <Link href="/" className="group flex items-center gap-2 font-mono text-[10px] tracking-[0.18em] text-zinc-600 transition-colors hover:text-zinc-200">
            <ArrowLeft size={11} className="transition-transform group-hover:-translate-x-0.5" />
            VOLVER
          </Link>
        </div>
      </nav>

      {/* Main content */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pt-20">
        <div className="w-full max-w-[420px]">

          {/* Header */}
          <div className="mb-10 fade-up">
            <div className="mb-4 flex items-center gap-4">
              <div className="h-px w-5 bg-[#E8FF47]" />
              <span className="font-mono text-[9px] tracking-[0.42em] text-zinc-600">
                {step === "email" ? "AUTENTICACIÓN" : step === "login" ? "BIENVENIDO" : "NUEVA CUENTA"}
              </span>
            </div>
            <h1
              className="text-white"
              style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(42px, 7vw, 64px)", letterSpacing: "0.02em", lineHeight: 0.95 }}
            >
              {step === "email" ? "IDENTIFÍCATE" : step === "login" ? "INICIAR SESIÓN" : "CREAR CUENTA"}
            </h1>
            <p className="mt-4 text-sm font-light leading-relaxed text-zinc-600">
              {step === "email"
                ? "Introduce tu email para continuar. Si ya tienes cuenta, iniciarás sesión. Si no, crearemos una nueva."
                : step === "login"
                  ? "Introduce tu contraseña para acceder a tu dashboard financiero."
                  : "Completa la información para crear tu cuenta en FinTrack."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email — always shown */}
            <div className="fade-up fade-up-1">
              <label className="mb-2 block font-mono text-[9px] tracking-[0.28em] text-zinc-600">EMAIL</label>
              <input
                ref={emailRef}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@ejemplo.com"
                className={inputClass}
                disabled={step !== "email"}
                style={step !== "email" ? { opacity: 0.5, borderColor: "#27272A" } : {}}
                required
              />
              {step !== "email" && (
                <button
                  type="button"
                  onClick={() => { setStep("email"); setPassword(""); setError(""); }}
                  className="mt-2 font-mono text-[9px] tracking-[0.18em] text-[#E8FF47]/60 transition-colors hover:text-[#E8FF47]"
                >
                  CAMBIAR EMAIL
                </button>
              )}
            </div>

            {/* Login — password only */}
            {step === "login" && (
              <div className="fade-up fade-up-2">
                <label className="mb-2 block font-mono text-[9px] tracking-[0.28em] text-zinc-600">CONTRASEÑA</label>
                <input
                  ref={passRef}
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={inputClass}
                  required
                />
              </div>
            )}

            {/* Register — all fields */}
            {step === "register" && (
              <>
                <div className="grid grid-cols-2 gap-3 fade-up fade-up-2">
                  <div>
                    <label className="mb-2 block font-mono text-[9px] tracking-[0.28em] text-zinc-600">NOMBRE</label>
                    <input
                      ref={nombreRef}
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="Jorge"
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-2 block font-mono text-[9px] tracking-[0.28em] text-zinc-600">APELLIDOS</label>
                    <input
                      type="text"
                      value={apellidos}
                      onChange={(e) => setApellidos(e.target.value)}
                      placeholder="Martínez García"
                      className={inputClass}
                      required
                    />
                  </div>
                </div>
                <div className="fade-up fade-up-3">
                  <label className="mb-2 block font-mono text-[9px] tracking-[0.28em] text-zinc-600">FECHA DE NACIMIENTO</label>
                  <input
                    type="date"
                    value={fechaNacimiento}
                    onChange={(e) => setFechaNacimiento(e.target.value)}
                    className={`${inputClass} [color-scheme:dark]`}
                    required
                  />
                </div>
                <div className="fade-up fade-up-4">
                  <label className="mb-2 block font-mono text-[9px] tracking-[0.28em] text-zinc-600">CONTRASEÑA</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    className={inputClass}
                    minLength={8}
                    required
                  />
                </div>
              </>
            )}

            {/* Error */}
            {error && (
              <div className="border border-red-500/20 bg-red-500/5 px-4 py-3">
                <span className="font-mono text-[10px] tracking-[0.1em] text-red-400">{error}</span>
              </div>
            )}

            {/* Submit */}
            <div className={`fade-up ${step === "register" ? "fade-up-5" : "fade-up-2"}`}>
              <button
                type="submit"
                disabled={loading}
                className="group flex w-full items-center justify-center gap-2.5 bg-[#E8FF47] px-7 py-4 font-mono text-[10px] tracking-[0.22em] text-black transition-all duration-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <>
                    {step === "email" ? "CONTINUAR" : step === "login" ? "INICIAR SESIÓN" : "CREAR CUENTA"}
                    <ArrowUpRight size={12} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer text */}
          <div className={`mt-6 text-center fade-up ${step === "register" ? "fade-up-6" : "fade-up-3"}`}>
            <p className="font-mono text-[9px] tracking-[0.18em] text-zinc-700">
              {step === "email"
                ? "CIFRADO AES-256 · DATOS 100% PRIVADOS"
                : step === "login"
                  ? "¿OLVIDASTE TU CONTRASEÑA? CONTACTA SOPORTE"
                  : "AL REGISTRARTE ACEPTAS NUESTROS "}
              {step === "register" && (
                <Link href="/terms" className="text-zinc-500 underline decoration-zinc-700 underline-offset-2 transition-colors hover:text-zinc-300">
                  TÉRMINOS DE SERVICIO
                </Link>
              )}
            </p>
          </div>

          {/* Security badges */}
          <div className="mt-10 flex items-center justify-center gap-6 fade-up fade-up-3">
            {[
              { label: "AES-256", value: "ENCRYPTED" },
              { label: "0 DATA", value: "SHARED" },
              { label: "JWT", value: "AUTH" },
            ].map((b) => (
              <div key={b.label} className="text-center">
                <div className="font-mono text-[10px] font-medium text-zinc-500">{b.label}</div>
                <div className="font-mono text-[8px] tracking-[0.2em] text-zinc-800">{b.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom links */}
      <footer className="relative z-10 border-t border-zinc-800/50 px-10 py-6">
        <div className="mx-auto flex max-w-screen-xl items-center justify-center gap-8">
          <Link href="/legal" className="font-mono text-[9px] tracking-[0.22em] text-zinc-700 transition-colors hover:text-zinc-400">LEGAL</Link>
          <Link href="/terms" className="font-mono text-[9px] tracking-[0.22em] text-zinc-700 transition-colors hover:text-zinc-400">TERMS</Link>
          <Link href="/cookies" className="font-mono text-[9px] tracking-[0.22em] text-zinc-700 transition-colors hover:text-zinc-400">COOKIES</Link>
        </div>
      </footer>
    </div>
  );
}
