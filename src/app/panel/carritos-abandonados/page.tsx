"use client";

import { useState, useEffect, useCallback } from "react";

interface CartItem {
  id: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  variantName?: string;
}

interface AbandonedCart {
  id: string;
  email: string | null;
  phone: string | null;
  name: string | null;
  items: CartItem[];
  total: number;
  recoverySent: boolean;
  recoverySentAt: string | null;
  recovered: boolean;
  createdAt: string;
}

interface Stats {
  total: number;
  recovered: number;
  contacted: number;
  totalValue: number;
  recoveryRate: number;
}

function formatPrice(n: number) {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 0 }).format(n);
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  return `${Math.floor(days / 30)}mo`;
}

/* ─── Icons ─── */
function IconCart() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 002-1.61L23 6H6"/>
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  );
}

function IconPercent() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>
    </svg>
  );
}

function IconDollar() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
    </svg>
  );
}

function IconSend() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  );
}

function IconRefresh() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
    </svg>
  );
}

/* ─── Stat Card ─── */
function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="text-neutral-500">{icon}</div>
        <span className="text-xs text-neutral-500 uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-semibold text-white">{value}</div>
      {sub && <div className="text-xs text-neutral-500 mt-1">{sub}</div>}
    </div>
  );
}

/* ─── Status Badge ─── */
function StatusBadge({ recovered, recoverySent }: { recovered: boolean; recoverySent: boolean }) {
  if (recovered) {
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-400/10 text-emerald-400 border border-emerald-400/20">Recuperado</span>;
  }
  if (recoverySent) {
    return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-400/10 text-blue-400 border border-blue-400/20">Contactado</span>;
  }
  return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-400/10 text-yellow-400 border border-yellow-400/20">Abandonado</span>;
}

/* ─── Filter Tabs ─── */
const PERIODS = [
  { key: "all", label: "Todos" },
  { key: "24h", label: "Últimas 24h" },
  { key: "week", label: "Última semana" },
  { key: "month", label: "Último mes" },
] as const;

/* ─── Main Page ─── */
export default function CarritosAbandonadosPage() {
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, recovered: 0, contacted: 0, totalValue: 0, recoveryRate: 0 });
  const [period, setPeriod] = useState("all");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);
  const [autoRecovery, setAutoRecovery] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [reminderDelay, setReminderDelay] = useState("1");
  const [maxReminders, setMaxReminders] = useState("3");
  const [reminderTemplate, setReminderTemplate] = useState(
    "¡Hola {{nombre}}! Dejaste productos en tu carrito por {{total}}. Completa tu compra con 15% OFF usando el código VUELVE15 👉 https://sequoiaspeed.com.co/carrito"
  );

  const fetchCarts = useCallback(() => {
    setLoading(true);
    fetch(`/api/panel/abandoned-carts?period=${period}`)
      .then((r) => r.json())
      .then((d) => {
        setCarts(d.carts || []);
        setStats(d.stats || { total: 0, recovered: 0, contacted: 0, totalValue: 0, recoveryRate: 0 });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [period]);

  useEffect(() => { fetchCarts(); }, [fetchCarts]);

  const sendReminder = async (cartId: string) => {
    setSending(cartId);
    try {
      const res = await fetch("/api/panel/abandoned-carts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send-reminder", cartId }),
      });
      const data = await res.json();
      if (data.success) {
        fetchCarts();
      } else {
        alert(data.error || "Error enviando recordatorio");
      }
    } catch {
      alert("Error de conexión");
    } finally {
      setSending(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Carritos abandonados</h1>
          <p className="text-sm text-neutral-500 mt-1">Recupera ventas perdidas con recordatorios automáticos</p>
        </div>
        <button
          onClick={fetchCarts}
          className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-sm transition-colors"
        >
          <IconRefresh /> Actualizar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<IconCart />} label="Total abandonados" value={String(stats.total)} />
        <StatCard icon={<IconCheck />} label="Recuperados" value={String(stats.recovered)} sub={`${stats.contacted} contactados`} />
        <StatCard icon={<IconPercent />} label="Tasa de recuperación" value={`${stats.recoveryRate}%`} />
        <StatCard icon={<IconDollar />} label="Valor perdido" value={formatPrice(stats.totalValue)} />
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-neutral-900 border border-neutral-800 rounded-lg p-1 w-fit">
        {PERIODS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPeriod(p.key)}
            className={`px-4 py-1.5 rounded-md text-sm transition-colors ${
              period === p.key
                ? "bg-white text-neutral-900 font-medium"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-800">
              <th className="text-left p-4 text-xs text-neutral-500 uppercase tracking-wider font-medium">Cliente</th>
              <th className="text-left p-4 text-xs text-neutral-500 uppercase tracking-wider font-medium">Productos</th>
              <th className="text-right p-4 text-xs text-neutral-500 uppercase tracking-wider font-medium">Total</th>
              <th className="text-center p-4 text-xs text-neutral-500 uppercase tracking-wider font-medium">Abandonado hace</th>
              <th className="text-center p-4 text-xs text-neutral-500 uppercase tracking-wider font-medium">Estado</th>
              <th className="text-right p-4 text-xs text-neutral-500 uppercase tracking-wider font-medium">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-neutral-500">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-neutral-600 border-t-white rounded-full animate-spin" />
                    Cargando...
                  </div>
                </td>
              </tr>
            ) : carts.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-12 text-center text-neutral-500">
                  No hay carritos abandonados en este período
                </td>
              </tr>
            ) : (
              carts.map((cart) => (
                <tr key={cart.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/50 transition-colors">
                  <td className="p-4">
                    <div className="text-white font-medium">{cart.name || "Anónimo"}</div>
                    <div className="text-neutral-500 text-xs mt-0.5">
                      {cart.email || cart.phone || "Sin contacto"}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-neutral-300 text-sm max-w-xs truncate">
                      {(cart.items || []).slice(0, 2).map((i) => i.name).join(", ")}
                    </div>
                    {(cart.items || []).length > 2 && (
                      <span className="text-neutral-500 text-xs">+{cart.items.length - 2} más</span>
                    )}
                  </td>
                  <td className="p-4 text-right text-white font-medium tabular-nums">
                    {formatPrice(cart.total)}
                  </td>
                  <td className="p-4 text-center text-neutral-400 tabular-nums">
                    {timeAgo(cart.createdAt)}
                  </td>
                  <td className="p-4 text-center">
                    <StatusBadge recovered={cart.recovered} recoverySent={cart.recoverySent} />
                  </td>
                  <td className="p-4 text-right">
                    {!cart.recovered && !cart.recoverySent && cart.phone && (
                      <button
                        onClick={() => sendReminder(cart.id)}
                        disabled={sending === cart.id}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white text-neutral-900 rounded-lg text-xs font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50"
                      >
                        {sending === cart.id ? (
                          <div className="w-3 h-3 border-2 border-neutral-400 border-t-neutral-900 rounded-full animate-spin" />
                        ) : (
                          <IconSend />
                        )}
                        Enviar recordatorio
                      </button>
                    )}
                    {cart.recoverySent && !cart.recovered && (
                      <span className="text-xs text-neutral-500">Enviado</span>
                    )}
                    {cart.recovered && (
                      <span className="text-xs text-emerald-400">Recuperado</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Auto-recovery Section */}
      <div className="mt-8 bg-neutral-900 border border-neutral-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-white font-medium">Recuperación automática</h3>
            <p className="text-neutral-500 text-sm mt-1">Envía recordatorios por WhatsApp automáticamente</p>
          </div>
          <button
            onClick={() => setAutoRecovery(!autoRecovery)}
            className={`relative w-11 h-6 rounded-full transition-colors ${
              autoRecovery ? "bg-emerald-500" : "bg-neutral-700"
            }`}
          >
            <div
              className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                autoRecovery ? "translate-x-[22px]" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>

        {autoRecovery && (
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="text-sm text-neutral-400 hover:text-white mt-3 transition-colors"
          >
            {settingsOpen ? "Ocultar configuración" : "Configurar ajustes"} →
          </button>
        )}

        {autoRecovery && settingsOpen && (
          <div className="mt-6 pt-6 border-t border-neutral-800 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">
                  Espera antes del primer recordatorio
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={reminderDelay}
                    onChange={(e) => setReminderDelay(e.target.value)}
                    className="w-20 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:border-neutral-600 focus:outline-none"
                    min="1"
                    max="72"
                  />
                  <span className="text-neutral-500 text-sm">horas</span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">
                  Máximo de recordatorios
                </label>
                <input
                  type="number"
                  value={maxReminders}
                  onChange={(e) => setMaxReminders(e.target.value)}
                  className="w-20 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:border-neutral-600 focus:outline-none"
                  min="1"
                  max="5"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">
                Plantilla del mensaje
              </label>
              <textarea
                value={reminderTemplate}
                onChange={(e) => setReminderTemplate(e.target.value)}
                rows={3}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none resize-none"
                placeholder="Usa {{nombre}} y {{total}} como variables..."
              />
              <p className="text-xs text-neutral-600 mt-1">Variables: {"{{nombre}}"}, {"{{total}}"}, {"{{productos}}"}</p>
            </div>
            <button className="px-4 py-2 bg-white text-neutral-900 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors">
              Guardar configuración
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
