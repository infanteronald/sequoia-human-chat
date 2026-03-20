"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface FulfillmentData {
  counts: { new: number; paid: number; preparing: number; packed: number; shippedToday: number; delayed: number };
  ordersToPrepare: Array<{
    id: string; orderNumber: string; customer: string; status: string;
    items: Array<{ name: string; variant?: string; quantity: number }>;
    createdAt: string;
  }>;
}

interface PickingItem { name: string; variant: string; sku: string; quantity: number }

export default function FulfillmentPage() {
  const [data, setData] = useState<FulfillmentData | null>(null);
  const [pickingList, setPickingList] = useState<PickingItem[]>([]);
  const [pickingTotal, setPickingTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showPicking, setShowPicking] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      fetch("/api/panel/fulfillment").then(r => r.json()),
      fetch("/api/panel/fulfillment/picking-list").then(r => r.json()),
    ]).then(([f, p]) => {
      setData(f);
      setPickingList(p.pickingList || []);
      setPickingTotal(p.totalItems || 0);
      setLoading(false);
    });
  };

  useEffect(loadData, []);

  const markPacked = async (orderId: string) => {
    await fetch(`/api/panel/orders/${orderId}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "PACKED" }),
    });
    loadData();
  };

  const markPreparing = async (orderId: string) => {
    await fetch(`/api/panel/orders/${orderId}`, {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "PREPARING" }),
    });
    loadData();
  };

  if (loading || !data) return <div className="text-neutral-500 p-8">Cargando fulfillment...</div>;

  const { counts } = data;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Fulfillment</h1>
        <button onClick={() => setShowPicking(!showPicking)}
          className="px-4 py-2 bg-primary text-black rounded-lg text-sm font-medium hover:bg-primary/90">
          📋 {showPicking ? "Ver cola" : "Picking List"}
        </button>
      </div>

      {/* Kanban Counts */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        <KanbanCard label="Nuevos" count={counts.new} color="bg-yellow-500/20 text-yellow-400" />
        <KanbanCard label="Pagados" count={counts.paid} color="bg-blue-500/20 text-blue-400" />
        <KanbanCard label="Preparando" count={counts.preparing} color="bg-purple-500/20 text-purple-400" />
        <KanbanCard label="Empacados" count={counts.packed} color="bg-indigo-500/20 text-indigo-400" />
        <KanbanCard label="Enviados hoy" count={counts.shippedToday} color="bg-green-500/20 text-green-400" />
        <KanbanCard label="⚠️ Retrasados" count={counts.delayed} color={counts.delayed > 0 ? "bg-red-500/20 text-red-400" : "bg-neutral-800 text-neutral-400"} />
      </div>

      {showPicking ? (
        /* Picking List */
        <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Picking List — {pickingTotal} items totales</h2>
            <button onClick={() => window.print()} className="px-3 py-1.5 bg-neutral-800 text-neutral-300 rounded text-sm">🖨️ Imprimir</button>
          </div>
          {pickingList.length === 0 ? (
            <p className="text-neutral-500 text-sm">No hay productos para recoger</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-800 text-neutral-400">
                  <th className="text-left p-3">Producto</th>
                  <th className="text-left p-3">Variante</th>
                  <th className="text-left p-3">SKU</th>
                  <th className="text-center p-3">Cantidad</th>
                  <th className="text-center p-3">Recogido</th>
                </tr>
              </thead>
              <tbody>
                {pickingList.map((item, i) => (
                  <tr key={i} className="border-b border-neutral-800/50">
                    <td className="p-3 text-white font-medium">{item.name}</td>
                    <td className="p-3 text-neutral-400">{item.variant || "—"}</td>
                    <td className="p-3 text-neutral-500 font-mono text-xs">{item.sku || "—"}</td>
                    <td className="p-3 text-center text-white font-bold text-lg">{item.quantity}</td>
                    <td className="p-3 text-center"><input type="checkbox" className="rounded" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ) : (
        /* Preparation Queue */
        <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
          <h2 className="text-lg font-semibold text-white mb-4">Cola de preparación ({data.ordersToPrepare.length} pedidos)</h2>
          {data.ordersToPrepare.length === 0 ? (
            <p className="text-neutral-500 text-sm">No hay pedidos por preparar</p>
          ) : (
            <div className="space-y-3">
              {data.ordersToPrepare.map(order => (
                <div key={order.id} className="bg-neutral-800/50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <Link href={`/panel/pedidos/${order.id}`} className="text-primary hover:underline font-medium">#{order.orderNumber}</Link>
                      <span className="text-neutral-500 text-sm ml-2">{order.customer}</span>
                      <span className="text-neutral-600 text-xs ml-2">{new Date(order.createdAt).toLocaleDateString("es-CO")}</span>
                    </div>
                    <div className="flex gap-2">
                      {order.status === "PAID" && (
                        <button onClick={() => markPreparing(order.id)} className="px-3 py-1 bg-purple-600 text-white rounded text-xs">En preparación</button>
                      )}
                      <button onClick={() => markPacked(order.id)} className="px-3 py-1 bg-indigo-600 text-white rounded text-xs">📦 Empacado</button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {order.items.map((item, i) => (
                      <span key={i} className="text-xs bg-neutral-700 px-2 py-1 rounded text-neutral-300">
                        {item.quantity}× {item.name}{item.variant ? ` (${item.variant})` : ""}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function KanbanCard({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className={`rounded-lg p-3 text-center ${color}`}>
      <p className="text-2xl font-bold">{count}</p>
      <p className="text-xs mt-1 opacity-80">{label}</p>
    </div>
  );
}
