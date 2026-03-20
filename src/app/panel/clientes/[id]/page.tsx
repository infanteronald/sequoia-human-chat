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
const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-400", PAID: "bg-blue-500/20 text-blue-400",
  PREPARING: "bg-purple-500/20 text-purple-400", PACKED: "bg-indigo-500/20 text-indigo-400",
  SHIPPED: "bg-cyan-500/20 text-cyan-400", DELIVERED: "bg-green-500/20 text-green-400",
  RETURNED: "bg-orange-500/20 text-orange-400", CANCELLED: "bg-red-500/20 text-red-400",
  FRAUD_RISK: "bg-red-600/20 text-red-400", REFUNDED: "bg-orange-500/20 text-orange-400",
};

const TAG_OPTIONS = ["VIP", "mayorista", "problema", "reventa", "fidelizado"];

export default function ClienteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = () => {
    fetch(`/api/panel/users/${id}`).then(r => r.json()).then(d => { setUser(d); setLoading(false); });
  };

  useEffect(loadUser, [id]);

  const toggleTag = async (tag: string) => {
    const currentTags = user.tags || [];
    const newTags = currentTags.includes(tag) ? currentTags.filter((t: string) => t !== tag) : [...currentTags, tag];
    await fetch(`/api/panel/users/${id}`, {
      method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tags: newTags }),
    });
    setUser((prev: any) => ({ ...prev, tags: newTags }));
  };

  if (loading || !user) return <div className="text-neutral-500 p-8">Cargando cliente...</div>;

  const orders = (user.orders || []) as any[];
  const addresses = (user.addresses || []) as any[];
  const stats = user.stats as any;
  const productsBought = (user.productsBought || []) as any[];

  return (
    <div>
      <Link href="/panel/clientes" className="text-sm text-neutral-500 hover:text-white">&larr; Volver a clientes</Link>
      <div className="flex items-center gap-3 mt-2 mb-6">
        <h1 className="text-2xl font-bold text-white">{user.name || user.email}</h1>
        {stats.isVIP && <span className="text-xs px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full">⭐ VIP</span>}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
              <p className="text-xs text-neutral-500">Total pedidos</p>
              <p className="text-2xl font-bold text-white">{stats.totalOrders}</p>
            </div>
            <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
              <p className="text-xs text-neutral-500">Total gastado</p>
              <p className="text-2xl font-bold text-white">{formatPrice(stats.totalSpent)}</p>
            </div>
            <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
              <p className="text-xs text-neutral-500">Ticket promedio</p>
              <p className="text-2xl font-bold text-white">{formatPrice(stats.avgTicket)}</p>
            </div>
            <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
              <p className="text-xs text-neutral-500">Última compra</p>
              <p className="text-lg font-bold text-white">{stats.lastOrder ? new Date(stats.lastOrder).toLocaleDateString("es-CO") : "—"}</p>
            </div>
          </div>

          {/* Orders */}
          <div className="bg-neutral-900 rounded-lg border border-neutral-800 overflow-hidden">
            <div className="p-4 border-b border-neutral-800">
              <h2 className="text-lg font-semibold text-white">Pedidos ({orders.length})</h2>
            </div>
            {orders.length === 0 ? (
              <p className="p-6 text-neutral-500 text-sm">No tiene pedidos</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-800 text-neutral-400">
                    <th className="text-left p-3"># Pedido</th>
                    <th className="text-right p-3">Total</th>
                    <th className="text-center p-3">Items</th>
                    <th className="text-center p-3">Estado</th>
                    <th className="text-right p-3">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o: any) => (
                    <tr key={o.id} className="border-b border-neutral-800/50">
                      <td className="p-3"><Link href={`/panel/pedidos/${o.id}`} className="text-primary hover:underline">#{o.orderNumber}</Link></td>
                      <td className="p-3 text-right text-white">{formatPrice(o.total)}</td>
                      <td className="p-3 text-center text-neutral-400">{o.itemCount}</td>
                      <td className="p-3 text-center">
                        <span className={`text-xs px-2 py-1 rounded-full ${statusColors[o.status] || ""}`}>{statusLabels[o.status] || o.status}</span>
                      </td>
                      <td className="p-3 text-right text-neutral-500 text-xs">{new Date(o.createdAt).toLocaleDateString("es-CO")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Products bought */}
          {productsBought.length > 0 && (
            <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
              <h2 className="text-lg font-semibold text-white mb-4">Productos comprados</h2>
              <div className="space-y-2">
                {productsBought.slice(0, 10).map((p: any, i: number) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span className="text-neutral-300 truncate max-w-[400px]">{p.name}</span>
                    <span className="text-neutral-500">{p.quantity} uds</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Info</h3>
            <div className="space-y-2 text-sm">
              <p><span className="text-neutral-500">Email:</span> <span className="text-neutral-300">{user.email}</span></p>
              <p><span className="text-neutral-500">Teléfono:</span> <span className="text-neutral-300">{user.phone || "—"}</span></p>
              <p><span className="text-neutral-500">Registro:</span> <span className="text-neutral-300">{new Date(user.createdAt).toLocaleDateString("es-CO")}</span></p>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {TAG_OPTIONS.map(tag => (
                <button key={tag} onClick={() => toggleTag(tag)}
                  className={`text-xs px-2 py-1 rounded-full transition ${
                    (user.tags || []).includes(tag) ? "bg-primary/20 text-primary border border-primary/50" : "bg-neutral-800 text-neutral-400 border border-neutral-700 hover:border-neutral-500"
                  }`}>
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Addresses */}
          {addresses.length > 0 && (
            <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Direcciones</h3>
              <div className="space-y-3">
                {addresses.map((a: any, i: number) => (
                  <div key={i} className="text-sm text-neutral-400">
                    <p className="text-neutral-300 font-medium">{a.name}</p>
                    <p>{a.address}</p>
                    <p>{a.city}, {a.state}</p>
                    {a.phone && <p>Tel: {a.phone}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
