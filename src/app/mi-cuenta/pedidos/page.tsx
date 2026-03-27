import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";

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
  if (!user) redirect("/login?returnUrl=/mi-cuenta/pedidos");

  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    include: {
      items: { include: { product: { select: { images: { select: { url: true }, take: 1 } } } } },
      payment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const statusLabels: Record<string, string> = {
    PENDING: "Pendiente", PAID: "Pagado", SHIPPED: "Enviado",
    DELIVERED: "Entregado", CANCELLED: "Cancelado",
  };
  const statusColors: Record<string, string> = {
    PENDING: "bg-yellow-500/20 text-yellow-400",
    PAID: "bg-green-500/20 text-green-400",
    SHIPPED: "bg-cyan-500/20 text-cyan-400",
    DELIVERED: "bg-green-500/20 text-green-400",
    CANCELLED: "bg-red-500/20 text-red-400",
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/mi-cuenta" className="text-xs text-neutral-500 hover:text-white mb-2 inline-block">← Mi Cuenta</Link>
      <h1 className="font-heading text-3xl mb-6">MIS PEDIDOS</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📦</p>
          <p className="text-neutral-400 mb-4">Aún no tienes pedidos</p>
          <Link href="/" className="inline-block px-6 py-2.5 bg-primary text-white font-bold rounded-lg text-sm">IR A COMPRAR</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <Link key={order.id} href={"/mi-cuenta/pedidos/" + order.orderNumber}
              className="block bg-neutral-900 border border-neutral-800 rounded-xl p-4 hover:border-neutral-700 transition"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-primary">{order.orderNumber}</span>
                  <span className={"text-[10px] px-2 py-0.5 rounded-full font-medium " + (statusColors[order.status] || "bg-neutral-700")}>
                    {statusLabels[order.status] || order.status}
                  </span>
                </div>
                <span className="text-sm font-bold text-white">{formatPrice(Number(order.total))}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {order.items.slice(0, 4).map((item, i) => (
                    <div key={i} className="relative w-8 h-8 bg-neutral-800 rounded overflow-hidden">
                      {item.product?.images?.[0]?.url ? (
                        <Image src={item.product.images[0].url} alt={item.name} fill className="object-cover" sizes="32px" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-600 text-[10px]">📦</div>
                      )}
                    </div>
                  ))}
                  <span className="text-[11px] text-neutral-500 ml-1">
                    {order.items.length} producto{order.items.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <span className="text-[11px] text-neutral-500">
                  {new Date(order.createdAt).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
