import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { generateShippingLabelHTML } from "@/lib/shipping-label";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { variant: { select: { name: true } } } } },
  });
  if (!order) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const html = generateShippingLabelHTML({
    orderNumber: order.orderNumber,
    carrier: order.carrier || "Coordinadora",
    trackingNumber: order.trackingNumber || undefined,
    sender: { name: "Sequoia Speed", address: "Bogotá, Colombia", city: "Bogotá", phone: "300-123-4567" },
    recipient: {
      name: order.shippingName || "",
      address: order.shippingAddress || "",
      city: order.shippingCity || "",
      state: order.shippingState || "",
      phone: order.shippingPhone || "",
    },
    items: order.items.map(i => ({ name: `${i.name}${i.variant?.name ? " - " + i.variant.name : ""}`, quantity: i.quantity })),
  });

  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
