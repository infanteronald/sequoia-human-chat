import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") || "";
  const q = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const city = searchParams.get("city") || "";
  const carrier = searchParams.get("carrier") || "";
  const paymentMethod = searchParams.get("paymentMethod") || "";
  const dateFrom = searchParams.get("dateFrom") || "";
  const dateTo = searchParams.get("dateTo") || "";
  const minValue = searchParams.get("minValue") || "";
  const maxValue = searchParams.get("maxValue") || "";
  const customerType = searchParams.get("customerType") || "";
  const hasFraudRisk = searchParams.get("hasFraudRisk") || "";
  const tag = searchParams.get("tag") || "";

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (city) where.shippingCity = { contains: city, mode: "insensitive" };
  if (carrier) where.carrier = carrier;
  if (tag) where.tags = { has: tag };
  if (hasFraudRisk === "true") where.fraudScore = { gte: 25 };

  if (dateFrom || dateTo) {
    where.createdAt = {};
    if (dateFrom) (where.createdAt as Record<string, unknown>).gte = new Date(dateFrom);
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      (where.createdAt as Record<string, unknown>).lte = to;
    }
  }

  if (minValue || maxValue) {
    where.total = {};
    if (minValue) (where.total as Record<string, unknown>).gte = parseFloat(minValue);
    if (maxValue) (where.total as Record<string, unknown>).lte = parseFloat(maxValue);
  }

  if (paymentMethod) {
    where.payment = { method: paymentMethod };
  }

  if (q) {
    where.OR = [
      { orderNumber: { contains: q, mode: "insensitive" } },
      { user: { name: { contains: q, mode: "insensitive" } } },
      { user: { email: { contains: q, mode: "insensitive" } } },
      { shippingPhone: { contains: q } },
    ];
  }

  // Customer type filter (new vs recurring)
  if (customerType === "new" || customerType === "recurring") {
    // Will be applied post-query for simplicity
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { name: true, email: true, _count: { select: { orders: true } } } },
        payment: { select: { method: true, status: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  let mapped = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    customer: o.user.name || o.user.email,
    customerEmail: o.user.email,
    customerOrderCount: o.user._count.orders,
    total: Number(o.total),
    status: o.status,
    itemCount: o._count.items,
    city: o.shippingCity,
    carrier: o.carrier,
    trackingNumber: o.trackingNumber,
    paymentMethod: o.payment?.method || null,
    paymentStatus: o.payment?.status || null,
    fraudScore: o.fraudScore || 0,
    tags: o.tags,
    margin: o.margin ? Number(o.margin) : null,
    createdAt: o.createdAt,
  }));

  // Post-filter for customer type
  if (customerType === "new") {
    mapped = mapped.filter(o => o.customerOrderCount <= 1);
  } else if (customerType === "recurring") {
    mapped = mapped.filter(o => o.customerOrderCount > 1);
  }

  return NextResponse.json({ orders: mapped, total, pages: Math.ceil(total / limit), page });
}
