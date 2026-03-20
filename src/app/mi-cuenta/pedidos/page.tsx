import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { formatPrice } from "@/lib/utils";

async function getUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session-token")?.value;
  if (!token) return null;
  const session = await prisma.session.findUnique({
    where: { sessionToken: token },
    include: { user: true },
  });
  if (!session || session.expires < new Date()) return null;
  return session.user;
}

export default async function OrdersPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: { items: true, payment: true },
    orderBy: { createdAt: "desc" },
  });

  const statusLabels: Record<string, string> = {
    PENDING: "Pendiente",
    CONFIRMED: "Confirmado",
    PROCESSING: "En proceso",
    SHIPPED: "Enviado",
    DELIVERED: "Entregado",
    CANCELLED: "Cancelado",
    REFUNDED: "Reembolsado",
  };

  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-900/50 text-yellow-300",
    CONFIRMED: "bg-blue-900/50 text-blue-300",
    PROCESSING: "bg-purple-900/50 text-purple-300",
    SHIPPED: "bg-cyan-900/50 text-cyan-300",
    DELIVERED: "bg-green-900/50 text-green-300",
    CANCELLED: "bg-red-900/50 text-red-300",
    REFUNDED: "bg-neutral-700 text-neutral-300",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="font-heading text-5xl mb-8">MIS PEDIDOS</h1>

      {orders.length === 0 ? (
        <p className="text-neutral-400 text-center py-12">Aún no tienes pedidos</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="bg-surface rounded-xl p-6">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                <div>
                  <span className="text-sm text-neutral-400">Pedido</span>
                  <p className="font-bold">{order.orderNumber}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    statusColors[order.status] || "bg-neutral-700"
                  }`}
                >
                  {statusLabels[order.status] || order.status}
                </span>
                <div className="text-right">
                  <span className="text-sm text-neutral-400">Total</span>
                  <p className="font-bold text-primary">{formatPrice(Number(order.total))}</p>
                </div>
              </div>
              <div className="text-sm text-neutral-400">
                {order.items.length} producto{order.items.length !== 1 ? "s" : ""} &middot;{" "}
                {new Date(order.createdAt).toLocaleDateString("es-CO")}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
