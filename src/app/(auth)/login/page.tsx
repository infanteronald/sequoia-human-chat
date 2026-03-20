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
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl");

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
        if (returnUrl) {
          window.location.href = returnUrl;
        } else if (data.user?.role === "ADMIN") {
          window.location.href = "/panel";
        } else {
          window.location.href = "/mi-cuenta";
        }
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none"
        />
        <input
          type="password"
          placeholder="Contraseña"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none"
        />
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
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="font-heading text-5xl text-center mb-8">INICIAR SESIÓN</h1>
      <Suspense fallback={<div className="text-center text-neutral-500">Cargando...</div>}>
        <LoginForm />
      </Suspense>
      <p className="text-center text-sm text-neutral-400 mt-6">
        ¿No tienes cuenta?{" "}
        <Link href="/registro" className="text-primary hover:underline">
          Regístrate
        </Link>
      </p>
    </div>
  );
}
