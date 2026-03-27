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

export default async function MyAccountPage() {
  const user = await getUser();
  if (!user) redirect("/login?returnUrl=/mi-cuenta");

  const firstName = (user.name || "Cliente").split(" ")[0];

  // Get stats
  const [totalOrders, lastOrder, totalSpent] = await Promise.all([
    prisma.order.count({ where: { userId: user.id } }),
    prisma.order.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { items: { include: { product: { select: { images: { select: { url: true }, take: 1 } } } } } },
    }),
    prisma.order.aggregate({
      where: { userId: user.id, status: { in: ["PAID", "SHIPPED", "DELIVERED"] } },
      _sum: { total: true },
    }),
  ]);

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
      {/* Greeting */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Hola, {firstName} 👋</h1>
          <p className="text-sm text-neutral-500">{user.email}</p>
        </div>
        <Link href="/mi-cuenta/configuracion" className="text-xs text-neutral-500 hover:text-white border border-neutral-700 px-3 py-1.5 rounded-lg transition">
          ⚙️ Configuración
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{totalOrders}</p>
          <p className="text-[11px] text-neutral-500">Pedidos</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-primary">{formatPrice(Number(totalSpent._sum.total || 0))}</p>
          <p className="text-[11px] text-neutral-500">Total comprado</p>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-white">{user.createdAt ? new Date(user.createdAt).getFullYear() : "—"}</p>
          <p className="text-[11px] text-neutral-500">Cliente desde</p>
        </div>
      </div>

      {/* Last Order */}
      {lastOrder && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-wider">Último pedido</h2>
            <Link href="/mi-cuenta/pedidos" className="text-xs text-primary hover:underline">Ver todos →</Link>
          </div>
          <Link href={"/mi-cuenta/pedidos/" + lastOrder.orderNumber} className="block bg-neutral-900 border border-neutral-800 rounded-xl p-4 hover:border-neutral-700 transition">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-primary">{lastOrder.orderNumber}</span>
                <span className={"text-[10px] px-2 py-0.5 rounded-full font-medium " + (statusColors[lastOrder.status] || "bg-neutral-700 text-neutral-300")}>
                  {statusLabels[lastOrder.status] || lastOrder.status}
                </span>
              </div>
              <span className="text-sm font-bold text-white">{formatPrice(Number(lastOrder.total))}</span>
            </div>
            <div className="flex items-center gap-2">
              {lastOrder.items.slice(0, 3).map((item, i) => (
                <div key={i} className="relative w-10 h-10 bg-neutral-800 rounded-lg overflow-hidden">
                  {item.product?.images?.[0]?.url ? (
                    <Image src={item.product.images[0].url} alt={item.name} fill className="object-cover" sizes="40px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-600 text-xs">📦</div>
                  )}
                </div>
              ))}
              {lastOrder.items.length > 3 && (
                <span className="text-xs text-neutral-500">+{lastOrder.items.length - 3} más</span>
              )}
              <span className="ml-auto text-xs text-neutral-500">
                {new Date(lastOrder.createdAt).toLocaleDateString("es-CO", { day: "numeric", month: "short" })}
              </span>
            </div>
          </Link>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/mi-cuenta/pedidos" className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded-xl p-4 hover:border-primary/50 transition">
          <span className="text-xl">📦</span>
          <div>
            <p className="text-sm font-medium text-white">Mis Pedidos</p>
            <p className="text-[11px] text-neutral-500">{totalOrders} pedido{totalOrders !== 1 ? "s" : ""}</p>
          </div>
        </Link>
        <Link href="/mi-cuenta/configuracion" className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded-xl p-4 hover:border-primary/50 transition">
          <span className="text-xl">⚙️</span>
          <div>
            <p className="text-sm font-medium text-white">Configuración</p>
            <p className="text-[11px] text-neutral-500">Perfil y contraseña</p>
          </div>
        </Link>
        <a href="https://wa.me/573247892412" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded-xl p-4 hover:border-green-500/50 transition">
          <span className="text-xl">💬</span>
          <div>
            <p className="text-sm font-medium text-white">Soporte</p>
            <p className="text-[11px] text-neutral-500">WhatsApp directo</p>
          </div>
        </a>
        <Link href="/" className="flex items-center gap-3 bg-neutral-900 border border-neutral-800 rounded-xl p-4 hover:border-primary/50 transition">
          <span className="text-xl">🛒</span>
          <div>
            <p className="text-sm font-medium text-white">Seguir comprando</p>
            <p className="text-[11px] text-neutral-500">Ver catálogo</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
