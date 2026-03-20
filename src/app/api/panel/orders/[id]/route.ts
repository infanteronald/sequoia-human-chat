import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { sendPaymentConfirmed, sendOrderShipped, sendOrderDelivered } from "@/lib/email";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true, name: true, email: true, phone: true, tags: true, createdAt: true,
          orders: { select: { id: true, total: true, status: true, createdAt: true }, orderBy: { createdAt: "desc" } },
          addresses: true,
        },
      },
      items: {
        include: {
          product: { select: { slug: true, costPrice: true, images: { where: { isCover: true }, take: 1 } } },
          variant: { select: { name: true } },
        },
      },
      payment: true,
      timeline: { orderBy: { createdAt: "desc" } },
      returns: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!order) return NextResponse.json({ error: "Pedido no encontrado" }, { status: 404 });

  // Calculate customer stats
  const customerOrders = order.user.orders;
  const customerStats = {
    totalOrders: customerOrders.length,
    totalSpent: customerOrders.reduce((sum, o) => sum + Number(o.total), 0),
    avgTicket: customerOrders.length > 0 ? customerOrders.reduce((sum, o) => sum + Number(o.total), 0) / customerOrders.length : 0,
    lastOrder: customerOrders[0]?.createdAt || null,
    isNew: customerOrders.length <= 1,
  };

  return NextResponse.json({
    ...order,
    total: Number(order.total),
    subtotal: Number(order.subtotal),
    shipping: Number(order.shipping),
    tax: Number(order.tax),
    costTotal: order.costTotal ? Number(order.costTotal) : null,
    gatewayFee: order.gatewayFee ? Number(order.gatewayFee) : null,
    shippingCost: order.shippingCost ? Number(order.shippingCost) : null,
    margin: order.margin ? Number(order.margin) : null,
    items: order.items.map((i) => ({
      ...i,
      price: Number(i.price),
      costPrice: i.costPrice ? Number(i.costPrice) : (i.product.costPrice ? Number(i.product.costPrice) : null),
      image: i.product.images[0]?.url || null,
    })),
    payment: order.payment ? { ...order.payment, amount: Number(order.payment.amount) } : null,
    customerStats,
    returns: order.returns.map(r => ({ ...r, refundAmount: r.refundAmount ? Number(r.refundAmount) : null })),
  });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { status, notes, carrier, trackingNumber, trackingUrl, tags,
          shippingAddress, shippingCity, shippingState, shippingName, shippingPhone,
          costTotal, gatewayFee, shippingCost, margin } = body;

  const currentOrder = await prisma.order.findUnique({ where: { id }, select: { status: true } });
  if (!currentOrder) return NextResponse.json({ error: "No encontrado" }, { status: 404 });

  const data: Record<string, unknown> = {};
  if (status) {
    data.status = status;
    // Set timestamps based on status
    if (status === "PACKED") data.packedAt = new Date();
    if (status === "SHIPPED") data.shippedAt = new Date();
    if (status === "DELIVERED") data.deliveredAt = new Date();
  }
  if (notes !== undefined) data.notes = notes;
  if (carrier !== undefined) data.carrier = carrier;
  if (trackingNumber !== undefined) data.trackingNumber = trackingNumber;
  if (trackingUrl !== undefined) data.trackingUrl = trackingUrl;
  if (tags !== undefined) data.tags = tags;
  if (shippingAddress !== undefined) data.shippingAddress = shippingAddress;
  if (shippingCity !== undefined) data.shippingCity = shippingCity;
  if (shippingState !== undefined) data.shippingState = shippingState;
  if (shippingName !== undefined) data.shippingName = shippingName;
  if (shippingPhone !== undefined) data.shippingPhone = shippingPhone;
  if (costTotal !== undefined) data.costTotal = costTotal;
  if (gatewayFee !== undefined) data.gatewayFee = gatewayFee;
  if (shippingCost !== undefined) data.shippingCost = shippingCost;
  if (margin !== undefined) data.margin = margin;

  await prisma.order.update({ where: { id }, data });

  // Log timeline event
  if (status && status !== currentOrder.status) {
    await prisma.orderEvent.create({
      data: {
        orderId: id,
        type: "status_change",
        detail: `Estado cambiado de ${currentOrder.status} a ${status}`,
        author: admin.email,
      },
    });
  }
  if (trackingNumber) {
    await prisma.orderEvent.create({
      data: {
        orderId: id,
        type: "tracking_updated",
        detail: `Guía actualizada: ${carrier || ""} ${trackingNumber}`,
        author: admin.email,
      },
    });
  }

  // ── Send email notification on status change ──
  if (status && status !== currentOrder.status) {
    try {
      const updatedOrder = await prisma.order.findUnique({
        where: { id },
        include: { user: true },
      });
      const email = updatedOrder?.shippingEmail || updatedOrder?.user?.email;
      const name = updatedOrder?.shippingName || updatedOrder?.user?.name || "Cliente";
      if (email && updatedOrder) {
        if (status === "PAID") {
          sendPaymentConfirmed(email, { orderNumber: updatedOrder.orderNumber, customerName: name, total: Number(updatedOrder.total) }).catch(() => {});
        } else if (status === "SHIPPED") {
          sendOrderShipped(email, { orderNumber: updatedOrder.orderNumber, customerName: name, trackingNumber: updatedOrder.trackingNumber || undefined, carrier: updatedOrder.carrier || undefined }).catch(() => {});
        } else if (status === "DELIVERED") {
          sendOrderDelivered(email, { orderNumber: updatedOrder.orderNumber, customerName: name }).catch(() => {});
        }
      }
    } catch (err) {
      console.error("Email notification error:", err);
    }
  }

  return NextResponse.json({ success: true });
}
