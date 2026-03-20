"use client";
import * as gtag from "@/lib/datalayer";

import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error al registrarse");
      } else {
        gtag.signUp("email");
        window.location.href = "/login?registered=1";
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <h1 className="font-heading text-5xl text-center mb-8">CREAR CUENTA</h1>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded-lg mb-6 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Nombre completo"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none"
        />
        <input
          type="email"
          placeholder="Email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none"
        />
        <input
          type="tel"
          placeholder="Teléfono"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none"
        />
        <input
          type="password"
          placeholder="Contraseña"
          required
          minLength={6}
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none"
        />
        <input
          type="password"
          placeholder="Confirmar contraseña"
          required
          value={form.confirmPassword}
          onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-sm focus:border-primary focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition disabled:opacity-50"
        >
          {loading ? "Registrando..." : "CREAR CUENTA"}
        </button>
      </form>

      <p className="text-center text-sm text-neutral-400 mt-6">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="text-primary hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
