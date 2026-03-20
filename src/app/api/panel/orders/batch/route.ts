import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { sendPaymentConfirmed, sendOrderShipped, sendOrderDelivered } from "@/lib/email";

async function notifyOrders(orderIds: string[], type: "paid" | "shipped" | "delivered") {
  try {
    const orders = await prisma.order.findMany({
      where: { id: { in: orderIds } },
      include: { user: true },
    });
    for (const order of orders) {
      const email = order.shippingEmail || order.user?.email;
      if (!email) continue;
      const name = order.shippingName || order.user?.name || "Cliente";
      if (type === "paid") {
        sendPaymentConfirmed(email, { orderNumber: order.orderNumber, customerName: name, total: Number(order.total) }).catch(() => {});
      } else if (type === "shipped") {
        sendOrderShipped(email, { orderNumber: order.orderNumber, customerName: name }).catch(() => {});
      } else if (type === "delivered") {
        sendOrderDelivered(email, { orderNumber: order.orderNumber, customerName: name }).catch(() => {});
      }
    }
  } catch (err) {
    console.error("Batch email notify error:", err);
  }
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { action, orderIds } = await req.json();
  if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
    return NextResponse.json({ error: "No se seleccionaron pedidos" }, { status: 400 });
  }

  switch (action) {
    case "mark_paid": {
      await prisma.order.updateMany({
        where: { id: { in: orderIds } },
        data: { status: "PAID" },
      });
      await prisma.orderEvent.createMany({
        data: orderIds.map(id => ({
          orderId: id, type: "status_change",
          detail: "Estado cambiado a PAID (acción en lote)",
          author: admin.email,
        })),
      });
      notifyOrders(orderIds, "paid");
      break;
    }
    case "mark_packed": {
      await prisma.order.updateMany({
        where: { id: { in: orderIds } },
        data: { status: "PACKED", packedAt: new Date() },
      });
      await prisma.orderEvent.createMany({
        data: orderIds.map(id => ({
          orderId: id, type: "status_change",
          detail: "Estado cambiado a PACKED (acción en lote)",
          author: admin.email,
        })),
      });
      break;
    }
    case "mark_shipped": {
      await prisma.order.updateMany({
        where: { id: { in: orderIds } },
        data: { status: "SHIPPED", shippedAt: new Date() },
      });
      await prisma.orderEvent.createMany({
        data: orderIds.map(id => ({
          orderId: id, type: "status_change",
          detail: "Estado cambiado a SHIPPED (acción en lote)",
          author: admin.email,
        })),
      });
      notifyOrders(orderIds, "shipped");
      break;
    }
    case "mark_delivered": {
      await prisma.order.updateMany({
        where: { id: { in: orderIds } },
        data: { status: "DELIVERED", deliveredAt: new Date() },
      });
      await prisma.orderEvent.createMany({
        data: orderIds.map(id => ({
          orderId: id, type: "status_change",
          detail: "Estado cambiado a DELIVERED (acción en lote)",
          author: admin.email,
        })),
      });
      notifyOrders(orderIds, "delivered");
      break;
    }
    case "change_status": {
      // Generic status change — no email
      break;
    }
    default:
      return NextResponse.json({ error: "Acción no válida" }, { status: 400 });
  }

  return NextResponse.json({ success: true, affected: orderIds.length });
}
