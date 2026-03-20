"use client";

import { useState, useEffect, useCallback } from "react";

interface Campaign {
  id: number;
  name: string;
  type: string;
  subject: string | null;
  content: string | null;
  segmentId: number | null;
  status: string;
  sentCount: number;
  openCount: number;
  clickCount: number;
  scheduledAt: string | null;
  sentAt: string | null;
  createdAt: string;
}

interface Stats {
  total: number;
  totalSent: number;
  openRate: number;
  clickRate: number;
}

interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: string;
  enabled: boolean;
  message: string;
}

const DEFAULT_AUTOMATIONS: Automation[] = [
  {
    id: "welcome",
    name: "Bienvenida",
    description: "Mensaje de bienvenida para nuevos clientes",
    trigger: "Nuevo registro",
    enabled: true,
    message: "¡Bienvenido/a a Sequoia Speed! 🏍️ Gracias por registrarte. Usa el código BIENVENIDO10 para un 10% de descuento en tu primera compra.",
  },
  {
    id: "abandoned-cart",
    name: "Carrito abandonado",
    description: "Recordatorio automático de carrito abandonado",
    trigger: "Carrito abandonado > 1h",
    enabled: true,
    message: "¡Hola {{nombre}}! Dejaste productos en tu carrito. Completa tu compra con 15% OFF usando VUELVE15 👉 sequoiaspeed.com.co/carrito",
  },
  {
    id: "post-purchase",
    name: "Post-compra",
    description: "Seguimiento después de la compra",
    trigger: "Pedido entregado",
    enabled: false,
    message: "¡Hola {{nombre}}! ¿Recibiste tu pedido? Nos encantaría saber tu opinión. Responde este mensaje con tu calificación del 1 al 5 ⭐",
  },
  {
    id: "win-back",
    name: "Win-back",
    description: "Reactivación de clientes inactivos",
    trigger: "Sin compra > 30 días",
    enabled: false,
    message: "¡Hola {{nombre}}! Te extrañamos en Sequoia Speed. Tenemos nuevos productos que te van a encantar. Usa TEQUIERO20 para un 20% OFF 🎁",
  },
];

/* ─── Icons ─── */
function IconCampaigns() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  );
}
function IconMessages() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
    </svg>
  );
}
function IconEye() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  );
}
function IconClick() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 15l-2 5L9 9l11 4-5 2z"/><path d="M22 22l-5-10"/>
    </svg>
  );
}
function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  );
}
function IconX() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
}
function IconTrash() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
    </svg>
  );
}

/* ─── Stat Card ─── */
function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="text-neutral-500">{icon}</div>
        <span className="text-xs text-neutral-500 uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-semibold text-white">{value}</div>
    </div>
  );
}

/* ─── Status Badge ─── */
function CampaignStatus({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: "bg-neutral-700/30 text-neutral-400 border-neutral-700",
    scheduled: "bg-neutral-800 text-neutral-400 border-neutral-800",
    sending: "bg-neutral-800 text-orange-400 border-neutral-800",
    sent: "bg-neutral-800 text-green-400 border-neutral-800",
    paused: "bg-neutral-800 text-orange-400 border-neutral-800",
  };
  const labels: Record<string, string> = {
    draft: "Borrador",
    scheduled: "Programada",
    sending: "Enviando",
    sent: "Enviada",
    paused: "Pausada",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || styles.draft}`}>
      {labels[status] || status}
    </span>
  );
}

/* ─── Type Badge ─── */
function TypeBadge({ type }: { type: string }) {
  if (type === "whatsapp") {
    return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-800 text-green-400">WhatsApp</span>;
  }
  return <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-neutral-800 text-neutral-400">Email</span>;
}

/* ─── Main Page ─── */
export default function MarketingPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, totalSent: 0, openRate: 0, clickRate: 0 });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"campaigns" | "automations">("campaigns");
  const [showForm, setShowForm] = useState(false);
  const [automations, setAutomations] = useState<Automation[]>(DEFAULT_AUTOMATIONS);
  const [editingAuto, setEditingAuto] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState("");
  const [formType, setFormType] = useState("whatsapp");
  const [formSubject, setFormSubject] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formSegment, setFormSegment] = useState("");
  const [formSchedule, setFormSchedule] = useState("");
  const [formSaving, setFormSaving] = useState(false);

  const fetchCampaigns = useCallback(() => {
    setLoading(true);
    fetch("/api/panel/marketing")
      .then((r) => r.json())
      .then((d) => {
        setCampaigns(d.campaigns || []);
        setStats(d.stats || { total: 0, totalSent: 0, openRate: 0, clickRate: 0 });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  const createCampaign = async () => {
    if (!formName.trim()) return;
    setFormSaving(true);
    try {
      await fetch("/api/panel/marketing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          name: formName,
          type: formType,
          subject: formSubject,
          content: formContent,
          segmentId: formSegment ? parseInt(formSegment) : null,
          scheduledAt: formSchedule || null,
        }),
      });
      setFormName(""); setFormType("whatsapp"); setFormSubject(""); setFormContent(""); setFormSegment(""); setFormSchedule("");
      setShowForm(false);
      fetchCampaigns();
    } catch {
      alert("Error creando campaña");
    } finally {
      setFormSaving(false);
    }
  };

  const deleteCampaign = async (id: number) => {
    if (!confirm("¿Eliminar esta campaña?")) return;
    await fetch("/api/panel/marketing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "delete", id }),
    });
    fetchCampaigns();
  };

  const toggleAutomation = (id: string) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, enabled: !a.enabled } : a))
    );
  };

  const updateAutoMessage = (id: string, message: string) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, message } : a))
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Marketing</h1>
          <p className="text-sm text-neutral-500 mt-1">Campañas y automatizaciones de mensajería</p>
        </div>
        {tab === "campaigns" && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-white text-neutral-900 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors"
          >
            {showForm ? <IconX /> : <IconPlus />}
            {showForm ? "Cancelar" : "Crear campaña"}
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<IconCampaigns />} label="Total campañas" value={String(stats.total)} />
        <StatCard icon={<IconMessages />} label="Mensajes enviados" value={stats.totalSent.toLocaleString()} />
        <StatCard icon={<IconEye />} label="Tasa de apertura" value={`${stats.openRate}%`} />
        <StatCard icon={<IconClick />} label="Tasa de clicks" value={`${stats.clickRate}%`} />
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 mb-6 bg-neutral-900 border border-neutral-800 rounded-lg p-1 w-fit">
        <button
          onClick={() => { setTab("campaigns"); setShowForm(false); }}
          className={`px-4 py-1.5 rounded-md text-sm transition-colors ${
            tab === "campaigns" ? "bg-white text-neutral-900 font-medium" : "text-neutral-400 hover:text-white"
          }`}
        >
          Campañas
        </button>
        <button
          onClick={() => { setTab("automations"); setShowForm(false); }}
          className={`px-4 py-1.5 rounded-md text-sm transition-colors ${
            tab === "automations" ? "bg-white text-neutral-900 font-medium" : "text-neutral-400 hover:text-white"
          }`}
        >
          Automatizaciones
        </button>
      </div>

      {/* ─── CAMPAIGNS TAB ─── */}
      {tab === "campaigns" && (
        <>
          {/* Inline Create Form */}
          {showForm && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 mb-6">
              <h3 className="text-white font-medium mb-5">Nueva campaña</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">Nombre de la campaña</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none"
                    placeholder="Ej: Promo fin de semana"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">Tipo</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:border-neutral-600 focus:outline-none"
                  >
                    <option value="whatsapp">WhatsApp</option>
                    <option value="email">Email</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">Asunto</label>
                  <input
                    type="text"
                    value={formSubject}
                    onChange={(e) => setFormSubject(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none"
                    placeholder="Asunto del mensaje"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">Segmento</label>
                  <select
                    value={formSegment}
                    onChange={(e) => setFormSegment(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:border-neutral-600 focus:outline-none"
                  >
                    <option value="">Todos los clientes</option>
                    <option value="1">Compradores frecuentes</option>
                    <option value="2">Nuevos clientes</option>
                    <option value="3">Clientes inactivos</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">Contenido del mensaje</label>
                  <textarea
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    rows={4}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none resize-none"
                    placeholder="Escribe el contenido del mensaje..."
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-500 uppercase tracking-wider mb-2">Programar envío</label>
                  <input
                    type="datetime-local"
                    value={formSchedule}
                    onChange={(e) => setFormSchedule(e.target.value)}
                    className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white focus:border-neutral-600 focus:outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-5 border-t border-neutral-800">
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-neutral-800 text-neutral-300 rounded-lg text-sm hover:bg-neutral-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={createCampaign}
                  disabled={!formName.trim() || formSaving}
                  className="px-4 py-2 bg-white text-neutral-900 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors disabled:opacity-50"
                >
                  {formSaving ? "Guardando..." : "Crear campaña"}
                </button>
              </div>
            </div>
          )}

          {/* Campaign Table */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-800">
                  <th className="text-left p-4 text-xs text-neutral-500 uppercase tracking-wider font-medium">Nombre</th>
                  <th className="text-center p-4 text-xs text-neutral-500 uppercase tracking-wider font-medium">Tipo</th>
                  <th className="text-center p-4 text-xs text-neutral-500 uppercase tracking-wider font-medium">Estado</th>
                  <th className="text-right p-4 text-xs text-neutral-500 uppercase tracking-wider font-medium">Enviados</th>
                  <th className="text-right p-4 text-xs text-neutral-500 uppercase tracking-wider font-medium">Apertura</th>
                  <th className="text-right p-4 text-xs text-neutral-500 uppercase tracking-wider font-medium">Fecha</th>
                  <th className="text-right p-4 text-xs text-neutral-500 uppercase tracking-wider font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-neutral-500">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-neutral-600 border-t-white rounded-full animate-spin" />
                        Cargando...
                      </div>
                    </td>
                  </tr>
                ) : campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-12 text-center text-neutral-500">
                      No hay campañas. Crea tu primera campaña para comenzar.
                    </td>
                  </tr>
                ) : (
                  campaigns.map((c) => (
                    <tr key={c.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/50 transition-colors">
                      <td className="p-4">
                        <div className="text-white font-medium">{c.name}</div>
                        {c.subject && <div className="text-neutral-500 text-xs mt-0.5">{c.subject}</div>}
                      </td>
                      <td className="p-4 text-center">
                        <TypeBadge type={c.type} />
                      </td>
                      <td className="p-4 text-center">
                        <CampaignStatus status={c.status} />
                      </td>
                      <td className="p-4 text-right text-neutral-300 tabular-nums">{c.sentCount.toLocaleString()}</td>
                      <td className="p-4 text-right text-neutral-300 tabular-nums">
                        {c.sentCount > 0 ? `${Math.round((c.openCount / c.sentCount) * 100)}%` : "—"}
                      </td>
                      <td className="p-4 text-right text-neutral-500 text-xs">
                        {c.sentAt
                          ? new Date(c.sentAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short" })
                          : c.scheduledAt
                            ? new Date(c.scheduledAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short" })
                            : new Date(c.createdAt).toLocaleDateString("es-CO", { day: "2-digit", month: "short" })}
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => deleteCampaign(c.id)}
                          className="p-1.5 text-neutral-500 hover:text-red-400 transition-colors"
                          title="Eliminar"
                        >
                          <IconTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ─── AUTOMATIONS TAB ─── */}
      {tab === "automations" && (
        <div className="space-y-4">
          {automations.map((auto) => (
            <div key={auto.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-white font-medium">{auto.name}</h3>
                    <span className="text-xs text-neutral-600 bg-neutral-800 px-2 py-0.5 rounded">{auto.trigger}</span>
                  </div>
                  <p className="text-neutral-500 text-sm">{auto.description}</p>
                </div>
                <button
                  onClick={() => toggleAutomation(auto.id)}
                  className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ml-4 ${
                    auto.enabled ? "bg-white" : "bg-neutral-700"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                      auto.enabled ? "translate-x-[22px]" : "translate-x-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Edit message */}
              <div className="mt-4 pt-4 border-t border-neutral-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-neutral-500 uppercase tracking-wider">Mensaje</span>
                  <button
                    onClick={() => setEditingAuto(editingAuto === auto.id ? null : auto.id)}
                    className="text-xs text-neutral-400 hover:text-white transition-colors"
                  >
                    {editingAuto === auto.id ? "Cerrar" : "Editar"}
                  </button>
                </div>
                {editingAuto === auto.id ? (
                  <div>
                    <textarea
                      value={auto.message}
                      onChange={(e) => updateAutoMessage(auto.id, e.target.value)}
                      rows={3}
                      className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:border-neutral-600 focus:outline-none resize-none"
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={() => setEditingAuto(null)}
                        className="px-3 py-1.5 bg-white text-neutral-900 rounded-lg text-xs font-medium hover:bg-neutral-200 transition-colors"
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-neutral-400 text-sm">{auto.message}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
