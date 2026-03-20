import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { generateInvoiceHTML } from "@/lib/invoice";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: { select: { name: true, email: true, phone: true } },
      items: { include: { variant: { select: { name: true } } } },
      payment: { select: { method: true } },
    },
  });
  if (!order) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const html = generateInvoiceHTML({
    orderNumber: order.orderNumber,
    date: order.createdAt.toLocaleDateString("es-CO"),
    customer: { name: order.user.name || order.user.email, email: order.user.email, phone: order.user.phone || undefined },
    shipping: {
      name: order.shippingName || "",
      address: order.shippingAddress || "",
      city: order.shippingCity || "",
      state: order.shippingState || "",
      phone: order.shippingPhone || undefined,
    },
    items: order.items.map(i => ({
      name: i.name,
      variant: i.variant?.name,
      quantity: i.quantity,
      price: Number(i.price),
    })),
    subtotal: Number(order.subtotal),
    shippingCost: Number(order.shipping),
    tax: Number(order.tax),
    total: Number(order.total),
    paymentMethod: order.payment?.method,
  });

  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
