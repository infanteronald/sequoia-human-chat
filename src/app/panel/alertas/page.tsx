"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const typeLabels: Record<string, string> = {
  unshipped_48h: "⏰ Sin enviar >48h", fraud: "🚨 Riesgo fraude",
  out_of_stock: "📦 Producto agotado", payment_failed: "❌ Pago fallido",
};
const typeColors: Record<string, string> = {
  unshipped_48h: "border-yellow-500/30 bg-yellow-500/5", fraud: "border-red-500/30 bg-red-500/5",
  out_of_stock: "border-orange-500/30 bg-orange-500/5", payment_failed: "border-red-500/30 bg-red-500/5",
};

export default function AlertasPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [generating, setGenerating] = useState(false);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter) params.set("type", filter);
    if (unreadOnly) params.set("unreadOnly", "true");
    fetch(`/api/panel/alerts?${params}`).then(r => r.json()).then(d => { setAlerts(d.alerts || []); setLoading(false); });
  };

  useEffect(load, [filter, unreadOnly]);

  const markRead = async (id: string) => {
    await fetch(`/api/panel/alerts/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isRead: true }) });
    load();
  };

  const generateAlerts = async () => {
    setGenerating(true);
    await fetch("/api/panel/alerts", { method: "POST" });
    setGenerating(false);
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Alertas</h1>
        <button onClick={generateAlerts} disabled={generating}
          className="px-4 py-2 bg-primary text-black rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
          {generating ? "Generando..." : "🔄 Generar alertas"}
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white">
          <option value="">Todos los tipos</option>
          {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm text-neutral-400">
          <input type="checkbox" checked={unreadOnly} onChange={e => setUnreadOnly(e.target.checked)} />
          Solo no leídas
        </label>
      </div>

      {loading ? <p className="text-neutral-500">Cargando...</p> : (
        <div className="space-y-2">
          {alerts.length === 0 ? (
            <p className="text-neutral-500 text-sm p-4">No hay alertas</p>
          ) : alerts.map((a: any) => (
            <div key={a.id} className={`rounded-lg border p-4 ${a.isRead ? "border-neutral-800 bg-neutral-900/50 opacity-60" : typeColors[a.type] || "border-neutral-800 bg-neutral-900"}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-white">{a.title}</p>
                  <p className="text-xs text-neutral-400 mt-1">{a.detail}</p>
                  <p className="text-xs text-neutral-500 mt-1">{new Date(a.createdAt).toLocaleString("es-CO")}</p>
                </div>
                <div className="flex gap-2 items-center">
                  {a.orderId && <Link href={`/panel/pedidos/${a.orderId}`} className="text-xs text-primary hover:underline">Ver pedido →</Link>}
                  {!a.isRead && <button onClick={() => markRead(a.id)} className="text-xs px-2 py-1 bg-neutral-800 text-neutral-400 rounded hover:text-white">✓ Leída</button>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
