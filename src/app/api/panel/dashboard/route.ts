import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalProducts,
    activeProducts,
    totalCustomers,
    pendingOrders,
    salesToday,
    salesWeek,
    salesMonth,
    recentOrders,
    lowStock,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { isActive: true } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.aggregate({
      _sum: { total: true },
      _count: true,
      where: { createdAt: { gte: todayStart }, status: { not: "CANCELLED" } },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      _count: true,
      where: { createdAt: { gte: weekStart }, status: { not: "CANCELLED" } },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      _count: true,
      where: { createdAt: { gte: monthStart }, status: { not: "CANCELLED" } },
    }),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.productVariant.findMany({
      where: { stock: { lt: 5 }, isActive: true },
      include: { product: { select: { name: true, slug: true } } },
      orderBy: { stock: "asc" },
      take: 15,
    }),
  ]);

  return NextResponse.json({
    stats: {
      totalProducts,
      activeProducts,
      totalCustomers,
      pendingOrders,
      salesToday: { total: Number(salesToday._sum.total || 0), count: salesToday._count },
      salesWeek: { total: Number(salesWeek._sum.total || 0), count: salesWeek._count },
      salesMonth: { total: Number(salesMonth._sum.total || 0), count: salesMonth._count },
    },
    recentOrders: recentOrders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      customer: o.user.name || o.user.email,
      total: Number(o.total),
      status: o.status,
      createdAt: o.createdAt,
    })),
    lowStock: lowStock.map((v) => ({
      id: v.id,
      product: v.product.name,
      variant: v.name,
      sku: v.sku,
      stock: v.stock,
    })),
  });
}
