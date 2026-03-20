import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from") || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];
  const to = searchParams.get("to") || new Date().toISOString().split("T")[0];

  const toDate = new Date(to);
  toDate.setHours(23, 59, 59, 999);

  const orders = await prisma.order.findMany({
    where: {
      createdAt: { gte: new Date(from), lte: toDate },
      status: { notIn: ["CANCELLED", "FRAUD_RISK"] },
    },
    select: {
      id: true, orderNumber: true, total: true, costTotal: true, gatewayFee: true,
      shippingCost: true, margin: true, shipping: true, status: true, createdAt: true,
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalRevenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const totalCost = orders.reduce((sum, o) => sum + (o.costTotal ? Number(o.costTotal) : 0), 0);
  const totalGatewayFees = orders.reduce((sum, o) => sum + (o.gatewayFee ? Number(o.gatewayFee) : 0), 0);
  const totalShippingCost = orders.reduce((sum, o) => sum + (o.shippingCost ? Number(o.shippingCost) : 0), 0);
  const totalMargin = totalRevenue - totalCost - totalGatewayFees - totalShippingCost;

  return NextResponse.json({
    summary: {
      revenue: totalRevenue,
      cost: totalCost,
      gatewayFees: totalGatewayFees,
      shippingCosts: totalShippingCost,
      margin: totalMargin,
      marginPct: totalRevenue > 0 ? Math.round((totalMargin / totalRevenue) * 100) : 0,
      orderCount: orders.length,
      avgMargin: orders.length > 0 ? Math.round(totalMargin / orders.length) : 0,
    },
    orders: orders.map(o => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customer: o.user.name || o.user.email,
      revenue: Number(o.total),
      cost: o.costTotal ? Number(o.costTotal) : null,
      gatewayFee: o.gatewayFee ? Number(o.gatewayFee) : null,
      shippingCost: o.shippingCost ? Number(o.shippingCost) : null,
      margin: o.margin ? Number(o.margin) : null,
      status: o.status,
      createdAt: o.createdAt,
    })),
  });
}
