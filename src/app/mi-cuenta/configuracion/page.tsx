"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function ConfiguracionPage() {
  const [user, setUser] = useState<{ name: string; email: string; phone: string; image: string | null } | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Password change
  const [showPassword, setShowPassword] = useState(false);
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passMsg, setPassMsg] = useState("");
  const [passSaving, setPassSaving] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        const u = data?.user || null;
        setUser(u);
        if (u) { setName(u.name || ""); setPhone(u.phone || ""); }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSaveProfile() {
    setSaving(true);
    setSaveMsg("");
    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      if (res.ok) {
        setSaveMsg("✅ Datos actualizados");
        setUser(prev => prev ? { ...prev, name, phone } : null);
        setEditMode(false);
      } else {
        setSaveMsg("❌ Error al guardar");
      }
    } catch { setSaveMsg("❌ Error de conexión"); }
    finally { setSaving(false); setTimeout(() => setSaveMsg(""), 3000); }
  }

  async function handleChangePassword() {
    if (newPass !== confirmPass) { setPassMsg("❌ Las contraseñas no coinciden"); return; }
    if (newPass.length < 6) { setPassMsg("❌ Mínimo 6 caracteres"); return; }
    setPassSaving(true);
    setPassMsg("");
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass }),
      });
      const data = await res.json();
      if (res.ok) {
        setPassMsg("✅ Contraseña actualizada");
        setCurrentPass(""); setNewPass(""); setConfirmPass("");
        setShowPassword(false);
      } else {
        setPassMsg("❌ " + (data.error || "Error"));
      }
    } catch { setPassMsg("❌ Error de conexión"); }
    finally { setPassSaving(false); setTimeout(() => setPassMsg(""), 4000); }
  }

  const handleLogout = async () => {
    await fetch("/api/auth/login", { method: "DELETE" });
    window.location.href = "/login";
  };

  if (loading) return <div className="max-w-xl mx-auto px-4 py-8 text-neutral-500">Cargando...</div>;

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <Link href="/mi-cuenta" className="text-xs text-neutral-500 hover:text-white mb-2 inline-block">← Mi Cuenta</Link>
      <h1 className="font-heading text-3xl mb-6">CONFIGURACIÓN</h1>

      {user ? (
        <div className="space-y-4">
          {/* Profile */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Datos personales</h2>
              {!editMode && (
                <button onClick={() => setEditMode(true)} className="text-xs text-primary hover:underline">Editar</button>
              )}
            </div>
            {editMode ? (
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] text-neutral-600 uppercase">Nombre</label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none mt-1" />
                </div>
                <div>
                  <label className="text-[10px] text-neutral-600 uppercase">Teléfono</label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none mt-1" />
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSaveProfile} disabled={saving}
                    className="flex-1 py-2 bg-primary text-white text-sm font-medium rounded-lg disabled:opacity-50">
                    {saving ? "Guardando..." : "Guardar"}
                  </button>
                  <button onClick={() => { setEditMode(false); setName(user.name || ""); setPhone(user.phone || ""); }}
                    className="px-4 py-2 border border-neutral-700 text-neutral-400 text-sm rounded-lg">Cancelar</button>
                </div>
                {saveMsg && <p className="text-xs text-center">{saveMsg}</p>}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] text-neutral-600 uppercase">Nombre</p>
                  <p className="text-sm text-white">{user.name || "Sin nombre"}</p>
                </div>
                <div>
                  <p className="text-[10px] text-neutral-600 uppercase">Email</p>
                  <p className="text-sm text-white">{user.email}</p>
                </div>
                <div>
                  <p className="text-[10px] text-neutral-600 uppercase">Teléfono</p>
                  <p className="text-sm text-white">{user.phone || "No registrado"}</p>
                </div>
              </div>
            )}
          </div>

          {/* Change Password */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Contraseña</h2>
              {!showPassword && (
                <button onClick={() => setShowPassword(true)} className="text-xs text-primary hover:underline">Cambiar</button>
              )}
            </div>
            {showPassword ? (
              <div className="space-y-3">
                <input type="password" placeholder="Contraseña actual" value={currentPass} onChange={e => setCurrentPass(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                <input type="password" placeholder="Nueva contraseña" value={newPass} onChange={e => setNewPass(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                <input type="password" placeholder="Confirmar nueva contraseña" value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
                  className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm focus:border-primary focus:outline-none" />
                <div className="flex gap-2">
                  <button onClick={handleChangePassword} disabled={passSaving}
                    className="flex-1 py-2 bg-primary text-white text-sm font-medium rounded-lg disabled:opacity-50">
                    {passSaving ? "Guardando..." : "Cambiar contraseña"}
                  </button>
                  <button onClick={() => { setShowPassword(false); setCurrentPass(""); setNewPass(""); setConfirmPass(""); }}
                    className="px-4 py-2 border border-neutral-700 text-neutral-400 text-sm rounded-lg">Cancelar</button>
                </div>
                {passMsg && <p className="text-xs text-center">{passMsg}</p>}
              </div>
            ) : (
              <p className="text-xs text-neutral-500">••••••••</p>
            )}
          </div>

          {/* Logout */}
          <button onClick={handleLogout}
            className="w-full py-2.5 bg-red-900/20 hover:bg-red-900/40 text-red-400 text-sm font-medium rounded-xl transition border border-red-800/30">
            Cerrar sesión
          </button>
        </div>
      ) : (
        <p className="text-neutral-500">No pudimos cargar tu información. <Link href="/login" className="text-primary">Inicia sesión</Link></p>
      )}
    </div>
  );
}
