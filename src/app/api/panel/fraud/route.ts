import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { calculateFraudScore } from "@/lib/fraud";

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { orderId } = await req.json();
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: { include: { _count: { select: { orders: true } } } } },
  });
  if (!order) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const avgTicket = await prisma.order.aggregate({ _avg: { total: true }, where: { status: { not: "CANCELLED" } } });

  // Check same address orders from different users
  const sameAddressOrders = order.shippingAddress ? await prisma.order.count({
    where: { shippingAddress: order.shippingAddress, userId: { not: order.userId } },
  }) : 0;

  const result = calculateFraudScore({
    email: order.user.email,
    orderTotal: Number(order.total),
    avgTicket: Number(avgTicket._avg.total || 0),
    isNewCustomer: order.user._count.orders <= 1,
    orderCount: order.user._count.orders,
    ipAddress: order.ipAddress,
    shippingCity: order.shippingCity,
    sameAddressOrders,
  });

  await prisma.order.update({
    where: { id: orderId },
    data: { fraudScore: result.score, fraudFlags: result.flags },
  });

  return NextResponse.json(result);
}
