import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/20 text-yellow-400", PAID: "bg-blue-500/20 text-blue-400",
  PREPARING: "bg-purple-500/20 text-purple-400", PACKED: "bg-indigo-500/20 text-indigo-400",
  SHIPPED: "bg-cyan-500/20 text-cyan-400", DELIVERED: "bg-green-500/20 text-green-400",
  RETURNED: "bg-orange-500/20 text-orange-400", CANCELLED: "bg-red-500/20 text-red-400",
  FRAUD_RISK: "bg-red-500/20 text-red-400", REFUNDED: "bg-orange-500/20 text-orange-400",
};
const statusLabels: Record<string, string> = {
  PENDING: "Pendiente", PAID: "Pagado", PREPARING: "En preparación", PACKED: "Empacado",
  SHIPPED: "Enviado", DELIVERED: "Entregado", RETURNED: "Devuelto", CANCELLED: "Cancelado",
  FRAUD_RISK: "Fraude", REFUNDED: "Reembolsado",
};

export default async function DashboardPage() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const h48ago = new Date(now.getTime() - 48 * 60 * 60 * 1000);
  const d30ago = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    activeProducts, totalCustomers, pendingOrders, salesToday, salesMonth,
    recentOrders, lowStock, unreadAlerts, delayedOrders,
    todayOrders, deliveredThisMonth, cancelledThisMonth, dailySales
  ] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.count({ where: { status: { in: ["PENDING", "PAID"] } } }),
    prisma.order.aggregate({ _sum: { total: true }, _count: true, where: { createdAt: { gte: todayStart }, status: { notIn: ["CANCELLED", "FRAUD_RISK"] } } }),
    prisma.order.aggregate({ _sum: { total: true }, _count: true, where: { createdAt: { gte: monthStart }, status: { notIn: ["CANCELLED", "FRAUD_RISK"] } } }),
    prisma.order.findMany({ take: 10, orderBy: { createdAt: "desc" }, include: { user: { select: { name: true, email: true } } } }),
    prisma.productVariant.findMany({ where: { stock: { lt: 5 }, isActive: true }, include: { product: { select: { name: true } } }, orderBy: { stock: "asc" }, take: 10 }),
    prisma.alert.count({ where: { isRead: false } }),
    prisma.order.count({ where: { status: { in: ["PENDING", "PAID", "PREPARING"] }, createdAt: { lt: h48ago } } }),
    prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.order.count({ where: { status: "DELIVERED", createdAt: { gte: monthStart } } }),
    prisma.order.count({ where: { status: "CANCELLED", createdAt: { gte: monthStart } } }),
    // Daily sales for chart (last 30 days)
    prisma.order.findMany({
      where: { createdAt: { gte: d30ago }, status: { notIn: ["CANCELLED", "FRAUD_RISK"] } },
      select: { total: true, createdAt: true },
    }),
  ]);

  // Build daily chart data
  const dailyMap = new Map<string, number>();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i);
    dailyMap.set(d.toISOString().split("T")[0], 0);
  }
  for (const o of dailySales) {
    const key = o.createdAt.toISOString().split("T")[0];
    dailyMap.set(key, (dailyMap.get(key) || 0) + Number(o.total));
  }
  const chartData = Array.from(dailyMap.entries()).map(([date, total]) => ({ date, total }));
  const maxSale = Math.max(...chartData.map(d => d.total), 1);

  const avgTicketMonth = salesMonth._count > 0 ? Number(salesMonth._sum.total || 0) / salesMonth._count : 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <div className="flex gap-2">
          {unreadAlerts > 0 && (
            <Link href="/panel/alertas" className="flex items-center gap-2 bg-red-500/20 text-red-400 px-3 py-1.5 rounded-lg text-sm">
              🔔 {unreadAlerts} alertas
            </Link>
          )}
          {delayedOrders > 0 && (
            <Link href="/panel/fulfillment" className="flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-3 py-1.5 rounded-lg text-sm">
              ⚠️ {delayedOrders} retrasados
            </Link>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <Card label="Ventas hoy" value={formatPrice(Number(salesToday._sum.total || 0))} sub={`${salesToday._count} pedidos`} />
        <Card label="Ventas del mes" value={formatPrice(Number(salesMonth._sum.total || 0))} sub={`${salesMonth._count} pedidos`} />
        <Card label="Ticket promedio" value={formatPrice(avgTicketMonth)} />
        <Card label="Pendientes" value={String(pendingOrders)} color={pendingOrders > 0 ? "text-yellow-400" : undefined} sub={`${todayOrders} hoy`} />
        <Card label="Productos activos" value={String(activeProducts)} sub={`${totalCustomers} clientes`} />
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MiniCard label="Entregados (mes)" value={String(deliveredThisMonth)} color="text-green-400" />
        <MiniCard label="Cancelados (mes)" value={String(cancelledThisMonth)} color={cancelledThisMonth > 0 ? "text-red-400" : "text-green-400"} />
        <MiniCard label="Tasa cancelación" value={`${salesMonth._count > 0 ? Math.round((cancelledThisMonth / (salesMonth._count + cancelledThisMonth)) * 100) : 0}%`} color="text-neutral-300" />
        <MiniCard label="Stock bajo" value={`${lowStock.length} variantes`} color={lowStock.length > 0 ? "text-yellow-400" : "text-green-400"} />
      </div>

      {/* Sales Chart */}
      <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4 mb-6">
        <h2 className="text-sm font-semibold text-white mb-3">Ventas últimos 30 días</h2>
        <div className="flex items-end gap-0.5 h-24">
          {chartData.map((d, i) => (
            <div key={i} className="flex-1 group relative h-full">
              <div
                className="bg-primary/60 hover:bg-primary rounded-t transition-colors w-full"
                style={{ height: `${Math.max((d.total / maxSale) * 100, 2)}%` }}
              />
              <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 hidden group-hover:block bg-neutral-800 text-xs text-white px-2 py-1 rounded whitespace-nowrap z-10">
                {d.date.slice(5)}: {formatPrice(d.total)}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Pedidos recientes</h2>
            <Link href="/panel/pedidos" className="text-sm text-primary hover:underline">Ver todos</Link>
          </div>
          <div className="space-y-2">
            {recentOrders.map((order) => (
              <Link key={order.id} href={`/panel/pedidos/${order.id}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-neutral-800 transition-colors">
                <div>
                  <p className="text-sm font-medium text-white">#{order.orderNumber}</p>
                  <p className="text-xs text-neutral-500">{order.user.name || order.user.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{formatPrice(Number(order.total))}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[order.status] || ""}`}>
                    {statusLabels[order.status] || order.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Stock bajo</h2>
            <Link href="/panel/inventario" className="text-sm text-primary hover:underline">Ver inventario</Link>
          </div>
          <div className="space-y-2">
            {lowStock.map((v) => (
              <div key={v.id} className="flex items-center justify-between p-3 rounded-lg bg-neutral-800/50">
                <div>
                  <p className="text-sm font-medium text-white truncate max-w-[250px]">{v.product.name}</p>
                  <p className="text-xs text-neutral-500">{v.name} {v.sku ? `(${v.sku})` : ""}</p>
                </div>
                <span className={`text-sm font-bold ${v.stock === 0 ? "text-red-400" : "text-yellow-400"}`}>
                  {v.stock === 0 ? "Agotado" : `${v.stock} uds`}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Card({ label, value, sub, color }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="bg-neutral-900 rounded-lg border border-neutral-800 p-4">
      <p className="text-xs text-neutral-500 uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${color || "text-white"}`}>{value}</p>
      {sub && <p className="text-xs text-neutral-500 mt-1">{sub}</p>}
    </div>
  );
}

function MiniCard({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-neutral-800/50 rounded-lg p-3">
      <p className="text-[10px] text-neutral-500 uppercase">{label}</p>
      <p className={`text-lg font-bold ${color || "text-white"}`}>{value}</p>
    </div>
  );
}
