"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

const statusLabels: Record<string, string> = {
  PENDING: "Pendiente", PAID: "Pagado", PREPARING: "En preparación", PACKED: "Empacado",
  SHIPPED: "Enviado", DELIVERED: "Entregado", RETURNED: "Devuelto", CANCELLED: "Cancelado",
  FRAUD_RISK: "Fraude", REFUNDED: "Reembolsado",
};
const allStatuses = Object.keys(statusLabels);

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [carrier, setCarrier] = useState("");
  const [activeTab, setActiveTab] = useState("detail");

  useEffect(() => {
    fetch(`/api/panel/orders/${id}`).then(r => r.json()).then(d => {
      setOrder(d);
      setTrackingNumber(d.trackingNumber || "");
      setCarrier(d.carrier || "coordinadora");
      setLoading(false);
    });
  }, [id]);

  const updateOrder = async (data: Record<string, unknown>) => {
    setSaving(true);
    await fetch(`/api/panel/orders/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
    });
    // Reload
    const d = await fetch(`/api/panel/orders/${id}`).then(r => r.json());
    setOrder(d);
    setSaving(false);
  };

  const addNote = async () => {
    if (!noteText.trim()) return;
    await fetch(`/api/panel/orders/${id}/notes`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text: noteText }),
    });
    setNoteText("");
    const d = await fetch(`/api/panel/orders/${id}`).then(r => r.json());
    setOrder(d);
  };

  const saveTracking = () => updateOrder({ carrier, trackingNumber, trackingUrl: carrier === "coordinadora" ? `https://www.coordinadora.com/rastreo-de-guias/?guia=${trackingNumber}` : "" });

  if (loading || !order) return <div className="text-neutral-500 p-8">Cargando pedido...</div>;

  const user = order.user as any;
  const items = order.items as any[];
  const payment = order.payment as any;
  const timeline = (order.timeline || []) as any[];
  const notes = (order.internalNotes || []) as any[];
  const customerStats = order.customerStats as any;
  const returns = (order.returns || []) as any[];

  // Financial calc
  const itemCost = items.reduce((s: number, i: any) => s + (i.costPrice || 0) * i.quantity, 0);
  const revenue = order.total;
  const gFee = order.gatewayFee || 0;
  const sCost = order.shippingCost || 0;
  const calcMargin = revenue - itemCost - gFee - sCost;

  return (
    <div>
      <Link href="/panel/pedidos" className="text-sm text-neutral-500 hover:text-white">&larr; Volver a pedidos</Link>

      {/* Header */}
      <div className="flex flex-wrap justify-between items-start mt-2 mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Pedido #{order.orderNumber}</h1>
          <p className="text-sm text-neutral-500">{new Date(order.createdAt).toLocaleString("es-CO")}</p>
          {order.tags?.length > 0 && (
            <div className="flex gap-1 mt-1">{order.tags.map((t: string) => <span key={t} className="text-xs px-2 py-0.5 bg-neutral-800 text-neutral-400 rounded">{t}</span>)}</div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select value={order.status} onChange={e => updateOrder({ status: e.target.value })} disabled={saving}
            className="bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white">
            {allStatuses.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
          </select>
          <a href={`/api/panel/orders/${id}/invoice`} target="_blank" className="px-3 py-2 bg-neutral-800 text-neutral-300 rounded-lg text-sm hover:bg-neutral-700">🧾 Factura</a>
          <a href={`/api/panel/orders/${id}/label`} target="_blank" className="px-3 py-2 bg-neutral-800 text-neutral-300 rounded-lg text-sm hover:bg-neutral-700">📄 Guía</a>
          <button onClick={() => updateOrder({ status: "SHIPPED" })} className="px-3 py-2 bg-neutral-700 text-white rounded-lg text-sm hover:bg-neutral-600">🚚 Enviar</button>
        </div>
      </div>

      {/* Fraud Alert */}
      {order.fraudScore >= 25 && (
        <div className={`mb-4 p-3 rounded-lg border ${order.fraudScore >= 50 ? "bg-red-500/10 border-red-500/30" : "bg-orange-500/10 border-orange-500/30"}`}>
          <div className="flex items-center gap-3">
            <span className="text-lg">⚠️</span>
            <div>
              <p className={`text-sm font-medium ${order.fraudScore >= 50 ? "text-red-400" : "text-orange-400"}`}>
                Riesgo de fraude: {order.fraudScore}/100
              </p>
              {order.fraudFlags && (
                <p className="text-xs text-neutral-400 mt-1">
                  Flags: {(order.fraudFlags as string[]).join(", ")}
                </p>
              )}
            </div>
            <div className="ml-auto w-32 h-2 bg-neutral-800 rounded-full overflow-hidden">
              <div className={`h-full rounded-full ${order.fraudScore >= 50 ? "bg-red-500" : "bg-orange-500"}`}
                style={{ width: `${order.fraudScore}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-neutral-800">
        {[
          { key: "detail", label: "Detalle" }, { key: "timeline", label: "Timeline" },
          { key: "finance", label: "Finanzas" }, { key: "notes", label: "Notas" },
          { key: "tracking", label: "Envío" }, { key: "returns", label: "Devoluciones" },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm transition ${activeTab === tab.key ? "text-primary border-b-2 border-primary" : "text-neutral-500 hover:text-white"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: Detail */}
      {activeTab === "detail" && (
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-neutral-900 rounded-lg border border-neutral-800 p-4">
            <h2 className="text-lg font-semibold text-white mb-4">Productos</h2>
            <div className="space-y-3">
              {items.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-neutral-800/50 rounded-lg">
                  {item.image ? <img src={item.image} alt="" className="w-12 h-12 rounded object-cover bg-neutral-700" /> : <div className="w-12 h-12 rounded bg-neutral-700" />}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{item.name}</p>
                    {item.variant?.name && <p className="text-xs text-neutral-500">{item.variant.name}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-white">{formatPrice(item.price)} × {item.quantity}</p>
                    <p className="text-xs text-neutral-500">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="border-t border-neutral-700 mt-4 pt-4 space-y-1 text-right">
              <p className="text-sm text-neutral-400">Subtotal: {formatPrice(order.subtotal)}</p>
              <p className="text-sm text-neutral-400">Envío: {formatPrice(order.shipping)}</p>
              <p className="text-lg font-bold text-white">Total: {formatPrice(order.total)}</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Customer Profile */}
            <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
              <h3 className="text-sm font-semibold text-white mb-2">Cliente</h3>
              <Link href={`/panel/clientes/${user.id}`} className="text-primary hover:underline text-sm">{user.name || user.email}</Link>
              <p className="text-xs text-neutral-500">{user.email}</p>
              {user.phone && <p className="text-xs text-neutral-500">Tel: {user.phone}</p>}
              <div className="mt-3 pt-3 border-t border-neutral-800 grid grid-cols-2 gap-2">
                <div><p className="text-[10px] text-neutral-500">Pedidos</p><p className="text-sm text-white font-medium">{customerStats.totalOrders}</p></div>
                <div><p className="text-[10px] text-neutral-500">Total gastado</p><p className="text-sm text-white font-medium">{formatPrice(customerStats.totalSpent)}</p></div>
                <div><p className="text-[10px] text-neutral-500">Ticket prom.</p><p className="text-sm text-white font-medium">{formatPrice(customerStats.avgTicket)}</p></div>
                <div><p className="text-[10px] text-neutral-500">Último pedido</p><p className="text-sm text-white font-medium">{customerStats.lastOrder ? new Date(customerStats.lastOrder).toLocaleDateString("es-CO") : "—"}</p></div>
              </div>
              {user.tags?.length > 0 && (
                <div className="flex gap-1 mt-2 flex-wrap">{user.tags.map((t: string) => <span key={t} className="text-[10px] px-1.5 py-0.5 bg-neutral-800 text-neutral-400 rounded">{t}</span>)}</div>
              )}
            </div>

            {/* Shipping */}
            <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
              <h3 className="text-sm font-semibold text-white mb-2">Envío</h3>
              <p className="text-sm text-neutral-300">{order.shippingName}</p>
              <p className="text-xs text-neutral-500">{order.shippingAddress}</p>
              <p className="text-xs text-neutral-500">{order.shippingCity}, {order.shippingState}</p>
              {order.shippingPhone && <p className="text-xs text-neutral-500">Tel: {order.shippingPhone}</p>}
            </div>

            {/* Payment */}
            {payment && (
              <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
                <h3 className="text-sm font-semibold text-white mb-2">Pago</h3>
                <p className="text-sm text-neutral-300">{payment.method}</p>
                <p className="text-xs text-neutral-500">Estado: {payment.status}</p>
                {payment.transactionId && <p className="text-xs text-neutral-500 font-mono mt-1">TX: {payment.transactionId}</p>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: Timeline */}
      {activeTab === "timeline" && (
        <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
          <h2 className="text-lg font-semibold text-white mb-4">Historial del pedido</h2>
          {timeline.length === 0 ? (
            <p className="text-neutral-500 text-sm">Sin eventos registrados</p>
          ) : (
            <div className="space-y-3">
              {timeline.map((e: any) => (
                <div key={e.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 bg-primary rounded-full mt-1.5" />
                    <div className="w-0.5 flex-1 bg-neutral-800" />
                  </div>
                  <div className="pb-4">
                    <p className="text-sm text-white">{e.detail}</p>
                    <p className="text-xs text-neutral-500">{new Date(e.createdAt).toLocaleString("es-CO")} {e.author ? `— ${e.author}` : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: Finance */}
      {activeTab === "finance" && (
        <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4 max-w-lg">
          <h2 className="text-lg font-semibold text-white mb-4">Panel financiero</h2>
          <div className="space-y-2">
            <div className="flex justify-between text-sm"><span className="text-neutral-400">Ingresos (total pedido)</span><span className="text-white">{formatPrice(revenue)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-neutral-400">Costo productos</span><span className="text-red-400">- {formatPrice(itemCost)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-neutral-400">Comisión pasarela</span><span className="text-red-400">- {formatPrice(gFee)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-neutral-400">Costo envío</span><span className="text-red-400">- {formatPrice(sCost)}</span></div>
            <div className="border-t border-neutral-700 pt-2 flex justify-between text-sm font-bold">
              <span className="text-white">Margen</span>
              <span className={calcMargin >= 0 ? "text-green-400" : "text-red-400"}>{formatPrice(calcMargin)} ({revenue > 0 ? Math.round((calcMargin / revenue) * 100) : 0}%)</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-neutral-500">Comisión pasarela</label>
              <input type="number" defaultValue={gFee} onBlur={e => updateOrder({ gatewayFee: Number(e.target.value) })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1.5 text-sm text-white mt-1" />
            </div>
            <div>
              <label className="text-xs text-neutral-500">Costo envío real</label>
              <input type="number" defaultValue={sCost} onBlur={e => updateOrder({ shippingCost: Number(e.target.value) })}
                className="w-full bg-neutral-800 border border-neutral-700 rounded px-2 py-1.5 text-sm text-white mt-1" />
            </div>
          </div>
        </div>
      )}

      {/* TAB: Notes */}
      {activeTab === "notes" && (
        <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4 max-w-lg">
          <h2 className="text-lg font-semibold text-white mb-4">Notas internas</h2>
          <div className="flex gap-2 mb-4">
            <input type="text" value={noteText} onChange={e => setNoteText(e.target.value)}
              placeholder="Agregar nota interna..."
              onKeyDown={e => e.key === "Enter" && addNote()}
              className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-500" />
            <button onClick={addNote} className="px-4 py-2 bg-primary text-black rounded-lg text-sm font-medium">Agregar</button>
          </div>
          {notes.length === 0 ? (
            <p className="text-neutral-500 text-sm">Sin notas</p>
          ) : (
            <div className="space-y-3">
              {notes.map((n: any, i: number) => (
                <div key={i} className="bg-neutral-800/50 rounded-lg p-3">
                  <p className="text-sm text-white">{n.text}</p>
                  <p className="text-xs text-neutral-500 mt-1">{n.author} — {new Date(n.createdAt).toLocaleString("es-CO")}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: Tracking */}
      {activeTab === "tracking" && (
        <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4 max-w-lg">
          <h2 className="text-lg font-semibold text-white mb-4">Información de envío</h2>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-neutral-500">Transportadora</label>
              <select value={carrier} onChange={e => setCarrier(e.target.value)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white mt-1">
                <option value="coordinadora">Coordinadora</option>
                <option value="servientrega">Servientrega</option>
                <option value="interrapidisimo">Interrapidísimo</option>
                <option value="envia">Envía</option>
                <option value="tcc">TCC</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-neutral-500">Número de guía</label>
              <input type="text" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)}
                placeholder="Número de guía..."
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 text-sm text-white mt-1" />
            </div>
            <button onClick={saveTracking} className="px-4 py-2 bg-primary text-black rounded-lg text-sm font-medium">
              Guardar tracking
            </button>
            {order.trackingNumber && (
              <div className="mt-4 p-3 bg-neutral-800/50 rounded-lg">
                <p className="text-sm text-white">Guía: <span className="font-mono">{order.trackingNumber}</span>
                  <button onClick={() => navigator.clipboard.writeText(order.trackingNumber)} className="ml-2 text-primary text-xs">📋 Copiar</button>
                </p>
                {order.trackingUrl && <a href={order.trackingUrl} target="_blank" className="text-primary text-xs hover:underline mt-1 block">Ver tracking →</a>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: Returns */}
      {activeTab === "returns" && (
        <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4 max-w-lg">
          <h2 className="text-lg font-semibold text-white mb-4">Devoluciones</h2>
          {returns.length === 0 ? (
            <p className="text-neutral-500 text-sm">No hay devoluciones para este pedido</p>
          ) : (
            <div className="space-y-3">
              {returns.map((r: any) => (
                <div key={r.id} className="bg-neutral-800/50 rounded-lg p-3">
                  <div className="flex justify-between">
                    <p className="text-sm text-white">{r.reason}</p>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-orange-400">{r.status}</span>
                  </div>
                  {r.refundAmount && <p className="text-xs text-neutral-400 mt-1">Reembolso: {formatPrice(r.refundAmount)}</p>}
                  <p className="text-xs text-neutral-500 mt-1">{new Date(r.createdAt).toLocaleDateString("es-CO")}</p>
                </div>
              ))}
            </div>
          )}
          <Link href={`/panel/devoluciones?orderId=${id}`} className="mt-4 inline-block px-4 py-2 bg-neutral-800 text-neutral-300 rounded-lg text-sm hover:bg-neutral-700">
            + Crear devolución
          </Link>
        </div>
      )}
    </div>
  );
}
