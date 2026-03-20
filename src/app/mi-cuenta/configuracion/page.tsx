"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function ConfiguracionPage() {
  const [user, setUser] = useState<{ name: string; email: string; phone: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { setUser(data?.user || null); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/login", { method: "DELETE" });
    window.location.href = "/login";
  };

  if (loading) return <div className="max-w-xl mx-auto px-4 py-8 text-neutral-500">Cargando...</div>;

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <Link href="/mi-cuenta" className="text-sm text-neutral-500 hover:text-white">&larr; Volver</Link>
      <h1 className="font-heading text-4xl mt-2 mb-8">CONFIGURACIÓN</h1>

      {user ? (
        <div className="space-y-6">
          <div className="bg-surface rounded-xl p-6 border border-neutral-800 space-y-4">
            <div>
              <p className="text-xs text-neutral-500 uppercase">Nombre</p>
              <p className="text-white">{user.name || "Sin nombre"}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 uppercase">Email</p>
              <p className="text-white">{user.email}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-500 uppercase">Teléfono</p>
              <p className="text-white">{user.phone || "No registrado"}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full py-3 bg-red-900/30 hover:bg-red-900/50 text-red-400 font-medium rounded-lg transition border border-red-800/50"
          >
            Cerrar sesión
          </button>
        </div>
      ) : (
        <p className="text-neutral-500">No pudimos cargar tu información. <Link href="/login" className="text-primary">Inicia sesión</Link></p>
      )}
    </div>
  );
}
