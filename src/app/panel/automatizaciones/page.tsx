"use client";

import { useState, useEffect } from "react";

const triggerLabels: Record<string, string> = {
  order_paid: "Pedido pagado", order_shipped: "Pedido enviado", order_delivered: "Pedido entregado",
  order_cancelled: "Pedido cancelado", order_created: "Pedido creado",
};
const actionLabels: Record<string, string> = {
  change_status_preparing: "Cambiar estado a En preparacion",
  change_status_shipped: "Cambiar estado a Enviado",
  send_email_tracking: "Enviar email con tracking",
  send_email_review: "Enviar email pidiendo review",
  send_email_confirmation: "Enviar email de confirmacion",
  calculate_fraud: "Calcular fraud score",
};

export default function AutomatizacionesPage() {
  const [automations, setAutomations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newTrigger, setNewTrigger] = useState("order_paid");
  const [newAction, setNewAction] = useState("change_status_preparing");

  const load = () => {
    setLoading(true);
    fetch("/api/panel/automations").then(r => r.json()).then(d => { setAutomations(d.automations || []); setLoading(false); });
  };

  useEffect(load, []);

  const createAutomation = async () => {
    await fetch("/api/panel/automations", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trigger: newTrigger, action: newAction, config: {} }),
    });
    setShowCreate(false);
    load();
  };

  const toggle = async (id: string, isActive: boolean) => {
    await fetch("/api/panel/automations/" + id, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    load();
  };

  const remove = async (id: string) => {
    await fetch("/api/panel/automations/" + id, { method: "DELETE" });
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Automatizaciones</h1>
        <button onClick={() => setShowCreate(!showCreate)} className="px-4 py-2 bg-primary text-black rounded-lg text-sm font-medium">+ Nueva regla</button>
      </div>

      {showCreate && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 mb-4">
          <h3 className="text-sm font-semibold text-white mb-3">Nueva automatizacion</h3>
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="text-xs text-neutral-500 mb-1 block">Cuando...</label>
              <select value={newTrigger} onChange={e => setNewTrigger(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm text-white">
                {Object.entries(triggerLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <span className="text-neutral-500 text-sm pb-2">entonces</span>
            <div className="flex-1">
              <label className="text-xs text-neutral-500 mb-1 block">Entonces...</label>
              <select value={newAction} onChange={e => setNewAction(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm text-white">
                {Object.entries(actionLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <button onClick={createAutomation} className="px-4 py-2 bg-primary text-black rounded text-sm font-medium">Crear</button>
          </div>
        </div>
      )}

      {loading ? <p className="text-neutral-500">Cargando...</p> : (
        <div className="space-y-3">
          {automations.length === 0 ? (
            <p className="text-neutral-500 text-sm p-4">No hay automatizaciones configuradas</p>
          ) : automations.map((a: any) => (
            <div key={a.id} className={"bg-neutral-900 rounded-lg border p-4 " + (a.isActive ? "border-neutral-800" : "border-neutral-800/50 opacity-50")}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <span className="text-lg">{a.isActive ? "⚡" : "⏸️"}</span>
                  <div>
                    <p className="text-sm text-white">
                      <span className="text-primary">{triggerLabels[a.trigger] || a.trigger}</span>
                      <span className="text-neutral-500 mx-2">&rarr;</span>
                      <span className="text-white">{actionLabels[a.action] || a.action}</span>
                    </p>
                    <p className="text-xs text-neutral-500 mt-0.5">Creada: {new Date(a.createdAt).toLocaleDateString("es-CO")}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => toggle(a.id, a.isActive)}
                    className={"text-xs px-3 py-1 rounded " + (a.isActive ? "bg-green-600/20 text-green-400" : "bg-neutral-800 text-neutral-400")}>
                    {a.isActive ? "Activa" : "Inactiva"}
                  </button>
                  <button onClick={() => remove(a.id)} className="text-xs px-3 py-1 bg-red-600/20 text-red-400 rounded">Eliminar</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
