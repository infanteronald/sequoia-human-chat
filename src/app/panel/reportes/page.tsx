"use client";

import { useState, useEffect } from "react";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

export default function ReportesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const now = new Date();
  const [from, setFrom] = useState(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split("T")[0]);
  const [to, setTo] = useState(now.toISOString().split("T")[0]);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/panel/reports?from=${from}&to=${to}`).then(r => r.json()).then(d => { setData(d); setLoading(false); });
  }, [from, to]);

  if (loading || !data) return <div className="text-neutral-500 p-8">Cargando reportes...</div>;

  const { summary, logistics, topProducts, topCategories, cohorts } = data;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Reportes</h1>
        <div className="flex gap-2">
          <Link href={`/api/panel/export?type=orders&from=${from}&to=${to}`} target="_blank"
            className="px-3 py-1.5 bg-neutral-800 text-neutral-300 rounded-lg text-sm hover:bg-neutral-700">📥 Exportar pedidos</Link>
          <Link href="/api/panel/export?type=customers" target="_blank"
            className="px-3 py-1.5 bg-neutral-800 text-neutral-300 rounded-lg text-sm hover:bg-neutral-700">📥 Exportar clientes</Link>
          <Link href="/api/panel/export?type=products" target="_blank"
            className="px-3 py-1.5 bg-neutral-800 text-neutral-300 rounded-lg text-sm hover:bg-neutral-700">📥 Exportar productos</Link>
        </div>
      </div>

      <div className="flex gap-3 items-center mb-6">
        <label className="text-sm text-neutral-400">Desde:</label>
        <input type="date" value={from} onChange={e => setFrom(e.target.value)}
          className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white" />
        <label className="text-sm text-neutral-400">Hasta:</label>
        <input type="date" value={to} onChange={e => setTo(e.target.value)}
          className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white" />
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
          <p className="text-xs text-neutral-500 uppercase">Total ventas</p>
          <p className="text-2xl font-bold text-white mt-1">{formatPrice(summary.totalSales)}</p>
        </div>
        <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
          <p className="text-xs text-neutral-500 uppercase">Pedidos</p>
          <p className="text-2xl font-bold text-white mt-1">{summary.orderCount}</p>
        </div>
        <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
          <p className="text-xs text-neutral-500 uppercase">Ticket promedio</p>
          <p className="text-2xl font-bold text-white mt-1">{formatPrice(summary.avgTicket)}</p>
        </div>
      </div>

      {/* KPIs Logísticos */}
      <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">KPIs Logísticos</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-neutral-500">Tiempo prom. envío</p>
            <p className="text-xl font-bold text-white">{logistics.avgShipTimeHours}h</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">% Devoluciones</p>
            <p className={`text-xl font-bold ${logistics.returnRate > 5 ? "text-red-400" : "text-green-400"}`}>{logistics.returnRate}%</p>
            <p className="text-xs text-neutral-500">{logistics.returnCount} total</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">% Cancelaciones</p>
            <p className={`text-xl font-bold ${logistics.cancelRate > 10 ? "text-red-400" : "text-green-400"}`}>{logistics.cancelRate}%</p>
            <p className="text-xs text-neutral-500">{logistics.cancelCount} total</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500">% Pagos fallidos</p>
            <p className={`text-xl font-bold ${logistics.paymentFailRate > 5 ? "text-red-400" : "text-green-400"}`}>{logistics.paymentFailRate}%</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        {/* Top Products */}
        <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
          <h2 className="text-lg font-semibold text-white mb-4">Top 10 productos</h2>
          {topProducts.length === 0 ? <p className="text-neutral-500 text-sm">Sin datos</p> : (
            <div className="space-y-3">
              {topProducts.map((p: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-neutral-500 w-5">{i + 1}.</span>
                    <div><p className="text-sm text-white truncate max-w-[250px]">{p.name}</p><p className="text-xs text-neutral-500">{p.quantity} vendidos</p></div>
                  </div>
                  <p className="text-sm font-medium text-primary">{formatPrice(p.revenue)}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Categories */}
        <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
          <h2 className="text-lg font-semibold text-white mb-4">Ventas por categoría</h2>
          {topCategories.length === 0 ? <p className="text-neutral-500 text-sm">Sin datos</p> : (
            <div className="space-y-3">
              {topCategories.map((c: any, i: number) => {
                const maxRevenue = topCategories[0]?.revenue || 1;
                const pct = Math.round((c.revenue / maxRevenue) * 100);
                return (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white">{c.name}</span>
                      <span className="text-primary">{formatPrice(c.revenue)}</span>
                    </div>
                    <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                      <div className="h-full bg-primary/60 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">{c.quantity} unidades</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Cohorts */}
      {cohorts && cohorts.length > 0 && (
        <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
          <h2 className="text-lg font-semibold text-white mb-4">Cohortes de clientes (por mes de registro)</h2>
          <div className="grid grid-cols-4 lg:grid-cols-6 gap-3">
            {cohorts.map((c: any) => (
              <div key={c.month} className="bg-neutral-800/50 rounded-lg p-3 text-center">
                <p className="text-xs text-neutral-500">{c.month}</p>
                <p className="text-lg font-bold text-white">{c.count}</p>
                <p className="text-[10px] text-neutral-500">clientes</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
