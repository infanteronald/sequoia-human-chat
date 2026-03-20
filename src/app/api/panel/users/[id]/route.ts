import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      addresses: true,
      orders: {
        include: {
          _count: { select: { items: true } },
          items: { select: { name: true, quantity: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!user) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const totalSpent = user.orders.reduce((sum, o) => sum + Number(o.total), 0);
  const avgTicket = user.orders.length > 0 ? totalSpent / user.orders.length : 0;
  const lastOrder = user.orders[0]?.createdAt || null;

  // Products bought (aggregated)
  const productMap = new Map<string, number>();
  for (const order of user.orders) {
    for (const item of order.items) {
      productMap.set(item.name, (productMap.get(item.name) || 0) + item.quantity);
    }
  }
  const productsBought = Array.from(productMap.entries())
    .map(([name, qty]) => ({ name, quantity: qty }))
    .sort((a, b) => b.quantity - a.quantity);

  return NextResponse.json({
    ...user,
    orders: user.orders.map(o => ({
      id: o.id,
      orderNumber: o.orderNumber,
      total: Number(o.total),
      status: o.status,
      itemCount: o._count.items,
      createdAt: o.createdAt,
    })),
    stats: {
      totalOrders: user.orders.length,
      totalSpent,
      avgTicket,
      lastOrder,
      isVIP: totalSpent > 2000000, // VIP if spent over 2M COP
    },
    productsBought,
  });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;
  const { tags } = await req.json();
  const data: Record<string, unknown> = {};
  if (tags !== undefined) data.tags = tags;
  await prisma.user.update({ where: { id }, data });
  return NextResponse.json({ success: true });
}
