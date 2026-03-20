"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Campaign {
  id: number;
  name: string;
  template_name: string | null;
  message_text: string | null;
  status: string;
  total_recipients: number;
  sent_count: number;
  delivered_count: number;
  read_count: number;
  failed_count: number;
  filter_criteria: any;
  scheduled_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

interface Label {
  id: number;
  title: string;
  color: string;
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [sending, setSending] = useState<number | null>(null);

  // New campaign form
  const [newName, setNewName] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newTemplate, setNewTemplate] = useState("");
  const [useTemplate, setUseTemplate] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterLabel, setFilterLabel] = useState<string>("");
  const [filterCity, setFilterCity] = useState("");

  useEffect(() => {
    fetchCampaigns();
    fetch("/api/sequoia-chat/labels").then(r => r.json()).then(setLabels).catch(() => {});
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch("/api/sequoia-chat/campaigns");
      if (res.ok) setCampaigns(await res.json());
    } catch {}
    setLoading(false);
  };

  const createCampaign = async () => {
    if (!newName || (!newMessage && !newTemplate)) return;
    try {
      const filter: any = {};
      if (filterStatus) filter.status = parseInt(filterStatus);
      if (filterLabel) filter.labelId = parseInt(filterLabel);
      if (filterCity) filter.city = filterCity;

      await fetch("/api/sequoia-chat/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          template_name: useTemplate ? newTemplate : null,
          message_text: useTemplate ? null : newMessage,
          filter_criteria: filter,
        }),
      });
      setShowNew(false);
      setNewName("");
      setNewMessage("");
      setNewTemplate("");
      fetchCampaigns();
    } catch {}
  };

  const startCampaign = async (id: number) => {
    if (!confirm("Estas seguro de enviar esta campana? Se enviaran mensajes a todos los destinatarios.")) return;
    setSending(id);
    try {
      await fetch("/api/sequoia-chat/campaigns", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "start" }),
      });
      fetchCampaigns();
    } catch {}
    setSending(null);
  };

  const deleteCampaign = async (id: number) => {
    if (!confirm("Eliminar esta campana?")) return;
    try {
      await fetch("/api/sequoia-chat/campaigns", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action: "delete" }),
      });
      fetchCampaigns();
    } catch {}
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      draft: "bg-neutral-800 text-neutral-400",
      sending: "bg-yellow-900/50 text-yellow-400",
      completed: "bg-green-900/50 text-green-400",
      failed: "bg-red-900/50 text-red-400",
    };
    const labels: Record<string, string> = {
      draft: "Borrador",
      sending: "Enviando...",
      completed: "Completada",
      failed: "Fallida",
    };
    return <span className={`text-[10px] px-2 py-0.5 rounded-full ${map[status] || map.draft}`}>{labels[status] || status}</span>;
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent" />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Campanas / Broadcasts</h1>
          <p className="text-sm text-neutral-500 mt-1">Envio masivo de mensajes por WhatsApp</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowNew(true)}
            className="px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg text-sm transition"
          >
            + Nueva campana
          </button>
          <Link href="/panel/whatsapp" className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-sm transition">
            ← Chat
          </Link>
        </div>
      </div>

      {/* New Campaign Form */}
      {showNew && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 mb-6">
          <h3 className="text-white font-medium mb-4">Nueva campana</h3>
          <div className="space-y-4">
            <input
              type="text"
              value={newName}
              onChange={e => setNewName(e.target.value)}
              placeholder="Nombre de la campana"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-500"
            />

            {/* Message type toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => setUseTemplate(false)}
                className={`px-3 py-1.5 rounded-lg text-xs transition ${!useTemplate ? "bg-green-700 text-white" : "bg-neutral-800 text-neutral-400"}`}
              >
                Mensaje de texto
              </button>
              <button
                onClick={() => setUseTemplate(true)}
                className={`px-3 py-1.5 rounded-lg text-xs transition ${useTemplate ? "bg-green-700 text-white" : "bg-neutral-800 text-neutral-400"}`}
              >
                Template
              </button>
            </div>

            {useTemplate ? (
              <input
                type="text"
                value={newTemplate}
                onChange={e => setNewTemplate(e.target.value)}
                placeholder="Nombre del template (de Meta Business)"
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-500"
              />
            ) : (
              <textarea
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                placeholder="Texto del mensaje..."
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-500 resize-none"
                rows={3}
              />
            )}

            {/* Filters */}
            <div className="bg-neutral-800/50 rounded-lg p-3">
              <p className="text-xs text-neutral-500 mb-3">Filtros de destinatarios (opcional)</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-neutral-500">Estado</label>
                  <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="w-full mt-1 bg-neutral-800 border border-neutral-700 rounded-lg px-2 py-1.5 text-xs text-neutral-300"
                  >
                    <option value="">Todos</option>
                    <option value="0">Abiertos</option>
                    <option value="1">Pendientes</option>
                    <option value="2">Resueltos</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-neutral-500">Etiqueta</label>
                  <select
                    value={filterLabel}
                    onChange={e => setFilterLabel(e.target.value)}
                    className="w-full mt-1 bg-neutral-800 border border-neutral-700 rounded-lg px-2 py-1.5 text-xs text-neutral-300"
                  >
                    <option value="">Todas</option>
                    {labels.map(l => (
                      <option key={l.id} value={l.id}>{l.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-neutral-500">Ciudad</label>
                  <input
                    type="text"
                    value={filterCity}
                    onChange={e => setFilterCity(e.target.value)}
                    placeholder="Ej: Bogota"
                    className="w-full mt-1 bg-neutral-800 border border-neutral-700 rounded-lg px-2 py-1.5 text-xs text-neutral-300 placeholder:text-neutral-600"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowNew(false)} className="px-3 py-1.5 bg-neutral-800 text-neutral-400 rounded-lg text-sm">Cancelar</button>
              <button onClick={createCampaign} className="px-4 py-1.5 bg-green-700 text-white rounded-lg text-sm">Crear campana</button>
            </div>
          </div>
        </div>
      )}

      {/* Campaign List */}
      <div className="space-y-3">
        {campaigns.length === 0 && (
          <div className="text-center py-16 bg-neutral-900 border border-neutral-800 rounded-xl">
            <div className="text-4xl mb-3 opacity-20">📢</div>
            <p className="text-neutral-600">No hay campanas</p>
            <p className="text-xs text-neutral-700 mt-1">Crea tu primera campana de broadcast</p>
          </div>
        )}

        {campaigns.map(c => (
          <div key={c.id} className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-medium">{c.name}</h3>
                  {statusBadge(c.status)}
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  {new Date(c.created_at).toLocaleDateString("es-CO", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
              <div className="flex gap-2">
                {c.status === "draft" && (
                  <button
                    onClick={() => startCampaign(c.id)}
                    disabled={sending === c.id}
                    className="px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white rounded-lg text-xs transition disabled:opacity-50"
                  >
                    {sending === c.id ? "Enviando..." : "Enviar"}
                  </button>
                )}
                <button onClick={() => deleteCampaign(c.id)} className="text-neutral-600 hover:text-red-400 transition text-sm">🗑</button>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-5 gap-3">
              <div className="text-center">
                <p className="text-lg font-bold text-white">{c.total_recipients.toLocaleString()}</p>
                <p className="text-[10px] text-neutral-500">Destinatarios</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-green-400">{c.sent_count.toLocaleString()}</p>
                <p className="text-[10px] text-neutral-500">Enviados</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-blue-400">{c.delivered_count.toLocaleString()}</p>
                <p className="text-[10px] text-neutral-500">Entregados</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-cyan-400">{c.read_count.toLocaleString()}</p>
                <p className="text-[10px] text-neutral-500">Leidos</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-red-400">{c.failed_count.toLocaleString()}</p>
                <p className="text-[10px] text-neutral-500">Fallidos</p>
              </div>
            </div>

            {/* Progress bar */}
            {c.total_recipients > 0 && c.status !== "draft" && (
              <div className="mt-3 h-2 bg-neutral-800 rounded-full overflow-hidden flex">
                {c.sent_count > 0 && <div className="bg-green-500 h-full" style={{ width: `${(c.sent_count / c.total_recipients) * 100}%` }} />}
                {c.failed_count > 0 && <div className="bg-red-500 h-full" style={{ width: `${(c.failed_count / c.total_recipients) * 100}%` }} />}
              </div>
            )}

            {/* Details */}
            <div className="mt-3 flex gap-4 text-[10px] text-neutral-600">
              {c.template_name && <span>Template: {c.template_name}</span>}
              {c.message_text && <span>Texto: {c.message_text.substring(0, 50)}...</span>}
              {c.started_at && <span>Inicio: {new Date(c.started_at).toLocaleTimeString("es-CO")}</span>}
              {c.completed_at && <span>Fin: {new Date(c.completed_at).toLocaleTimeString("es-CO")}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
