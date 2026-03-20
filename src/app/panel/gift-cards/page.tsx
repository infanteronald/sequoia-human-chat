"use client";

import { useState, useEffect } from "react";

interface GiftCard {
  id: number;
  code: string;
  initial_value: number;
  balance: number;
  currency: string;
  status: string;
  customer_email: string | null;
  customer_name: string | null;
  note: string | null;
  expires_at: string | null;
  created_at: string;
  used_at: string | null;
}

interface Stats {
  total: number;
  activeValue: number;
  redeemedAmount: number;
}

const EMPTY_FORM = {
  code: "",
  initial_value: "",
  customer_name: "",
  customer_email: "",
  note: "",
  expires_at: "",
};

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 16; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
    if (i === 3 || i === 7 || i === 11) code += "-";
  }
  return code;
}

function formatCOP(n: number): string {
  return "$ " + n.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  active: { label: "Activa", bg: "bg-emerald-500/15", text: "text-emerald-400" },
  used: { label: "Usada", bg: "bg-neutral-500/15", text: "text-neutral-400" },
  expired: { label: "Expirada", bg: "bg-red-500/15", text: "text-red-400" },
  disabled: { label: "Desactivada", bg: "bg-yellow-500/15", text: "text-yellow-400" },
};

export default function GiftCardsPage() {
  const [cards, setCards] = useState<GiftCard[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, activeValue: 0, redeemedAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState("");
  const [detailCard, setDetailCard] = useState<GiftCard | null>(null);

  const load = () => {
    fetch("/api/panel/gift-cards")
      .then((r) => r.json())
      .then((data) => {
        setCards(data.cards || []);
        setStats(data.stats || { total: 0, activeValue: 0, redeemedAmount: 0 });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setShowForm(false);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code || !form.initial_value) {
      setError("Codigo y valor son requeridos");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/panel/gift-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code,
          initial_value: Number(form.initial_value),
          customer_name: form.customer_name || null,
          customer_email: form.customer_email || null,
          note: form.note || null,
          expires_at: form.expires_at || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error creando tarjeta");
      } else {
        resetForm();
        load();
      }
    } catch {
      setError("Error de conexion");
    }
    setSaving(false);
  };

  const disableCard = async (id: number) => {
    if (!confirm("Desactivar esta tarjeta de regalo?")) return;
    try {
      await fetch("/api/panel/gift-cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disable", id }),
      });
      load();
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-neutral-950">
        <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-screen bg-neutral-950 p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white tracking-tight">Tarjetas de regalo</h1>
            <p className="text-neutral-400 mt-1 text-sm">
              Gestiona tarjetas de regalo para tus clientes
            </p>
          </div>
          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="px-4 py-2.5 bg-white text-neutral-900 text-sm font-medium rounded-lg hover:bg-neutral-100 transition"
          >
            Crear tarjeta de regalo
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total tarjetas", value: stats.total.toString() },
            { label: "Valor activo", value: formatCOP(stats.activeValue) },
            { label: "Monto canjeado", value: formatCOP(stats.redeemedAmount) },
          ].map((s) => (
            <div key={s.label} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
              <p className="text-neutral-400 text-xs font-medium uppercase tracking-wider">{s.label}</p>
              <p className="text-white text-2xl font-semibold mt-2">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Create Form */}
        {showForm && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-8">
            <h3 className="text-white font-medium mb-5">Nueva tarjeta de regalo</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-neutral-400 mb-1.5">Codigo *</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={form.code}
                      onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                      placeholder="XXXX-XXXX-XXXX-XXXX"
                      className="flex-1 bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder-neutral-600 focus:border-neutral-600 focus:outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, code: generateCode() })}
                      className="px-3 py-2.5 bg-neutral-800 text-neutral-300 text-sm rounded-lg hover:bg-neutral-700 transition whitespace-nowrap"
                    >
                      Generar
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-1.5">Valor (COP) *</label>
                  <input
                    type="number"
                    value={form.initial_value}
                    onChange={(e) => setForm({ ...form, initial_value: e.target.value })}
                    placeholder="50000"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder-neutral-600 focus:border-neutral-600 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-neutral-400 mb-1.5">Nombre del cliente</label>
                  <input
                    type="text"
                    value={form.customer_name}
                    onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                    placeholder="Juan Perez"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder-neutral-600 focus:border-neutral-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-1.5">Email del cliente</label>
                  <input
                    type="email"
                    value={form.customer_email}
                    onChange={(e) => setForm({ ...form, customer_email: e.target.value })}
                    placeholder="cliente@email.com"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder-neutral-600 focus:border-neutral-600 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-neutral-400 mb-1.5">Nota</label>
                  <input
                    type="text"
                    value={form.note}
                    onChange={(e) => setForm({ ...form, note: e.target.value })}
                    placeholder="Nota interna..."
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder-neutral-600 focus:border-neutral-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-neutral-400 mb-1.5">Fecha de expiracion</label>
                  <input
                    type="date"
                    value={form.expires_at}
                    onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-3 py-2.5 text-sm text-white placeholder-neutral-600 focus:border-neutral-600 focus:outline-none"
                  />
                </div>
              </div>
              {error && <p className="text-red-400 text-sm">{error}</p>}
              <div className="flex justify-end gap-3 pt-1">
                <button type="button" onClick={resetForm} className="px-4 py-2.5 text-sm text-neutral-400 hover:text-white transition">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-white text-neutral-900 text-sm font-medium rounded-lg hover:bg-neutral-100 transition disabled:opacity-50"
                >
                  {saving ? "Creando..." : "Crear tarjeta"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Detail Modal */}
        {detailCard && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDetailCard(null)}>
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-medium">Detalle de tarjeta</h3>
                <button onClick={() => setDetailCard(null)} className="text-neutral-500 hover:text-white transition">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
              <div className="space-y-4">
                <div className="bg-neutral-950 rounded-lg p-4 text-center">
                  <p className="text-neutral-400 text-xs uppercase tracking-wider mb-1">Codigo</p>
                  <p className="text-white text-lg font-mono font-semibold">{detailCard.code}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-neutral-500 text-xs mb-1">Valor inicial</p>
                    <p className="text-white text-sm font-medium">{formatCOP(detailCard.initial_value)}</p>
                  </div>
                  <div>
                    <p className="text-neutral-500 text-xs mb-1">Saldo</p>
                    <p className="text-white text-sm font-medium">{formatCOP(detailCard.balance)}</p>
                  </div>
                  <div>
                    <p className="text-neutral-500 text-xs mb-1">Estado</p>
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${(statusConfig[detailCard.status] || statusConfig.active).bg} ${(statusConfig[detailCard.status] || statusConfig.active).text}`}>
                      {(statusConfig[detailCard.status] || statusConfig.active).label}
                    </span>
                  </div>
                  <div>
                    <p className="text-neutral-500 text-xs mb-1">Moneda</p>
                    <p className="text-white text-sm">{detailCard.currency}</p>
                  </div>
                </div>
                {detailCard.customer_name && (
                  <div>
                    <p className="text-neutral-500 text-xs mb-1">Cliente</p>
                    <p className="text-white text-sm">{detailCard.customer_name}</p>
                    {detailCard.customer_email && <p className="text-neutral-400 text-xs">{detailCard.customer_email}</p>}
                  </div>
                )}
                {detailCard.note && (
                  <div>
                    <p className="text-neutral-500 text-xs mb-1">Nota</p>
                    <p className="text-neutral-300 text-sm">{detailCard.note}</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-neutral-800">
                  <div>
                    <p className="text-neutral-500 text-xs mb-1">Creada</p>
                    <p className="text-neutral-300 text-sm">{new Date(detailCard.created_at).toLocaleDateString("es-CO")}</p>
                  </div>
                  {detailCard.expires_at && (
                    <div>
                      <p className="text-neutral-500 text-xs mb-1">Expira</p>
                      <p className="text-neutral-300 text-sm">{new Date(detailCard.expires_at).toLocaleDateString("es-CO")}</p>
                    </div>
                  )}
                  {detailCard.used_at && (
                    <div>
                      <p className="text-neutral-500 text-xs mb-1">Usada</p>
                      <p className="text-neutral-300 text-sm">{new Date(detailCard.used_at).toLocaleDateString("es-CO")}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        {cards.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-16 text-center">
            <p className="text-white font-medium mb-2">No hay tarjetas de regalo</p>
            <p className="text-neutral-500 text-sm">Crea tu primera tarjeta de regalo para comenzar.</p>
          </div>
        ) : (
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-800">
                    <th className="text-left text-xs font-medium text-neutral-400 uppercase tracking-wider px-5 py-3">Codigo</th>
                    <th className="text-left text-xs font-medium text-neutral-400 uppercase tracking-wider px-5 py-3">Valor inicial</th>
                    <th className="text-left text-xs font-medium text-neutral-400 uppercase tracking-wider px-5 py-3">Saldo</th>
                    <th className="text-left text-xs font-medium text-neutral-400 uppercase tracking-wider px-5 py-3">Estado</th>
                    <th className="text-left text-xs font-medium text-neutral-400 uppercase tracking-wider px-5 py-3">Cliente</th>
                    <th className="text-left text-xs font-medium text-neutral-400 uppercase tracking-wider px-5 py-3">Creada</th>
                    <th className="text-right text-xs font-medium text-neutral-400 uppercase tracking-wider px-5 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800/50">
                  {cards.map((card) => {
                    const sc = statusConfig[card.status] || statusConfig.active;
                    return (
                      <tr key={card.id} className="hover:bg-neutral-800/30 transition-colors">
                        <td className="px-5 py-4">
                          <span className="text-white text-sm font-mono">{card.code}</span>
                        </td>
                        <td className="px-5 py-4 text-neutral-300 text-sm">{formatCOP(card.initial_value)}</td>
                        <td className="px-5 py-4 text-white text-sm font-medium">{formatCOP(card.balance)}</td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${sc.bg} ${sc.text}`}>
                            {sc.label}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {card.customer_name ? (
                            <div>
                              <p className="text-neutral-300 text-sm">{card.customer_name}</p>
                              {card.customer_email && <p className="text-neutral-500 text-xs">{card.customer_email}</p>}
                            </div>
                          ) : (
                            <span className="text-neutral-600 text-sm">--</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-neutral-400 text-sm">
                          {new Date(card.created_at).toLocaleDateString("es-CO")}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => setDetailCard(card)}
                              className="p-1.5 text-neutral-500 hover:text-white transition rounded-lg hover:bg-neutral-800"
                              title="Ver detalle"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                            </button>
                            {card.status === "active" && (
                              <button
                                onClick={() => disableCard(card.id)}
                                className="p-1.5 text-neutral-500 hover:text-yellow-400 transition rounded-lg hover:bg-neutral-800"
                                title="Desactivar"
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
