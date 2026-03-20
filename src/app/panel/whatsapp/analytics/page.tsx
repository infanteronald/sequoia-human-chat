"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Analytics {
  totalContacts: number;
  activeToday: number;
  messages: { total: number; outbound: number; inbound: number; notes: number };
  status: { open: number; pending: number; resolved: number; snoozed: number };
  agents: { id: number; name: string; assigned_count: number; resolved_count: number }[];
  dailyMessages: { date: string; total: number; outbound: number; inbound: number }[];
  avgResponseMinutes: number;
  csat: { avgRating: number; totalResponses: number };
  ai: {
    resolutionsWithoutHuman: number;
    totalAiConversations: number;
    resolutionRate: string;
    cacheHits: number;
    cacheMisses: number;
    cacheHitRate: string;
    estimatedCostUSD: string;
    costPerResolution: string;
    intercomEquivalent: string;
    zendeskEquivalent: string;
    savingsVsIntercom: string;
    savingsVsZendesk: string;
  };
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
      <p className="text-[10px] text-neutral-500 uppercase">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color || "text-white"}`}>{typeof value === "number" ? value.toLocaleString() : value}</p>
      {sub && <p className="text-xs text-neutral-500 mt-0.5">{sub}</p>}
    </div>
  );
}

function MiniBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  );
}

export default function WhatsAppAnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [period, setPeriod] = useState("7d");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/sequoia-chat/analytics?period=${period}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [period]);

  if (loading || !data) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent" />
    </div>
  );

  const maxDaily = Math.max(...data.dailyMessages.map(d => d.total), 1);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Analytics WhatsApp</h1>
          <p className="text-sm text-neutral-500 mt-1">Metricas y rendimiento</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-neutral-800/50 rounded-lg p-0.5">
            {[
              { key: "today", label: "Hoy" },
              { key: "7d", label: "7 dias" },
              { key: "30d", label: "30 dias" },
              { key: "90d", label: "90 dias" },
            ].map(p => (
              <button
                key={p.key}
                onClick={() => setPeriod(p.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  period === p.key ? "bg-neutral-700 text-white" : "text-neutral-500 hover:text-neutral-300"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
          <Link href="/panel/whatsapp" className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-sm transition">
            ← Chat
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <StatCard label="Total contactos" value={data.totalContacts} />
        <StatCard label="Activos hoy" value={data.activeToday} color="text-green-400" />
        <StatCard label="Mensajes (periodo)" value={data.messages.total} sub={`${data.messages.inbound} entrantes · ${data.messages.outbound} salientes`} />
        <StatCard
          label="Tiempo respuesta"
          value={data.avgResponseMinutes > 60 ? `${Math.round(data.avgResponseMinutes / 60)}h` : `${Math.round(data.avgResponseMinutes)}m`}
          sub="promedio"
          color={data.avgResponseMinutes < 30 ? "text-green-400" : data.avgResponseMinutes < 120 ? "text-yellow-400" : "text-red-400"}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Status breakdown */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <h3 className="text-white font-medium mb-4">Estado de conversaciones</h3>
          <div className="space-y-3">
            {[
              { label: "Abiertas", value: data.status.open, color: "bg-emerald-500" },
              { label: "Pendientes", value: data.status.pending, color: "bg-neutral-500" },
              { label: "Resueltas", value: data.status.resolved, color: "bg-neutral-600" },
              { label: "En espera", value: data.status.snoozed, color: "bg-neutral-500" },
            ].map(s => (
              <div key={s.label}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-neutral-400">{s.label}</span>
                  <span className="text-white font-medium">{s.value.toLocaleString()}</span>
                </div>
                <MiniBar value={s.value} max={data.totalContacts} color={s.color} />
              </div>
            ))}
          </div>
        </div>

        {/* Agent performance */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
          <h3 className="text-white font-medium mb-4">Rendimiento por agente</h3>
          {data.agents.length === 0 ? (
            <p className="text-neutral-600 text-sm">No hay agentes asignados</p>
          ) : (
            <div className="space-y-3">
              {data.agents.map(a => (
                <div key={a.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-neutral-700 flex items-center justify-center text-sm shrink-0">
                    {a.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between">
                      <span className="text-sm text-white truncate">{a.name}</span>
                      <span className="text-xs text-neutral-500">{a.assigned_count} asignadas</span>
                    </div>
                    <MiniBar value={parseInt(a.resolved_count?.toString())} max={parseInt(a.assigned_count?.toString()) || 1} color="bg-green-500" />
                    <p className="text-[10px] text-neutral-600 mt-0.5">{a.resolved_count} resueltas</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Daily volume chart (text-based) */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 mb-6">
        <h3 className="text-white font-medium mb-4">Volumen diario de mensajes (14 dias)</h3>
        {data.dailyMessages.length === 0 ? (
          <p className="text-neutral-600 text-sm">Sin datos</p>
        ) : (
          <div className="space-y-1.5">
            {data.dailyMessages.map(d => (
              <div key={d.date} className="flex items-center gap-3">
                <span className="text-[10px] text-neutral-500 w-20 shrink-0">
                  {new Date(d.date).toLocaleDateString("es-CO", { day: "2-digit", month: "short" })}
                </span>
                <div className="flex-1 flex gap-0.5 h-4">
                  <div className="bg-neutral-600 rounded-sm" style={{ width: `${(d.inbound / maxDaily) * 100}%` }} title={`${d.inbound} entrantes`} />
                  <div className="bg-emerald-500 rounded-sm" style={{ width: `${(d.outbound / maxDaily) * 100}%` }} title={`${d.outbound} salientes`} />
                </div>
                <span className="text-[10px] text-neutral-500 w-12 text-right">{d.total}</span>
              </div>
            ))}
            <div className="flex gap-4 mt-3 text-[10px] text-neutral-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-neutral-600 rounded-sm" /> Entrantes</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-sm" /> Salientes</span>
            </div>
          </div>
        )}
      </div>

      {/* AI Performance */}
      {data.ai && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 mb-6">
          <h3 className="text-white font-medium mb-4">🤖 Rendimiento IA</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-neutral-800/60 rounded-lg p-3 text-center">
              <p className="text-[10px] text-neutral-500 uppercase">Resolucion IA</p>
              <p className="text-xl font-bold text-green-400">{data.ai.resolutionRate}%</p>
              <p className="text-[10px] text-neutral-600">{data.ai.resolutionsWithoutHuman} de {data.ai.totalAiConversations}</p>
            </div>
            <div className="bg-neutral-800/60 rounded-lg p-3 text-center">
              <p className="text-[10px] text-neutral-500 uppercase">Cache Hit Rate</p>
              <p className="text-xl font-bold text-neutral-400">{data.ai.cacheHitRate}%</p>
              <p className="text-[10px] text-neutral-600">{data.ai.cacheHits} hits / {data.ai.cacheMisses} misses</p>
            </div>
            <div className="bg-neutral-800/60 rounded-lg p-3 text-center">
              <p className="text-[10px] text-neutral-500 uppercase">Conversaciones IA</p>
              <p className="text-xl font-bold text-neutral-400">{data.ai.totalAiConversations}</p>
              <p className="text-[10px] text-neutral-600">en el periodo</p>
            </div>
            <div className="bg-neutral-800/60 rounded-lg p-3 text-center">
              <p className="text-[10px] text-neutral-500 uppercase">Costo estimado</p>
              <p className="text-xl font-bold text-neutral-400">${data.ai.estimatedCostUSD}</p>
              <p className="text-[10px] text-neutral-600">USD en el periodo</p>
            </div>
          </div>
          {/* Savings comparison */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-neutral-800/60 border border-neutral-700 rounded-lg p-3">
              <p className="text-[10px] text-neutral-500 uppercase">Ahorro vs Intercom</p>
              <p className="text-lg font-bold text-green-400">${data.ai.savingsVsIntercom} USD</p>
              <p className="text-[10px] text-neutral-600">Intercom cobraria ${data.ai.intercomEquivalent} USD ($0.99/resolucion)</p>
            </div>
            <div className="bg-neutral-800/60 border border-neutral-700 rounded-lg p-3">
              <p className="text-[10px] text-neutral-500 uppercase">Ahorro vs Zendesk</p>
              <p className="text-lg font-bold text-green-400">${data.ai.savingsVsZendesk} USD</p>
              <p className="text-[10px] text-neutral-600">Zendesk cobraria ${data.ai.zendeskEquivalent} USD ($1.50/resolucion)</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex-1 h-3 bg-neutral-800 rounded-full overflow-hidden flex">
              <div className="bg-emerald-500 h-full" style={{ width: `${data.ai.cacheHitRate}%` }} title="Cache hits" />
              <div className="bg-neutral-600 h-full" style={{ width: `${100 - parseFloat(data.ai.cacheHitRate)}%` }} title="LLM calls" />
            </div>
            <div className="flex gap-3 text-[10px] text-neutral-500 shrink-0">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded-sm" /> Cache</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-neutral-600 rounded-sm" /> LLM</span>
            </div>
          </div>
        </div>
      )}

      {/* CSAT */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
        <h3 className="text-white font-medium mb-4">Satisfaccion del cliente (CSAT)</h3>
        {data.csat.totalResponses === 0 ? (
          <div className="text-center py-6">
            <p className="text-neutral-600 text-sm">Sin encuestas respondidas en este periodo</p>
            <p className="text-xs text-neutral-700 mt-1">Activa la encuesta CSAT en Configuracion</p>
          </div>
        ) : (
          <div className="flex items-center gap-6">
            <div className="text-center">
              <p className="text-4xl font-bold text-yellow-400">{data.csat.avgRating.toFixed(1)}</p>
              <p className="text-xs text-neutral-500">/ 5.0</p>
              <div className="flex gap-0.5 mt-1 justify-center">
                {[1, 2, 3, 4, 5].map(s => (
                  <span key={s} className={`text-sm ${s <= Math.round(data.csat.avgRating) ? "text-yellow-400" : "text-neutral-700"}`}>★</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm text-neutral-400">{data.csat.totalResponses} respuestas</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
