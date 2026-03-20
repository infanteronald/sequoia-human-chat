import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  // Get all items from orders that need to be prepared
  const items = await prisma.orderItem.findMany({
    where: { order: { status: { in: ["PAID", "PREPARING"] } } },
    include: { variant: { select: { name: true, sku: true } }, product: { select: { name: true } } },
  });

  // Consolidate by product+variant
  const consolidated = new Map<string, { name: string; variant: string; sku: string; quantity: number }>();
  for (const item of items) {
    const key = `${item.productId}-${item.variantId || "none"}`;
    const existing = consolidated.get(key);
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      consolidated.set(key, {
        name: item.product.name,
        variant: item.variant?.name || "",
        sku: item.variant?.sku || "",
        quantity: item.quantity,
      });
    }
  }

  const pickingList = Array.from(consolidated.values()).sort((a, b) => b.quantity - a.quantity);
  const totalItems = pickingList.reduce((sum, i) => sum + i.quantity, 0);

  return NextResponse.json({ pickingList, totalItems, orderCount: new Set(items.map(i => i.orderId)).size });
}
