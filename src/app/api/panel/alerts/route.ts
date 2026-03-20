import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "";
  const unreadOnly = searchParams.get("unreadOnly") === "true";

  const where: Record<string, unknown> = {};
  if (type) where.type = type;
  if (unreadOnly) where.isRead = false;

  const alerts = await prisma.alert.findMany({ where, orderBy: { createdAt: "desc" }, take: 100 });
  const unreadCount = await prisma.alert.count({ where: { isRead: false } });

  return NextResponse.json({ alerts, unreadCount });
}

// Generate alerts (called periodically or manually)
export async function POST() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const h48ago = new Date(Date.now() - 48 * 60 * 60 * 1000);
  let created = 0;

  // 1. Unshipped orders > 48h
  const unshipped = await prisma.order.findMany({
    where: { status: { in: ["PENDING", "PAID", "PREPARING"] }, createdAt: { lt: h48ago } },
    select: { id: true, orderNumber: true },
  });
  for (const o of unshipped) {
    const exists = await prisma.alert.findFirst({ where: { orderId: o.id, type: "unshipped_48h", isRead: false } });
    if (!exists) {
      await prisma.alert.create({
        data: { type: "unshipped_48h", title: `Pedido #${o.orderNumber} sin enviar >48h`, detail: "Pedido lleva más de 48 horas sin ser enviado", orderId: o.id },
      });
      created++;
    }
  }

  // 2. Fraud risk orders
  const fraudOrders = await prisma.order.findMany({
    where: { fraudScore: { gte: 50 }, status: { not: "FRAUD_RISK" } },
    select: { id: true, orderNumber: true, fraudScore: true },
  });
  for (const o of fraudOrders) {
    const exists = await prisma.alert.findFirst({ where: { orderId: o.id, type: "fraud", isRead: false } });
    if (!exists) {
      await prisma.alert.create({
        data: { type: "fraud", title: `Riesgo de fraude: #${o.orderNumber}`, detail: `Score: ${o.fraudScore}/100`, orderId: o.id },
      });
      created++;
    }
  }

  // 3. Out of stock
  const outOfStock = await prisma.productVariant.findMany({
    where: { stock: 0, isActive: true },
    include: { product: { select: { id: true, name: true } } },
    take: 20,
  });
  for (const v of outOfStock) {
    const exists = await prisma.alert.findFirst({ where: { productId: v.product.id, type: "out_of_stock", isRead: false } });
    if (!exists) {
      await prisma.alert.create({
        data: { type: "out_of_stock", title: `${v.product.name} - ${v.name} agotado`, detail: "Stock en 0", productId: v.product.id },
      });
      created++;
    }
  }

  return NextResponse.json({ success: true, created });
}
