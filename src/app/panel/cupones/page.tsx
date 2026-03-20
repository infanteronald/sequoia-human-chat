"use client";

import { useState, useEffect } from "react";

interface Coupon {
  id: string;
  code: string;
  type: string;
  value: number;
  description: string;
  minPurchase: number;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

const EMPTY_COUPON = {
  code: "", type: "percentage", value: 0, description: "",
  minPurchase: 0, maxUses: null as number | null, expiresAt: "", isActive: true,
};

export default function CuponesPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_COUPON);
  const [error, setError] = useState("");

  const loadCoupons = () => {
    fetch("/api/panel/coupons")
      .then((r) => r.json())
      .then(setCoupons)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadCoupons(); }, []);

  const resetForm = () => {
    setForm(EMPTY_COUPON);
    setEditId(null);
    setShowForm(false);
    setError("");
  };

  const startEdit = (coupon: Coupon) => {
    setForm({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      description: coupon.description,
      minPurchase: coupon.minPurchase,
      maxUses: coupon.maxUses,
      expiresAt: coupon.expiresAt ? coupon.expiresAt.split("T")[0] : "",
      isActive: coupon.isActive,
    });
    setEditId(coupon.id);
    setShowForm(true);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.value) {
      setError("Código y valor son requeridos");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/panel/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(editId ? { id: editId } : {}),
          code: form.code.toUpperCase(),
          type: form.type,
          value: Number(form.value),
          description: form.description,
          minPurchase: Number(form.minPurchase) || 0,
          maxUses: form.maxUses ? Number(form.maxUses) : null,
          expiresAt: form.expiresAt || null,
          isActive: form.isActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error guardando cupón");
      } else {
        resetForm();
        loadCoupons();
      }
    } catch {
      setError("Error de conexión");
    }
    setSaving(false);
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm("¿Eliminar este cupón?")) return;
    try {
      await fetch("/api/panel/coupons", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      loadCoupons();
    } catch {}
  };

  const toggleActive = async (coupon: Coupon) => {
    try {
      await fetch("/api/panel/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...coupon, id: coupon.id, isActive: !coupon.isActive }),
      });
      loadCoupons();
    } catch {}
  };

  const formatPrice = (n: number) => "$ " + n.toLocaleString("es-CO");

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-[#0f1923] p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                <line x1="7" y1="7" x2="7.01" y2="7" />
              </svg>
              Cupones
            </h1>
            <p className="text-[#8899aa] mt-2">
              Gestiona cupones de descuento para tu tienda. {coupons.filter(c => c.isActive).length} activos.
            </p>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="px-4 py-2 bg-primary hover:bg-primary/80 text-white text-sm font-medium rounded-lg transition flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Nuevo cupón
          </button>
        </div>

        {/* Create/Edit Form */}
        {showForm && (
          <div className="bg-[#1a2535] border border-[#2a3a4a] rounded-xl p-6 mb-6">
            <h3 className="text-white font-semibold mb-4">{editId ? "Editar cupón" : "Nuevo cupón"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-[#8899aa] mb-1">Código *</label>
                  <input type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                    placeholder="BIENVENIDO10" className="w-full bg-[#0f1923] border border-[#2a3a4a] rounded-lg px-3 py-2.5 text-sm text-white focus:border-primary focus:outline-none uppercase" />
                </div>
                <div>
                  <label className="block text-sm text-[#8899aa] mb-1">Tipo *</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full bg-[#0f1923] border border-[#2a3a4a] rounded-lg px-3 py-2.5 text-sm text-white focus:border-primary focus:outline-none">
                    <option value="percentage">% Porcentaje</option>
                    <option value="fixed">$ Monto fijo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-[#8899aa] mb-1">Valor * {form.type === "percentage" ? "(%)" : "(COP)"}</label>
                  <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                    placeholder={form.type === "percentage" ? "10" : "15000"}
                    className="w-full bg-[#0f1923] border border-[#2a3a4a] rounded-lg px-3 py-2.5 text-sm text-white focus:border-primary focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-sm text-[#8899aa] mb-1">Descripción</label>
                <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="10% de descuento para nuevos clientes" className="w-full bg-[#0f1923] border border-[#2a3a4a] rounded-lg px-3 py-2.5 text-sm text-white focus:border-primary focus:outline-none" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-[#8899aa] mb-1">Compra mínima (COP)</label>
                  <input type="number" value={form.minPurchase} onChange={(e) => setForm({ ...form, minPurchase: Number(e.target.value) })}
                    placeholder="0" className="w-full bg-[#0f1923] border border-[#2a3a4a] rounded-lg px-3 py-2.5 text-sm text-white focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-[#8899aa] mb-1">Usos máximos</label>
                  <input type="number" value={form.maxUses || ""} onChange={(e) => setForm({ ...form, maxUses: e.target.value ? Number(e.target.value) : null })}
                    placeholder="Sin límite" className="w-full bg-[#0f1923] border border-[#2a3a4a] rounded-lg px-3 py-2.5 text-sm text-white focus:border-primary focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-[#8899aa] mb-1">Fecha de expiración</label>
                  <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                    className="w-full bg-[#0f1923] border border-[#2a3a4a] rounded-lg px-3 py-2.5 text-sm text-white focus:border-primary focus:outline-none" />
                </div>
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={resetForm} className="px-4 py-2 text-sm text-[#8899aa] hover:text-white transition">Cancelar</button>
                <button type="submit" disabled={saving}
                  className="px-6 py-2 bg-primary hover:bg-primary/80 text-white text-sm font-medium rounded-lg transition disabled:opacity-50">
                  {saving ? "Guardando..." : editId ? "Actualizar" : "Crear cupón"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Coupons List */}
        {coupons.length === 0 ? (
          <div className="bg-[#1a2535] border border-[#2a3a4a] rounded-xl p-12 text-center">
            <div className="text-4xl mb-4">🏷️</div>
            <p className="text-white font-medium mb-2">No hay cupones creados</p>
            <p className="text-[#667788] text-sm">Crea tu primer cupón de descuento para ofrecer a tus clientes.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="bg-[#1a2535] border border-[#2a3a4a] rounded-xl p-5 hover:border-[#3a4a5a] transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`px-3 py-1.5 rounded-lg font-mono font-bold text-sm ${coupon.isActive ? "bg-primary/20 text-primary" : "bg-neutral-700/50 text-neutral-500"}`}>
                      {coupon.code}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">
                          {coupon.type === "percentage" ? `${coupon.value}%` : formatPrice(coupon.value)} de descuento
                        </span>
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${coupon.isActive ? "bg-green-500/20 text-green-400" : "bg-neutral-700/50 text-neutral-500"}`}>
                          {coupon.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-xs text-[#667788]">
                        {coupon.description && <span>{coupon.description}</span>}
                        <span>Usado: {coupon.usedCount}{coupon.maxUses ? `/${coupon.maxUses}` : ""}</span>
                        {coupon.minPurchase > 0 && <span>Mín: {formatPrice(coupon.minPurchase)}</span>}
                        {coupon.expiresAt && <span>Expira: {new Date(coupon.expiresAt).toLocaleDateString("es-CO")}</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => toggleActive(coupon)}
                      className={`relative w-10 h-5 rounded-full transition-colors duration-200 ${coupon.isActive ? "bg-green-500" : "bg-neutral-600"}`}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${coupon.isActive ? "translate-x-[22px]" : "translate-x-0.5"}`} />
                    </button>
                    <button onClick={() => startEdit(coupon)} className="text-[#667788] hover:text-primary transition p-1">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                    </button>
                    <button onClick={() => deleteCoupon(coupon.id)} className="text-[#667788] hover:text-red-400 transition p-1">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
