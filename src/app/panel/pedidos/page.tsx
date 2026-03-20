"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente", PAID: "Pagado", PREPARING: "En preparación", PACKED: "Empacado",
  SHIPPED: "Enviado", DELIVERED: "Entregado", RETURNED: "Devuelto", CANCELLED: "Cancelado",
  FRAUD_RISK: "Fraude", REFUNDED: "Reembolsado",
};
const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-400", PAID: "bg-blue-500/20 text-blue-400",
  PREPARING: "bg-purple-500/20 text-purple-400", PACKED: "bg-indigo-500/20 text-indigo-400",
  SHIPPED: "bg-cyan-500/20 text-cyan-400", DELIVERED: "bg-green-500/20 text-green-400",
  RETURNED: "bg-orange-500/20 text-orange-400", CANCELLED: "bg-red-500/20 text-red-400",
  FRAUD_RISK: "bg-red-600/20 text-red-400", REFUNDED: "bg-orange-500/20 text-orange-400",
};
const allStatuses = Object.keys(statusLabels);

interface OrderRow {
  id: string; orderNumber: string; customer: string; customerEmail: string; customerOrderCount: number;
  total: number; status: string; itemCount: number; city: string | null; carrier: string | null;
  trackingNumber: string | null; paymentMethod: string | null; paymentStatus: string | null;
  fraudScore: number; tags: string[]; margin: number | null; createdAt: string;
}

export default function PedidosPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [city, setCity] = useState("");
  const [carrier, setCarrier] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [minValue, setMinValue] = useState("");
  const [maxValue, setMaxValue] = useState("");
  const [customerType, setCustomerType] = useState("");
  const [hasFraudRisk, setHasFraudRisk] = useState(false);

  // Saved filters
  const [savedFilters, setSavedFilters] = useState<Array<{id: string; name: string; filters: Record<string, string>}>>([]);
  const [filterName, setFilterName] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    const p = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) p.set("q", search);
    if (status) p.set("status", status);
    if (city) p.set("city", city);
    if (carrier) p.set("carrier", carrier);
    if (paymentMethod) p.set("paymentMethod", paymentMethod);
    if (dateFrom) p.set("dateFrom", dateFrom);
    if (dateTo) p.set("dateTo", dateTo);
    if (minValue) p.set("minValue", minValue);
    if (maxValue) p.set("maxValue", maxValue);
    if (customerType) p.set("customerType", customerType);
    if (hasFraudRisk) p.set("hasFraudRisk", "true");

    fetch(`/api/panel/orders?${p}`)
      .then(r => r.json())
      .then(d => { setOrders(d.orders || []); setTotal(d.total || 0); setPages(d.pages || 1); setLoading(false); });
  }, [page, search, status, city, carrier, paymentMethod, dateFrom, dateTo, minValue, maxValue, customerType, hasFraudRisk]);

  useEffect(load, [load]);

  useEffect(() => {
    fetch("/api/panel/saved-filters").then(r => r.json()).then(d => setSavedFilters(d.filters || []));
  }, []);

  const toggleSelect = (id: string) => {
    setSelected(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };
  const toggleAll = () => {
    if (selected.size === orders.length) setSelected(new Set());
    else setSelected(new Set(orders.map(o => o.id)));
  };

  const batchAction = async (action: string) => {
    if (selected.size === 0) return;
    await fetch("/api/panel/orders/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, orderIds: Array.from(selected) }),
    });
    setSelected(new Set());
    load();
  };

  const saveFilter = async () => {
    if (!filterName) return;
    const filters = { status, city, carrier, paymentMethod, dateFrom, dateTo, minValue, maxValue, customerType, hasFraudRisk: hasFraudRisk ? "true" : "" };
    await fetch("/api/panel/saved-filters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: filterName, filters }),
    });
    setFilterName("");
    const d = await fetch("/api/panel/saved-filters").then(r => r.json());
    setSavedFilters(d.filters || []);
  };

  const applyFilter = (filters: Record<string, string>) => {
    setStatus(filters.status || "");
    setCity(filters.city || "");
    setCarrier(filters.carrier || "");
    setPaymentMethod(filters.paymentMethod || "");
    setDateFrom(filters.dateFrom || "");
    setDateTo(filters.dateTo || "");
    setMinValue(filters.minValue || "");
    setMaxValue(filters.maxValue || "");
    setCustomerType(filters.customerType || "");
    setHasFraudRisk(filters.hasFraudRisk === "true");
    setPage(1);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-white">Pedidos ({total})</h1>
        <div className="flex gap-2">
          <button onClick={() => setShowFilters(!showFilters)}
            className="px-3 py-1.5 bg-neutral-800 text-neutral-300 rounded-lg text-sm hover:bg-neutral-700">
            {showFilters ? "Ocultar filtros" : "🔽 Filtros avanzados"}
          </button>
          <Link href="/api/panel/export?type=orders" target="_blank"
            className="px-3 py-1.5 bg-neutral-800 text-neutral-300 rounded-lg text-sm hover:bg-neutral-700">
            📥 Exportar CSV
          </Link>
        </div>
      </div>

      {/* Search + Status */}
      <div className="flex gap-3 mb-4">
        <input type="text" placeholder="Buscar por #pedido, cliente, email, teléfono..."
          value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:border-primary focus:outline-none" />
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="bg-neutral-900 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white">
          <option value="">Todos los estados</option>
          {allStatuses.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
        </select>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
            <div>
              <label className="text-xs text-neutral-500 mb-1 block">Ciudad</label>
              <input type="text" value={city} onChange={e => setCity(e.target.value)} placeholder="Bogotá..."
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1.5 text-sm text-white" />
            </div>
            <div>
              <label className="text-xs text-neutral-500 mb-1 block">Transportadora</label>
              <select value={carrier} onChange={e => setCarrier(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1.5 text-sm text-white">
                <option value="">Todas</option>
                <option value="coordinadora">Coordinadora</option>
                <option value="servientrega">Servientrega</option>
                <option value="interrapidisimo">Interrapidísimo</option>
                <option value="envia">Envía</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-neutral-500 mb-1 block">Método de pago</label>
              <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1.5 text-sm text-white">
                <option value="">Todos</option>
                <option value="BOLD">Bold</option>
                <option value="TRANSFER">Transferencia</option>
                <option value="WOMPI">Wompi</option>
                <option value="MERCADOPAGO">MercadoPago</option>
                <option value="ADDI">Addi</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-neutral-500 mb-1 block">Tipo cliente</label>
              <select value={customerType} onChange={e => setCustomerType(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1.5 text-sm text-white">
                <option value="">Todos</option>
                <option value="new">Nuevos</option>
                <option value="recurring">Recurrentes</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-neutral-500 mb-1 block">Desde</label>
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1.5 text-sm text-white" />
            </div>
            <div>
              <label className="text-xs text-neutral-500 mb-1 block">Hasta</label>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1.5 text-sm text-white" />
            </div>
            <div>
              <label className="text-xs text-neutral-500 mb-1 block">Valor mín</label>
              <input type="number" value={minValue} onChange={e => setMinValue(e.target.value)} placeholder="0"
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1.5 text-sm text-white" />
            </div>
            <div>
              <label className="text-xs text-neutral-500 mb-1 block">Valor máx</label>
              <input type="number" value={maxValue} onChange={e => setMaxValue(e.target.value)} placeholder="999999"
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1.5 text-sm text-white" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-neutral-400">
              <input type="checkbox" checked={hasFraudRisk} onChange={e => setHasFraudRisk(e.target.checked)} className="rounded" />
              Solo con riesgo fraude
            </label>
            <div className="ml-auto flex gap-2 items-center">
              <input type="text" value={filterName} onChange={e => setFilterName(e.target.value)} placeholder="Nombre del filtro..."
                className="bg-neutral-800 border border-neutral-700 rounded px-2 py-1 text-sm text-white w-40" />
              <button onClick={saveFilter} className="px-3 py-1 bg-primary text-black rounded text-sm font-medium">Guardar filtro</button>
            </div>
          </div>
          {savedFilters.length > 0 && (
            <div className="flex gap-2 mt-3 flex-wrap">
              <span className="text-xs text-neutral-500">Filtros guardados:</span>
              {savedFilters.map(f => (
                <button key={f.id} onClick={() => applyFilter(f.filters as Record<string, string>)}
                  className="px-2 py-0.5 bg-neutral-800 text-primary text-xs rounded hover:bg-neutral-700">{f.name}</button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Batch Actions */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 mb-4 bg-primary/10 border border-primary/30 rounded-lg px-4 py-2">
          <span className="text-sm text-primary font-medium">{selected.size} seleccionados</span>
          <button onClick={() => batchAction("mark_paid")} className="px-3 py-1 bg-blue-600 text-white rounded text-xs">💰 Marcar pagado</button>
          <button onClick={() => batchAction("mark_packed")} className="px-3 py-1 bg-indigo-600 text-white rounded text-xs">📦 Marcar empacado</button>
          <button onClick={() => batchAction("mark_shipped")} className="px-3 py-1 bg-cyan-600 text-white rounded text-xs">🚚 Marcar enviado</button>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-neutral-900 rounded-lg border border-neutral-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-800 text-neutral-400">
              <th className="p-3 w-8"><input type="checkbox" onChange={toggleAll} checked={selected.size === orders.length && orders.length > 0} /></th>
              <th className="text-left p-3"># Pedido</th>
              <th className="text-left p-3">Cliente</th>
              <th className="text-right p-3">Total</th>
              <th className="text-center p-3">Items</th>
              <th className="text-center p-3">Estado</th>
              <th className="text-left p-3">Ciudad</th>
              <th className="text-center p-3">Fraude</th>
              <th className="text-right p-3">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={9} className="p-8 text-center text-neutral-500">Cargando...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={9} className="p-8 text-center text-neutral-500">No hay pedidos</td></tr>
            ) : orders.map(o => (
              <tr key={o.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30">
                <td className="p-3"><input type="checkbox" checked={selected.has(o.id)} onChange={() => toggleSelect(o.id)} /></td>
                <td className="p-3">
                  <Link href={`/panel/pedidos/${o.id}`} className="text-primary hover:underline font-medium">#{o.orderNumber}</Link>
                  {o.tags.length > 0 && (
                    <div className="flex gap-1 mt-1">{o.tags.map(t => <span key={t} className="text-[10px] px-1.5 py-0.5 bg-neutral-800 text-neutral-400 rounded">{t}</span>)}</div>
                  )}
                </td>
                <td className="p-3">
                  <p className="text-white">{o.customer}</p>
                  <p className="text-xs text-neutral-500">{o.customerOrderCount > 1 ? `${o.customerOrderCount} pedidos` : "Nuevo"}</p>
                </td>
                <td className="p-3 text-right text-white font-medium">{formatPrice(o.total)}</td>
                <td className="p-3 text-center text-neutral-400">{o.itemCount}</td>
                <td className="p-3 text-center">
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColors[o.status] || ""}`}>{statusLabels[o.status] || o.status}</span>
                </td>
                <td className="p-3 text-neutral-400 text-xs">{o.city || "—"}</td>
                <td className="p-3 text-center">
                  {o.fraudScore > 0 && (
                    <span className={`text-xs font-bold ${o.fraudScore >= 50 ? "text-red-400" : o.fraudScore >= 25 ? "text-yellow-400" : "text-green-400"}`}>
                      {o.fraudScore}
                    </span>
                  )}
                </td>
                <td className="p-3 text-right text-neutral-500 text-xs">{new Date(o.createdAt).toLocaleDateString("es-CO")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: Math.min(pages, 10) }, (_, i) => i + 1).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`px-3 py-1 rounded text-sm ${p === page ? "bg-primary text-black" : "bg-neutral-800 text-neutral-400 hover:text-white"}`}>{p}</button>
          ))}
          {pages > 10 && <span className="text-neutral-500 px-2">...</span>}
        </div>
      )}
    </div>
  );
}
