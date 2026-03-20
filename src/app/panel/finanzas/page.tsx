"use client";

import { useState, useEffect } from "react";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

export default function FinanzasPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [from, setFrom] = useState(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]);
  const [to, setTo] = useState(now.toISOString().split("T")[0]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/panel/finance?from=${from}&to=${to}`).then(r => r.json()).then(d => { setData(d); setLoading(false); });
  }, [from, to]);

  if (loading || !data) return <div className="text-neutral-500 p-8">Cargando finanzas...</div>;

  const s = data.summary;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Finanzas</h1>

      <div className="flex gap-3 items-center mb-6">
        <label className="text-sm text-neutral-400">Desde:</label>
        <input type="date" value={from} onChange={e => setFrom(e.target.value)}
          className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white" />
        <label className="text-sm text-neutral-400">Hasta:</label>
        <input type="date" value={to} onChange={e => setTo(e.target.value)}
          className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white" />
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
          <p className="text-xs text-neutral-500 uppercase">Ingresos</p>
          <p className="text-2xl font-bold text-white mt-1">{formatPrice(s.revenue)}</p>
        </div>
        <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
          <p className="text-xs text-neutral-500 uppercase">Costos</p>
          <p className="text-2xl font-bold text-red-400 mt-1">{formatPrice(s.cost + s.gatewayFees + s.shippingCosts)}</p>
        </div>
        <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
          <p className="text-xs text-neutral-500 uppercase">Margen total</p>
          <p className={`text-2xl font-bold mt-1 ${s.margin >= 0 ? "text-green-400" : "text-red-400"}`}>{formatPrice(s.margin)}</p>
        </div>
        <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
          <p className="text-xs text-neutral-500 uppercase">% Margen</p>
          <p className={`text-2xl font-bold mt-1 ${s.marginPct >= 0 ? "text-green-400" : "text-red-400"}`}>{s.marginPct}%</p>
        </div>
      </div>

      {/* Breakdown */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-neutral-800/50 rounded-lg p-3">
          <p className="text-xs text-neutral-500">Costo productos</p>
          <p className="text-lg font-bold text-white">{formatPrice(s.cost)}</p>
        </div>
        <div className="bg-neutral-800/50 rounded-lg p-3">
          <p className="text-xs text-neutral-500">Comisiones pasarela</p>
          <p className="text-lg font-bold text-white">{formatPrice(s.gatewayFees)}</p>
        </div>
        <div className="bg-neutral-800/50 rounded-lg p-3">
          <p className="text-xs text-neutral-500">Costos de envío</p>
          <p className="text-lg font-bold text-white">{formatPrice(s.shippingCosts)}</p>
        </div>
      </div>

      {/* Orders with margin */}
      <div className="bg-neutral-900 rounded-lg border border-neutral-800 overflow-hidden">
        <div className="p-4 border-b border-neutral-800">
          <h2 className="text-lg font-semibold text-white">Pedidos con margen ({s.orderCount})</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-800 text-neutral-400">
              <th className="text-left p-3">Pedido</th>
              <th className="text-left p-3">Cliente</th>
              <th className="text-right p-3">Ingreso</th>
              <th className="text-right p-3">Costo</th>
              <th className="text-right p-3">Fee</th>
              <th className="text-right p-3">Envío</th>
              <th className="text-right p-3">Margen</th>
              <th className="text-right p-3">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {data.orders.map((o: any) => {
              const margin = o.revenue - (o.cost || 0) - (o.gatewayFee || 0) - (o.shippingCost || 0);
              return (
                <tr key={o.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30">
                  <td className="p-3"><Link href={`/panel/pedidos/${o.id}`} className="text-primary hover:underline">#{o.orderNumber}</Link></td>
                  <td className="p-3 text-neutral-300">{o.customer}</td>
                  <td className="p-3 text-right text-white">{formatPrice(o.revenue)}</td>
                  <td className="p-3 text-right text-neutral-400">{o.cost ? formatPrice(o.cost) : "—"}</td>
                  <td className="p-3 text-right text-neutral-400">{o.gatewayFee ? formatPrice(o.gatewayFee) : "—"}</td>
                  <td className="p-3 text-right text-neutral-400">{o.shippingCost ? formatPrice(o.shippingCost) : "—"}</td>
                  <td className={`p-3 text-right font-medium ${margin >= 0 ? "text-green-400" : "text-red-400"}`}>{formatPrice(margin)}</td>
                  <td className="p-3 text-right text-neutral-500 text-xs">{new Date(o.createdAt).toLocaleDateString("es-CO")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
