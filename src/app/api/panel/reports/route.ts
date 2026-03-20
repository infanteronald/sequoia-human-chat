import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from") || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0];
  const to = searchParams.get("to") || new Date().toISOString().split("T")[0];
  const toDate = new Date(to); toDate.setHours(23,59,59,999);

  const dateFilter = { createdAt: { gte: new Date(from), lte: toDate } };

  const [salesAgg, orders, topProducts, topCategories, allOrders, returns, cancelledCount, failedPayments] = await Promise.all([
    prisma.order.aggregate({
      _sum: { total: true }, _count: true, _avg: { total: true },
      where: { ...dateFilter, status: { notIn: ["CANCELLED", "FRAUD_RISK"] } },
    }),
    prisma.order.findMany({
      where: { ...dateFilter, status: { notIn: ["CANCELLED", "FRAUD_RISK"] } },
      select: { total: true, createdAt: true, shippedAt: true },
    }),
    prisma.orderItem.groupBy({
      by: ["name"],
      _sum: { quantity: true },
      where: { order: dateFilter },
      orderBy: { _sum: { quantity: "desc" } },
      take: 10,
    }),
    prisma.orderItem.findMany({
      where: { order: dateFilter },
      select: { quantity: true, price: true, product: { select: { category: { select: { name: true } } } } },
    }),
    prisma.order.findMany({ where: dateFilter, select: { status: true } }),
    prisma.return.count({ where: dateFilter }),
    prisma.order.count({ where: { ...dateFilter, status: "CANCELLED" } }),
    prisma.payment.count({ where: { ...dateFilter, status: "DECLINED" } }),
  ]);

  // KPIs logísticos
  const shippedOrders = orders.filter(o => o.shippedAt);
  const avgShipTime = shippedOrders.length > 0
    ? shippedOrders.reduce((sum, o) => sum + (o.shippedAt!.getTime() - o.createdAt.getTime()), 0) / shippedOrders.length / (1000 * 60 * 60)
    : 0;

  const totalOrderCount = allOrders.length;
  const returnRate = totalOrderCount > 0 ? Math.round((returns / totalOrderCount) * 100) : 0;
  const cancelRate = totalOrderCount > 0 ? Math.round((cancelledCount / totalOrderCount) * 100) : 0;
  const paymentFailRate = totalOrderCount > 0 ? Math.round((failedPayments / totalOrderCount) * 100) : 0;

  // Category aggregation
  const catMap = new Map<string, { quantity: number; revenue: number }>();
  for (const item of topCategories) {
    const cat = item.product.category.name;
    const existing = catMap.get(cat) || { quantity: 0, revenue: 0 };
    existing.quantity += item.quantity;
    existing.revenue += Number(item.price) * item.quantity;
    catMap.set(cat, existing);
  }
  const categoryStats = Array.from(catMap.entries())
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue);

  // Top products with revenue
  const topProductsWithRevenue = await Promise.all(
    topProducts.map(async (p) => {
      const revenue = await prisma.orderItem.aggregate({
        _sum: { quantity: true },
        where: { name: p.name, order: dateFilter },
      });
      const items = await prisma.orderItem.findMany({
        where: { name: p.name, order: dateFilter },
        select: { price: true, quantity: true },
      });
      return {
        name: p.name,
        quantity: p._sum.quantity || 0,
        revenue: items.reduce((sum, i) => sum + Number(i.price) * i.quantity, 0),
      };
    })
  );

  // Cohort data (customers by registration month)
  const cohorts = await prisma.user.groupBy({
    by: ["createdAt"],
    _count: true,
    where: { role: "CUSTOMER" },
  });
  // Simplify cohorts to month buckets
  const cohortMap = new Map<string, number>();
  for (const c of cohorts) {
    const monthKey = `${c.createdAt.getFullYear()}-${String(c.createdAt.getMonth() + 1).padStart(2, "0")}`;
    cohortMap.set(monthKey, (cohortMap.get(monthKey) || 0) + c._count);
  }
  const cohortData = Array.from(cohortMap.entries())
    .map(([month, count]) => ({ month, count }))
    .sort((a, b) => b.month.localeCompare(a.month))
    .slice(0, 12);

  return NextResponse.json({
    period: { from, to },
    summary: {
      totalSales: Number(salesAgg._sum.total || 0),
      orderCount: salesAgg._count,
      avgTicket: Number(salesAgg._avg.total || 0),
    },
    logistics: {
      avgShipTimeHours: Math.round(avgShipTime),
      returnRate,
      cancelRate,
      paymentFailRate,
      returnCount: returns,
      cancelCount: cancelledCount,
    },
    topProducts: topProductsWithRevenue,
    topCategories: categoryStats,
    cohorts: cohortData,
  });
}
