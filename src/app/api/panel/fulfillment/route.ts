import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const now = new Date();
  const h48ago = new Date(now.getTime() - 48 * 60 * 60 * 1000);

  const [newOrders, paidOrders, preparingOrders, packedOrders, shippedToday, delayed] = await Promise.all([
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "PAID" } }),
    prisma.order.count({ where: { status: "PREPARING" } }),
    prisma.order.count({ where: { status: "PACKED" } }),
    prisma.order.count({ where: { status: "SHIPPED", shippedAt: { gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) } } }),
    prisma.order.count({ where: { status: { in: ["PENDING", "PAID", "PREPARING"] }, createdAt: { lt: h48ago } } }),
  ]);

  // Orders to prepare (PAID + PREPARING)
  const ordersToPrepare = await prisma.order.findMany({
    where: { status: { in: ["PAID", "PREPARING"] } },
    include: {
      items: { include: { variant: { select: { name: true } } } },
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  return NextResponse.json({
    counts: { new: newOrders, paid: paidOrders, preparing: preparingOrders, packed: packedOrders, shippedToday, delayed },
    ordersToPrepare: ordersToPrepare.map(o => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customer: o.user.name || o.user.email,
      status: o.status,
      items: o.items.map(i => ({ name: i.name, variant: i.variant?.name, quantity: i.quantity })),
      createdAt: o.createdAt,
    })),
  });
}
