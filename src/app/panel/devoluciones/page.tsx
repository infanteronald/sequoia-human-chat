"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

const returnStatusLabels: Record<string, string> = {
  REQUESTED: "Solicitada", APPROVED: "Aprobada", RECEIVED: "Recibida", REFUNDED: "Reembolsada", REJECTED: "Rechazada",
};
const returnStatusColors: Record<string, string> = {
  REQUESTED: "bg-yellow-500/20 text-yellow-400", APPROVED: "bg-blue-500/20 text-blue-400",
  RECEIVED: "bg-purple-500/20 text-purple-400", REFUNDED: "bg-green-500/20 text-green-400",
  REJECTED: "bg-red-500/20 text-red-400",
};

export default function DevolucionesPage() {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [newReturn, setNewReturn] = useState({ orderId: "", reason: "", refundAmount: "" });

  const load = () => {
    setLoading(true);
    const params = filter ? `?status=${filter}` : "";
    fetch(`/api/panel/returns${params}`).then(r => r.json()).then(d => { setReturns(d.returns || []); setLoading(false); });
  };

  useEffect(load, [filter]);

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/panel/returns/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }),
    });
    load();
  };

  const createReturn = async () => {
    if (!newReturn.orderId || !newReturn.reason) return;
    await fetch(`/api/panel/orders/${newReturn.orderId}/returns`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: newReturn.reason, refundAmount: newReturn.refundAmount ? Number(newReturn.refundAmount) : null }),
    });
    setShowCreate(false);
    setNewReturn({ orderId: "", reason: "", refundAmount: "" });
    load();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Devoluciones</h1>
        <button onClick={() => setShowCreate(!showCreate)} className="px-4 py-2 bg-primary text-black rounded-lg text-sm font-medium">+ Nueva devolución</button>
      </div>

      {showCreate && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 mb-4">
          <h3 className="text-sm font-semibold text-white mb-3">Crear devolución</h3>
          <div className="grid grid-cols-3 gap-3">
            <input type="text" value={newReturn.orderId} onChange={e => setNewReturn({...newReturn, orderId: e.target.value})}
              placeholder="ID del pedido" className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm text-white" />
            <input type="text" value={newReturn.reason} onChange={e => setNewReturn({...newReturn, reason: e.target.value})}
              placeholder="Motivo" className="bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm text-white" />
            <div className="flex gap-2">
              <input type="number" value={newReturn.refundAmount} onChange={e => setNewReturn({...newReturn, refundAmount: e.target.value})}
                placeholder="Monto reembolso" className="flex-1 bg-neutral-800 border border-neutral-700 rounded px-3 py-2 text-sm text-white" />
              <button onClick={createReturn} className="px-4 py-2 bg-primary text-black rounded text-sm">Crear</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <select value={filter} onChange={e => setFilter(e.target.value)}
          className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white">
          <option value="">Todos los estados</option>
          {Object.entries(returnStatusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      <div className="bg-neutral-900 rounded-lg border border-neutral-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-800 text-neutral-400">
              <th className="text-left p-3">Pedido</th>
              <th className="text-left p-3">Cliente</th>
              <th className="text-left p-3">Motivo</th>
              <th className="text-right p-3">Reembolso</th>
              <th className="text-center p-3">Estado</th>
              <th className="text-center p-3">Acciones</th>
              <th className="text-right p-3">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="p-8 text-center text-neutral-500">Cargando...</td></tr>
            ) : returns.length === 0 ? (
              <tr><td colSpan={7} className="p-8 text-center text-neutral-500">No hay devoluciones</td></tr>
            ) : returns.map((r: any) => (
              <tr key={r.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30">
                <td className="p-3"><Link href={`/panel/pedidos/${r.orderId}`} className="text-primary hover:underline">#{r.orderNumber}</Link></td>
                <td className="p-3 text-neutral-300">{r.customer}</td>
                <td className="p-3 text-neutral-400">{r.reason}</td>
                <td className="p-3 text-right text-white">{r.refundAmount ? formatPrice(r.refundAmount) : "—"}</td>
                <td className="p-3 text-center">
                  <span className={`text-xs px-2 py-1 rounded-full ${returnStatusColors[r.status] || ""}`}>{returnStatusLabels[r.status] || r.status}</span>
                </td>
                <td className="p-3 text-center">
                  {r.status === "REQUESTED" && (
                    <div className="flex gap-1 justify-center">
                      <button onClick={() => updateStatus(r.id, "APPROVED")} className="text-xs px-2 py-1 bg-blue-600 text-white rounded">Aprobar</button>
                      <button onClick={() => updateStatus(r.id, "REJECTED")} className="text-xs px-2 py-1 bg-red-600 text-white rounded">Rechazar</button>
                    </div>
                  )}
                  {r.status === "APPROVED" && <button onClick={() => updateStatus(r.id, "RECEIVED")} className="text-xs px-2 py-1 bg-purple-600 text-white rounded">Recibida</button>}
                  {r.status === "RECEIVED" && <button onClick={() => updateStatus(r.id, "REFUNDED")} className="text-xs px-2 py-1 bg-green-600 text-white rounded">Reembolsar</button>}
                </td>
                <td className="p-3 text-right text-neutral-500 text-xs">{new Date(r.createdAt).toLocaleDateString("es-CO")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
