"use client";
import * as gtag from "@/lib/datalayer";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");
  const googleError = searchParams.get("error");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al iniciar sesión");
      } else {
        gtag.login("email");
        if (returnUrl) window.location.href = returnUrl;
        else if (data.user?.role === "ADMIN") window.location.href = "/panel";
        else window.location.href = "/mi-cuenta";
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword(e: React.FormEvent) {
    e.preventDefault();
    setForgotLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      setForgotSent(true);
    } catch {
      setError("Error al enviar email");
    } finally {
      setForgotLoading(false);
    }
  }

  function handleGoogleLogin() {
    gtag.login("google");
    window.location.href = "/api/auth/google";
  }

  // Forgot password modal
  if (showForgot) {
    return (
      <div className="space-y-4">
        {forgotSent ? (
          <div className="text-center py-6">
            <div className="text-4xl mb-3">📧</div>
            <h2 className="text-xl font-bold text-white mb-2">Revisa tu email</h2>
            <p className="text-neutral-400 text-sm mb-4">
              Si existe una cuenta con <strong className="text-white">{forgotEmail}</strong>, te enviamos un enlace para restablecer tu contraseña.
            </p>
            <button onClick={() => { setShowForgot(false); setForgotSent(false); }} className="text-primary text-sm hover:underline">
              Volver al login
            </button>
          </div>
        ) : (
          <>
            <p className="text-neutral-400 text-sm">Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.</p>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <input
                type="email"
                placeholder="Tu email"
                required
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none"
              />
              <button type="submit" disabled={forgotLoading} className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition disabled:opacity-50">
                {forgotLoading ? "Enviando..." : "ENVIAR ENLACE"}
              </button>
            </form>
            <button onClick={() => setShowForgot(false)} className="w-full text-center text-neutral-500 text-sm hover:text-white">
              Volver al login
            </button>
          </>
        )}
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}
      {googleError && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-4 text-sm">
          {googleError === "google_cancelled" ? "Inicio con Google cancelado" : "Error al iniciar con Google. Intenta de nuevo."}
        </div>
      )}

      {/* Google Login Button */}
      <button
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-3 py-3 bg-white hover:bg-neutral-100 text-neutral-800 font-medium rounded-lg transition mb-4"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continuar con Google
      </button>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px bg-neutral-700" />
        <span className="text-neutral-500 text-xs">o con email</span>
        <div className="flex-1 h-px bg-neutral-700" />
      </div>

      {/* Email/Password Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none"
        />
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="Contraseña"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none"
        />
        <div className="text-right">
          <button type="button" onClick={() => setShowForgot(true)} className="text-xs text-neutral-500 hover:text-primary transition">
            ¿Olvidaste tu contraseña?
          </button>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition disabled:opacity-50"
        >
          {loading ? "Cargando..." : "INGRESAR"}
        </button>
      </form>
    </>
  );
}

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="font-heading text-4xl text-center mb-6">INICIAR SESIÓN</h1>
      <Suspense fallback={<div className="text-center text-neutral-500">Cargando...</div>}>
        <LoginForm />
      </Suspense>
      <p className="text-center text-sm text-neutral-400 mt-6">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="text-primary hover:underline">Regístrate</Link>
      </p>
    </div>
  );
}
